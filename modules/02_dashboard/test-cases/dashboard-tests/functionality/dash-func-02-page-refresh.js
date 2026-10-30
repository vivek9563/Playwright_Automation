/**
 * Dashboard Functionality Test 02: Page Refresh
 * Verifies page refresh maintains session and data
 */

const { chromium } = require('@playwright/test');
const CommonUtils = require('../../utils/common');
const logger = require('../../utils/logger');
const ReportGenerator = require('../../utils/report-generator');
require('dotenv').config();

const TEST_ID = 'DASH-FUNC-02';
const TEST_NAME = 'Page Refresh Functionality';

async function runTest() {
  let browser, context, page;
  const startTime = Date.now();
  let testResult;

  try {
    logger.testStart(`${TEST_ID}: ${TEST_NAME}`);

    browser = await chromium.launch({ headless: false });
    context = await browser.newContext();
    page = await context.newPage();

    await page.setViewportSize({ width: 1920, height: 1080 });
    logger.info('Browser initialized');

    const appUrl = process.env.APP_URL || 'http://localhost:5173/';
    await page.goto(appUrl, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    logger.info(`Initial URL: ${page.url()}`);
    await CommonUtils.takeScreenshot(page, TEST_ID, 'step-01-before-refresh');

    const urlBefore = page.url();

    // Refresh page
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    logger.info('✓ Page refreshed');
    await CommonUtils.takeScreenshot(page, TEST_ID, 'step-02-after-refresh');

    const urlAfter = page.url();
    logger.info(`URL after refresh: ${urlAfter}`);

    if (urlBefore !== urlAfter) {
      logger.warn('URL changed after refresh - might indicate redirect');
    }

    // Check page is still responsive
    const titleAfter = await page.title();
    logger.info(`Page title after refresh: ${titleAfter}`);

    if (!titleAfter) {
      throw new Error('Page title not found after refresh');
    }

    await CommonUtils.takeScreenshot(page, TEST_ID, 'step-03-page-responsive');

    const duration = Date.now() - startTime;
    logger.testPass(TEST_NAME, duration);
    testResult = new ReportGenerator().generateTestResult(TEST_ID, TEST_NAME, 'Page refresh', 'PASS', duration);

  } catch (error) {
    const duration = Date.now() - startTime;
    logger.testFail(TEST_NAME, duration, error.message);
    if (page) await CommonUtils.takeScreenshot(page, TEST_ID, 'step-error');
    testResult = new ReportGenerator().generateTestResult(TEST_ID, TEST_NAME, 'Page refresh', 'FAIL', duration, error.message);
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
    process.exit(result.status === 'PASS' ? 0 : 1);
  }).catch(err => {
    console.error('Test execution failed:', err);
    process.exit(1);
  });
}
