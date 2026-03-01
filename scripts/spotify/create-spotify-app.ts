/**
 * THE VIDEO POOL — Spotify Developer App Creation Script
 *
 * This script automates creating a Spotify Developer app for "The Video Pool".
 * It opens a headed browser so you can complete the Spotify login manually
 * (Spotify uses CAPTCHA and bot-detection that blocks automated login).
 * Once logged in, the script takes over and automates all remaining steps.
 *
 * Usage:
 *   cd /Users/dremacmini/Desktop/OC/the-video-pool
 *   npx ts-node scripts/spotify/create-spotify-app.ts
 *
 * OR with npx playwright directly:
 *   npx tsx scripts/spotify/create-spotify-app.ts
 *
 * What it does:
 *   1. Opens https://developer.spotify.com/dashboard in a headed browser
 *   2. Waits for you to log in (pauses until dashboard is visible)
 *   3. Clicks "Create app" button
 *   4. Fills in app name, description, redirect URIs
 *   5. Accepts Terms of Service
 *   6. Submits the form
 *   7. Navigates to Settings to reveal Client ID and Client Secret
 *   8. Screenshots credentials and saves them to test-results/
 *   9. Prints Client ID and Client Secret to console
 */

import { chromium, Browser, Page } from 'playwright';
import * as path from 'path';
import * as fs from 'fs';

// ── Constants ─────────────────────────────────────────────────────────────────

const SPOTIFY_DASHBOARD_URL = 'https://developer.spotify.com/dashboard';
const RESULTS_DIR = path.resolve(__dirname, '../../test-results/spotify');
const LOGIN_TIMEOUT_MS = 120_000; // 2 minutes for manual login
const ACTION_TIMEOUT_MS = 15_000;

const APP_DETAILS = {
  name: 'The Video Pool',
  description: 'Professional video streaming platform with 30,000+ music videos and DJ integration',
  redirectUris: [
    'https://thevideopool.com/api/auth/spotify/callback',
    'https://dev.thevideopool.com/api/auth/spotify/callback',
  ],
} as const;

// ── Helpers ───────────────────────────────────────────────────────────────────

function ensureResultsDir(): void {
  if (!fs.existsSync(RESULTS_DIR)) {
    fs.mkdirSync(RESULTS_DIR, { recursive: true });
  }
}

async function screenshot(page: Page, filename: string): Promise<void> {
  const screenshotPath = path.join(RESULTS_DIR, filename);
  await page.screenshot({ path: screenshotPath, fullPage: true });
  console.log(`[screenshot] Saved: ${screenshotPath}`);
}

function printDivider(): void {
  console.log('─'.repeat(60));
}

// ── Main Automation ───────────────────────────────────────────────────────────

async function waitForDashboard(page: Page): Promise<void> {
  console.log('\n[ACTION REQUIRED] Please log in to Spotify in the browser window.');
  console.log(`[INFO] Waiting up to ${LOGIN_TIMEOUT_MS / 1000}s for you to complete login...`);
  console.log('[INFO] After login, automation will continue automatically.\n');

  // Wait for the dashboard to appear — indicates successful login
  // The dashboard shows "Create app" or lists existing apps
  await page.waitForFunction(
    () => {
      // Check for dashboard heading or "Create app" button
      const heading = document.querySelector('[data-testid="app-list-header"], h1, h2');
      const createBtn = document.querySelector('button, a');
      const bodyText = document.body.innerText.toLowerCase();
      return (
        bodyText.includes('create app') ||
        bodyText.includes('my apps') ||
        bodyText.includes('dashboard') && !bodyText.includes('log in') && !bodyText.includes('sign in')
      );
    },
    { timeout: LOGIN_TIMEOUT_MS }
  );

  console.log('[INFO] Dashboard detected — login successful. Continuing automation...\n');
  await screenshot(page, '01-dashboard-logged-in.png');
}

