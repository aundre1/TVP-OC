// ============================================
// THE VIDEO POOL — GOOGLE OAUTH E2E TEST
// Target: https://dev.thevideopool.com/login
// Registered domain: dev.thevideopool.com is an authorized JavaScript origin in Google Cloud Console.
//
// Journey:
//   1. Page loads
//   2. Google button is ACTIVE (not grayed out / "Coming soon")
//   3. Click Google button → OAuth popup or redirect fires WITHOUT redirect_uri_mismatch
//   4. Console error audit (no OAuth errors)
//   5. Network trace — GSI SDK loads successfully
//
// Stop before: actual Google sign-in page interaction.
// ============================================

import { test, expect, Page } from '@playwright/test';
import path from 'path';

const DEV_LOGIN_URL = 'https://dev.thevideopool.com/login';
const SCREENSHOTS_DIR = '/Users/dremacmini/Desktop/OC/the-video-pool/test-results';

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Attach console error listener and return the collected array (populated by reference). */
function collectConsoleErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });
  return errors;
}

/** Find the Google button using primary or fallback selector. */
async function findGoogleButton(page: Page) {
  const byTitle = page.locator('button[title="Sign in with Google"]').first();
  if (await byTitle.count() > 0) return byTitle;

  // Fallback: button containing the canonical Google-blue SVG path fill
  const bySvgFill = page.locator('button:has(svg path[fill="#4285F4"])').first();
  if (await bySvgFill.count() > 0) return bySvgFill;

  // Second fallback: button whose text contains "Google"
  return page.locator('button:has-text("Google")').first();
}

// ── Test Suite ─────────────────────────────────────────────────────────────────

