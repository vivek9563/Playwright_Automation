/**
 * Edge Case Test 05: Browser Back Button Behavior
 * Verifies behavior when user clicks browser back button during login
 */

const { chromium } = require('@playwright/test');
const logger = require('../utils/logger');
const ReportGenerator = require('../utils/report-generator');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const TEST_ID = 'EDGE-TEST-05';
const TEST_NAME = 'Browser Back Button Behavior';
const TEST_DESCRIPTION = 'Verify behavior when user clicks back button during login';

async function takeScreenshot(page, step) {
  const screenshotDir = './screenshots/edge-test-05';
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
  }
  const filename = path.join(screenshotDir, `${step}.png`);
  await page.screenshot({ path: filename });
}

async function runTest() {
  let browser, page;
  const startTime = Date.now();
  let testResult;

  try {
    logger.testStart(`${TEST_ID}: ${TEST_NAME}`);

    const appUrl = process.env.APP_URL || 'http://localhost:5173/';
    
    browser = await chromium.launch({ headless: false });
    const context = await browser.newContext();
    page = await context.newPage();

    await page.setViewportSize({ width: 1920, height: 1080 });
    logger.info('Browser initialized for back button test');
    await takeScreenshot(page, 'step-01-ready');

    // Test 1: Back button on login page
    logger.info('\n--- Test 1: Back button behavior on login page ---');
    await page.goto(appUrl, { waitUntil: 'networkidle' });
    logger.info('✓ Initial page loaded');
    await takeScreenshot(page, 'step-02-login-page');

    // Try to go back (should stay on page or reload)
    try {
      await page.goBack({ waitUntil: 'networkidle', timeout: 2000 });
      logger.info('✓ Back navigation processed');
    } catch (e) {
      logger.info('No history to go back to (expected)');
    }
    await takeScreenshot(page, 'step-03-after-back');

    // Verify page is still accessible
    const googleButton = page.locator('button, a').filter({ hasText: /Continue with Google/i });
    if (await googleButton.count() === 0) {
      throw new Error('Page became inaccessible after back action');
    }
    logger.info('✓ Page still functional after back attempt');
    await takeScreenshot(page, 'step-04-page-functional');

    // Test 2: Navigate forward/back in history
    logger.info('\n--- Test 2: Forward/Back navigation ---');
    await page.goto('about:blank');
    logger.info('Navigated to blank page');
    await takeScreenshot(page, 'step-05-blank-page');

    // Go back to app
    await page.goBack({ waitUntil: 'networkidle' });
    logger.info('✓ Navigated back to app');
    await takeScreenshot(page, 'step-06-back-to-app');

    // Verify app is still accessible
    const buttonAfterBack = page.locator('button, a').filter({ hasText: /Continue with Google/i });
    if (await buttonAfterBack.count() === 0) {
      throw new Error('Button disappeared after back navigation');
    }
    logger.info('✓ Login button still present after back navigation');
    await takeScreenshot(page, 'step-07-button-present');

    // Test 3: Session preservation during navigation
    logger.info('\n--- Test 3: Session preservation ---');
    await page.evaluate(() => {
      localStorage.setItem('test_data', 'preserved_value');
    });
    logger.info('Test data set in localStorage');
    await takeScreenshot(page, 'step-08-data-set');

    // Navigate back and forth
    await page.goto('about:blank');
    await page.goBack();
    await page.waitForTimeout(500);
    
    const preservedData = await page.evaluate(() => {
      return localStorage.getItem('test_data');
    });

    if (preservedData !== 'preserved_value') {
      logger.warn('⚠ LocalStorage was not preserved during navigation');
    } else {
      logger.info('✓ LocalStorage preserved during navigation');
    }
    await takeScreenshot(page, 'step-09-storage-check');

    // Test 4: Multiple back/forward navigation
    logger.info('\n--- Test 4: Multiple navigation cycles ---');
    for (let i = 0; i < 3; i++) {
      await page.goto('about:blank');
      await page.goBack();
      await page.waitForTimeout(200);
    }
    logger.info('✓ Multiple navigation cycles completed');
    await takeScreenshot(page, 'step-10-after-cycles');

    // Final check
    const finalButton = page.locator('button, a').filter({ hasText: /Continue with Google/i });
    if (await finalButton.count() === 0) {
      throw new Error('Page became broken after multiple navigations');
    }
    logger.info('✓ Page stable after multiple navigations');
    await takeScreenshot(page, 'step-11-final-state');

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
      try {
        await takeScreenshot(page, 'step-error');
      } catch (e) {
        logger.error(`Failed to capture error screenshot: ${e.message}`);
      }
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
    if (page) {
      await page.close();
    }
    if (browser) {
      await browser.close();
    }
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
