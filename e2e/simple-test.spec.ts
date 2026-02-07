import { test, expect } from '@playwright/test';

test('simple page load', async ({ page }) => {
  test.setTimeout(30000);

  // Don't wait for full load - use domcontentloaded or networkidle
  await page.goto('http://127.0.0.1:3001/', { waitUntil: 'domcontentloaded', timeout: 15000 });

  // Just check we got a page
  console.log('Page loaded');
  console.log('Title:', await page.title());
});
