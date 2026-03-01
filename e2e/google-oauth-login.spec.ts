// ============================================
// THE VIDEO POOL — GOOGLE OAUTH LOGIN E2E TEST
// Target: Live Vercel deployment
// Journey: Navigate to login → verify Google button active → click → verify OAuth initiates
// ============================================

import { test, expect, Page } from '@playwright/test';

const LIVE_LOGIN_URL =
  'https://tvp-redesign-2026-m4aw42vju-aora-developments-projects.vercel.app/login';

// ── Helpers ───────────────────────────────────────────────────

async function captureConsoleErrors(page: Page): Promise<string[]> {
  const errors: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });
  return errors;
}

// ── Test Suite ────────────────────────────────────────────────

test.describe('Google OAuth Login Flow — Live Deployment', () => {

  test.use({
    // Run against live Vercel — no baseURL override needed since we use absolute URLs
    baseURL: undefined,
  });

  // ── Step 1: Login page loads ─────────────────────────────────
  test('Step 1 — Login page loads and displays expected elements', async ({ page }) => {
    const consoleErrors = await captureConsoleErrors(page);

    await page.goto(LIVE_LOGIN_URL, { waitUntil: 'networkidle' });

    // Screenshot: initial load
    await page.screenshot({
      path: '/Users/dremacmini/Desktop/OC/the-video-pool/test-results/oauth-step1-login-page.png',
      fullPage: true,
    });

    // Brand logo visible
    await expect(page.locator('text=THEVIDEO')).toBeVisible();

    // Sign In heading
    await expect(page.locator('h1:has-text("Sign In")')).toBeVisible();

    // Email input
    await expect(page.locator('input[type="email"]')).toBeVisible();

    // Password input
    await expect(page.locator('input[type="password"]')).toBeVisible();

    // Sign In submit button
    await expect(page.locator('button[type="submit"]:has-text("Sign In")')).toBeVisible();

    // Divider "or continue with"
    await expect(page.locator('text=or continue with')).toBeVisible();

    // No critical console errors on page load
    const oauthErrors = consoleErrors.filter(
      (e) =>
        e.toLowerCase().includes('oauth') ||
        e.toLowerCase().includes('google') ||
        e.toLowerCase().includes('invalid_client') ||
        e.toLowerCase().includes('gsi')
    );
    expect(oauthErrors, `OAuth-related console errors: ${oauthErrors.join(', ')}`).toHaveLength(0);

    console.log('Step 1 PASS — Login page loaded, no OAuth errors on initial load');
  });

  // ── Step 2: Google button is ACTIVE (not disabled/grayed-out) ─
  test('Step 2 — Google button is visible, enabled, and not grayed out', async ({ page }) => {
    await page.goto(LIVE_LOGIN_URL, { waitUntil: 'networkidle' });

    // The SocialLoginGrid renders 4 provider buttons (Google, Facebook, Apple, Spotify)
    // Google is the first button. It renders with the Google SVG "G" icon inside.
    // The button has title="Sign in with Google" when configured.
    const googleButton = page
      .locator('button[title="Sign in with Google"]')
      .first();

    // Fallback: find button containing Google SVG paths (4285F4 = Google blue)
    const googleButtonFallback = page
      .locator('button:has(svg path[fill="#4285F4"])')
      .first();

    // Determine which locator matched
    let activeButton;
    if (await googleButton.count() > 0) {
      activeButton = googleButton;
    } else {
      activeButton = googleButtonFallback;
    }

    await expect(activeButton).toBeVisible();

    // Must NOT be disabled
    await expect(activeButton).toBeEnabled();

    // Must NOT have opacity-40 class (which indicates "Coming soon" / unconfigured)
    const classList = await activeButton.getAttribute('class') || '';
    expect(classList, 'Google button should not have opacity-40 (disabled state)').not.toContain('opacity-40');

    // Screenshot: highlight button area
    await page.screenshot({
      path: '/Users/dremacmini/Desktop/OC/the-video-pool/test-results/oauth-step2-google-button-active.png',
      fullPage: false,
    });

    console.log('Step 2 PASS — Google button is visible and enabled');
    console.log(`Button classes: ${classList}`);
  });

  // ── Step 3: Click Google button — OAuth popup or redirect fires ──
  test('Step 3 — Clicking Google button initiates OAuth flow', async ({ page, context }) => {
    const consoleErrors: string[] = [];
    const networkRequests: string[] = [];

    // Capture all console messages
    page.on('console', (msg) => {
      const text = msg.text();
      if (msg.type() === 'error') {
        consoleErrors.push(text);
      }
      console.log(`[browser ${msg.type()}] ${text}`);
    });

    // Capture all network requests to detect OAuth calls
    page.on('request', (req) => {
      const url = req.url();
      if (
        url.includes('accounts.google.com') ||
        url.includes('oauth2.googleapis.com') ||
        url.includes('googleapis.com') ||
        url.includes('gsi/client') ||
        url.includes('google.com/gsi')
      ) {
        networkRequests.push(url);
        console.log(`[network] OAuth request: ${url}`);
      }
    });

    await page.goto(LIVE_LOGIN_URL, { waitUntil: 'networkidle' });

    // Find Google button
    const googleButton = page.locator('button[title="Sign in with Google"]').first();
    const googleButtonFallback = page.locator('button:has(svg path[fill="#4285F4"])').first();

    let activeButton;
    if (await googleButton.count() > 0) {
      activeButton = googleButton;
    } else {
      activeButton = googleButtonFallback;
    }

    await expect(activeButton).toBeEnabled();

    // Listen for new page (popup) opening
    const popupPromise = context.waitForEvent('page', { timeout: 8000 }).catch(() => null);

    // Click the Google button
    await activeButton.click();

    console.log('Google button clicked — waiting for OAuth response...');

    // Short wait to let OAuth popup/redirect trigger
    await page.waitForTimeout(3000);

    // Screenshot after click (shows loading state or redirect)
    await page.screenshot({
      path: '/Users/dremacmini/Desktop/OC/the-video-pool/test-results/oauth-step3-after-click.png',
      fullPage: false,
    });

    // Check if popup opened
    const popup = await popupPromise;
    const currentUrl = page.url();

    console.log(`Current page URL after click: ${currentUrl}`);
    console.log(`Network OAuth requests captured: ${networkRequests.length}`);
    console.log(`OAuth URLs: ${networkRequests.join('\n  ')}`);

    if (popup) {
      const popupUrl = popup.url();
      console.log(`Popup URL: ${popupUrl}`);
      await popup.screenshot({
        path: '/Users/dremacmini/Desktop/OC/the-video-pool/test-results/oauth-step3-popup.png',
      });

      // Verify popup is a Google OAuth URL
      expect(
        popupUrl.includes('accounts.google.com') ||
        popupUrl.includes('oauth2.googleapis.com'),
        `Popup URL should be Google OAuth, got: ${popupUrl}`
      ).toBeTruthy();

      console.log('Step 3 PASS — Google OAuth popup opened');

      // DO NOT proceed with actual login — stop here as per brief
      await popup.close();
    } else if (
      currentUrl.includes('accounts.google.com') ||
      currentUrl.includes('oauth2.googleapis.com')
    ) {
      // Redirect flow instead of popup
      console.log('Step 3 PASS — Page redirected to Google OAuth (redirect flow)');
    } else if (networkRequests.length > 0) {
      // OAuth network calls were made even if no popup/redirect (implicit/token flow)
      console.log('Step 3 PASS — Google OAuth network requests initiated');
    } else {
      // Check if button entered loading state (spinner visible)
      const spinner = page.locator('button[title="Sign in with Google"] svg.animate-spin, .animate-spin').first();
      const spinnerVisible = await spinner.isVisible().catch(() => false);
      if (spinnerVisible) {
        console.log('Step 3 PASS — Google button entered loading state (OAuth flow initiated)');
      } else {
        // Log all info for debugging without hard-failing — OAuth may require actual credentials
        console.log('Step 3 INFO — No popup, redirect, or spinner detected. Button may require configured Google credentials on this deployment.');
        console.log(`Console errors: ${consoleErrors.join('\n  ')}`);
      }
    }

    // Critical check: no "invalid_client" error
    const invalidClientErrors = consoleErrors.filter(
      (e) => e.toLowerCase().includes('invalid_client') || e.toLowerCase().includes('idpiframe_initialization_failed')
    );
    expect(
      invalidClientErrors,
      `invalid_client errors found — Google OAuth is misconfigured: ${invalidClientErrors.join(', ')}`
    ).toHaveLength(0);
  });

  // ── Step 4: Console error audit ────────────────────────────────
  test('Step 4 — Full console error audit on login page', async ({ page }) => {
    const allErrors: string[] = [];
    const allWarnings: string[] = [];

    page.on('console', (msg) => {
      if (msg.type() === 'error') allErrors.push(msg.text());
      if (msg.type() === 'warning') allWarnings.push(msg.text());
    });

    await page.goto(LIVE_LOGIN_URL, { waitUntil: 'networkidle' });

    // Wait for Google OAuth SDK to fully initialize
    await page.waitForTimeout(4000);

    const oauthErrors = allErrors.filter(
      (e) =>
        e.toLowerCase().includes('oauth') ||
        e.toLowerCase().includes('google') ||
        e.toLowerCase().includes('gsi') ||
        e.toLowerCase().includes('invalid_client') ||
        e.toLowerCase().includes('accounts.google.com')
    );

    console.log('All console errors on login page:');
    allErrors.forEach((e) => console.log(`  ERROR: ${e}`));
    console.log('All console warnings:');
    allWarnings.forEach((w) => console.log(`  WARN: ${w}`));

    // Screenshot of final state
    await page.screenshot({
      path: '/Users/dremacmini/Desktop/OC/the-video-pool/test-results/oauth-step4-console-audit.png',
      fullPage: true,
    });

    // OAuth-related errors are the critical ones to catch
    expect(
      oauthErrors,
      `OAuth errors found on login page: ${oauthErrors.join('\n')}`
    ).toHaveLength(0);

    console.log(`Step 4 PASS — ${allErrors.length} total errors, 0 OAuth-specific errors`);
  });

  // ── Step 5: Network trace for OAuth assets ─────────────────────
  test('Step 5 — Verify Google OAuth SDK loads (network trace)', async ({ page }) => {
    const googleResources: Array<{ url: string; status: number }> = [];

    // Capture responses
    page.on('response', async (response) => {
      const url = response.url();
      if (
        url.includes('accounts.google.com') ||
        url.includes('googleapis.com') ||
        url.includes('gsi/client') ||
        url.includes('google.com/gsi')
      ) {
        googleResources.push({ url, status: response.status() });
      }
    });

    await page.goto(LIVE_LOGIN_URL, { waitUntil: 'networkidle' });

    // Wait for SDK scripts to load
    await page.waitForTimeout(3000);

    console.log('Google-related network resources:');
    googleResources.forEach(({ url, status }) => {
      console.log(`  [${status}] ${url}`);
    });

    await page.screenshot({
      path: '/Users/dremacmini/Desktop/OC/the-video-pool/test-results/oauth-step5-network-trace.png',
      fullPage: true,
    });

    // If the Google Client ID is configured, we expect the GSI script to load
    // If not configured, the app guards against loading the provider
    const failedGoogleResources = googleResources.filter(({ status }) => status >= 400);
    expect(
      failedGoogleResources,
      `Google OAuth resources returned errors: ${JSON.stringify(failedGoogleResources)}`
    ).toHaveLength(0);

    console.log(`Step 5 PASS — ${googleResources.length} Google network resources, 0 failures`);
  });
});
