require('dotenv').config();
const { chromium } = require('@playwright/test');

async function debugLogin() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({ ignoreHTTPSErrors: true });
  const page = await context.newPage();

  try {
    console.log('📱 Opening app...');
    await page.goto(process.env.APP_URL || 'http://localhost:5173/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);

    console.log('📸 Taking screenshot of login page...');
    await page.screenshot({ path: 'debug-screenshot-1-login-page.png' });
    console.log('✅ Screenshot saved: debug-screenshot-1-login-page.png');

    console.log('🔍 Looking for Google button...');
    const buttons = await page.locator('button').all();
    console.log(`Found ${buttons.length} buttons on page`);

    for (let i = 0; i < Math.min(5, buttons.length); i++) {
      const text = await buttons[i].textContent();
      console.log(`  Button ${i}: "${text}"`);
    }

    const googleBtn = await page.locator('button:has-text("Continue with Google")').first();
    if (await googleBtn.isVisible()) {
      console.log('✅ Google button found and visible');
      console.log('🖱️ Clicking Google button...');
      
      // Listen for popups
      const popupPromise = context.waitForEvent('page');
      
      await googleBtn.click();
      console.log('⏳ Waiting for popup (10 seconds)...');
      
      const popup = await Promise.race([
        popupPromise,
        new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 10000))
      ]).catch(e => {
        console.log('❌ No popup detected:', e.message);
        return null;
      });

      if (popup) {
        console.log('✅ Popup detected!');
        await popup.waitForTimeout(2000);
        console.log('📸 Taking popup screenshot...');
        await popup.screenshot({ path: 'debug-screenshot-2-popup.png' });
        await popup.close();
      } else {
        console.log('💡 Popup might have opened in same tab or blocked');
        await page.waitForTimeout(2000);
        console.log('📸 Taking screenshot after click...');
        await page.screenshot({ path: 'debug-screenshot-2-after-click.png' });
      }
    } else {
      console.log('❌ Google button not found or not visible');
    }

    console.log('⏸️ Keeping browser open for 5 seconds...');
    await page.waitForTimeout(5000);
  } finally {
    await browser.close();
    console.log('✅ Debug complete');
  }
}

debugLogin().catch(console.error);
