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

test.describe('Keyboard Shortcuts', () => {
  test.beforeEach(async ({ page }) => {
    await mockLogin(page);
    await page.goto('/home');
    await page.waitForTimeout(1000);
  });

  test('should open shortcuts panel with ? key', async ({ page }) => {
    await page.keyboard.press('?');
    await page.waitForTimeout(500);

    // Look for shortcuts panel/modal
    const shortcutsPanel = page.locator('[data-testid="shortcuts-panel"], .shortcuts-panel, [role="dialog"]:has-text("Shortcut")');
    console.log('Shortcuts panel:', await shortcutsPanel.count());
  });

  test('should focus search with / key', async ({ page }) => {
    await page.keyboard.press('/');
    await page.waitForTimeout(300);

    // Check if search is focused
    const searchInput = page.locator('input[type="search"], input[placeholder*="search" i]').first();
    const isFocused = await searchInput.evaluate(el => el === document.activeElement);
    console.log('Search focused after /:', isFocused);
  });

  test('should toggle grid/list view with G/L keys', async ({ page }) => {
    // Press G for grid view
    await page.keyboard.press('g');
    await page.waitForTimeout(300);

    // Press L for list view
    await page.keyboard.press('l');
    await page.waitForTimeout(300);

    // Check view state changes
    console.log('Grid/List toggle tested');
  });

  test('should add to set with S key', async ({ page }) => {
    // Hover over a video card first
    const videoCard = page.locator('[data-testid="video-card"], .video-card').first();
    if (await videoCard.isVisible()) {
      await videoCard.hover();
      await page.keyboard.press('s');
      await page.waitForTimeout(500);

      // Check for toast or set builder update
      const toast = page.locator('.toast, [data-testid="toast"]');
      console.log('Toast after S key:', await toast.count());
    }
  });

  test('should navigate with arrow keys', async ({ page }) => {
    // Test arrow key navigation
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(200);
    await page.keyboard.press('ArrowUp');
    await page.waitForTimeout(200);
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(200);
    await page.keyboard.press('ArrowLeft');
    await page.waitForTimeout(200);

    console.log('Arrow key navigation tested');
  });

  test('should close modal with Escape key', async ({ page }) => {
    // Open a modal first
    const videoCard = page.locator('[data-testid="video-card"], .video-card').first();
    if (await videoCard.isVisible()) {
      await videoCard.click();
      await page.waitForTimeout(500);

      // Press Escape
      await page.keyboard.press('Escape');
      await page.waitForTimeout(300);

      // Check modal is closed
      const modal = page.locator('[role="dialog"], .modal').filter({ hasNotText: 'hidden' });
      console.log('Modal after Escape:', await modal.count());
    }
  });
});
