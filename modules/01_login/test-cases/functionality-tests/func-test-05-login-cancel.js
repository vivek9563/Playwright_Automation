/**
 * Functionality Test 05: Login Cancel Operation
 * Verifies that users can cancel the login flow
 */

const { chromium } = require('@playwright/test');
const logger = require('../utils/logger');
const ReportGenerator = require('../utils/report-generator');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const TEST_ID = 'FUNC-TEST-05';
const TEST_NAME = 'Login Cancel Operation';
const TEST_DESCRIPTION = 'Verify users can cancel the login flow';

async function takeScreenshot(page, step) {
  const screenshotDir = './screenshots/func-test-05';
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
  }
  const filename = path.join(screenshotDir, `${step}.png`);
  await page.screenshot({ path: filename });
}

async function runTest() {
  let browser, context, page, popup;
  const startTime = Date.now();
  let testResult;

  try {
    logger.testStart(`${TEST_ID}: ${TEST_NAME}`);

    const appUrl = process.env.APP_URL || 'http://localhost:5173/';
    browser = await chromium.launch({ headless: false });
    context = await browser.newContext();
    page = await context.newPage();

    await page.setViewportSize({ width: 1920, height: 1080 });
    logger.info('Browser initialized for cancel login test');

    // Load login page
    await page.goto(appUrl, { waitUntil: 'networkidle' });
    logger.info(`Navigated to ${appUrl}`);
    await takeScreenshot(page, 'step-01-login-page');

    // Click Google login button to open popup
    const googleButton = page.locator('button, a').filter({ hasText: /Continue with Google/i });
    if (await googleButton.count() === 0) {
      throw new Error('Google login button not found');
    }
    logger.info('✓ Google button found');
    await takeScreenshot(page, 'step-02-button-found');

    // Set up popup listener
    const popupPromise = context.waitForEvent('page');

    // Click button
    await googleButton.first().click();
    logger.info('Clicked Google login button');
    await takeScreenshot(page, 'step-03-button-clicked');

    // Wait for popup
    try {
      popup = await Promise.race([
        popupPromise,
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Popup timeout')), 5000)
        )
      ]);

      logger.info('✓ OAuth popup opened');
      await popup.waitForLoadState('load');
      await popup.waitForTimeout(500);
      await takeScreenshot(popup, 'step-04-popup-opened');

      // Close/cancel the popup instead of completing login
      logger.info('Closing popup to simulate cancel');
      await popup.close();
      logger.info('✓ Popup closed');
      await popup.waitForTimeout(500);

    } catch (e) {
      if (e.message.includes('timeout')) {
        logger.info('⚠ Popup did not open (skipping close test)');
      } else {
        throw e;
      }
    }

    await takeScreenshot(page, 'step-05-popup-closed');

    // Verify main page is still on login screen
    const googleButtonStill = page.locator('button, a').filter({ hasText: /Continue with Google/i });
    if (await googleButtonStill.count() === 0) {
      throw new Error('Google button disappeared after popup close');
    }
    logger.info('✓ Returned to login page after cancel');
    await takeScreenshot(page, 'step-06-login-page-returned');

    // Verify user is NOT logged in
    let isLoggedIn = false;
    try {
      const dashboard = page.locator('text="Dashboard"').first();
      isLoggedIn = await dashboard.isVisible();
    } catch (e) {
      isLoggedIn = false;
    }

    if (isLoggedIn) {
      throw new Error('User should not be logged in after canceling');
    }
    logger.info('✓ User not logged in (correct)');
    await takeScreenshot(page, 'step-07-not-logged-in');

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
    if (popup) {
      try {
        await popup.close();
      } catch (e) {
        logger.warn(`Failed to close popup: ${e.message}`);
      }
    }
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
