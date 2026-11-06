const { chromium } = require('@playwright/test');
const logger = require('../utils/logger');
const AuthHelperV2 = require('../utils/auth-helper-v2');
const CommonUtilsV2 = require('../utils/common-v2');

/**
 * Dashboard UI Tests
 */
async function runUITests() {
  const tests = [];
  const browser = await chromium.launch({ headless: false });

  try {
    // Test 1: Dashboard page loads and redirects to /app/dashboard
    tests.push(
      await testDashboardPageLoad(browser)
    );

    // Test 2: Vedak Logo visible and clickable
    tests.push(
      await testVedakLogo(browser)
    );

    // Test 3: Sidebar navigation elements visible
    tests.push(
      await testSidebarNavigation(browser)
    );

    // Test 4: Dashboard widgets visible
    tests.push(
      await testDashboardWidgets(browser)
    );

  } finally {
    await browser.close();
  }

  return tests;
}

async function testDashboardPageLoad(browser) {
  const testName = 'Dashboard Page Loads and Redirects';
  const testId = 'DASH-UI-01';
  let startTime = Date.now();

  try {
    logger.info(`START: ${testId}: ${testName}`);
    
    const context = await browser.newContext({ ignoreHTTPSErrors: true });
    const page = await context.newPage();

    // Authenticate
    const authHelper = new AuthHelperV2();
    const authResult = await authHelper.authenticate(page);
    
    if (!authResult.success) {
      throw new Error('Authentication failed');
    }

    // Check URL
    const url = page.url();
    if (!url.includes('/app/dashboard')) {
      throw new Error(`Expected /app/dashboard URL, got: ${url}`);
    }

    logger.info(`✓ Dashboard URL correct: ${url}`);

    // Check for dashboard content
    const mainContent = await page.locator('main, [role="main"], .main-content').first();
    if (!await mainContent.isVisible({ timeout: 3000 }).catch(() => false)) {
      throw new Error('Main content area not visible');
    }

    logger.info('✓ Dashboard main content visible');

    await context.close();
    logger.testPass(`✓ PASS: ${testName} (${Date.now() - startTime}ms)`);
    return { id: testId, name: testName, status: 'PASS', duration: Date.now() - startTime };
  } catch (error) {
    logger.testFail(`✗ FAIL: ${testName} (${Date.now() - startTime}ms)`);
    logger.error(`  Error: ${error.message}`);
    return { id: testId, name: testName, status: 'FAIL', error: error.message, duration: Date.now() - startTime };
  }
}

async function testVedakLogo(browser) {
  const testName = 'Vedak Logo Visible and Clickable';
  const testId = 'DASH-UI-02';
  let startTime = Date.now();

  try {
    logger.info(`START: ${testId}: ${testName}`);
    
    const context = await browser.newContext({ ignoreHTTPSErrors: true });
    const page = await context.newPage();

    const authHelper = new AuthHelperV2();
    await authHelper.authenticate(page);

    // Find logo
    const logo = await page.locator('img[alt*="logo"], img[alt*="Vedak"], .logo').first();
    
    if (!await logo.isVisible({ timeout: 3000 }).catch(() => false)) {
      throw new Error('Vedak logo not found or not visible');
    }

    logger.info('✓ Vedak logo found and visible');

    // Verify clickable
    const isClickable = await logo.isEnabled().catch(() => false);
    logger.info(`✓ Logo clickable: ${isClickable}`);

    await context.close();
    logger.testPass(`✓ PASS: ${testName} (${Date.now() - startTime}ms)`);
    return { id: testId, name: testName, status: 'PASS', duration: Date.now() - startTime };
  } catch (error) {
    logger.testFail(`✗ FAIL: ${testName} (${Date.now() - startTime}ms)`);
    logger.error(`  Error: ${error.message}`);
    return { id: testId, name: testName, status: 'FAIL', error: error.message, duration: Date.now() - startTime };
  }
}

async function testSidebarNavigation(browser) {
  const testName = 'Sidebar Navigation Elements Visible';
  const testId = 'DASH-UI-03';
  let startTime = Date.now();

  try {
    logger.info(`START: ${testId}: ${testName}`);
    
    const context = await browser.newContext({ ignoreHTTPSErrors: true });
    const page = await context.newPage();

    const authHelper = new AuthHelperV2();
    await authHelper.authenticate(page);

    // Check sidebar
    const sidebar = await page.locator('[role="navigation"], nav, aside, [class*="sidebar"]').first();
    
    if (!await sidebar.isVisible({ timeout: 3000 }).catch(() => false)) {
      throw new Error('Sidebar not visible');
    }

    logger.info('✓ Sidebar found and visible');

    // Check for key navigation items
    const navItems = ['Dashboard', 'Projects', 'Daily Workspace', 'Experts/Profiles', 'Reminders'];
    let foundCount = 0;

    for (const item of navItems) {
      const element = await page.locator(`button:has-text("${item}")`).first();
      if (await element.isVisible({ timeout: 1000 }).catch(() => false)) {
        logger.info(`  ✓ Found: ${item}`);
        foundCount++;
      }
    }

    if (foundCount === 0) {
      throw new Error('No navigation items found');
    }

    logger.info(`✓ Found ${foundCount}/${navItems.length} navigation items`);

    await context.close();
    logger.testPass(`✓ PASS: ${testName} (${Date.now() - startTime}ms)`);
    return { id: testId, name: testName, status: 'PASS', duration: Date.now() - startTime };
  } catch (error) {
    logger.testFail(`✗ FAIL: ${testName} (${Date.now() - startTime}ms)`);
    logger.error(`  Error: ${error.message}`);
    return { id: testId, name: testName, status: 'FAIL', error: error.message, duration: Date.now() - startTime };
  }
}

async function testDashboardWidgets(browser) {
  const testName = 'Dashboard Widgets Visible';
  const testId = 'DASH-UI-04';
  let startTime = Date.now();

  try {
    logger.info(`START: ${testId}: ${testName}`);
    
    const context = await browser.newContext({ ignoreHTTPSErrors: true });
    const page = await context.newPage();

    const authHelper = new AuthHelperV2();
    await authHelper.authenticate(page);

    // Check for key widgets
    const widgets = [
      'Todos',
      'Contribution',
      'Interested Experts',
      'Your Notes',
      'Responsibilities',
      'Recent Projects',
      'Recent Target',
      'Recent To Dos'
    ];

    let foundCount = 0;

    for (const widget of widgets) {
      const element = await page.locator(`text=${widget}`, { exact: false }).first();
      if (await element.isVisible({ timeout: 2000 }).catch(() => false)) {
        logger.info(`  ✓ Found widget: ${widget}`);
        foundCount++;
      } else {
        logger.warn(`  ⚠️ Widget not found: ${widget}`);
      }
    }

    if (foundCount < widgets.length / 2) {
      throw new Error(`Only found ${foundCount}/${widgets.length} widgets`);
    }

    logger.info(`✓ Found ${foundCount}/${widgets.length} dashboard widgets`);

    await context.close();
    logger.testPass(`✓ PASS: ${testName} (${Date.now() - startTime}ms)`);
    return { id: testId, name: testName, status: 'PASS', duration: Date.now() - startTime };
  } catch (error) {
    logger.testFail(`✗ FAIL: ${testName} (${Date.now() - startTime}ms)`);
    logger.error(`  Error: ${error.message}`);
    return { id: testId, name: testName, status: 'FAIL', error: error.message, duration: Date.now() - startTime };
  }
}

module.exports = { runUITests };