async function clickCreateApp(page: Page): Promise<void> {
  console.log('[STEP] Looking for "Create app" button...');

  // Try multiple selectors since Spotify may update their UI
  const selectors = [
    'button:has-text("Create app")',
    'a:has-text("Create app")',
    '[data-testid="create-app-button"]',
    'button:has-text("Create")',
  ];

  let clicked = false;
  for (const selector of selectors) {
    const el = page.locator(selector).first();
    if (await el.isVisible({ timeout: 3000 }).catch(() => false)) {
      await el.click();
      clicked = true;
      console.log(`[INFO] Clicked "Create app" via selector: ${selector}`);
      break;
    }
  }

  if (!clicked) {
    throw new Error(
      'Could not find "Create app" button. The Spotify Dashboard UI may have changed. ' +
      'Please take a screenshot and check the page manually.'
    );
  }

  // Wait for the form/modal to appear
  await page.waitForTimeout(1500);
  await screenshot(page, '02-create-app-form.png');
}

async function fillAppDetails(page: Page): Promise<void> {
  console.log('[STEP] Filling in app details...');

  // ── App Name ──────────────────────────────────────────────────
  const nameSelectors = [
    'input[name="appName"]',
    'input[placeholder*="name" i]',
    'input[id*="name" i]',
    'input[aria-label*="name" i]',
    '[data-testid="app-name-input"] input',
    'input[type="text"]',
  ];

  let nameField = null;
  for (const selector of nameSelectors) {
    const el = page.locator(selector).first();
    if (await el.isVisible({ timeout: 2000 }).catch(() => false)) {
      nameField = el;
      break;
    }
  }

  if (!nameField) {
    await screenshot(page, '02b-form-debug.png');
    throw new Error('Could not find App Name input field. Check 02b-form-debug.png for current state.');
  }

  await nameField.fill(APP_DETAILS.name);
  console.log(`[INFO] App name filled: "${APP_DETAILS.name}"`);

  // ── App Description ───────────────────────────────────────────
  const descSelectors = [
    'textarea[name="appDescription"]',
    'textarea[placeholder*="description" i]',
    'textarea[id*="description" i]',
    'textarea[aria-label*="description" i]',
    '[data-testid="app-description-input"] textarea',
    'textarea',
  ];

  let descField = null;
  for (const selector of descSelectors) {
    const el = page.locator(selector).first();
    if (await el.isVisible({ timeout: 2000 }).catch(() => false)) {
      descField = el;
      break;
    }
  }

  if (!descField) {
    await screenshot(page, '02c-desc-debug.png');
    throw new Error('Could not find App Description textarea. Check 02c-desc-debug.png.');
  }

  await descField.fill(APP_DETAILS.description);
  console.log(`[INFO] Description filled: "${APP_DETAILS.description}"`);

  // ── Redirect URIs ─────────────────────────────────────────────
  // Spotify may have a "Website" field and redirect URI field
  const redirectSelectors = [
    'input[name="redirectUri"]',
    'input[placeholder*="redirect" i]',
    'input[id*="redirect" i]',
    'input[aria-label*="redirect" i]',
    '[data-testid="redirect-uri-input"] input',
  ];

  // Add each redirect URI
  for (const uri of APP_DETAILS.redirectUris) {
    let redirectField = null;

    for (const selector of redirectSelectors) {
      const els = page.locator(selector);
      const count = await els.count();

      if (count > 0) {
        // Use the last empty one
        for (let i = 0; i < count; i++) {
          const el = els.nth(i);
          const val = await el.inputValue().catch(() => '');
          if (!val) {
            redirectField = el;
            break;
          }
        }
        if (!redirectField) {
          // All filled — try "Add more" button
          const addMoreBtn = page.locator('button:has-text("Add"), button:has-text("+ Add"), [data-testid*="add-uri"]').first();
          if (await addMoreBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
            await addMoreBtn.click();
            await page.waitForTimeout(500);
            // Re-query the last field
            const freshEls = page.locator(selector);
            const freshCount = await freshEls.count();
            redirectField = freshEls.nth(freshCount - 1);
          }
        }
        break;
      }
    }

    if (redirectField) {
      await redirectField.fill(uri);
      console.log(`[INFO] Redirect URI added: ${uri}`);
      // Press Tab or Enter to confirm the URI
      await redirectField.press('Tab');
      await page.waitForTimeout(300);
    } else {
      console.log(`[WARN] Could not find redirect URI field for: ${uri}. May need manual entry.`);
    }
  }

  await screenshot(page, '03-form-filled.png');
}

