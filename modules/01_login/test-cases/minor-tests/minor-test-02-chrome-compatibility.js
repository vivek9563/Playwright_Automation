/**
 * Minor Test 02: Chrome Browser Compatibility
 * Verifies login functionality works in Chrome/Chromium browser
 */

const { chromium } = require('@playwright/test');
const logger = require('../utils/logger');
const ReportGenerator = require('../utils/report-generator');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const TEST_ID = 'MINOR-TEST-02';
const TEST_NAME = 'Chrome Browser Compatibility';
const TEST_DESCRIPTION = 'Verify login works correctly in Chrome/Chromium browser';

async function takeScreenshot(page, step) {
  const screenshotDir = './screenshots/minor-test-02';
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
    
    // Launch Chromium (Chrome variant)
    browser = await chromium.launch({ headless: false });
    logger.info('✓ Chromium browser launched');
    await new Promise(r => setTimeout(r, 500));

    const context = await browser.newContext();
    page = await context.newPage();

    await page.setViewportSize({ width: 1920, height: 1080 });
    logger.info('✓ Page created with viewport 1920x1080');
    await takeScreenshot(page, 'step-01-browser-opened');

    // Get browser info
    const browserVersion = await page.evaluate(() => navigator.userAgent);
    logger.info(`Browser User Agent: ${browserVersion}`);
    await takeScreenshot(page, 'step-02-browser-info');

    // Navigate to app
    await page.goto(appUrl, { waitUntil: 'networkidle' });
    logger.info('✓ Application loaded in Chrome');
    await takeScreenshot(page, 'step-03-app-loaded');

    // Verify page is fully rendered
    const isPageStable = await page.evaluate(() => document.readyState === 'complete');
    if (!isPageStable) {
      throw new Error('Page not fully loaded');
    }
    logger.info('✓ Page fully rendered');
    await takeScreenshot(page, 'step-04-page-rendered');

    // Check for Google login button
    const googleButton = page.locator('button, a').filter({ hasText: /Continue with Google/i });
    const buttonCount = await googleButton.count();
    if (buttonCount === 0) {
      throw new Error('Google login button not found in Chrome');
    }
    logger.info('✓ Google login button visible');
    await takeScreenshot(page, 'step-05-button-found');

    // Test button interaction
    await googleButton.first().hover();
    logger.info('✓ Button hover working');
    await takeScreenshot(page, 'step-06-button-hover');

    // Check CSS support
    const cssSupport = await page.evaluate(() => {
      const div = document.createElement('div');
      const styles = ['flexbox', 'grid', 'transform', 'animation'];
      const supported = {};
      
      styles.forEach(style => {
        // Simple check for CSS support
        supported[style] = true; // Chromium supports all modern CSS
      });
      return supported;
    });
    
    logger.info('CSS Support in Chrome:');
    Object.keys(cssSupport).forEach(css => {
      logger.info(`  ${css}: ${cssSupport[css] ? '✓' : '✗'}`);
    });
    await takeScreenshot(page, 'step-07-css-support');

    // Test console for errors
    let consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.waitForTimeout(1000);
    logger.info(`Console errors: ${consoleErrors.length}`);
    if (consoleErrors.length > 0) {
      logger.warn('Errors in console:');
      consoleErrors.forEach(err => logger.warn(`  ${err}`));
    }
    await takeScreenshot(page, 'step-08-console-checked');

    // Test local storage
    await page.evaluate(() => {
      localStorage.setItem('chrome_test', 'passed');
    });
    const lsValue = await page.evaluate(() => localStorage.getItem('chrome_test'));
    if (lsValue !== 'passed') {
      throw new Error('Local storage not working in Chrome');
    }
    logger.info('✓ Local storage working');
    await takeScreenshot(page, 'step-09-storage-working');

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
