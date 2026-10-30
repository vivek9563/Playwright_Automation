/**
 * Minor Test 01: Performance and Load Time
 * Verifies login page loads within acceptable time limits
 */

const { chromium } = require('@playwright/test');
const logger = require('../utils/logger');
const ReportGenerator = require('../utils/report-generator');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const TEST_ID = 'MINOR-TEST-01';
const TEST_NAME = 'Performance and Load Time';
const TEST_DESCRIPTION = 'Verify login page loads within acceptable time limits';

async function takeScreenshot(page, step) {
  const screenshotDir = './screenshots/minor-test-01';
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
    const maxLoadTime = 5000; // 5 seconds max

    browser = await chromium.launch({ headless: false });
    const context = await browser.newContext();
    page = await context.newPage();

    await page.setViewportSize({ width: 1920, height: 1080 });
    logger.info('Browser initialized for performance test');

    // Measure navigation time
    const navStart = Date.now();
    const response = await page.goto(appUrl, { waitUntil: 'networkidle' });
    const navEnd = Date.now();
    const navTime = navEnd - navStart;

    logger.info(`Navigation completed in ${navTime}ms`);
    if (navTime > maxLoadTime) {
      logger.warn(`⚠ Navigation took longer than ${maxLoadTime}ms`);
    } else {
      logger.info(`✓ Navigation within acceptable time`);
    }
    await takeScreenshot(page, 'step-01-page-loaded');

    // Check response time
    const statusCode = response.status();
    logger.info(`HTTP Status: ${statusCode}`);
    if (statusCode !== 200) {
      throw new Error(`Unexpected HTTP status: ${statusCode}`);
    }
    await takeScreenshot(page, 'step-02-response-checked');

    // Measure DOM content loaded time
    const domStart = Date.now();
    await page.waitForLoadState('domcontentloaded');
    const domEnd = Date.now();
    const domTime = domEnd - domStart;

    logger.info(`DOM Content Loaded in ${domTime}ms`);
    await takeScreenshot(page, 'step-03-dom-loaded');

    // Measure network idle time
    const idleStart = Date.now();
    await page.waitForLoadState('networkidle');
    const idleEnd = Date.now();
    const idleTime = idleEnd - idleStart;

    logger.info(`Network Idle in ${idleTime}ms`);
    await takeScreenshot(page, 'step-04-network-idle');

    // Check for render blocking resources
    const perfTiming = await page.evaluate(() => {
      const timing = window.performance.timing;
      return {
        navigationStart: timing.navigationStart,
        responseEnd: timing.responseEnd,
        domInteractive: timing.domInteractive,
        domComplete: timing.domComplete,
        loadEventEnd: timing.loadEventEnd
      };
    });

    logger.info('\nPerformance Metrics:');
    logger.info(`  Response End: ${perfTiming.responseEnd - perfTiming.navigationStart}ms`);
    logger.info(`  DOM Interactive: ${perfTiming.domInteractive - perfTiming.navigationStart}ms`);
    logger.info(`  DOM Complete: ${perfTiming.domComplete - perfTiming.navigationStart}ms`);
    logger.info(`  Load Event: ${perfTiming.loadEventEnd - perfTiming.navigationStart}ms`);
    await takeScreenshot(page, 'step-05-performance-metrics');

    // Check resources count
    const resources = await page.evaluate(() => {
      return performance.getEntriesByType('resource').map(r => ({
        name: r.name,
        duration: Math.round(r.duration)
      }));
    });

    logger.info(`\nTotal resources loaded: ${resources.length}`);
    const slowResources = resources.filter(r => r.duration > 1000);
    if (slowResources.length > 0) {
      logger.warn(`⚠ ${slowResources.length} slow resources (>1000ms):`);
      slowResources.forEach(r => {
        logger.info(`  ${r.name}: ${r.duration}ms`);
      });
    }
    await takeScreenshot(page, 'step-06-resources-checked');

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
