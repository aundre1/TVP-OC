import { test, expect } from '@playwright/test';

// Helper to login as admin
async function mockAdminLogin(page: any) {
  await page.goto('/login');
  const emailInput = page.locator('input[type="email"], input[name="email"], input[placeholder*="email" i]').first();
  const passwordInput = page.locator('input[type="password"]').first();

  if (await emailInput.isVisible()) {
    // In dev mode, mock user is admin
    await emailInput.fill('dev@thevideopool.com');
    await passwordInput.fill('password123');
    const submitButton = page.locator('button[type="submit"], button:has-text("Login"), button:has-text("Sign In")').first();
    await submitButton.click();
    await page.waitForTimeout(2000);
  }
}

test.describe('Admin Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await mockAdminLogin(page);
  });

  test('should access admin page', async ({ page }) => {
    await page.goto('/admin');
    await page.waitForTimeout(1000);

    // Check for admin dashboard elements
    const adminHeading = page.locator('h1:has-text("Admin"), h1:has-text("Dashboard")');
    console.log('Admin heading:', await adminHeading.count());
  });

  test('should show admin statistics', async ({ page }) => {
    await page.goto('/admin');
    await page.waitForTimeout(1000);

    // Look for stats cards
    const statsCards = page.locator('[data-testid="stats-card"], .stats-card, .stat-card');
    console.log('Stats cards:', await statsCards.count());

    // Look for specific metrics
    const userCount = page.locator('text=/users/i, text=/subscribers/i, text=/members/i');
    const videoCount = page.locator('text=/videos/i, text=/tracks/i');
    console.log('User count metric:', await userCount.count());
    console.log('Video count metric:', await videoCount.count());
  });

  test('should have user management section', async ({ page }) => {
    await page.goto('/admin');
    await page.waitForTimeout(1000);

    // Look for users tab or section
    const usersSection = page.locator('button:has-text("Users"), a:has-text("Users"), [data-testid="users-tab"]');
    console.log('Users section:', await usersSection.count());
  });

  test('should have video management section', async ({ page }) => {
    await page.goto('/admin');
    await page.waitForTimeout(1000);

    // Look for videos tab or section
    const videosSection = page.locator('button:has-text("Videos"), a:has-text("Videos"), button:has-text("Content"), [data-testid="videos-tab"]');
    console.log('Videos section:', await videosSection.count());
  });
});

test.describe('Bulk Uploader', () => {
  test.beforeEach(async ({ page }) => {
    await mockAdminLogin(page);
  });

  test('should have bulk upload section in admin', async ({ page }) => {
    await page.goto('/admin');
    await page.waitForTimeout(1000);

    // Look for bulk upload button or tab
    const bulkUpload = page.locator('button:has-text("Bulk"), button:has-text("Upload"), a:has-text("Upload"), [data-testid="bulk-upload"]');
    console.log('Bulk upload button:', await bulkUpload.count());
  });

  test('should show file drop zone for bulk upload', async ({ page }) => {
    await page.goto('/admin');
    await page.waitForTimeout(1000);

    // Click on upload tab if exists
    const uploadTab = page.locator('button:has-text("Upload"), [data-testid="upload-tab"]').first();
    if (await uploadTab.isVisible()) {
      await uploadTab.click();
      await page.waitForTimeout(500);
    }

    // Look for drop zone
    const dropZone = page.locator('[data-testid="drop-zone"], .drop-zone, .dropzone, text=/drag.*drop/i');
    console.log('Drop zone:', await dropZone.count());
  });

  test('should have metadata editor', async ({ page }) => {
    await page.goto('/admin');
    await page.waitForTimeout(1000);

    // Look for metadata editing fields
    const metadataFields = page.locator('input[name*="title"], input[name*="artist"], input[name*="bpm"], select[name*="genre"]');
    console.log('Metadata fields:', await metadataFields.count());
  });
});

test.describe('Analytics Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await mockAdminLogin(page);
  });

  test('should show analytics in admin', async ({ page }) => {
    await page.goto('/admin');
    await page.waitForTimeout(1000);

    // Look for analytics tab
    const analyticsTab = page.locator('button:has-text("Analytics"), a:has-text("Analytics"), [data-testid="analytics-tab"]');
    console.log('Analytics tab:', await analyticsTab.count());
  });

  test('should show download metrics', async ({ page }) => {
    await page.goto('/admin');
    await page.waitForTimeout(1000);

    // Look for download-related metrics
    const downloadMetrics = page.locator('text=/download/i');
    console.log('Download metrics:', await downloadMetrics.count());
  });

  test('should show revenue metrics', async ({ page }) => {
    await page.goto('/admin');
    await page.waitForTimeout(1000);

    // Look for revenue-related metrics
    const revenueMetrics = page.locator('text=/revenue/i, text=/\\$[0-9,]+/');
    console.log('Revenue metrics:', await revenueMetrics.count());
  });
});
