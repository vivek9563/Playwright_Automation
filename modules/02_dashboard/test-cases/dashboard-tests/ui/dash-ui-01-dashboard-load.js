/**
 * Dashboard UI Test 01: Dashboard Page Loads Successfully
 * Verifies dashboard page loads with all required UI elements
 */

const { chromium } = require('@playwright/test');
const CommonUtils = require('../../utils/common');
const logger = require('../../utils/logger');
const ReportGenerator = require('../../utils/report-generator');
require('dotenv').config();

const TEST_ID = 'DASH-UI-01';
const TEST_NAME = 'Dashboard Page Loads Successfully';
const TEST_DESCRIPTION = 'Verify dashboard page loads with all required UI elements';

async function runTest() {
  let browser, context, page;
  const startTime = Date.now();
  let testResult;

  try {
    logger.testStart(`${TEST_ID}: ${TEST_NAME}`);

    const appUrl = process.env.APP_URL || 'http://localhost:5173/';
    browser = await chromium.launch({ headless: false });
    context = await browser.newContext();
    page = await context.newPage();

    await page.setViewportSize({ width: 1920, height: 1080 });
    logger.info('Browser initialized');

    // Navigate to app
    await page.goto(appUrl, { waitUntil: 'networkidle' });
    logger.info(`Navigated to ${appUrl}`);
    await CommonUtils.takeScreenshot(page, TEST_ID, 'step-01-login-page');

    // Login process
    const emailInput = page.locator('input[type="email"], input[placeholder*="email"], input[name="email"]').first();
    if (await emailInput.isVisible()) {
      await emailInput.fill(process.env.GMAIL_EMAIL);
      logger.info('Email entered');
      await CommonUtils.takeScreenshot(page, TEST_ID, 'step-02-email-entered');
      
      // Wait for Google login button and click
      const googleButton = page.locator('button, a').filter({ hasText: /Continue with Google/i }).first();
      await googleButton.click();
      logger.info('Clicked Continue with Google');
      await CommonUtils.takeScreenshot(page, TEST_ID, 'step-03-google-popup');
      
      // Wait for OAuth popup
      await page.waitForTimeout(2000);
    }

    // Wait for dashboard to load
    await page.waitForTimeout(5000);
    logger.info('Waiting for dashboard to load...');

    // Check dashboard elements
    const sidebarVisible = await page.locator('aside, nav, .sidebar, [role="navigation"]').first().isVisible({ timeout: 10000 }).catch(() => false);
    if (!sidebarVisible) {
      throw new Error('Sidebar/navigation not visible');
    }
    logger.info('✓ Sidebar visible');
    await CommonUtils.takeScreenshot(page, TEST_ID, 'step-04-sidebar-visible');

    const mainContent = await page.locator('main, [role="main"], .content, .dashboard').first().isVisible({ timeout: 10000 }).catch(() => false);
    if (!mainContent) {
      throw new Error('Main content area not visible');
    }
    logger.info('✓ Main content visible');
    await CommonUtils.takeScreenshot(page, TEST_ID, 'step-05-content-visible');

    // Check for page title
    const title = await page.title();
    logger.info(`Page title: ${title}`);
    await CommonUtils.takeScreenshot(page, TEST_ID, 'step-06-page-title');

    const duration = Date.now() - startTime;
    logger.testPass(TEST_NAME, duration);

    testResult = new ReportGenerator().generateTestResult(
      TEST_ID,
      TEST_NAME,
      TEST_DESCRIPTION,
      'PASS',
      duration
    );

  } catch (error) {
    const duration = Date.now() - startTime;
    logger.testFail(TEST_NAME, duration, error.message);

    if (page) {
      await CommonUtils.takeScreenshot(page, TEST_ID, 'step-error');
    }

    testResult = new ReportGenerator().generateTestResult(
      TEST_ID,
      TEST_NAME,
      TEST_DESCRIPTION,
      'FAIL',
      duration,
      error.message
    );

  } finally {
    if (page) await page.close();
    if (context) await context.close();
    if (browser) await browser.close();
  }

  return testResult;
}

module.exports = { runTest, TEST_ID, TEST_NAME };

if (require.main === module) {
  runTest().then(result => {
    console.log('\nTest Result:', result);
    process.exit(result.status === 'PASS' ? 0 : 1);
  }).catch(err => {
    console.error('Test execution failed:', err);
    process.exit(1);
  });
}
