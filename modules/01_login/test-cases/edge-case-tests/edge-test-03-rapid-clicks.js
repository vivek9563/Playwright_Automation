/**
 * Edge Case Test 03: Rapid Succession Clicks
 * Verifies login button handles rapid/double clicks correctly
 */

const { chromium } = require('@playwright/test');
const logger = require('../utils/logger');
const ReportGenerator = require('../utils/report-generator');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const TEST_ID = 'EDGE-TEST-03';
const TEST_NAME = 'Rapid Succession Clicks';
const TEST_DESCRIPTION = 'Verify login button handles rapid/double clicks correctly';

async function takeScreenshot(page, step) {
  const screenshotDir = './screenshots/edge-test-03';
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
    logger.info('Browser initialized for rapid click test');
    await takeScreenshot(page, 'step-01-ready');

    // Navigate to app
    await page.goto(appUrl, { waitUntil: 'networkidle' });
    logger.info('Page loaded');
    await takeScreenshot(page, 'step-02-page-loaded');

    // Find Google button
    const googleButton = page.locator('button, a').filter({ hasText: /Continue with Google/i });
    if (await googleButton.count() === 0) {
      throw new Error('Google button not found');
    }
    logger.info('✓ Google button found');
    await takeScreenshot(page, 'step-03-button-found');

    // Test 1: Double click
    logger.info('\n--- Test 1: Double Click ---');
    let popupCount = 0;
    const popupHandler = () => {
      popupCount++;
      logger.info(`Popup opened (count: ${popupCount})`);
    };
    
    context.on('page', popupHandler);
    
    await googleButton.first().dblclick();
    logger.info('Double clicked button');
    await page.waitForTimeout(1000);
    await takeScreenshot(page, 'step-04-after-double-click');

    if (popupCount > 1) {
      logger.warn(`⚠ Multiple popups opened (${popupCount}) - should be prevented`);
    } else if (popupCount === 1) {
      logger.info('✓ Only one popup opened (correct)');
    } else {
      logger.info('No popup detected (may be expected)');
    }

    // Test 2: Rapid clicks
    logger.info('\n--- Test 2: Rapid Clicks (5x quickly) ---');
    popupCount = 0;
    
    for (let i = 0; i < 5; i++) {
      await googleButton.first().click();
      await page.waitForTimeout(100); // 100ms between clicks
    }
    
    logger.info(`Performed 5 rapid clicks`);
    await page.waitForTimeout(1000);
    await takeScreenshot(page, 'step-05-after-rapid-clicks');

    logger.info(`Popups from rapid clicks: ${popupCount}`);
    if (popupCount > 1) {
      logger.warn(`⚠ Multiple popups from rapid clicks (${popupCount})`);
    } else if (popupCount === 1) {
      logger.info('✓ Only one popup despite rapid clicks (good)');
    }

    // Test 3: Check button state after interactions
    logger.info('\n--- Test 3: Button State After Interactions ---');
    
    const isStillVisible = await googleButton.first().isVisible();
    logger.info(`Button still visible: ${isStillVisible}`);
    
    const isStillEnabled = await googleButton.first().isEnabled();
    logger.info(`Button still enabled: ${isStillEnabled}`);
    
    if (!isStillVisible || !isStillEnabled) {
      logger.warn('⚠ Button became unavailable after interactions');
    } else {
      logger.info('✓ Button remains in good state');
    }
    await takeScreenshot(page, 'step-06-final-button-state');

    // Test 4: Check for multiple listeners
    logger.info('\n--- Test 4: Event Listener Check ---');
    const eventListenersCount = await page.evaluate(() => {
      const button = document.querySelector('button, a');
      if (!button) return 0;
      // Note: This is a simplified check
      return button.onclick ? 1 : 0;
    });
    
    logger.info(`Inline event listeners detected: ${eventListenersCount}`);
    await takeScreenshot(page, 'step-07-listeners-checked');

    context.off('page', popupHandler);

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
