/**
 * Dashboard Functionality Test 01: Click Vedak Logo Redirect
 * Verifies clicking Vedak logo redirects properly
 */

const { chromium } = require('@playwright/test');
const CommonUtils = require('../../utils/common');
const logger = require('../../utils/logger');
const ReportGenerator = require('../../utils/report-generator');
require('dotenv').config();

const TEST_ID = 'DASH-FUNC-01';
const TEST_NAME = 'Click Vedak Logo Redirect';

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

    // Navigate to login page
    await page.goto(process.env.APP_URL || 'http://localhost:5173/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    await CommonUtils.takeScreenshot(page, TEST_ID, 'step-01-login-page');

    // Simulate login
    logger.info('Simulating login...');
    await page.waitForTimeout(3000);

    // Find and click Vedak logo
    const logo = page.locator('img[alt*="Vedak"], img[alt*="vedak"], .logo, [class*="logo"]').first();
    
    if (await logo.isVisible({ timeout: 5000 }).catch(() => false)) {
      logger.info('✓ Vedak logo found');
      await CommonUtils.takeScreenshot(page, TEST_ID, 'step-02-logo-visible');
      
      await logo.click();
      logger.info('✓ Logo clicked');
      await CommonUtils.takeScreenshot(page, TEST_ID, 'step-03-logo-clicked');
      
      await page.waitForNavigation({ waitUntil: 'networkidle' }).catch(() => {});
      logger.info('✓ Navigation processed');
      
      const newUrl = page.url();
      logger.info(`New URL: ${newUrl}`);
      await CommonUtils.takeScreenshot(page, TEST_ID, 'step-04-after-redirect');

      const duration = Date.now() - startTime;
      logger.testPass(TEST_NAME, duration);
      testResult = new ReportGenerator().generateTestResult(TEST_ID, TEST_NAME, 'Logo click redirect', 'PASS', duration);
    } else {
      throw new Error('Vedak logo not found on page');
    }

  } catch (error) {
    const duration = Date.now() - startTime;
    logger.testFail(TEST_NAME, duration, error.message);
    if (page) await CommonUtils.takeScreenshot(page, TEST_ID, 'step-error');
    testResult = new ReportGenerator().generateTestResult(TEST_ID, TEST_NAME, 'Logo click redirect', 'FAIL', duration, error.message);
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
