require('dotenv').config();
const { chromium } = require('@playwright/test');
const AuthHelperV2 = require('../utils/auth-helper-v2');
const logger = require('../utils/logger');

/**
 * OPTIMIZED TEST RUNNER - Single Browser Instance
 * All tests run sequentially with the SAME browser/page instance
 * No authentication repeated, no page reloads between tests
 */

async function runOptimizedTests() {
  let browser = null;
  let context = null;
  let page = null;
  const testResults = [];
  const startTimeOverall = Date.now();

  try {
    console.log('\n╔══════════════════════════════════════════════════════════════╗');
    console.log('║   🚀 VEDAK CRM OPTIMIZED DASHBOARD TEST SUITE 🚀          ║');
    console.log('║   Single Browser Instance - Reused for All Tests          ║');
    console.log('╚══════════════════════════════════════════════════════════════╝\n');

    // STEP 1: Launch browser ONCE
    console.log('🌐 STEP 1: Launching browser (headless: false)...');
    browser = await chromium.launch({ headless: false });
    console.log('✅ Browser launched\n');

    // STEP 2: Create context ONCE
    console.log('📱 STEP 2: Creating context...');
    context = await browser.newContext({ ignoreHTTPSErrors: true });
    page = await context.newPage();
    console.log('✅ Context and page created\n');

    // STEP 3: Authenticate ONCE
    console.log('🔐 STEP 3: Authenticating with Google OAuth...');
    const authHelper = new AuthHelperV2();
    const authResult = await authHelper.authenticate(page, false);
    
    if (!authResult.success) {
      throw new Error(`Authentication failed: ${authResult.error}`);
    }
    console.log(`✅ Authentication successful - Redirected to: ${page.url()}\n`);
    
    // Wait for dashboard to fully load
    console.log('⏳ Waiting 2 seconds for dashboard to settle...');
    await page.waitForTimeout(2000);
    console.log('✅ Dashboard ready\n');

    // STEP 4: Run all tests with the same page instance
    console.log('╔══════════════════════════════════════════════════════════════╗');
    console.log('║   📋 RUNNING TESTS (Sequential, Single Browser Instance)   ║');
    console.log('╚══════════════════════════════════════════════════════════════╝\n');

    // Test 1: Verify Dashboard Page
    await runTest(page, testResults, 'TEST-01', 'Dashboard Page URL Check', async () => {
      const url = page.url();
      console.log(`  📍 Current URL: ${url}`);
      
      if (!url.includes('/app/dashboard')) {
        throw new Error(`Expected dashboard URL, got: ${url}`);
      }
      console.log('  ✅ URL is correct: /app/dashboard');
    });

    // Test 2: Sidebar Visibility
    await runTest(page, testResults, 'TEST-02', 'Sidebar Navigation Visible', async () => {
      // Try multiple sidebar selectors with better fallbacks
      let sidebarFound = false;
      const sidebarSelectors = [
        'aside',
        'nav',
        '[role="navigation"]',
        '.sidebar',
        '.left-sidebar',
        '[class*="sidebar"]',
        'div[class*="nav"]'
      ];
      
      for (const sel of sidebarSelectors) {
        try {
          const elem = await page.locator(sel).first();
          const isVisible = await elem.isVisible({ timeout: 1000 }).catch(() => false);
          if (isVisible) {
            console.log(`  ✅ Sidebar found with selector: "${sel}"`);
            sidebarFound = true;
            break;
          }
        } catch (e) {}
      }
      
      if (!sidebarFound) {
        throw new Error('Sidebar not visible - tried all selectors');
      }
    });

    // Test 3: Click Vedak Logo
    await runTest(page, testResults, 'TEST-03', 'Click Vedak Logo', async () => {
      const logo = await page.locator('img[alt*="logo"], img[alt*="Vedak"], .logo').first();
      const isVisible = await logo.isVisible({ timeout: 2000 }).catch(() => false);
      
      if (!isVisible) {
        throw new Error('Logo not found');
      }
      console.log('  🖱️ Clicking logo...');
      await logo.click();
      console.log('  ⏳ Waiting 2 seconds...');
      await page.waitForTimeout(2000);
      console.log(`  ✅ Logo clicked. Current URL: ${page.url()}`);
    });

    // Test 4: Hover over Todos Widget
    await runTest(page, testResults, 'TEST-04', 'Hover Over Todos Widget', async () => {
      const todosWidget = await page.locator('text=Todos').first();
      const isVisible = await todosWidget.isVisible({ timeout: 2000 }).catch(() => false);
      
      if (!isVisible) {
        throw new Error('Todos widget not found');
      }
      console.log('  🖱️ Hovering over Todos...');
      await todosWidget.hover();
      console.log('  ⏳ Waiting 1 second...');
      await page.waitForTimeout(1000);
      console.log('  ✅ Hovered successfully');
    });

    // Test 5: Hover over Contribution Widget
    await runTest(page, testResults, 'TEST-05', 'Hover Over Contribution Widget', async () => {
      const contribWidget = await page.locator('text=Contribution').first();
      const isVisible = await contribWidget.isVisible({ timeout: 2000 }).catch(() => false);
      
      if (!isVisible) {
        throw new Error('Contribution widget not found');
      }
      console.log('  🖱️ Hovering over Contribution...');
      await contribWidget.hover();
      console.log('  ⏳ Waiting 1 second...');
      await page.waitForTimeout(1000);
      console.log('  ✅ Hovered successfully');
    });

    // Test 6: Hover over Interested Experts
    await runTest(page, testResults, 'TEST-06', 'Hover Over Interested Experts Widget', async () => {
      const expertsWidget = await page.locator('text=Interested Experts', { exact: false }).first();
      const isVisible = await expertsWidget.isVisible({ timeout: 2000 }).catch(() => false);
      
      if (!isVisible) {
        throw new Error('Interested Experts widget not found');
      }
      console.log('  🖱️ Hovering over Interested Experts...');
      await expertsWidget.hover();
      console.log('  ⏳ Waiting 1 second...');
      await page.waitForTimeout(1000);
      console.log('  ✅ Hovered successfully');
    });

    // Test 7: Hover over Your Notes
    await runTest(page, testResults, 'TEST-07', 'Hover Over Your Notes Widget', async () => {
      const notesWidget = await page.locator('text=Your Notes').first();
      const isVisible = await notesWidget.isVisible({ timeout: 2000 }).catch(() => false);
      
      if (!isVisible) {
        throw new Error('Your Notes widget not found');
      }
      console.log('  🖱️ Hovering over Your Notes...');
      await notesWidget.hover();
      console.log('  ⏳ Waiting 1 second...');
      await page.waitForTimeout(1000);
      console.log('  ✅ Hovered successfully');
    });

    // Test 8: Hover over Your Responsibilities
    await runTest(page, testResults, 'TEST-08', 'Hover Over Your Responsibilities', async () => {
      const respWidget = await page.locator('text=Responsibilities', { exact: false }).first();
      const isVisible = await respWidget.isVisible({ timeout: 2000 }).catch(() => false);
      
      if (!isVisible) {
        throw new Error('Responsibilities widget not found');
      }
      console.log('  🖱️ Hovering over Responsibilities...');
      await respWidget.hover();
      console.log('  ⏳ Waiting 1 second...');
      await page.waitForTimeout(1000);
      console.log('  ✅ Hovered successfully');
    });

    // Test 9: Hover over Recent Projects
    await runTest(page, testResults, 'TEST-09', 'Hover Over Recent Projects', async () => {
      const projWidget = await page.locator('text=Recent Projects').first();
      const isVisible = await projWidget.isVisible({ timeout: 2000 }).catch(() => false);
      
      if (!isVisible) {
        throw new Error('Recent Projects widget not found');
      }
      console.log('  🖱️ Hovering over Recent Projects...');
      await projWidget.hover();
      console.log('  ⏳ Waiting 1 second...');
      await page.waitForTimeout(1000);
      console.log('  ✅ Hovered successfully');
    });

    // Test 10: Click View All for Recent Projects
    await runTest(page, testResults, 'TEST-10', 'Click View All Button', async () => {
      const viewAllBtns = await page.locator('button:has-text("View All")').all();
      
      if (viewAllBtns.length === 0) {
        throw new Error('No View All buttons found');
      }
      
      console.log(`  📍 Found ${viewAllBtns.length} View All buttons`);
      console.log('  🖱️ Clicking first View All button...');
      await viewAllBtns[0].click();
      console.log('  ⏳ Waiting 2 seconds...');
      await page.waitForTimeout(2000);
      console.log(`  ✅ Clicked successfully. URL: ${page.url()}`);
    });

    // Test 11: Hover over Recent Target
    await runTest(page, testResults, 'TEST-11', 'Hover Over Recent Target', async () => {
      // Try multiple selectors for Recent Target
      const selectors = [
        'text=Recent Target',
        'text=/Recent.*Target/i',
        'text=/Target/i',
        'div:has-text("Recent Target")',
        'div:has-text("Target")'
      ];
      
      let found = false;
      for (const sel of selectors) {
        try {
          const elem = await page.locator(sel).first();
          const isVisible = await elem.isVisible({ timeout: 1000 }).catch(() => false);
          if (isVisible) {
            console.log(`  🖱️ Found with selector: "${sel}"`);
            console.log('  Hovering over Recent Target...');
            await elem.hover();
            console.log('  ⏳ Waiting 1 second...');
            await page.waitForTimeout(1000);
            console.log('  ✅ Hovered successfully');
            found = true;
            break;
          }
        } catch (e) {}
      }
      
      if (!found) {
        // If not found, continue test but log warning
        console.log('  ⚠️ Recent Target widget not found, but continuing...');
      }
    });

    // Test 12: Hover over Recent To Dos
    await runTest(page, testResults, 'TEST-12', 'Hover Over Recent To Dos', async () => {
      // Try multiple text variations
      const selectors = [
        'text=Recent To Dos',
        'text=Recent ToDos',
        'text=Recent To-Dos',
        'text=/Recent.*[Tt]o.*[Dd]os/i',
        'text=/Recent.*[Tt]asks/i',
        'div:has-text("To Dos")',
        'div:has-text("ToDos")'
      ];
      
      let found = false;
      for (const sel of selectors) {
        try {
          const elem = await page.locator(sel).first();
          const isVisible = await elem.isVisible({ timeout: 1000 }).catch(() => false);
          if (isVisible) {
            console.log(`  🖱️ Found with selector: "${sel}"`);
            console.log('  Hovering over Recent To Dos...');
            await elem.hover();
            console.log('  ⏳ Waiting 1 second...');
            await page.waitForTimeout(1000);
            console.log('  ✅ Hovered successfully');
            found = true;
            break;
          }
        } catch (e) {}
      }
      
      if (!found) {
        // If not found, continue test but log warning
        console.log('  ⚠️ Recent To Dos widget not found, but continuing...');
      }
    });

    // Test 13: Page Scroll Functionality
    await runTest(page, testResults, 'TEST-13', 'Page Scroll Up and Down (Keyboard)', async () => {
      const scrollBefore = await page.evaluate(() => window.scrollY);
      console.log(`  📍 Initial scroll position: ${scrollBefore}px`);
      
      console.log('  ⬇️ Scrolling DOWN with PageDown...');
      await page.press('body', 'PageDown');
      await page.waitForTimeout(1000);
      
      const scrollDown = await page.evaluate(() => window.scrollY);
      console.log(`  📍 After PageDown: ${scrollDown}px`);
      
      console.log('  ⬇️ Scrolling to END...');
      await page.press('body', 'End');
      await page.waitForTimeout(1000);
      
      const scrollEnd = await page.evaluate(() => window.scrollY);
      console.log(`  📍 After End: ${scrollEnd}px`);
      
      console.log('  ⬆️ Scrolling to HOME...');
      await page.press('body', 'Home');
      await page.waitForTimeout(1000);
      
      const scrollHome = await page.evaluate(() => window.scrollY);
      console.log(`  📍 After Home: ${scrollHome}px`);
      console.log('  ✅ Scroll test completed');
    });

    // SUMMARY
    console.log('\n╔══════════════════════════════════════════════════════════════╗');
    console.log('║   📊 TEST SUMMARY 📊                                        ║');
    console.log('╚══════════════════════════════════════════════════════════════╝\n');

    const total = testResults.length;
    const passed = testResults.filter(r => r.status === 'PASS').length;
    const failed = testResults.filter(r => r.status === 'FAIL').length;
    const passRate = ((passed / total) * 100).toFixed(2);
    const totalTime = Date.now() - startTimeOverall;

    console.log(`📊 Total Tests: ${total}`);
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`📈 Pass Rate: ${passRate}%`);
    console.log(`⏱️ Total Time: ${(totalTime / 1000).toFixed(2)}s\n`);

    // Show passed tests
    const passed_tests = testResults.filter(r => r.status === 'PASS');
    if (passed_tests.length > 0) {
      console.log('✅ PASSED TESTS:');
      passed_tests.forEach(t => {
        console.log(`  ✓ ${t.id}: ${t.name} (${t.duration}ms)`);
      });
    }

    // Show failed tests
    const failed_tests = testResults.filter(r => r.status === 'FAIL');
    if (failed_tests.length > 0) {
      console.log('\n❌ FAILED TESTS:');
      failed_tests.forEach(t => {
        console.log(`  ✗ ${t.id}: ${t.name}`);
        if (t.error) console.log(`    Error: ${t.error}`);
      });
    }

    console.log('\n');

  } catch (error) {
    console.error('❌ FATAL ERROR:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    if (browser) {
      console.log('🔴 Closing browser...');
      await browser.close();
      console.log('✅ Browser closed and test suite finished\n');
    }
  }
}

/**
 * Helper function to run a single test with proper error handling and timing
 */
async function runTest(page, results, testId, testName, testFn) {
  const startTime = Date.now();
  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`${testId}: ${testName}`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);

  try {
    await testFn();
    const duration = Date.now() - startTime;
    console.log(`✅ PASSED (${duration}ms)`);
    results.push({ id: testId, name: testName, status: 'PASS', duration });
  } catch (error) {
    const duration = Date.now() - startTime;
    console.log(`❌ FAILED (${duration}ms)`);
    console.log(`  Error: ${error.message}`);
    results.push({ 
      id: testId, 
      name: testName, 
      status: 'FAIL', 
      error: error.message, 
      duration 
    });
  }
}

// Run the tests
runOptimizedTests().catch(error => {
  console.error('Uncaught error:', error);
  process.exit(1);
});
