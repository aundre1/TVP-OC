import { chromium } from 'playwright';
import { mkdirSync } from 'fs';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto('https://developer.spotify.com/dashboard');
  const title = await page.title();
  console.log('Page title:', title);
  mkdirSync('test-results/spotify', { recursive: true });
  await page.screenshot({ path: 'test-results/spotify/00-verify-browser.png', fullPage: false });
  await browser.close();
  console.log('Browser test PASSED — Spotify dashboard is reachable');
})();
