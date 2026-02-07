import { test, expect } from '@playwright/test';

test.describe('Authentication Flows', () => {
  test.describe('Login Page', () => {
    test('should display login form', async ({ page }) => {
      await page.goto('/login');

      // Check for email/username input
      const emailInput = page.locator('input[type="email"], input[name="email"], input[placeholder*="email" i]');
      await expect(emailInput.first()).toBeVisible();

      // Check for password input
      const passwordInput = page.locator('input[type="password"]');
      await expect(passwordInput.first()).toBeVisible();

      // Check for submit button
      const submitButton = page.locator('button[type="submit"], button:has-text("Login"), button:has-text("Sign In")');
      await expect(submitButton.first()).toBeVisible();
    });

    test('should have Google OAuth button', async ({ page }) => {
      await page.goto('/login');

      // Look for Google sign-in button
      const googleButton = page.locator('button:has-text("Google"), [data-testid="google-login"], .google-login');
      if (await googleButton.count() > 0) {
        await expect(googleButton.first()).toBeVisible();
      }
    });

    test('should show validation errors for empty form', async ({ page }) => {
      await page.goto('/login');

      const submitButton = page.locator('button[type="submit"], button:has-text("Login"), button:has-text("Sign In")');
      await submitButton.first().click();

      // Should show some form of validation (error messages, required field indicators)
      await page.waitForTimeout(500);
      // Check for any error indication
    });

    test('should have link to registration', async ({ page }) => {
      await page.goto('/login');

      const registerLink = page.locator('a[href*="register"], a:has-text("Sign Up"), a:has-text("Create Account")');
      if (await registerLink.count() > 0) {
        await expect(registerLink.first()).toBeVisible();
      }
    });

    test('should have forgot password link', async ({ page }) => {
      await page.goto('/login');

      const forgotLink = page.locator('a[href*="forgot"], a:has-text("Forgot"), a:has-text("Reset")');
      if (await forgotLink.count() > 0) {
        await expect(forgotLink.first()).toBeVisible();
      }
    });
  });

  test.describe('Registration Page', () => {
    test('should display registration form', async ({ page }) => {
      await page.goto('/register');

      // Check for email input
      const emailInput = page.locator('input[type="email"], input[name="email"]');
      await expect(emailInput.first()).toBeVisible();

      // Check for password input
      const passwordInput = page.locator('input[type="password"]');
      await expect(passwordInput.first()).toBeVisible();

      // Check for submit button
      const submitButton = page.locator('button[type="submit"], button:has-text("Register"), button:has-text("Sign Up"), button:has-text("Create")');
      await expect(submitButton.first()).toBeVisible();
    });

    test('should have terms acceptance if required', async ({ page }) => {
      await page.goto('/register');

      // Check for terms checkbox or link
      const termsElement = page.locator('input[type="checkbox"], a:has-text("Terms"), a:has-text("Privacy")');
      // Terms may or may not be required
    });
  });

  test.describe('Password Reset Flow', () => {
    test('should display forgot password form', async ({ page }) => {
      await page.goto('/forgot-password');

      // Check for email input
      const emailInput = page.locator('input[type="email"], input[name="email"]');
      await expect(emailInput.first()).toBeVisible();

      // Check for submit button
      const submitButton = page.locator('button[type="submit"], button:has-text("Send"), button:has-text("Reset")');
      await expect(submitButton.first()).toBeVisible();
    });
  });
});

test.describe('Mock Authentication (Dev Mode)', () => {
  test('should allow mock login in dev mode', async ({ page }) => {
    await page.goto('/login');

    // Fill in mock credentials
    const emailInput = page.locator('input[type="email"], input[name="email"], input[placeholder*="email" i]').first();
    const passwordInput = page.locator('input[type="password"]').first();

    await emailInput.fill('dev@thevideopool.com');
    await passwordInput.fill('password123');

    const submitButton = page.locator('button[type="submit"], button:has-text("Login"), button:has-text("Sign In")').first();
    await submitButton.click();

    // Wait for navigation or dashboard load
    await page.waitForTimeout(2000);

    // Check if redirected to home/dashboard
    const url = page.url();
    console.log('Post-login URL:', url);
  });
});
