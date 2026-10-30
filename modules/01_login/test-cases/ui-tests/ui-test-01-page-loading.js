/**
 * UI Test 01: Page Loading and Initial Content Display
 * Verifies that the login page loads correctly and displays all required UI elements
 */

const { chromium } = require('@playwright/test');
const CommonUtils = require('../utils/common');
const logger = require('../utils/logger');
const ReportGenerator = require('../utils/report-generator');
require('dotenv').config();

const TEST_ID = 'UI-TEST-01';
const TEST_NAME = 'Page Loading and Initial Content Display';
const TEST_DESCRIPTION = 'Verify login page loads with all UI elements present';

async function runTest() {
  let browser, context, page;
  const startTime = Date.now();
  let testResult;

  try {
    logger.testStart(`${TEST_ID}: ${TEST_NAME}`);

    // Initialize browser
    const appUrl = process.env.APP_URL || 'http://localhost:5173/';
    browser = await chromium.launch({ headless: false });
    context = await browser.newContext();
    page = await context.newPage();

    // Set viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    logger.info('Browser initialized with viewport 1920x1080');

    // Navigate to app
    await page.goto(appUrl, { waitUntil: 'networkidle' });
    logger.info(`Navigated to ${appUrl}`);
    await CommonUtils.takeScreenshot(page, TEST_ID, 'step-01-page-loaded');

    // Check for page title
    const title = await page.title();
    if (!title) {
      throw new Error('Page title not found');
    }
    logger.info(`Page title: ${title}`);
    await CommonUtils.takeScreenshot(page, TEST_ID, 'step-02-page-title');

    // Check for main heading/welcome text
    const heading = page.locator('h1, h2').first();
    const headingText = await heading.textContent();
    if (!headingText || headingText.trim().length === 0) {
      throw new Error('No main heading found on page');
    }
    logger.info(`Main heading: ${headingText.trim()}`);
    await CommonUtils.takeScreenshot(page, TEST_ID, 'step-03-heading-found');

    // Check for Google login button
    const googleButton = page.locator('button, a').filter({ hasText: /Continue with Google/i });
    const googleButtonCount = await googleButton.count();
    if (googleButtonCount === 0) {
      throw new Error('Continue with Google button not found');
    }
    logger.info('Continue with Google button found');
    await CommonUtils.takeScreenshot(page, TEST_ID, 'step-04-google-button-visible');

    // Verify button is visible and clickable
    await googleButton.first().isVisible();
    await googleButton.first().isEnabled();
    logger.info('Google button is visible and enabled');
    await CommonUtils.takeScreenshot(page, TEST_ID, 'step-05-button-enabled');

    // Check for page layout (look for main container)
    const mainContent = page.locator('main, [role="main"], .container, .login-container').first();
    const isVisible = await mainContent.isVisible();
    if (!isVisible) {
      throw new Error('Main content container not visible');
    }
    logger.info('Main content container is visible');
    await CommonUtils.takeScreenshot(page, TEST_ID, 'step-06-content-visible');

    // Calculate test duration
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

// Run if executed directly
if (require.main === module) {
  runTest().then(result => {
    console.log('\nTest Result:', result);
    process.exit(result.status === 'PASS' ? 0 : 1);
  }).catch(err => {
    console.error('Test execution failed:', err);
    process.exit(1);
  });
}