async function acceptTermsAndSubmit(page: Page): Promise<void> {
  console.log('[STEP] Looking for Terms of Service checkbox...');

  // Accept Terms of Service
  const tosSelectors = [
    'input[type="checkbox"][name*="terms" i]',
    'input[type="checkbox"][id*="terms" i]',
    'input[type="checkbox"][aria-label*="terms" i]',
    '[data-testid*="terms"] input[type="checkbox"]',
    'input[type="checkbox"]',
  ];

  for (const selector of tosSelectors) {
    const checkboxes = page.locator(selector);
    const count = await checkboxes.count();
    if (count > 0) {
      for (let i = 0; i < count; i++) {
        const cb = checkboxes.nth(i);
        const isChecked = await cb.isChecked().catch(() => false);
        if (!isChecked) {
          await cb.check({ force: true });
          console.log(`[INFO] Checked ToS checkbox (${i + 1} of ${count})`);
        }
      }
      break;
    }
  }

  await screenshot(page, '04-tos-accepted.png');

  // ── Submit the form ───────────────────────────────────────────
  console.log('[STEP] Submitting the form...');

  const submitSelectors = [
    'button[type="submit"]:has-text("Create")',
    'button:has-text("Create")',
    'button:has-text("Save")',
    '[data-testid="create-app-submit"]',
    'button[type="submit"]',
  ];

  let submitted = false;
  for (const selector of submitSelectors) {
    const btn = page.locator(selector).first();
    if (await btn.isEnabled({ timeout: 2000 }).catch(() => false)) {
      await btn.click();
      submitted = true;
      console.log(`[INFO] Submitted form via: ${selector}`);
      break;
    }
  }

  if (!submitted) {
    await screenshot(page, '04b-submit-debug.png');
    throw new Error('Could not find/click Submit button. Check 04b-submit-debug.png.');
  }

  // Wait for navigation to app detail page
  await page.waitForLoadState('networkidle', { timeout: ACTION_TIMEOUT_MS });
  await page.waitForTimeout(2000);
  await screenshot(page, '05-app-created.png');

  console.log('[INFO] App created successfully.');
  console.log(`[INFO] Current URL: ${page.url()}`);
}

