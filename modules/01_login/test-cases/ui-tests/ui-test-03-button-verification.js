/**
 * UI Test 03: Button and Interactive Elements Verification
 * Verifies that all login buttons and interactive elements are present and functional
 */

const { chromium } = require('@playwright/test');
const CommonUtils = require('../utils/common');
const logger = require('../utils/logger');
const ReportGenerator = require('../utils/report-generator');
require('dotenv').config();

const TEST_ID = 'UI-TEST-03';
const TEST_NAME = 'Button and Interactive Elements Verification';
const TEST_DESCRIPTION = 'Verify login buttons and interactive elements are present and enabled';

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

    // Find and verify Google login button
    const googleButton = page.locator('button, a').filter({ hasText: /Continue with Google/i });
    const googleButtonCount = await googleButton.count();

    if (googleButtonCount === 0) {
      throw new Error('No Google login button found');
    }
    logger.info(`Found ${googleButtonCount} Google login button(s)`);

    // Verify button properties
    const button = googleButton.first();
    const isVisible = await button.isVisible();
    const isEnabled = await button.isEnabled();

    if (!isVisible) {
      throw new Error('Google login button is not visible');
    }
    logger.info('✓ Google button is visible');
    await CommonUtils.takeScreenshot(page, TEST_ID, 'step-02-google-button-visible');

    if (!isEnabled) {
      throw new Error('Google login button is not enabled');
    }
    logger.info('✓ Google button is enabled');
    await CommonUtils.takeScreenshot(page, TEST_ID, 'step-03-google-button-enabled');

    // Check button text
    const buttonText = await button.textContent();
    if (!buttonText || buttonText.toLowerCase().includes('google') === false) {
      throw new Error(`Unexpected button text: ${buttonText}`);
    }
    logger.info(`✓ Button text correct: "${buttonText.trim()}"`);
    await CommonUtils.takeScreenshot(page, TEST_ID, 'step-04-button-text-verified');

    // Verify button has hover effect or is interactive
    try {
      await button.hover();
      logger.info('✓ Button supports hover interaction');
      await CommonUtils.takeScreenshot(page, TEST_ID, 'step-05-button-hover');
    } catch (e) {
      logger.warn('Could not test hover effect');
    }

    // Check for any additional buttons or links
    const allButtons = page.locator('button, a[role="button"]');
    const buttonCount = await allButtons.count();
    logger.info(`Total interactive buttons/links on page: ${buttonCount}`);
    await CommonUtils.takeScreenshot(page, TEST_ID, 'step-06-all-buttons-counted');

    // Verify form elements if present
    const forms = page.locator('form');
    const formCount = await forms.count();
    if (formCount > 0) {
      logger.info(`Found ${formCount} form(s) on page`);
    } else {
      logger.info('No traditional forms found (using OAuth flow)');
    }
    await CommonUtils.takeScreenshot(page, TEST_ID, 'step-07-forms-checked');

    // Check for input fields (should not be present in OAuth-only flow)
    const inputs = page.locator('input[type="email"], input[type="password"]');
    const inputCount = await inputs.count();
    if (inputCount === 0) {
      logger.info('✓ No email/password inputs found (OAuth-only login)');
    } else {
      logger.info(`Found ${inputCount} input field(s)`);
    }
    await CommonUtils.takeScreenshot(page, TEST_ID, 'step-08-inputs-checked');

    // Verify accessibility attributes
    const ariaLabel = await button.getAttribute('aria-label');
    if (ariaLabel) {
      logger.info(`✓ Button has aria-label: "${ariaLabel}"`);
    } else {
      logger.info('ℹ Button does not have aria-label (consider adding for accessibility)');
    }
    await CommonUtils.takeScreenshot(page, TEST_ID, 'step-09-accessibility-checked');

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
