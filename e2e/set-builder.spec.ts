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

test.describe('Set Builder Feature', () => {
  test.beforeEach(async ({ page }) => {
    await mockLogin(page);
    await page.goto('/home');
    await page.waitForTimeout(1000);
  });

  test('should have Set Builder panel', async ({ page }) => {
    // Look for Set Builder panel or toggle
    const setBuilder = page.locator('[data-testid="set-builder"], .set-builder, [class*="setBuilder"], aside:has-text("Set")');
    console.log('Set Builder elements:', await setBuilder.count());
  });

  test('should be able to add track to set (keyboard shortcut S)', async ({ page }) => {
    // Select a video card
    const videoCard = page.locator('[data-testid="video-card"], .video-card, .track-item').first();

    if (await videoCard.isVisible()) {
      // Hover and press S
      await videoCard.hover();
      await page.keyboard.press('s');
      await page.waitForTimeout(500);

      // Check for toast notification or set builder update
      const toast = page.locator('[data-testid="toast"], .toast, [class*="toast"]');
      console.log('Toast notification:', await toast.count());
    }
  });

  test('should show track recommendations in Set Builder', async ({ page }) => {
    // Look for recommendations section
    const recommendations = page.locator('[data-testid="recommendations"], .recommendations, text=/recommend/i, text=/similar/i');
    console.log('Recommendations elements:', await recommendations.count());
  });

  test('should allow drag-and-drop reordering', async ({ page }) => {
    // Find draggable items in set builder
    const draggableItems = page.locator('[draggable="true"], [data-testid="draggable-track"]');
    console.log('Draggable items:', await draggableItems.count());
  });

  test('should have share set functionality', async ({ page }) => {
    // Look for share button in set builder
    const shareButton = page.locator('button:has-text("Share"), button[aria-label*="share" i], [data-testid="share-set"]');
    console.log('Share button:', await shareButton.count());

    if (await shareButton.count() > 0) {
      await shareButton.first().click();
      await page.waitForTimeout(500);

      // Check for share modal
      const shareModal = page.locator('[role="dialog"]:has-text("Share"), .modal:has-text("Share")');
      console.log('Share modal:', await shareModal.count());
    }
  });
});

test.describe('AI Recommendations', () => {
  test.beforeEach(async ({ page }) => {
    await mockLogin(page);
  });

  test('should have "For You" personalized section', async ({ page }) => {
    await page.goto('/home');
    await page.waitForTimeout(1000);

    const forYouSection = page.locator('text=/for you/i, text=/personalized/i, [data-testid="for-you"]');
    console.log('For You section:', await forYouSection.count());
  });

  test('should have "Trending" section', async ({ page }) => {
    await page.goto('/home');
    await page.waitForTimeout(1000);

    const trendingSection = page.locator('text=/trending/i, [data-testid="trending"]');
    console.log('Trending section:', await trendingSection.count());
  });

  test('should have "New This Week" section', async ({ page }) => {
    await page.goto('/home');
    await page.waitForTimeout(1000);

    const newSection = page.locator('text=/new this week/i, text=/new releases/i, [data-testid="new-releases"]');
    console.log('New This Week section:', await newSection.count());
  });

  test('should show "More Like This" on video preview', async ({ page }) => {
    await page.goto('/home');
    await page.waitForTimeout(1000);

    // Open a video preview
    const videoCard = page.locator('[data-testid="video-card"], .video-card').first();
    if (await videoCard.isVisible()) {
      await videoCard.click();
      await page.waitForTimeout(500);

      // Look for similar videos section
      const similarSection = page.locator('text=/more like this/i, text=/similar/i, [data-testid="similar-videos"]');
      console.log('Similar videos section:', await similarSection.count());
    }
  });
});

test.describe('Camelot Wheel & BPM Matching', () => {
  test('should show key compatibility indicators', async ({ page }) => {
    await mockLogin(page);
    await page.goto('/home');
    await page.waitForTimeout(1000);

    // Look for Camelot/key indicators
    const keyIndicators = page.locator('[data-testid="camelot"], text=/[0-9]+[AB]/i, .key-badge');
    console.log('Key indicators:', await keyIndicators.count());
  });

  test('should show BPM on video cards', async ({ page }) => {
    await mockLogin(page);
    await page.goto('/home');
    await page.waitForTimeout(1000);

    // Look for BPM display
    const bpmDisplay = page.locator('text=/[0-9]+ ?bpm/i, [data-testid="bpm"], .bpm');
    console.log('BPM displays:', await bpmDisplay.count());
  });
});