async function extractCredentials(page: Page): Promise<{ clientId: string; clientSecret: string }> {
  console.log('[STEP] Navigating to Settings to extract credentials...');

  // Navigate to Settings tab
  const settingsSelectors = [
    'a:has-text("Settings")',
    'button:has-text("Settings")',
    '[data-testid="settings-tab"]',
    'nav a:has-text("Settings")',
  ];

  let navigatedToSettings = false;
  for (const selector of settingsSelectors) {
    const el = page.locator(selector).first();
    if (await el.isVisible({ timeout: 3000 }).catch(() => false)) {
      await el.click();
      navigatedToSettings = true;
      console.log(`[INFO] Navigated to Settings via: ${selector}`);
      break;
    }
  }

  if (!navigatedToSettings) {
    // Try navigating via URL if app ID is in the URL
    const currentUrl = page.url();
    const appIdMatch = currentUrl.match(/\/app\/([a-z0-9]+)/);
    if (appIdMatch) {
      const settingsUrl = `${currentUrl.replace(/\/$/, '')}/settings`;
      await page.goto(settingsUrl, { waitUntil: 'networkidle' });
      console.log(`[INFO] Navigated to Settings via URL: ${settingsUrl}`);
    } else {
      console.log('[WARN] Could not navigate to Settings automatically. Attempting to read credentials from current page.');
    }
  }

  await page.waitForTimeout(2000);
  await screenshot(page, '06-settings-page.png');

  // ── Extract Client ID ─────────────────────────────────────────
  let clientId = '';
  const clientIdSelectors = [
    '[data-testid="client-id"]',
    'input[name*="clientId" i]',
    'input[id*="client-id" i]',
    'input[readonly][value]:not([value=""])',
  ];

  // First try direct element
  for (const selector of clientIdSelectors) {
    const el = page.locator(selector).first();
    if (await el.isVisible({ timeout: 2000 }).catch(() => false)) {
      clientId = await el.inputValue().catch(async () => {
        return await el.textContent() || '';
      });
      if (clientId) {
        console.log(`[INFO] Client ID found via: ${selector}`);
        break;
      }
    }
  }

  // Fallback: search page text for 32-char alphanumeric string near "Client ID"
  if (!clientId) {
    const bodyText = await page.evaluate(() => document.body.innerText);
    const clientIdMatch = bodyText.match(/Client\s+ID[:\s]+([a-z0-9]{32})/i);
    if (clientIdMatch) {
      clientId = clientIdMatch[1];
      console.log('[INFO] Client ID extracted from page text via regex');
    }
  }

  // ── Reveal and Extract Client Secret ─────────────────────────
  console.log('[STEP] Looking for "View client secret" button...');

  const revealSelectors = [
    'button:has-text("View client secret")',
    'button:has-text("Reveal")',
    'button:has-text("Show")',
    '[data-testid="reveal-client-secret"]',
    'button[aria-label*="secret" i]',
  ];

  for (const selector of revealSelectors) {
    const btn = page.locator(selector).first();
    if (await btn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await btn.click();
      console.log(`[INFO] Clicked reveal button via: ${selector}`);
      await page.waitForTimeout(1000);
      break;
    }
  }

  await screenshot(page, '07-credentials-revealed.png');

  let clientSecret = '';
  const clientSecretSelectors = [
    '[data-testid="client-secret"]',
    'input[name*="clientSecret" i]',
    'input[id*="client-secret" i]',
  ];

  for (const selector of clientSecretSelectors) {
    const el = page.locator(selector).first();
    if (await el.isVisible({ timeout: 2000 }).catch(() => false)) {
      clientSecret = await el.inputValue().catch(async () => {
        return await el.textContent() || '';
      });
      if (clientSecret) {
        console.log(`[INFO] Client Secret found via: ${selector}`);
        break;
      }
    }
  }

  // Fallback: search page text for 32-char hex string near "Client Secret"
  if (!clientSecret) {
    const bodyText = await page.evaluate(() => document.body.innerText);
    const secretMatch = bodyText.match(/Client\s+Secret[:\s]+([a-f0-9]{32})/i);
    if (secretMatch) {
      clientSecret = secretMatch[1];
      console.log('[INFO] Client Secret extracted from page text via regex');
    }
  }

  return { clientId, clientSecret };
}

async function configureRedirectUris(page: Page): Promise<void> {
  console.log('[STEP] Verifying redirect URIs in Settings...');

  // Check if redirect URIs are already configured or need to be added in Settings
  const currentBodyText = await page.evaluate(() => document.body.innerText);

  for (const uri of APP_DETAILS.redirectUris) {
    if (currentBodyText.includes(uri)) {
      console.log(`[INFO] Redirect URI already configured: ${uri}`);
    } else {
      console.log(`[INFO] Redirect URI not found in Settings, may need to add: ${uri}`);
      // Find and fill redirect URI field
      const uriInput = page.locator('input[placeholder*="redirect" i], input[name*="redirect" i]').first();
      if (await uriInput.isVisible({ timeout: 2000 }).catch(() => false)) {
        await uriInput.fill(uri);
        const addBtn = page.locator('button:has-text("Add"), button:has-text("Save")').first();
        if (await addBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
          await addBtn.click();
          await page.waitForTimeout(500);
        }
      }
    }
  }

  // Save settings if there's a Save button
  const saveBtn = page.locator('button:has-text("Save settings"), button:has-text("Save")').first();
  if (await saveBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
    await saveBtn.click();
    console.log('[INFO] Settings saved.');
    await page.waitForTimeout(1000);
  }

  await screenshot(page, '08-settings-saved.png');
}

