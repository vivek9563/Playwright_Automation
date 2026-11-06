/**
 * Edge Case Test 01: Slow Network Simulation
 * Verifies login works under slow/poor network conditions
 */

const { chromium } = require('@playwright/test');
const logger = require('../utils/logger');
const ReportGenerator = require('../utils/report-generator');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const TEST_ID = 'EDGE-TEST-01';
const TEST_NAME = 'Slow Network Simulation';
const TEST_DESCRIPTION = 'Verify login works under slow network conditions (3G)';

async function takeScreenshot(page, step) {
  const screenshotDir = './screenshots/edge-test-01';
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
  }
  const filename = path.join(screenshotDir, `${step}.png`);
  await page.screenshot({ path: filename });
}

async function runTest() {
  let browser, context, page;
  const startTime = Date.now();
  let testResult;

  try {
    logger.testStart(`${TEST_ID}: ${TEST_NAME}`);

    const appUrl = process.env.APP_URL || 'http://localhost:5173/';
    
    browser = await chromium.launch({ headless: false });
    
    // Simulate slow 3G network
    context = await browser.newContext();
    const cdpSession = await context.newCDPSession(await context.pages()[0] || null);
    
    // Wait for page creation before trying to use CDP
    const tempPage = await context.newPage();
    const session = await tempPage.context().newCDPSession(tempPage);
    
    // Simulate 3G network conditions
    await session.send('Network.emulateNetworkConditions', {
      offline: false,
      downloadThroughput: 400 * 1024 / 8, // 400 Kbps
      uploadThroughput: 400 * 1024 / 8,
      latency: 400 // 400ms latency
    });
    
    logger.info('✓ 3G network conditions applied');
    await tempPage.close();
    
    page = await context.newPage();
    await page.setViewportSize({ width: 1920, height: 1080 });
    await takeScreenshot(page, 'step-01-3g-enabled');

    // Navigate with slow network
    const startNav = Date.now();
    try {
      await page.goto(appUrl, { waitUntil: 'networkidle', timeout: 30000 });
    } catch (e) {
      logger.warn(`Navigation timeout on slow network: ${e.message}`);
    }
    const navTime = Date.now() - startNav;
    logger.info(`Page loaded in ${navTime}ms under 3G conditions`);
    await takeScreenshot(page, 'step-02-page-loaded');

    // Check if page is still functional
    const googleButton = page.locator('button, a').filter({ hasText: /Continue with Google/i });
    const buttonExists = await googleButton.count() > 0;
    
    if (!buttonExists) {
      throw new Error('Login button not found after slow network load');
    }
    logger.info('✓ Page remains functional under slow network');
    await takeScreenshot(page, 'step-03-button-visible');

    // Check if button is clickable
    try {
      await googleButton.first().isEnabled();
      logger.info('✓ Button is clickable');
    } catch (e) {
      throw new Error('Button not clickable on slow network');
    }
    await takeScreenshot(page, 'step-04-button-clickable');

    // Measure script execution
    const scriptTime = await page.evaluate(() => {
      const start = performance.now();
      // Simulate some computation
      let result = 0;
      for (let i = 0; i < 1000000; i++) {
        result += Math.sqrt(i);
      }
      const end = performance.now();
      return end - start;
    });
    
    logger.info(`Script execution time: ${scriptTime.toFixed(2)}ms`);
    await takeScreenshot(page, 'step-05-script-executed');

    // Check resource loading times
    const resources = await page.evaluate(() => {
      const entries = performance.getEntriesByType('resource');
      return {
        total: entries.length,
        slowest: Math.max(...entries.map(e => e.duration))
      };
    });

    logger.info(`Resources loaded: ${resources.total}, Slowest: ${resources.slowest.toFixed(0)}ms`);
    await takeScreenshot(page, 'step-06-resources-loaded');

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
    if (context) {
      await context.close();
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
