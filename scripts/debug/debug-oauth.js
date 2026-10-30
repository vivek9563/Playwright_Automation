require('dotenv').config();
const { chromium } = require('@playwright/test');

async function debugOAuth() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({ ignoreHTTPSErrors: true });
  const page = await context.newPage();

  try {
    console.log('📱 Opening app...');
    await page.goto(process.env.APP_URL || 'http://localhost:5173/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);

    console.log('🔍 Looking for Google button...');
    const googleBtn = await page.locator('button:has-text("Continue with Google")').first();
    
    if (await googleBtn.isVisible()) {
      console.log('✅ Google button found');
      
      console.log('📡 Listening for popups and navigation...');
      page.on('response', response => {
        console.log(`  📊 Response: ${response.status()} ${response.url()}`);
      });

      const popupPromise = context.waitForEvent('page');
      await googleBtn.click();
      
      const popup = await popupPromise;
      console.log('✅ Popup detected');

      // Wait for email input
      await popup.waitForSelector('input[type="email"]', { timeout: 10000 });
      
      const emailInput = await popup.locator('input[type="email"]').first();
      await emailInput.fill(process.env.GMAIL_EMAIL);
      await popup.waitForTimeout(500);

      let nextBtn = await popup.locator('button:has-text("Next")').first();
      await nextBtn.click();
      await popup.waitForTimeout(2000);

      const pwInput = await popup.locator('input[type="password"]').first();
      await pwInput.fill(process.env.GMAIL_PASSWORD);
      await popup.waitForTimeout(500);

      nextBtn = await popup.locator('button:has-text("Next")').first();
      await nextBtn.click();

      console.log('⏳ Waiting for OAuth to complete (15 seconds)...');
      await popup.waitForTimeout(15000);

      console.log('📍 Main page URL:', page.url());
      console.log('📍 Popup URL:', popup.url());
      
      console.log('📸 Taking popup screenshot...');
      await popup.screenshot({ path: 'debug-popup-final.png' });
      
      console.log('📸 Taking main page screenshot...');
      await page.screenshot({ path: 'debug-main-page-final.png' });

      console.log('⏸️ Keeping browser open for inspection...');
      await page.waitForTimeout(10000);
    }
  } finally {
    await browser.close();
    console.log('✅ Debug complete');
  }
}

debugOAuth().catch(console.error);
