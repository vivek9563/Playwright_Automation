require('dotenv').config();
const { chromium } = require('@playwright/test');
const AuthHelperV2 = require('./utils/auth-helper-v2');

async function inspectDashboard() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({ ignoreHTTPSErrors: true });
  const page = await context.newPage();

  try {
    console.log('📱 Opening dashboard...');
    
    // Use session to login
    const authHelper = new AuthHelperV2();
    const authResult = await authHelper.authenticate(page, false);
    
    if (!authResult.success) {
      console.log('❌ Authentication failed');
      return;
    }

    console.log('✅ Logged in successfully');
    console.log('📍 Current URL:', page.url());
    await page.waitForTimeout(3000);

    // Take screenshots
    console.log('📸 Taking dashboard screenshot...');
    await page.screenshot({ path: 'dashboard-screenshot-full.png', fullPage: true });
    
    // Get all major elements
    console.log('\n🔍 Dashboard Elements:');
    
    // Sidebar/navigation
    const sidebar = await page.locator('[role="navigation"], nav, aside, .sidebar, [class*="sidebar"]').first();
    if (await sidebar.isVisible().catch(() => false)) {
      console.log('✅ Sidebar found');
      const sidebarText = await sidebar.textContent();
      console.log('   Content:', sidebarText.substring(0, 200));
    }

    // Logo
    const logo = await page.locator('img[alt*="logo"], img[alt*="Vedak"], .logo, [class*="logo"]').first();
    if (await logo.isVisible().catch(() => false)) {
      console.log('✅ Logo found');
    }

    // Main content area
    const mainContent = await page.locator('main, [role="main"], .main-content, [class*="content"]').first();
    if (await mainContent.isVisible().catch(() => false)) {
      console.log('✅ Main content area found');
    }

    // All buttons
    const buttons = await page.locator('button').all();
    console.log(`\n📍 Found ${buttons.length} buttons:`);
    for (let i = 0; i < Math.min(15, buttons.length); i++) {
      const text = (await buttons[i].textContent()).trim();
      if (text) {
        console.log(`   [${i}] ${text}`);
      }
    }

    // All cards/widgets
    const cards = await page.locator('[class*="card"], [class*="widget"], [class*="box"], .component').all();
    console.log(`\n📍 Found ${cards.length} card/widget elements`);

    // Find specific text
    const textElements = [
      'Daily Training',
      'Todos',
      'Email',
      'Contribution',
      'Interested Experts',
      'Your Notes',
      'Responsibilities',
      'Recent Projects',
      'Recent Target',
      'Recent To Dos',
      'Profiles',
      'Vedak',
      'Work',
      'Organization'
    ];

    console.log('\n🔎 Searching for key elements:');
    for (const text of textElements) {
      const element = await page.locator(`text=${text}`, { exact: false }).first();
      if (await element.isVisible({ timeout: 1000 }).catch(() => false)) {
        console.log(`   ✅ Found: "${text}"`);
        const boundingBox = await element.boundingBox();
        if (boundingBox) {
          console.log(`      Position: x=${boundingBox.x}, y=${boundingBox.y}`);
        }
      }
    }

    console.log('\n📸 Keeping browser open for 10 seconds...');
    await page.waitForTimeout(10000);
    
    console.log('✅ Inspection complete');
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await browser.close();
  }
}

inspectDashboard();