function saveCredentials(clientId: string, clientSecret: string): void {
  const credentialsPath = path.join(RESULTS_DIR, 'spotify-credentials.json');

  // Save credentials to a local file (NOT committed — in test-results/)
  const credentialsData = {
    appName: APP_DETAILS.name,
    clientId,
    clientSecret,
    redirectUris: APP_DETAILS.redirectUris,
    createdAt: new Date().toISOString(),
    envVars: {
      frontend: {
        VITE_SPOTIFY_CLIENT_ID: clientId,
      },
      backend: {
        SPOTIFY_CLIENT_ID: clientId,
        SPOTIFY_CLIENT_SECRET: clientSecret,
      },
    },
    nextSteps: [
      'Add VITE_SPOTIFY_CLIENT_ID to Vercel environment variables (Settings > Environment Variables)',
      'Add SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET to Railway environment variables',
      'Redeploy both frontend and backend after adding variables',
    ],
  };

  fs.writeFileSync(credentialsPath, JSON.stringify(credentialsData, null, 2));
  console.log(`\n[SAVED] Credentials saved to: ${credentialsPath}`);
}

// ── Entry Point ───────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  printDivider();
  console.log('THE VIDEO POOL — Spotify Developer App Creation');
  console.log('App: "The Video Pool"');
  printDivider();

  ensureResultsDir();

  let browser: Browser | null = null;

  try {
    // Launch headed browser — required for manual login step
    browser = await chromium.launch({
      headless: false,
      slowMo: 100,
      args: ['--start-maximized'],
    });

    const context = await browser.newContext({
      viewport: null, // Use full window size
      userAgent:
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    });

    const page = await context.newPage();

    // Navigate to Spotify Developer Dashboard
    console.log(`\n[STEP] Opening Spotify Developer Dashboard: ${SPOTIFY_DASHBOARD_URL}`);
    await page.goto(SPOTIFY_DASHBOARD_URL, { waitUntil: 'domcontentloaded', timeout: 30_000 });

    // Step 1: Wait for manual login
    await waitForDashboard(page);

    // Step 2: Click "Create app"
    await clickCreateApp(page);

    // Step 3: Fill app details
    await fillAppDetails(page);

    // Step 4: Accept ToS and submit
    await acceptTermsAndSubmit(page);

    // Step 5: Extract credentials from Settings
    const { clientId, clientSecret } = await extractCredentials(page);

    // Step 6: Configure/verify redirect URIs
    await configureRedirectUris(page);

    // Step 7: Final screenshot of Settings with credentials
    await screenshot(page, '09-final-settings.png');

    // ── Results ───────────────────────────────────────────────────
    printDivider();
    console.log('SPOTIFY APP CREATED SUCCESSFULLY');
    printDivider();
    console.log(`App Name:      ${APP_DETAILS.name}`);
    console.log(`Client ID:     ${clientId || '[NOT EXTRACTED — check screenshots]'}`);
    console.log(`Client Secret: ${clientSecret || '[NOT EXTRACTED — check screenshots]'}`);
    printDivider();
    console.log('Redirect URIs configured:');
    APP_DETAILS.redirectUris.forEach((uri) => console.log(`  - ${uri}`));
    printDivider();
    console.log('\nNEXT STEPS:');
    console.log('1. Add VITE_SPOTIFY_CLIENT_ID to Vercel (frontend)');
    console.log('2. Add SPOTIFY_CLIENT_ID + SPOTIFY_CLIENT_SECRET to Railway (backend)');
    console.log('3. Redeploy both services');
    printDivider();
    console.log(`\nScreenshots saved to: ${RESULTS_DIR}`);

    if (clientId || clientSecret) {
      saveCredentials(clientId, clientSecret);
    } else {
      console.log('\n[WARN] Could not auto-extract credentials. Check screenshots in test-results/spotify/');
      console.log('[WARN] You may need to manually copy them from the browser before closing.');
      console.log('[INFO] Keeping browser open for 60 seconds for manual extraction...');
      await page.waitForTimeout(60_000);
    }

  } catch (err) {
    console.error('\n[ERROR] Automation failed:', err);
    console.error('\n[INFO] Check screenshots in:', RESULTS_DIR);
    process.exit(1);
  } finally {
    if (browser) {
      console.log('\n[INFO] Closing browser...');
      await browser.close();
    }
  }
}

main();
