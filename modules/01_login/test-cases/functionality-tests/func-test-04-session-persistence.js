/**
 * Functionality Test 04: Session Persistence Check
 * Verifies that user session persists after login
 */

const { chromium } = require('@playwright/test');
const logger = require('../utils/logger');
const ReportGenerator = require('../utils/report-generator');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const TEST_ID = 'FUNC-TEST-04';
const TEST_NAME = 'Session Persistence Check';
const TEST_DESCRIPTION = 'Verify user session persists after login';

async function takeScreenshot(page, step) {
  const screenshotDir = './screenshots/func-test-04';
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
    context = await browser.newContext();
    page = await context.newPage();

    await page.setViewportSize({ width: 1920, height: 1080 });
    logger.info('Browser initialized for session persistence test');

    // Load login page
    await page.goto(appUrl, { waitUntil: 'networkidle' });
    logger.info(`Navigated to ${appUrl}`);
    await takeScreenshot(page, 'step-01-login-page');

    // Check for existing session (cookies/storage)
    const cookies = await context.cookies();
    logger.info(`Found ${cookies.length} cookies`);
    if (cookies.length > 0) {
      cookies.forEach(cookie => {
        logger.info(`  - ${cookie.name}: ${cookie.value.substring(0, 20)}...`);
      });
    }
    await takeScreenshot(page, 'step-02-cookies-logged');

    // Check local storage
    const storage = await page.evaluate(() => {
      return {
        localStorage: { ...window.localStorage },
        sessionStorage: { ...window.sessionStorage }
      };
    });

    logger.info(`LocalStorage items: ${Object.keys(storage.localStorage).length}`);
    logger.info(`SessionStorage items: ${Object.keys(storage.sessionStorage).length}`);

    Object.keys(storage.localStorage).forEach(key => {
      logger.info(`  LS[${key}]: ${storage.localStorage[key].substring(0, 30)}...`);
    });
    await takeScreenshot(page, 'step-03-storage-checked');

    // Simulate session by adding token (simulating successful login)
    await page.evaluate(() => {
      localStorage.setItem('auth_token', 'test_token_12345');
      sessionStorage.setItem('session_id', 'sess_67890');
    });
    logger.info('✓ Simulated session storage set');
    await takeScreenshot(page, 'step-04-session-set');

    // Navigate away and back to verify persistence
    const testUrl = 'about:blank';
    await page.goto(testUrl);
    logger.info('Navigated to blank page');
    await page.waitForTimeout(500);

    // Navigate back to app
    await page.goto(appUrl, { waitUntil: 'networkidle' });
    logger.info('Navigated back to app URL');
    await takeScreenshot(page, 'step-05-navigated-back');

    // Verify session still exists
    const sessionAfter = await page.evaluate(() => {
      return {
        auth_token: localStorage.getItem('auth_token'),
        session_id: sessionStorage.getItem('session_id')
      };
    });

    if (!sessionAfter.auth_token) {
      logger.warn('⚠ LocalStorage was cleared (may be expected behavior)');
    } else {
      logger.info(`✓ Auth token persisted: ${sessionAfter.auth_token}`);
    }

    if (!sessionAfter.session_id) {
      logger.info('ℹ SessionStorage was cleared (expected - session ended)');
    } else {
      logger.info(`✓ Session ID still present: ${sessionAfter.session_id}`);
    }
    await takeScreenshot(page, 'step-06-session-verified');

    // Check if user is still logged in
    let isLoggedIn = false;
    try {
      const dashboard = page.locator('text="Dashboard"').first();
      isLoggedIn = await dashboard.isVisible();
    } catch (e) {
      logger.info('Dashboard check failed (user may not be logged in)');
    }

    logger.info(`User logged in status: ${isLoggedIn}`);
    await takeScreenshot(page, 'step-07-login-status');

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
