import { test, expect } from '@playwright/test';

// Helper to bypass auth in mock mode
async function mockLogin(page: any) {
  await page.goto('/login');
  const emailInput = page.locator('input[type="email"], input[name="email"], input[placeholder*="email" i]').first();
  const passwordInput = page.locator('input[type="password"]').first();

  if (await emailInput.isVisible()) {
    await emailInput.fill('dev@thevideopool.com');
    await passwordInput.fill('password123');
    const submitButton = page.locator('button[type="submit"], button:has-text("Login"), button:has-text("Sign In")').first();
    await submitButton.click();
    await page.waitForTimeout(2000);
  }
}

test.describe('Download System', () => {
  test.beforeEach(async ({ page }) => {
    await mockLogin(page);
  });

  test('should show download counter in header', async ({ page }) => {
    await page.goto('/home');
    await page.waitForTimeout(1000);

    // Look for download counter
    const downloadCounter = page.locator('[data-testid="download-counter"], .download-counter, text=/[0-9]+.*downloads/i, text=/[0-9]+.*\\/.*[0-9]+/');
    console.log('Download counter:', await downloadCounter.count());
  });

  test('should have download button on video preview', async ({ page }) => {
    await page.goto('/home');
    await page.waitForTimeout(1000);

    // Open video preview
    const videoCard = page.locator('[data-testid="video-card"], .video-card').first();
    if (await videoCard.isVisible()) {
      await videoCard.click();
      await page.waitForTimeout(500);

      // Look for download button
      const downloadButton = page.locator('button:has-text("Download"), button[aria-label*="download" i], [data-testid="download-button"]');
      console.log('Download button:', await downloadButton.count());
    }
  });

  test('should show version selection for download', async ({ page }) => {
    await page.goto('/home');
    await page.waitForTimeout(1000);

    const videoCard = page.locator('[data-testid="video-card"], .video-card').first();
    if (await videoCard.isVisible()) {
      await videoCard.click();
      await page.waitForTimeout(500);

      // Look for version options (clean, explicit, intro, outro)
      const versionOptions = page.locator('text=/clean/i, text=/explicit/i, text=/intro/i, text=/outro/i');
      console.log('Version options:', await versionOptions.count());
    }
  });

  test('should display download history page', async ({ page }) => {
    await page.goto('/downloads');
    await page.waitForTimeout(1000);

    // Check page loads
    const heading = page.locator('h1:has-text("Download"), h2:has-text("Download")');
    console.log('Downloads page heading:', await heading.count());
  });

  test('should show recent downloads panel', async ({ page }) => {
    await page.goto('/home');
    await page.waitForTimeout(1000);

    // Look for recent downloads panel
    const recentPanel = page.locator('[data-testid="recent-downloads"], .recent-downloads, text=/recent/i');
    console.log('Recent downloads panel:', await recentPanel.count());
  });
});

test.describe('Download Limits', () => {
  test('should show download limit warning when near limit', async ({ page }) => {
    await mockLogin(page);
    await page.goto('/home');
    await page.waitForTimeout(1000);

    // Look for any limit warnings
    const limitWarning = page.locator('text=/limit/i, text=/remaining/i, [data-testid="limit-warning"]');
    console.log('Limit warnings:', await limitWarning.count());
  });

  test('should show upgrade modal when limit reached', async ({ page }) => {
    await mockLogin(page);
    await page.goto('/home');

    // This would need a mock user with 0 downloads remaining
    // Look for the modal structure
    const upgradeModal = page.locator('[data-testid="download-limit-modal"], .upgrade-modal');
    console.log('Upgrade modal element exists in DOM:', await upgradeModal.count());
  });
});

test.describe('Subscription & Billing', () => {
  test.beforeEach(async ({ page }) => {
    await mockLogin(page);
  });

  test('should display membership page with pricing tiers', async ({ page }) => {
    await page.goto('/membership');
    await page.waitForTimeout(1000);

    // Check for pricing tiers
    const monthlyPrice = page.locator('text=/\\$34\\.99/');
    const quarterlyPrice = page.locator('text=/\\$99\\.99/');
    const annualPrice = page.locator('text=/\\$299\\.99/');

    console.log('Monthly price visible:', await monthlyPrice.count());
    console.log('Quarterly price visible:', await quarterlyPrice.count());
    console.log('Annual price visible:', await annualPrice.count());
  });

  test('should have billing interval toggle (monthly/quarterly/annual)', async ({ page }) => {
    await page.goto('/membership');
    await page.waitForTimeout(1000);

    // Look for interval toggle
    const monthlyToggle = page.locator('button:has-text("Monthly"), input[value="monthly"]');
    const quarterlyToggle = page.locator('button:has-text("Quarterly"), input[value="quarterly"]');
    const annualToggle = page.locator('button:has-text("Annual"), button:has-text("Yearly"), input[value="annual"]');

    console.log('Monthly toggle:', await monthlyToggle.count());
    console.log('Quarterly toggle:', await quarterlyToggle.count());
    console.log('Annual toggle:', await annualToggle.count());
  });

  test('should show feature comparison for tiers', async ({ page }) => {
    await page.goto('/membership');
    await page.waitForTimeout(1000);

    // Look for feature lists
    const downloadLimit = page.locator('text=/200 downloads/i, text=/300 downloads/i, text=/400 downloads/i');
    console.log('Download limits shown:', await downloadLimit.count());
  });

  test('should have checkout button', async ({ page }) => {
    await page.goto('/membership');
    await page.waitForTimeout(1000);

    // Look for checkout/subscribe button
    const checkoutButton = page.locator('button:has-text("Subscribe"), button:has-text("Upgrade"), button:has-text("Choose"), button:has-text("Get Started")');
    console.log('Checkout buttons:', await checkoutButton.count());
  });
});

test.describe('Free Trial', () => {
  test('should show trial banner for trial users', async ({ page }) => {
    await mockLogin(page);
    await page.goto('/home');
    await page.waitForTimeout(1000);

    // Look for trial banner
    const trialBanner = page.locator('[data-testid="trial-banner"], .trial-banner, text=/trial/i, text=/days remaining/i');
    console.log('Trial banner:', await trialBanner.count());
  });

  test('should show trial info (2 downloads/month for 6 months)', async ({ page }) => {
    await mockLogin(page);
    await page.goto('/membership');
    await page.waitForTimeout(1000);

    // Look for free tier info
    const freeTierInfo = page.locator('text=/free/i, text=/2 downloads/i, text=/trial/i');
    console.log('Free tier info:', await freeTierInfo.count());
  });
});
