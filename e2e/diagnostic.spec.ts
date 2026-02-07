import { test, expect } from '@playwright/test';

test.describe('Diagnostic Tests', () => {
  test('capture landing page state', async ({ page }) => {
    test.setTimeout(60000);

    // Navigate to root
    await page.goto('/');
    await page.waitForTimeout(3000);

    // Log URL and title
    console.log('Current URL:', page.url());
    console.log('Page title:', await page.title());

    // Get page content
    const bodyHTML = await page.locator('body').innerHTML();
    console.log('Body HTML (first 2000 chars):', bodyHTML.substring(0, 2000));

    // Check for any visible text
    const allText = await page.locator('body').innerText();
    console.log('Visible text (first 1000 chars):', allText.substring(0, 1000));

    // Check for any errors in console
    page.on('console', msg => console.log('Browser console:', msg.text()));
    page.on('pageerror', err => console.log('Page error:', err.message));

    // Screenshot
    await page.screenshot({ path: 'playwright-report/diagnostic-root.png', fullPage: true });
  });

  test('capture /welcome page state', async ({ page }) => {
    test.setTimeout(60000);

    await page.goto('/welcome');
    await page.waitForTimeout(3000);

    console.log('URL after /welcome:', page.url());

    const bodyText = await page.locator('body').innerText();
    console.log('/welcome text:', bodyText.substring(0, 1000));

    await page.screenshot({ path: 'playwright-report/diagnostic-welcome.png', fullPage: true });
  });

  test('capture /login page state', async ({ page }) => {
    test.setTimeout(60000);

    await page.goto('/login');
    await page.waitForTimeout(3000);

    console.log('URL after /login:', page.url());

    const bodyText = await page.locator('body').innerText();
    console.log('/login text:', bodyText.substring(0, 1000));

    // Check for input fields
    const inputs = await page.locator('input').all();
    console.log('Input fields found:', inputs.length);
    for (const input of inputs) {
      const type = await input.getAttribute('type');
      const name = await input.getAttribute('name');
      const placeholder = await input.getAttribute('placeholder');
      console.log(`  Input: type=${type}, name=${name}, placeholder=${placeholder}`);
    }

    // Check for buttons
    const buttons = await page.locator('button').all();
    console.log('Buttons found:', buttons.length);
    for (const button of buttons) {
      const text = await button.innerText();
      console.log(`  Button: "${text}"`);
    }

    await page.screenshot({ path: 'playwright-report/diagnostic-login.png', fullPage: true });
  });

  test('capture /home page state (after login attempt)', async ({ page }) => {
    test.setTimeout(60000);

    // Try to go directly to home
    await page.goto('/home');
    await page.waitForTimeout(3000);

    console.log('URL after /home:', page.url());

    const bodyText = await page.locator('body').innerText();
    console.log('/home text:', bodyText.substring(0, 1000));

    await page.screenshot({ path: 'playwright-report/diagnostic-home.png', fullPage: true });
  });

  test('check all routes', async ({ page }) => {
    test.setTimeout(120000);

    const routes = ['/', '/welcome', '/login', '/register', '/home', '/membership', '/admin'];

    for (const route of routes) {
      await page.goto(route);
      await page.waitForTimeout(2000);
      console.log(`${route} -> ${page.url()}`);
    }
  });
});
