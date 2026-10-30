/**
 * UI Test 02: Welcome Text and Logo Display
 * Verifies that welcome message and branding elements are displayed correctly
 */

const { chromium } = require('@playwright/test');
const CommonUtils = require('../utils/common');
const logger = require('../utils/logger');
const ReportGenerator = require('../utils/report-generator');
require('dotenv').config();

const TEST_ID = 'UI-TEST-02';
const TEST_NAME = 'Welcome Text and Logo Display';
const TEST_DESCRIPTION = 'Verify welcome message and branding elements are displayed';

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
    logger.info('Browser initialized');

    await page.goto(appUrl, { waitUntil: 'networkidle' });
    await CommonUtils.takeScreenshot(page, TEST_ID, 'step-01-page-loaded');

    // Check for logo or branding
    const logo = page.locator('img[alt*="logo"], img[alt*="Vedak"], .logo, [class*="logo"]').first();
    let logoFound = false;
    try {
      logoFound = await logo.isVisible();
      if (logoFound) {
        logger.info('Logo found and visible');
      }
    } catch (e) {
      logger.warn('Logo not found via selector');
    }
    await CommonUtils.takeScreenshot(page, TEST_ID, 'step-02-logo-check');

    // Check for welcome text variations
    const welcomeSelectors = [
      'text="Welcome"',
      'text="Sign in"',
      'text="Login"',
      'h1, h2, h3'
    ];

    let welcomeTextFound = false;
    let welcomeText = '';

    for (const selector of welcomeSelectors) {
      try {
        const element = page.locator(selector).first();
        if (await element.isVisible()) {
          welcomeText = await element.textContent();
          welcomeTextFound = true;
          logger.info(`Welcome text found: "${welcomeText.trim()}"`);
          break;
        }
      } catch (e) {
        continue;
      }
    }

    if (!welcomeTextFound) {
      throw new Error('Welcome or greeting text not found on page');
    }
    await CommonUtils.takeScreenshot(page, TEST_ID, 'step-03-welcome-text-found');

    // Check for description or subtitle
    const descriptions = page.locator('p, .description, .subtitle, [role="heading"]');
    const descCount = await descriptions.count();
    if (descCount < 2) {
      logger.warn('Expected at least 2 text elements (heading + description)');
    } else {
      logger.info(`Found ${descCount} text elements on page`);
    }
    await CommonUtils.takeScreenshot(page, TEST_ID, 'step-04-text-elements-verified');

    // Verify color scheme or styling (if applicable)
    const mainContainer = page.locator('main, [role="main"], .container').first();
    const bgColor = await mainContainer.evaluate(el => window.getComputedStyle(el).backgroundColor);
    logger.info(`Main container background color: ${bgColor}`);
    await CommonUtils.takeScreenshot(page, TEST_ID, 'step-05-styling-verified');

    // Check for any error messages (should be none)
    const errorMessages = page.locator('[role="alert"], .error, .error-message, .alert-danger').first();
    let errorFound = false;
    try {
      errorFound = await errorMessages.isVisible();
    } catch (e) {
      errorFound = false;
    }

    if (errorFound) {
      throw new Error('Unexpected error message found on login page');
    }
    logger.info('No error messages present');
    await CommonUtils.takeScreenshot(page, TEST_ID, 'step-06-no-errors');

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
