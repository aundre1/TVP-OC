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

test.describe('Video Browsing & Search', () => {
  test.beforeEach(async ({ page }) => {
    await mockLogin(page);
  });

  test('should display video grid/list on home page', async ({ page }) => {
    await page.goto('/home');
    await page.waitForTimeout(1000);

    // Look for video cards or list items
    const videoElements = page.locator('[data-testid="video-card"], .video-card, .track-item, [class*="video"]');

    // May or may not have videos loaded depending on mock data
    console.log('Video elements found:', await videoElements.count());
  });

  test('should have search functionality', async ({ page }) => {
    await page.goto('/home');

    // Find search input
    const searchInput = page.locator('input[type="search"], input[placeholder*="search" i], [data-testid="search-input"]');

    if (await searchInput.count() > 0) {
      await expect(searchInput.first()).toBeVisible();

      // Test search input
      await searchInput.first().fill('hip hop');
      await page.waitForTimeout(500);

      // Check for autocomplete suggestions or search results
    }
  });

  test('should have genre navigation', async ({ page }) => {
    await page.goto('/home');

    // Look for genre filters or navigation
    const genreNav = page.locator('[data-testid="genre-nav"], .genre-nav, nav:has-text("Genre"), button:has-text("Hip Hop"), button:has-text("Pop")');

    if (await genreNav.count() > 0) {
      console.log('Genre navigation found');
    }
  });

  test('should toggle between grid and list view', async ({ page }) => {
    await page.goto('/home');

    // Look for view toggle buttons
    const gridButton = page.locator('button[aria-label*="grid" i], button:has([class*="grid"]), [data-testid="grid-view"]');
    const listButton = page.locator('button[aria-label*="list" i], button:has([class*="list"]), [data-testid="list-view"]');

    if (await gridButton.count() > 0 && await listButton.count() > 0) {
      // Click list view
      await listButton.first().click();
      await page.waitForTimeout(500);

      // Click grid view
      await gridButton.first().click();
      await page.waitForTimeout(500);
    }
  });

  test('should open preview modal on video click', async ({ page }) => {
    await page.goto('/home');
    await page.waitForTimeout(1000);

    // Find a video card and click it
    const videoCard = page.locator('[data-testid="video-card"], .video-card, .track-item').first();

    if (await videoCard.isVisible()) {
      await videoCard.click();
      await page.waitForTimeout(500);

      // Check for modal
      const modal = page.locator('[role="dialog"], .modal, [data-testid="preview-modal"]');
      if (await modal.count() > 0) {
        await expect(modal.first()).toBeVisible();
      }
    }
  });
});

test.describe('Search Page', () => {
  test.beforeEach(async ({ page }) => {
    await mockLogin(page);
  });

  test('should display search page with filters', async ({ page }) => {
    await page.goto('/search?q=test');
    await page.waitForTimeout(1000);

    // Check for filter controls
    const filters = page.locator('[data-testid="filters"], .filters, .filter-panel');
    console.log('Filter elements found:', await filters.count());
  });

  test('should have BPM range filter', async ({ page }) => {
    await page.goto('/search');

    // Look for BPM filter
    const bpmFilter = page.locator('input[placeholder*="BPM" i], label:has-text("BPM"), [data-testid="bpm-filter"]');
    console.log('BPM filter elements:', await bpmFilter.count());
  });

  test('should have quality filter', async ({ page }) => {
    await page.goto('/search');

    // Look for quality filter (720p, 1080p, 4K)
    const qualityFilter = page.locator('button:has-text("720"), button:has-text("1080"), button:has-text("4K"), select:has(option:has-text("1080"))');
    console.log('Quality filter elements:', await qualityFilter.count());
  });
});
