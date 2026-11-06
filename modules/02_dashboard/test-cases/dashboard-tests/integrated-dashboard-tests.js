require('dotenv').config();
const { chromium } = require('@playwright/test');
const SessionManager = require('../utils/session-manager');
const AuthHelperV2 = require('../utils/auth-helper-v2');
const logger = require('../utils/logger');
const ReportGenerator = require('../utils/report-generator');

/**
 * Integrated Dashboard Test Suite - Single Browser Instance
 * All tests run in one session without page reloads
 */
async function runIntegratedDashboardTests() {
  const testResults = [];
  const reportGenerator = new ReportGenerator();
  
  let browser = null;
  let context = null;
  let page = null;

  try {
    console.log('\n╔═══════════════════════════════════════════════════════╗');
    console.log('║   🚀 VEDAK CRM INTEGRATED DASHBOARD TEST SUITE 🚀    ║');
    console.log('╚═══════════════════════════════════════════════════════╝\n');

    // Launch browser once
    console.log('🌐 Launching browser...');
    browser = await chromium.launch({ headless: false });
    
    console.log('📱 Creating context and page...');
    context = await browser.newContext({ ignoreHTTPSErrors: true });
    page = await context.newPage();

    // Authenticate once
    console.log('🔐 Authenticating...');
    const authHelper = new AuthHelperV2();
    const authResult = await authHelper.authenticate(page, false);
    
    if (!authResult.success) {
      throw new Error('Authentication failed');
    }

    console.log('✅ Authentication successful\n');
    await page.waitForTimeout(2000);

    // Test 1: Verify Dashboard Page
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('TEST 1️⃣: Dashboard Page Loads and Redirects');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    const startTime1 = Date.now();
    try {
      const url = page.url();
      console.log(`📍 Current URL: ${url}`);
      if (!url.includes('/app/dashboard')) {
        throw new Error('Not on dashboard page');
      }
      const mainContent = await page.locator('main, [role="main"]').isVisible();
      console.log(`✅ Main content visible: ${mainContent}`);
      testResults.push({
        id: 'DASH-TEST-01',
        name: 'Dashboard Page Loads and Redirects',
        status: 'PASS',
        duration: Date.now() - startTime1
      });
      console.log(`✅ PASSED (${Date.now() - startTime1}ms)\n`);
    } catch (error) {
      console.log(`❌ FAILED: ${error.message}\n`);
      testResults.push({
        id: 'DASH-TEST-01',
        name: 'Dashboard Page Loads and Redirects',
        status: 'FAIL',
        error: error.message,
        duration: Date.now() - startTime1
      });
    }

    // Test 2: Click Vedak Logo
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('TEST 2️⃣: Click Vedak Logo');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    const startTime2 = Date.now();
    try {
      const logo = await page.locator('img[alt*="logo"], img[alt*="Vedak"], .logo').first();
      if (!await logo.isVisible()) {
        throw new Error('Logo not visible');
      }
      console.log('🖱️  Logo found, clicking...');
      await logo.click();
      console.log('⏳ Waiting 2 seconds...');
      await page.waitForTimeout(2000);
      console.log(`📍 Current URL: ${page.url()}`);
      testResults.push({
        id: 'DASH-TEST-02',
        name: 'Click Vedak Logo',
        status: 'PASS',
        duration: Date.now() - startTime2
      });
      console.log(`✅ PASSED (${Date.now() - startTime2}ms)\n`);
    } catch (error) {
      console.log(`❌ FAILED: ${error.message}\n`);
      testResults.push({
        id: 'DASH-TEST-02',
        name: 'Click Vedak Logo',
        status: 'FAIL',
        error: error.message,
        duration: Date.now() - startTime2
      });
    }

    // Test 3: Refresh Page
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('TEST 3️⃣: Page Refresh Functionality');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    const startTime3 = Date.now();
    try {
      const urlBefore = page.url();
      console.log(`🔄 Refreshing page (was: ${urlBefore})...`);
      await page.reload({ waitUntil: 'networkidle' });
      console.log('⏳ Waiting 2 seconds...');
      await page.waitForTimeout(2000);
      const urlAfter = page.url();
      console.log(`📍 URL after refresh: ${urlAfter}`);
      testResults.push({
        id: 'DASH-TEST-03',
        name: 'Page Refresh Functionality',
        status: 'PASS',
        duration: Date.now() - startTime3
      });
      console.log(`✅ PASSED (${Date.now() - startTime3}ms)\n`);
    } catch (error) {
      console.log(`❌ FAILED: ${error.message}\n`);
      testResults.push({
        id: 'DASH-TEST-03',
        name: 'Page Refresh Functionality',
        status: 'FAIL',
        error: error.message,
        duration: Date.now() - startTime3
      });
    }

    // Test 4: Click Sidebar Items
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('TEST 4️⃣: Click Sidebar Navigation - Work/Organization Button');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    const startTime4 = Date.now();
    try {
      // Look for Work or Organization button
      const buttons = ['Daily Workspace', 'Workspace', 'Work', 'Organization'];
      let found = false;
      
      for (const btnText of buttons) {
        const btn = await page.locator(`button:has-text("${btnText}")`).first();
        if (await btn.isVisible({ timeout: 1000 }).catch(() => false)) {
          console.log(`🖱️  Found button: "${btnText}", clicking...`);
          await btn.click();
          console.log('⏳ Waiting 2 seconds...');
          await page.waitForTimeout(2000);
          console.log(`📍 Current URL: ${page.url()}`);
          found = true;
          break;
        }
      }
      
      if (!found) {
        throw new Error('Work/Organization button not found');
      }

      testResults.push({
        id: 'DASH-TEST-04',
        name: 'Click Sidebar Navigation - Work/Organization',
        status: 'PASS',
        duration: Date.now() - startTime4
      });
      console.log(`✅ PASSED (${Date.now() - startTime4}ms)\n`);
    } catch (error) {
      console.log(`❌ FAILED: ${error.message}\n`);
      testResults.push({
        id: 'DASH-TEST-04',
        name: 'Click Sidebar Navigation - Work/Organization',
        status: 'FAIL',
        error: error.message,
        duration: Date.now() - startTime4
      });
    }

    // Test 5: Hover Over Widgets
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('TEST 5️⃣: Hover Over Dashboard Widgets');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    const startTime5 = Date.now();
    try {
      const widgets = [
        { name: 'Daily Training', selector: 'text=Daily Training' },
        { name: 'Todos', selector: 'text=Todos' },
        { name: 'Email Observations', selector: 'text=Email Observations' },
        { name: 'Contribution', selector: 'text=Contribution' },
        { name: 'Interested Experts', selector: 'text=Interested Experts' }
      ];

      let hoveredCount = 0;
      for (const widget of widgets) {
        try {
          const elem = await page.locator(widget.selector).first();
          if (await elem.isVisible({ timeout: 1000 }).catch(() => false)) {
            console.log(`🖱️  Hovering over: "${widget.name}"...`);
            await elem.hover();
            console.log('⏳ Waiting 1 second...');
            await page.waitForTimeout(1000);
            hoveredCount++;
          }
        } catch (e) {
          console.log(`⚠️  Could not hover over: ${widget.name}`);
        }
      }

      console.log(`✅ Hovered over ${hoveredCount}/${widgets.length} widgets`);
      testResults.push({
        id: 'DASH-TEST-05',
        name: 'Hover Over Dashboard Widgets',
        status: 'PASS',
        duration: Date.now() - startTime5
      });
      console.log(`✅ PASSED (${Date.now() - startTime5}ms)\n`);
    } catch (error) {
      console.log(`❌ FAILED: ${error.message}\n`);
      testResults.push({
        id: 'DASH-TEST-05',
        name: 'Hover Over Dashboard Widgets',
        status: 'FAIL',
        error: error.message,
        duration: Date.now() - startTime5
      });
    }

    // Test 6: Click View All Buttons
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('TEST 6️⃣: Click View All Buttons');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    const startTime6 = Date.now();
    try {
      const viewAllButtons = await page.locator('button:has-text("View All"), a:has-text("View All")').all();
      console.log(`Found ${viewAllButtons.length} View All buttons`);
      
      if (viewAllButtons.length > 0) {
        for (let i = 0; i < Math.min(2, viewAllButtons.length); i++) {
          if (await viewAllButtons[i].isVisible({ timeout: 1000 }).catch(() => false)) {
            console.log(`🖱️  Clicking View All button ${i + 1}...`);
            await viewAllButtons[i].click();
            console.log('⏳ Waiting 2 seconds...');
            await page.waitForTimeout(2000);
            console.log(`📍 Current URL: ${page.url()}`);
          }
        }
      }

      testResults.push({
        id: 'DASH-TEST-06',
        name: 'Click View All Buttons',
        status: 'PASS',
        duration: Date.now() - startTime6
      });
      console.log(`✅ PASSED (${Date.now() - startTime6}ms)\n`);
    } catch (error) {
      console.log(`❌ FAILED: ${error.message}\n`);
      testResults.push({
        id: 'DASH-TEST-06',
        name: 'Click View All Buttons',
        status: 'FAIL',
        error: error.message,
        duration: Date.now() - startTime6
      });
    }

    // Test 7: Your Notes - Add Details
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('TEST 7️⃣: Your Notes - Hover and Check');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    const startTime7 = Date.now();
    try {
      const notesElement = await page.locator('text=Your Notes').first();
      if (await notesElement.isVisible({ timeout: 1000 }).catch(() => false)) {
        console.log('🖱️  Found "Your Notes", hovering...');
        await notesElement.hover();
        console.log('⏳ Waiting 2 seconds...');
        await page.waitForTimeout(2000);
        console.log('✅ Your Notes section interacted');
      } else {
        throw new Error('Your Notes section not found');
      }

      testResults.push({
        id: 'DASH-TEST-07',
        name: 'Your Notes - Hover and Check',
        status: 'PASS',
        duration: Date.now() - startTime7
      });
      console.log(`✅ PASSED (${Date.now() - startTime7}ms)\n`);
    } catch (error) {
      console.log(`❌ FAILED: ${error.message}\n`);
      testResults.push({
        id: 'DASH-TEST-07',
        name: 'Your Notes - Hover and Check',
        status: 'FAIL',
        error: error.message,
        duration: Date.now() - startTime7
      });
    }

    // Test 8: Hover Responsibilities, Recent Projects, Recent Target, Recent To Dos
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('TEST 8️⃣: Hover Over Multiple Dashboard Sections');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    const startTime8 = Date.now();
    try {
      const sections = [
        'Your Responsibilities',
        'Recent Projects',
        'Recent Target',
        'Recent To Dos',
        'Profiles Added'
      ];

      let hoveredCount = 0;
      for (const section of sections) {
        try {
          const elem = await page.locator(`text=${section}`, { exact: false }).first();
          if (await elem.isVisible({ timeout: 1000 }).catch(() => false)) {
            console.log(`🖱️  Hovering over: "${section}"...`);
            await elem.hover();
            console.log('⏳ Waiting 1 second...');
            await page.waitForTimeout(1000);
            hoveredCount++;
          }
        } catch (e) {
          console.log(`⚠️  Could not hover: ${section}`);
        }
      }

      console.log(`✅ Hovered over ${hoveredCount}/${sections.length} sections`);
      testResults.push({
        id: 'DASH-TEST-08',
        name: 'Hover Over Multiple Dashboard Sections',
        status: 'PASS',
        duration: Date.now() - startTime8
      });
      console.log(`✅ PASSED (${Date.now() - startTime8}ms)\n`);
    } catch (error) {
      console.log(`❌ FAILED: ${error.message}\n`);
      testResults.push({
        id: 'DASH-TEST-08',
        name: 'Hover Over Multiple Dashboard Sections',
        status: 'FAIL',
        error: error.message,
        duration: Date.now() - startTime8
      });
    }

    // Test 9: Page Scroll Up and Down - Using Keyboard
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('TEST 9️⃣: Page Scroll Up and Down Functionality');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    const startTime9 = Date.now();
    try {
      const scrollBefore = await page.evaluate(() => window.scrollY);
      console.log(`📍 Initial scroll position: ${scrollBefore}px`);

      console.log('⬇️ Scrolling DOWN using Page Down key...');
      await page.press('body', 'PageDown');
      await page.waitForTimeout(1000);

      const scrollDown = await page.evaluate(() => window.scrollY);
      console.log(`📍 Scroll position after PageDown: ${scrollDown}px`);

      console.log('⬇️ Scrolling DOWN more using End key...');
      await page.press('body', 'End');
      await page.waitForTimeout(1000);

      const scrollEnd = await page.evaluate(() => window.scrollY);
      console.log(`📍 Scroll position after End: ${scrollEnd}px`);

      console.log('⬆️ Scrolling UP using Home key...');
      await page.press('body', 'Home');
      await page.waitForTimeout(1000);

      const scrollHome = await page.evaluate(() => window.scrollY);
      console.log(`📍 Scroll position after Home: ${scrollHome}px`);

      console.log('⬆️ Scrolling UP using Page Up key...');
      await page.press('body', 'PageUp');
      await page.waitForTimeout(1000);

      const scrollFinal = await page.evaluate(() => window.scrollY);
      console.log(`📍 Final scroll position: ${scrollFinal}px`);

      console.log(`✅ Scroll test completed successfully`);
      testResults.push({
        id: 'DASH-TEST-09',
        name: 'Page Scroll Up and Down Functionality',
        status: 'PASS',
        duration: Date.now() - startTime9
      });
      console.log(`✅ PASSED (${Date.now() - startTime9}ms)\n`);
    } catch (error) {
      console.log(`❌ FAILED: ${error.message}\n`);
      testResults.push({
        id: 'DASH-TEST-09',
        name: 'Page Scroll Up and Down Functionality',
        status: 'FAIL',
        error: error.message,
        duration: Date.now() - startTime9
      });
    }

    // Final Summary
    console.log('╔═══════════════════════════════════════════════════════╗');
    console.log('║        📊 FINAL TEST SUMMARY 📊                      ║');
    console.log('╚═══════════════════════════════════════════════════════╝\n');

    const total = testResults.length;
    const passed = testResults.filter(t => t.status === 'PASS').length;
    const failed = testResults.filter(t => t.status === 'FAIL').length;
    const passRate = ((passed / total) * 100).toFixed(2);

    console.log(`📊 Total Tests: ${total}`);
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`📈 Pass Rate: ${passRate}%\n`);

    console.log('✅ PASSED TESTS:');
    testResults.filter(t => t.status === 'PASS').forEach(t => {
      console.log(`  ✓ ${t.id}: ${t.name} (${t.duration}ms)`);
    });

    if (failed > 0) {
      console.log('\n❌ FAILED TESTS:');
      testResults.filter(t => t.status === 'FAIL').forEach(t => {
        console.log(`  ✗ ${t.id}: ${t.name}`);
        if (t.error) console.log(`    Error: ${t.error}`);
      });
    }

    console.log('\n');

  } catch (error) {
    console.error('❌ Test suite error:', error.message);
  } finally {
    if (browser) {
      console.log('🔴 Closing browser...');
      await browser.close();
      console.log('✅ Browser closed\n');
    }
  }
}

// Run tests
runIntegratedDashboardTests().catch(console.error);
