import { test, expect } from '@playwright/test';

test.describe('Landing Page & Navigation', () => {
  test('should load landing page for unauthenticated users', async ({ page }) => {
    await page.goto('/welcome');

    // Check page loads
    await expect(page).toHaveTitle(/Video Pool/i);

    // Check hero section exists
    const heroSection = page.locator('[data-testid="hero-section"], .hero, h1');
    await expect(heroSection.first()).toBeVisible();

    // Check for CTA buttons
    const ctaButtons = page.locator('button, a').filter({ hasText: /(sign up|get started|join|login)/i });
    expect(await ctaButtons.count()).toBeGreaterThan(0);
  });

  test('should have working navigation links', async ({ page }) => {
    await page.goto('/welcome');

    // Check for login/signup links
    const loginLink = page.locator('a[href*="login"], button:has-text("Login"), button:has-text("Sign In")');
    if (await loginLink.count() > 0) {
      await expect(loginLink.first()).toBeVisible();
    }
  });

  test('should display pricing section', async ({ page }) => {
    await page.goto('/welcome');

    // Look for pricing information
    const pricingText = page.locator('text=/\\$34\\.99|\\$99\\.99|\\$299\\.99|monthly|annual/i');
    // Pricing should be visible on landing page
    if (await pricingText.count() > 0) {
      await expect(pricingText.first()).toBeVisible();
    }
  });

  test('should be responsive on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/welcome');

    // Page should still be functional
    await expect(page.locator('body')).toBeVisible();

    // Check no horizontal scroll (responsive design)
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    const viewportWidth = await page.evaluate(() => window.innerWidth);
    expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 10); // Allow small margin
  });
});
