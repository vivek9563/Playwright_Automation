require('dotenv').config();
const { chromium } = require('@playwright/test');
const AuthHelperV2 = require('./utils/auth-helper-v2');

async function quickDebug() {
  let browser = null;

  try {
    browser = await chromium.launch({ headless: false });
    const context = await browser.newContext({ ignoreHTTPSErrors: true });
    const page = await context.newPage();

    const authHelper = new AuthHelperV2();
    await authHelper.authenticate(page, false);
    await page.waitForTimeout(2000);

    console.log('\n=== SIDEBAR DEBUG ===');
    const sidebar = await page.locator('aside, nav, [role="navigation"], .sidebar').first();
    const sidebarVis = await sidebar.isVisible({ timeout: 2000 }).catch(() => false);
    console.log('Sidebar visible:', sidebarVis);

    console.log('\n=== PAGE CONTENT CHECK ===');
    const content = await page.content();
    console.log('Has "Recent Target":', content.includes('Recent Target'));
    console.log('Has "Recent To Dos":', content.includes('Recent To Dos'));
    console.log('Has "Recent To-Dos":', content.includes('Recent To-Dos'));

    console.log('\n=== ALL HEADING TEXTS ===');
    const headings = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6, [class*="heading"], [class*="title"]'))
        .map(el => el.textContent.trim())
        .filter(t => t && t.length > 0 && t.length < 100);
    });
    
    const unique = [...new Set(headings)];
    unique.forEach((h, i) => console.log(`${i+1}. "${h}"`));

    await browser.close();
  } catch (error) {
    console.error('Error:', error.message);
    if (browser) await browser.close();
  }
}

quickDebug();