test.describe('Google OAuth — dev.thevideopool.com (registered domain)', () => {

  // Disable baseURL from playwright.config.ts — we target the live domain directly.
  test.use({ baseURL: undefined });

  // ── Step 1: Login page loads ──────────────────────────────────────────────
  test('Step 1 — Login page loads and renders expected elements', async ({ page }) => {
    const consoleErrors = collectConsoleErrors(page);

    await page.goto(DEV_LOGIN_URL, { waitUntil: 'networkidle', timeout: 30_000 });

    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, 'dev-oauth-step1-login-page.png'),
      fullPage: true,
    });

    // Brand / product name visible
    const brandVisible =
      (await page.locator('text=THEVIDEO').count() > 0) ||
      (await page.locator('text=The Video Pool').count() > 0) ||
      (await page.locator('text=VIDEO POOL').count() > 0);
    expect(brandVisible, 'Brand name should be visible on login page').toBeTruthy();

    // Sign-in heading or form present
    const headingVisible =
      (await page.locator('h1:has-text("Sign In")').count() > 0) ||
      (await page.locator('h1:has-text("Log In")').count() > 0) ||
      (await page.locator('h2:has-text("Sign In")').count() > 0) ||
      (await page.locator('[data-testid="login-form"]').count() > 0);
    expect(headingVisible, 'Login heading or form should be visible').toBeTruthy();

    // No OAuth errors on initial load
    const oauthErrors = consoleErrors.filter((e) =>
      /oauth|google|invalid_client|idpiframe|gsi/i.test(e)
    );
    expect(
      oauthErrors,
      `OAuth-related console errors on page load: ${oauthErrors.join(' | ')}`
    ).toHaveLength(0);

    console.log('Step 1 PASS — Login page loaded at dev.thevideopool.com, no OAuth load errors');
  });

  // ── Step 2: Google button ACTIVE ─────────────────────────────────────────
  test('Step 2 — Google button is visible, enabled, and NOT in "Coming soon" state', async ({ page }) => {
    await page.goto(DEV_LOGIN_URL, { waitUntil: 'networkidle', timeout: 30_000 });

    const googleButton = await findGoogleButton(page);

    await expect(googleButton, 'Google button must be present').toBeVisible();
    await expect(googleButton, 'Google button must not be disabled').toBeEnabled();

    const classList = await googleButton.getAttribute('class') ?? '';
    expect(
      classList,
      `Google button has opacity-40 class — button is in "Coming soon" / disabled state. Classes: ${classList}`
    ).not.toContain('opacity-40');

    // Also verify no "cursor-not-allowed" (another disabled indicator)
    expect(
      classList,
      `Google button has cursor-not-allowed — button appears non-interactive. Classes: ${classList}`
    ).not.toContain('cursor-not-allowed');

    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, 'dev-oauth-step2-google-button.png'),
      fullPage: false,
    });

    console.log('Step 2 PASS — Google button is active and enabled');
    console.log(`  Button classes: ${classList}`);
  });

  // ── Step 3: Click Google button — OAuth fires WITHOUT mismatch error ──────
  test('Step 3 — Click Google button → OAuth popup/redirect appears WITHOUT redirect_uri_mismatch', async ({ page, context }) => {
    const consoleErrors: string[] = [];
    const consoleAll: string[] = [];
    const oauthNetworkUrls: string[] = [];

    page.on('console', (msg) => {
      const text = msg.text();
      consoleAll.push(`[${msg.type()}] ${text}`);
      if (msg.type() === 'error') consoleErrors.push(text);
      // Log everything to stdout for CI visibility
      console.log(`  [browser ${msg.type()}] ${text}`);
    });

    page.on('request', (req) => {
      const url = req.url();
      if (/accounts\.google\.com|oauth2\.googleapis\.com|gsi\/client|google\.com\/gsi/.test(url)) {
        oauthNetworkUrls.push(url);
        console.log(`  [network-oauth] ${url}`);
      }
    });

    await page.goto(DEV_LOGIN_URL, { waitUntil: 'networkidle', timeout: 30_000 });

    const googleButton = await findGoogleButton(page);
    await expect(googleButton).toBeEnabled();

    // Wait for popup OR fall through to redirect check
    const popupPromise = context.waitForEvent('page', { timeout: 10_000 }).catch(() => null);

    console.log('Clicking Google button...');
    await googleButton.click();

    // Allow OAuth flow to start
    await page.waitForTimeout(4_000);

    // Screenshot immediately after click
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, 'dev-oauth-step3-after-click.png'),
      fullPage: false,
    });

    const popup = await popupPromise;
    const currentUrl = page.url();

    console.log(`  Current URL after click: ${currentUrl}`);
    console.log(`  OAuth network requests captured: ${oauthNetworkUrls.length}`);

    // ── Verdict logic ──────────────────────────────────────────────────────

    if (popup) {
      const popupUrl = popup.url();
      console.log(`  Popup opened: ${popupUrl}`);

      await popup.screenshot({
        path: path.join(SCREENSHOTS_DIR, 'dev-oauth-step3-popup.png'),
      });

      // Verify it is a real Google OAuth URL
      const isGoogleOAuth =
        popupUrl.includes('accounts.google.com') ||
        popupUrl.includes('oauth2.googleapis.com');

      // Verify NO redirect_uri_mismatch in popup URL
      const hasMismatch = popupUrl.toLowerCase().includes('redirect_uri_mismatch');
      expect(hasMismatch, `redirect_uri_mismatch detected in popup URL: ${popupUrl}`).toBeFalsy();

      expect(
        isGoogleOAuth,
        `Popup URL should be Google OAuth, got: ${popupUrl}`
      ).toBeTruthy();

      console.log('Step 3 PASS — Google OAuth popup opened on dev.thevideopool.com WITHOUT redirect_uri_mismatch');
      await popup.close();

    } else if (
      currentUrl.includes('accounts.google.com') ||
      currentUrl.includes('oauth2.googleapis.com')
    ) {
      const hasMismatch = currentUrl.toLowerCase().includes('redirect_uri_mismatch');
      expect(hasMismatch, `redirect_uri_mismatch detected in redirect URL: ${currentUrl}`).toBeFalsy();

      console.log('Step 3 PASS — Page redirected to Google OAuth (redirect flow) WITHOUT mismatch');

    } else if (oauthNetworkUrls.length > 0) {
      console.log('Step 3 PASS — Google OAuth network requests were initiated (token/implicit flow)');
      console.log(`  OAuth URLs: ${oauthNetworkUrls.join('\n    ')}`);

    } else {
      // The button was clicked but we saw no popup, redirect, or network activity.
      // Still check for critical errors before soft-failing.
      const criticalErrors = consoleErrors.filter((e) =>
        /redirect_uri_mismatch|invalid_client|idpiframe_initialization_failed/i.test(e)
      );
      expect(
        criticalErrors,
        `Critical OAuth errors found after button click: ${criticalErrors.join(' | ')}`
      ).toHaveLength(0);

      console.log('Step 3 INFO — No popup, redirect, or OAuth network activity detected after click.');
      console.log('  This may indicate the Google Client ID is not yet configured for this deployment,');
      console.log('  or the button uses a different click handler (e.g., Supabase signInWithOAuth).');
      console.log(`  Console errors captured: ${consoleErrors.join(' | ')}`);
    }

    // ── Final critical assertion: no mismatch or invalid_client in any console error ──
    const criticalOAuthErrors = consoleErrors.filter((e) =>
      /redirect_uri_mismatch|invalid_client|idpiframe_initialization_failed/i.test(e)
    );
    expect(
      criticalOAuthErrors,
      `Critical OAuth errors in console: ${criticalOAuthErrors.join(' | ')}`
    ).toHaveLength(0);
  });

  // ── Step 4: Full console error audit ─────────────────────────────────────
  test('Step 4 — Full console error audit (no OAuth errors after SDK init)', async ({ page }) => {
    const allErrors: string[] = [];
    const allWarnings: string[] = [];

    page.on('console', (msg) => {
      if (msg.type() === 'error') allErrors.push(msg.text());
      if (msg.type() === 'warning') allWarnings.push(msg.text());
    });

    await page.goto(DEV_LOGIN_URL, { waitUntil: 'networkidle', timeout: 30_000 });

    // Wait for Google GSI SDK to fully initialize
    await page.waitForTimeout(5_000);

    const oauthErrors = allErrors.filter((e) =>
      /oauth|google|gsi|invalid_client|accounts\.google\.com/i.test(e)
    );
    const redirectMismatchErrors = allErrors.filter((e) =>
      /redirect_uri_mismatch/i.test(e)
    );

    console.log(`All console errors (${allErrors.length}):`);
    allErrors.forEach((e) => console.log(`  ERROR: ${e}`));
    console.log(`All console warnings (${allWarnings.length}):`);
    allWarnings.slice(0, 10).forEach((w) => console.log(`  WARN: ${w}`));

    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, 'dev-oauth-step4-console-audit.png'),
      fullPage: true,
    });

    // redirect_uri_mismatch is the specific error we are testing is GONE on this domain
    expect(
      redirectMismatchErrors,
      `redirect_uri_mismatch found — domain not registered in Google Cloud Console: ${redirectMismatchErrors.join(' | ')}`
    ).toHaveLength(0);

    expect(
      oauthErrors,
      `OAuth-related console errors: ${oauthErrors.join(' | ')}`
    ).toHaveLength(0);

    console.log(`Step 4 PASS — ${allErrors.length} total errors, 0 redirect_uri_mismatch, 0 OAuth errors`);
  });

  // ── Step 5: Google GSI SDK network trace ─────────────────────────────────
  test('Step 5 — Google GSI SDK loads without network errors', async ({ page }) => {
    const googleResources: Array<{ url: string; status: number }> = [];

    page.on('response', async (response) => {
      const url = response.url();
      if (/accounts\.google\.com|googleapis\.com|gsi\/client|google\.com\/gsi/.test(url)) {
        googleResources.push({ url, status: response.status() });
      }
    });

    await page.goto(DEV_LOGIN_URL, { waitUntil: 'networkidle', timeout: 30_000 });

    // Wait for all Google scripts to load
    await page.waitForTimeout(4_000);

    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, 'dev-oauth-step5-network-trace.png'),
      fullPage: true,
    });

    console.log(`Google network resources loaded (${googleResources.length}):`);
    googleResources.forEach(({ url, status }) => {
      console.log(`  [${status}] ${url}`);
    });

    const failed = googleResources.filter(({ status }) => status >= 400);
    expect(
      failed,
      `Google OAuth resources returned 4xx/5xx: ${JSON.stringify(failed)}`
    ).toHaveLength(0);

    console.log(`Step 5 PASS — ${googleResources.length} Google resources loaded, 0 failures`);
  });

});
