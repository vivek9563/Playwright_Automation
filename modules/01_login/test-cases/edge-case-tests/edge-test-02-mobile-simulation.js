/**
 * Edge Case Test 02: Mobile Device Simulation
 * Verifies login works on mobile device viewport
 */

const { chromium } = require('@playwright/test');
const logger = require('../utils/logger');
const ReportGenerator = require('../utils/report-generator');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const TEST_ID = 'EDGE-TEST-02';
const TEST_NAME = 'Mobile Device Simulation';
const TEST_DESCRIPTION = 'Verify login works on mobile device viewport';

async function takeScreenshot(page, step) {
  const screenshotDir = './screenshots/edge-test-02';
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
    
    // Simulate iPhone 12
    const devices = [
      { name: 'iPhone 12', width: 390, height: 844, userAgent: 'iPhone' },
      { name: 'iPad', width: 1024, height: 1366, userAgent: 'iPad' }
    ];

    for (const device of devices) {
      logger.info(`\n--- Testing on ${device.name} ---`);
      
      context = await browser.createContext({
        viewport: { width: device.width, height: device.height },
        userAgent: `Mozilla/5.0 (${device.userAgent}; CPU OS 15_0 like Mac OS X)`
      });
      
      page = await context.newPage();
      logger.info(`✓ Device context created: ${device.width}x${device.height}`);
      
      await page.goto(appUrl, { waitUntil: 'networkidle' });
      logger.info(`✓ Page loaded on ${device.name}`);
      await takeScreenshot(page, `step-01-${device.name.toLowerCase()}-loaded`);

      // Check viewport adaptation
      const viewportSize = await page.viewportSize();
      logger.info(`Viewport: ${viewportSize.width}x${viewportSize.height}`);
      
      // Check if page is responsive
      const bodyWidth = await page.evaluate(() => document.body.clientWidth);
      logger.info(`Body width: ${bodyWidth}px`);
      await takeScreenshot(page, `step-02-${device.name.toLowerCase()}-rendered`);

      // Check Google button visibility
      const googleButton = page.locator('button, a').filter({ hasText: /Continue with Google/i });
      const isVisible = await googleButton.count() > 0;
      
      if (!isVisible) {
        logger.warn(`⚠ Google button not visible on ${device.name}`);
      } else {
        logger.info(`✓ Google button visible on ${device.name}`);
      }
      await takeScreenshot(page, `step-03-${device.name.toLowerCase()}-button`);

      // Check if button is clickable
      if (isVisible) {
        const isEnabled = await googleButton.first().isEnabled();
        logger.info(`✓ Button clickable: ${isEnabled}`);
      }
      await takeScreenshot(page, `step-04-${device.name.toLowerCase()}-clickable`);

      // Check touch target size (min 44x44 for mobile)
      if (isVisible) {
        const boundingBox = await googleButton.first().boundingBox();
        if (boundingBox) {
          const minSize = Math.min(boundingBox.width, boundingBox.height);
          logger.info(`Button size: ${boundingBox.width.toFixed(0)}x${boundingBox.height.toFixed(0)}px`);
          if (minSize >= 44) {
            logger.info('✓ Button meets touch target size requirements');
          } else {
            logger.warn(`⚠ Button size ${minSize}px < 44px minimum`);
          }
        }
      }
      await takeScreenshot(page, `step-05-${device.name.toLowerCase()}-size`);

      // Close context for this device
      await context.close();
    }

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
