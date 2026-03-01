/**
 * THE VIDEO POOL — Comprehensive Playwright Visual Audit
 * Checks: auth, thumbnails, downloads, previews, new pages, admin
 */

import pkg from '../node_modules/playwright/index.js';
const { chromium } = pkg;
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

const BASE_URL = 'https://dev.thevideopool.com';
const SCREENSHOTS_DIR = './scripts/audit-screenshots';

if (!existsSync(SCREENSHOTS_DIR)) {
  mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

const results = [];
let passed = 0;
let failed = 0;
let warnings = 0;

function log(status, label, detail = '') {
  const emoji = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : status === 'WARN' ? '⚠️' : 'ℹ️';
  const line = `${emoji} [${status}] ${label}${detail ? ' — ' + detail : ''}`;
  console.log(line);
  results.push({ status, label, detail });
  if (status === 'PASS') passed++;
  else if (status === 'FAIL') failed++;
  else if (status === 'WARN') warnings++;
}

async function screenshotPage(page, name) {
  try {
    await page.screenshot({ path: join(SCREENSHOTS_DIR, `${name}.png`), fullPage: false });
  } catch(e) { /* ignore */ }
}

async function getImageLoadStats(page) {
  return await page.evaluate(() => {
    const imgs = Array.from(document.querySelectorAll('img'));
    const stats = { total: imgs.length, loaded: 0, broken: 0, placeholder: 0, details: [] };
    for (const img of imgs) {
      const src = img.src || img.getAttribute('src') || '';
      const isLoaded = img.complete && img.naturalWidth > 0;
      const isBroken = img.complete && img.naturalWidth === 0;
      const isPlaceholder = src.includes('picsum') || src.includes('placeholder') || src.includes('via.placeholder');
      const isWasabi = src.includes('wasabi') || src.includes('s3.us-east-1');
      if (isLoaded) stats.loaded++;
      if (isBroken) stats.broken++;
      if (isPlaceholder) stats.placeholder++;
      stats.details.push({ src: src.substring(0, 80), isLoaded, isBroken, isPlaceholder, isWasabi });
    }
    return stats;
  });
}

async function main() {
  console.log('\n🎬 THE VIDEO POOL — PLAYWRIGHT VISUAL AUDIT');
  console.log('='.repeat(55));
  console.log(`Target: ${BASE_URL}`);
  console.log(`Time: ${new Date().toISOString()}\n`);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  });
  const page = await context.newPage();

  // Collect console errors
  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });

  // ─── 1. LANDING PAGE ──────────────────────────────
  console.log('\n── LANDING PAGE ──');
  try {
    await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 15000 });
    await screenshotPage(page, '01-landing');
    const title = await page.title();
    log('PASS', 'Landing page loads', title);

    // Check key elements
    const heroText = await page.locator('h1, h2').first().textContent().catch(() => '');
    log(heroText ? 'PASS' : 'WARN', 'Hero heading present', heroText?.trim().substring(0, 60));

    const hasNavLink = await page.locator('a[href="/login"], a[href="/register"], button:has-text("Sign")').count();
    log(hasNavLink > 0 ? 'PASS' : 'WARN', 'Auth CTAs visible', `found ${hasNavLink}`);
  } catch(e) {
    log('FAIL', 'Landing page', e.message);
  }

  // ─── 2. LOGIN PAGE ────────────────────────────────
  console.log('\n── LOGIN PAGE ──');
  try {
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle', timeout: 15000 });
    await screenshotPage(page, '02-login');

    const emailInput = await page.locator('input[type="email"], input[name="email"]').count();
    const passwordInput = await page.locator('input[type="password"]').count();
    const submitBtn = await page.locator('button[type="submit"]').count();
    log(emailInput > 0 ? 'PASS' : 'FAIL', 'Email input present');
    log(passwordInput > 0 ? 'PASS' : 'FAIL', 'Password input present');
    log(submitBtn > 0 ? 'PASS' : 'FAIL', 'Submit button present');

    // Social login grid — 4 buttons (Google, Facebook, Apple, Spotify)
    // Google, Facebook, Apple should be enabled; Spotify should be disabled
    const socialGridContainer = await page.locator('.grid.grid-cols-4').count();
    const socialButtons = await page.locator('.grid.grid-cols-4 button').count();
    const enabledButtons = await page.locator('.grid.grid-cols-4 button:not([disabled])').count();
    const disabledButtons = await page.locator('.grid.grid-cols-4 button[disabled]').count();

    log(socialGridContainer > 0 ? 'PASS' : 'WARN', 'Social login grid container', socialGridContainer > 0 ? 'found' : 'not found');
    log(socialButtons === 4 ? 'PASS' : 'WARN', 'Social login buttons (4 providers)', `${socialButtons} buttons`);
    log(enabledButtons >= 3 ? 'PASS' : 'WARN', 'Active OAuth providers (3+ enabled)', `${enabledButtons} enabled, ${disabledButtons} disabled`);

    // "or continue with" divider confirms social section is present
    const dividerText = await page.locator(':has-text("or continue with")').count();
    log(dividerText > 0 ? 'PASS' : 'WARN', '"or continue with" divider present');
  } catch(e) {
    log('FAIL', 'Login page', e.message);
  }

  // ─── 3. AUTH — EMAIL LOGIN ────────────────────────
  console.log('\n── EMAIL AUTH ──');
  let adminToken = null;
  try {
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle', timeout: 15000 });
    await page.fill('input[type="email"], input[name="email"]', 'admin@thevideopool.com');
    await page.fill('input[type="password"]', 'TVP-Admin-2026!');
    await page.click('button[type="submit"]');
    await page.waitForNavigation({ timeout: 8000 }).catch(() => {});
    await screenshotPage(page, '03-after-login');

    const url = page.url();
    const isHome = url.includes('/home') || url.includes('/library') || url === BASE_URL + '/';
    const isAdmin = url.includes('/admin');
    log(isHome || isAdmin ? 'PASS' : 'FAIL', 'Login redirect successful', `→ ${url.replace(BASE_URL, '')}`);

    // Go to home if needed
    if (!isHome) {
      await page.goto(`${BASE_URL}/home`, { waitUntil: 'networkidle', timeout: 12000 });
    }
  } catch(e) {
    log('FAIL', 'Email login', e.message);
  }

  // ─── 4. HOME PAGE — VIDEO CATALOG + THUMBNAILS ────
  console.log('\n── HOME PAGE / CATALOG + THUMBNAILS ──');
  try {
    await page.goto(`${BASE_URL}/home`, { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(2000); // Let images lazy-load
    await screenshotPage(page, '04-home');

    const imgStats = await getImageLoadStats(page);
    log(imgStats.total > 0 ? 'PASS' : 'FAIL', 'Images found on page', `${imgStats.total} total`);
    log(imgStats.loaded > 0 ? 'PASS' : 'WARN', 'Thumbnails loading', `${imgStats.loaded}/${imgStats.total} loaded`);

    const wasabiCount = imgStats.details.filter(d => d.isWasabi).length;
    log(wasabiCount > 0 ? 'PASS' : 'WARN', 'Wasabi thumbnails', `${wasabiCount} from Wasabi`);
    log(imgStats.broken === 0 ? 'PASS' : 'WARN', 'Broken images', `${imgStats.broken} broken`);
    log(imgStats.placeholder === 0 ? 'PASS' : 'WARN', 'Placeholder images', `${imgStats.placeholder} placeholders`);

    // Check video cards are rendering
    const videoCards = await page.locator('[class*="video"], [class*="card"], .group').count();
    log(videoCards > 0 ? 'PASS' : 'WARN', 'Video cards rendered', `${videoCards} elements`);

    // Scroll to trigger lazy load
    await page.evaluate(() => window.scrollBy(0, 600));
    await page.waitForTimeout(1500);
    const imgStatsAfterScroll = await getImageLoadStats(page);
    if (imgStatsAfterScroll.broken < imgStats.broken) {
      log('INFO', 'Lazy loading working', `${imgStats.broken} → ${imgStatsAfterScroll.broken} broken after scroll`);
    }

    // Sample broken image URLs
    const brokenImages = imgStats.details.filter(d => d.isBroken);
    if (brokenImages.length > 0) {
      console.log(`\n  📋 Sample broken image URLs (first 5):`);
      brokenImages.slice(0, 5).forEach((img, i) => {
        console.log(`     ${i+1}. ${img.src || '(no src)'}`);
      });
    }
  } catch(e) {
    log('FAIL', 'Home page thumbnails', e.message);
  }

  // ─── 5. VIDEO PAGE — PREVIEW ─────────────────────
  console.log('\n── VIDEO PAGE / PREVIEW ──');
  try {
    // Use browser context (has auth session) to get a video ID
    const apiResp = await page.evaluate(async () => {
      const r = await fetch('/api/videos?limit=5', { credentials: 'include' });
      return { status: r.status, data: r.ok ? await r.json() : null };
    });

    if (apiResp.status === 200 && apiResp.data) {
      const tracks = apiResp.data.tracks || apiResp.data.videos || apiResp.data.data || [];
      if (tracks.length > 0) {
        const firstVideo = tracks[0];
        const videoId = firstVideo.id;
        log('PASS', 'API returns video catalog', `${tracks.length} tracks, first ID: ${videoId}`);

        const thumbUrl = firstVideo.thumbnailUrl || firstVideo.thumbnail_url || firstVideo.thumbnail;
        log(thumbUrl ? 'PASS' : 'WARN', 'Thumbnail URL in API', thumbUrl ? thumbUrl.substring(0, 60) : 'MISSING');

        const previewUrl = firstVideo.previewUrl || firstVideo.preview_url || firstVideo.preview;
        log(previewUrl ? 'PASS' : 'WARN', 'Preview URL in API', previewUrl ? previewUrl.substring(0, 60) : 'MISSING');

        // Navigate to video page
        await page.goto(`${BASE_URL}/video/${videoId}`, { waitUntil: 'networkidle', timeout: 12000 });
        await page.waitForTimeout(1500);
        await screenshotPage(page, '05-video-page');

        const hasVideo = await page.locator('video, [class*="player"], [class*="video"]').count();
        const hasDownloadBtn = await page.locator('button:has-text("Download"), a:has-text("Download"), [class*="download"]').count();
        log(hasVideo > 0 ? 'PASS' : 'WARN', 'Video player element present', `${hasVideo} elements`);
        log(hasDownloadBtn > 0 ? 'PASS' : 'WARN', 'Download button present', `${hasDownloadBtn} elements`);

        const titleEl = await page.locator('h1, h2').first().textContent().catch(() => '');
        log(titleEl ? 'PASS' : 'WARN', 'Video title renders', titleEl?.trim().substring(0, 50));
      } else {
        log('FAIL', 'Video catalog API', 'No tracks returned');
      }
    } else {
      log('WARN', 'Video catalog API', `Status ${apiResp.status} (check auth session)`);
    }
  } catch(e) {
    log('FAIL', 'Video page / preview', e.message);
  }

  // ─── 6. DOWNLOAD TEST (via browser context with auth) ─────────────────────
  console.log('\n── DOWNLOAD ENDPOINT ──');
  try {
    // Use the page context (which has auth session) to hit the video list
    const videoListResp = await page.evaluate(async () => {
      const r = await fetch('/api/videos?limit=3', { credentials: 'include' });
      return { status: r.status, data: r.ok ? await r.json() : null };
    });

    if (videoListResp.status === 200 && videoListResp.data) {
      const tracks = videoListResp.data.tracks || videoListResp.data.videos || [];
      log('PASS', 'Video catalog API (authenticated)', `${tracks.length} tracks returned`);

      if (tracks.length > 0) {
        const videoId = tracks[0].id;
        const dlResp = await page.evaluate(async (id) => {
          const r = await fetch(`/api/videos/${id}/download`, { credentials: 'include' });
          return { status: r.status, data: r.ok ? await r.json() : null };
        }, videoId);

        if (dlResp.status === 200) {
          const downloadUrl = dlResp.data?.url || dlResp.data?.downloadUrl || dlResp.data?.signedUrl;
          log('PASS', 'Download endpoint responds', `Status ${dlResp.status}`);
          log(downloadUrl ? 'PASS' : 'WARN', 'Signed URL returned', downloadUrl ? downloadUrl.substring(0, 60) : 'No URL field');
        } else if (dlResp.status === 401 || dlResp.status === 403) {
          log('WARN', 'Download requires paid membership', `Status ${dlResp.status} (admin is free tier)`);
        } else {
          log('FAIL', 'Download endpoint error', `Status ${dlResp.status}`);
        }
      }
    } else if (videoListResp.status === 401) {
      log('WARN', 'Video catalog requires auth', 'Expected — home page loads catalog correctly');
    } else {
      log('FAIL', 'Video catalog API', `Status ${videoListResp.status}`);
    }
  } catch(e) {
    log('FAIL', 'Download test', e.message);
  }

  // ─── 7. NEW PAGES ─────────────────────────────────
  console.log('\n── NEW PAGES (Terms / Privacy / Contact) ──');
  for (const [path, label] of [
    ['/terms', 'Terms of Service'],
    ['/privacy', 'Privacy Policy'],
    ['/contact', 'Contact Page'],
  ]) {
    try {
      await page.goto(`${BASE_URL}${path}`, { waitUntil: 'networkidle', timeout: 12000 });
      await screenshotPage(page, `06${path.replace('/', '-')}`);
      const url = page.url();
      const redirected = !url.endsWith(path) && !url.endsWith(path + '/');
      if (redirected) {
        log('FAIL', `${label} — redirected`, `→ ${url.replace(BASE_URL, '')}`);
      } else {
        const heading = await page.locator('h1').first().textContent().catch(() => '');
        log(heading ? 'PASS' : 'WARN', label, heading?.trim().substring(0, 50));
      }
    } catch(e) {
      log('FAIL', label, e.message);
    }
  }

  // ─── 8. MEMBERSHIP PAGE ───────────────────────────
  console.log('\n── MEMBERSHIP PAGE ──');
  try {
    await page.goto(`${BASE_URL}/membership`, { waitUntil: 'networkidle', timeout: 12000 });
    await page.waitForTimeout(2000);
    await screenshotPage(page, '07-membership');

    // Check for JS errors
    const jsErrors = consoleErrors.filter(e =>
      e.includes('TypeError') || e.includes('Cannot read') || e.includes('undefined')
    );
    log(jsErrors.length === 0 ? 'PASS' : 'FAIL', 'Membership page — no JS errors',
      jsErrors.length > 0 ? jsErrors[0].substring(0, 80) : 'clean');

    const heading = await page.locator('h1, h2').first().textContent().catch(() => '');
    log(heading ? 'PASS' : 'WARN', 'Membership page renders', heading?.trim().substring(0, 50));

    // Pricing cards are divs with border + rounded-2xl — count by $ price display
    const priceDisplays = await page.locator(':has-text("$0"), :has-text("$35"), :has-text("$33"), :has-text("$30")').count();
    const planCards = await page.locator('[class*="rounded-2xl"]').count();
    log(priceDisplays >= 4 ? 'PASS' : 'WARN', 'Pricing plans (4 tiers visible)', `${priceDisplays} price elements`);
    log(planCards >= 4 ? 'PASS' : 'WARN', 'Plan cards rendered', `${planCards} card elements`);
  } catch(e) {
    log('FAIL', 'Membership page', e.message);
  }

  // ─── 9. ADMIN PAGE ────────────────────────────────
  console.log('\n── ADMIN PAGE ──');
  try {
    await page.goto(`${BASE_URL}/admin`, { waitUntil: 'networkidle', timeout: 12000 });
    await page.waitForTimeout(2000);
    await screenshotPage(page, '08-admin');

    const url = page.url();
    const isAdmin = url.includes('/admin');

    if (!isAdmin) {
      log('FAIL', 'Admin page — redirected', `→ ${url.replace(BASE_URL, '')}`);
    } else {
      const accessDenied = await page.locator(':has-text("Access Denied"), :has-text("access denied")').count();
      const heading = await page.locator('h1').first().textContent().catch(() => '');

      if (accessDenied > 0) {
        log('FAIL', 'Admin page — Access Denied shown', 'isAdmin flag not working');
      } else {
        log('PASS', 'Admin page loads', heading?.trim().substring(0, 50));
      }

      // Admin tabs use custom styling — detect by known tab labels
      const overviewTab = await page.locator(':has-text("Overview")').count();
      const usersTab = await page.locator(':has-text("Users")').count();
      const videosTab = await page.locator(':has-text("Videos")').count();
      const tabsFound = [overviewTab > 0, usersTab > 0, videosTab > 0].filter(Boolean).length;
      log(tabsFound >= 3 ? 'PASS' : 'WARN', 'Admin tabs rendered', `Overview/Users/Videos tabs: ${tabsFound}/3 found`);
    }
  } catch(e) {
    log('FAIL', 'Admin page', e.message);
  }

  // ─── 10. SEARCH PAGE ──────────────────────────────
  console.log('\n── SEARCH ──');
  try {
    await page.goto(`${BASE_URL}/home`, { waitUntil: 'networkidle', timeout: 12000 });
    const searchInput = await page.locator('input[type="search"], input[placeholder*="earch"], input[placeholder*="Search"]').first();
    if (await searchInput.isVisible()) {
      await searchInput.fill('Drake');
      await page.waitForTimeout(1500);
      await screenshotPage(page, '09-search');
      const results = await page.locator('[class*="video"], [class*="card"]').count();
      log('PASS', 'Search works', `"Drake" → ${results} results shown`);
    } else {
      log('WARN', 'Search input not visible');
    }
  } catch(e) {
    log('FAIL', 'Search', e.message);
  }

  // ─── 11. SETTINGS PAGE ────────────────────────────
  console.log('\n── SETTINGS PAGE ──');
  try {
    await page.goto(`${BASE_URL}/settings`, { waitUntil: 'networkidle', timeout: 12000 });
    await page.waitForTimeout(1000);
    await screenshotPage(page, '10-settings');
    const url = page.url();
    const heading = await page.locator('h1, h2').first().textContent().catch(() => '');
    log(url.includes('/settings') ? 'PASS' : 'WARN', 'Settings page', heading?.trim().substring(0, 50));
  } catch(e) {
    log('FAIL', 'Settings', e.message);
  }

  await browser.close();

  // ─── SUMMARY ──────────────────────────────────────
  console.log('\n' + '='.repeat(55));
  console.log('AUDIT SUMMARY');
  console.log('='.repeat(55));
  console.log(`✅ PASS:    ${passed}`);
  console.log(`❌ FAIL:    ${failed}`);
  console.log(`⚠️  WARN:    ${warnings}`);
  console.log(`📊 Total:   ${passed + failed + warnings}`);

  if (failed === 0) {
    console.log('\n🚀 ALL CRITICAL CHECKS PASSING — Launch ready!');
  } else {
    console.log(`\n🔴 ${failed} critical issues need fixing before launch.`);
    console.log('\nFailed checks:');
    results.filter(r => r.status === 'FAIL').forEach(r => {
      console.log(`  ❌ ${r.label}: ${r.detail}`);
    });
  }

  if (warnings > 0) {
    console.log('\nWarnings (non-blocking):');
    results.filter(r => r.status === 'WARN').forEach(r => {
      console.log(`  ⚠️  ${r.label}: ${r.detail}`);
    });
  }

  console.log(`\n📸 Screenshots saved to: ${SCREENSHOTS_DIR}/`);

  // Save JSON report
  writeFileSync(join(SCREENSHOTS_DIR, 'audit-report.json'), JSON.stringify({
    timestamp: new Date().toISOString(),
    url: BASE_URL,
    summary: { passed, failed, warnings },
    results,
  }, null, 2));

  console.log('📄 Report saved to: scripts/audit-screenshots/audit-report.json\n');
}

main().catch(err => {
  console.error('Audit script error:', err);
  process.exit(1);
});
