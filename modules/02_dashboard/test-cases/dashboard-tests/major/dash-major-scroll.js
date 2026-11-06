/**
 * Dashboard Major Test: Page Scroll Functionality
 * Verifies scrolling up and down works correctly
 */

const { chromium } = require('@playwright/test');
const CommonUtils = require('../../utils/common');
const logger = require('../../utils/logger');
const ReportGenerator = require('../../utils/report-generator');
require('dotenv').config();

const TEST_ID = 'DASH-MAJOR-SCROLL';
const TEST_NAME = 'Page Scroll Up and Down Functionality';

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

    // Navigate to dashboard
    await page.goto(process.env.APP_URL || 'http://localhost:5173/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    logger.info('Page loaded');
    await CommonUtils.takeScreenshot(page, TEST_ID, 'step-01-initial');

    // Get initial scroll position
    const initialScroll = await page.evaluate(() => window.scrollY);
    logger.info(`Initial scroll position: ${initialScroll}`);

    // Scroll down
    await page.evaluate(() => window.scrollBy(0, 500));
    await page.waitForTimeout(500);
    const scrolledDown = await page.evaluate(() => window.scrollY);
    logger.info(`✓ Scrolled down to: ${scrolledDown}`);
    await CommonUtils.takeScreenshot(page, TEST_ID, 'step-02-scrolled-down');

    if (scrolledDown <= initialScroll) {
      throw new Error('Page did not scroll down');
    }

    // Scroll down more
    await page.evaluate(() => window.scrollBy(0, 500));
    await page.waitForTimeout(500);
    const scrolledMore = await page.evaluate(() => window.scrollY);
    logger.info(`✓ Scrolled further to: ${scrolledMore}`);
    await CommonUtils.takeScreenshot(page, TEST_ID, 'step-03-scrolled-more');

    // Scroll back up
    await page.evaluate(() => window.scrollBy(0, -300));
    await page.waitForTimeout(500);
    const scrolledUp = await page.evaluate(() => window.scrollY);
    logger.info(`✓ Scrolled back up to: ${scrolledUp}`);
    await CommonUtils.takeScreenshot(page, TEST_ID, 'step-04-scrolled-up');

    if (scrolledUp >= scrolledMore) {
      throw new Error('Page did not scroll up properly');
    }

    // Scroll to top
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(500);
    const topScroll = await page.evaluate(() => window.scrollY);
    logger.info(`✓ Scrolled to top: ${topScroll}`);
    await CommonUtils.takeScreenshot(page, TEST_ID, 'step-05-back-to-top');

    const duration = Date.now() - startTime;
    logger.testPass(TEST_NAME, duration);
    testResult = new ReportGenerator().generateTestResult(TEST_ID, TEST_NAME, 'Scroll functionality', 'PASS', duration);

  } catch (error) {
    const duration = Date.now() - startTime;
    logger.testFail(TEST_NAME, duration, error.message);
    if (page) await CommonUtils.takeScreenshot(page, TEST_ID, 'step-error');
    testResult = new ReportGenerator().generateTestResult(TEST_ID, TEST_NAME, 'Scroll functionality', 'FAIL', duration, error.message);
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
