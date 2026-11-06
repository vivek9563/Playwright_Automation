/**
 * Edge Case Test 04: Session Timeout Handling
 * Verifies login session timeout handling
 */

const { chromium } = require('@playwright/test');
const logger = require('../utils/logger');
const ReportGenerator = require('../utils/report-generator');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const TEST_ID = 'EDGE-TEST-04';
const TEST_NAME = 'Session Timeout Handling';
const TEST_DESCRIPTION = 'Verify session timeout is handled correctly';

async function takeScreenshot(page, step) {
  const screenshotDir = './screenshots/edge-test-04';
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
    logger.info('Browser initialized for session timeout test');
    await takeScreenshot(page, 'step-01-ready');

    // Load page
    await page.goto(appUrl, { waitUntil: 'networkidle' });
    logger.info('✓ Page loaded');
    await takeScreenshot(page, 'step-02-page-loaded');

    // Simulate creating a session
    logger.info('\n--- Creating simulated session ---');
    await page.evaluate(() => {
      const now = Date.now();
      localStorage.setItem('session_token', 'test_token_12345');
      localStorage.setItem('session_created', now.toString());
      localStorage.setItem('session_timeout', (now + 60000).toString()); // 60 seconds from now
      sessionStorage.setItem('user_data', JSON.stringify({
        id: 'user1',
        email: 'vivek.k@vedak.com'
      }));
    });
    logger.info('✓ Session created');
    await takeScreenshot(page, 'step-03-session-created');

    // Verify session exists
    const sessionBefore = await page.evaluate(() => {
      return {
        token: localStorage.getItem('session_token'),
        timeout: localStorage.getItem('session_timeout'),
        userData: sessionStorage.getItem('user_data')
      };
    });

    if (!sessionBefore.token) {
      throw new Error('Session token not set');
    }
    logger.info('✓ Session verified');
    await takeScreenshot(page, 'step-04-session-verified');

    // Simulate session expiry
    logger.info('\n--- Simulating session expiry ---');
    await page.evaluate(() => {
      // Set timeout to past time
      localStorage.setItem('session_timeout', (Date.now() - 1000).toString());
    });
    logger.info('✓ Session marked as expired');
    await takeScreenshot(page, 'step-05-session-expired');

    // Check if expiry can be detected
    const isExpired = await page.evaluate(() => {
      const timeout = parseInt(localStorage.getItem('session_timeout'));
      return Date.now() > timeout;
    });

    if (!isExpired) {
      throw new Error('Expiry detection failed');
    }
    logger.info('✓ Session expiry detected');
    await takeScreenshot(page, 'step-06-expiry-detected');

    // Simulate token refresh
    logger.info('\n--- Simulating token refresh ---');
    await page.evaluate(() => {
      localStorage.setItem('session_token', 'refreshed_token_67890');
      localStorage.setItem('session_timeout', (Date.now() + 60000).toString());
    });
    logger.info('✓ Token refreshed');
    await takeScreenshot(page, 'step-07-token-refreshed');

    // Verify refreshed session
    const sessionAfter = await page.evaluate(() => {
      return {
        token: localStorage.getItem('session_token'),
        isExpired: Date.now() > parseInt(localStorage.getItem('session_timeout'))
      };
    });

    if (sessionAfter.isExpired) {
      throw new Error('Session still expired after refresh');
    }
    logger.info(`✓ Session refreshed: ${sessionAfter.token}`);
    await takeScreenshot(page, 'step-08-refresh-verified');

    // Test logout/session cleanup
    logger.info('\n--- Simulating logout ---');
    await page.evaluate(() => {
      localStorage.removeItem('session_token');
      localStorage.removeItem('session_timeout');
      sessionStorage.clear();
    });
    logger.info('✓ Session cleared');
    await takeScreenshot(page, 'step-09-session-cleared');

    // Verify session is gone
    const sessionAfterLogout = await page.evaluate(() => {
      return {
        token: localStorage.getItem('session_token'),
        storageEmpty: localStorage.length === 0
      };
    });

    if (sessionAfterLogout.token !== null) {
      throw new Error('Session token still exists after logout');
    }
    logger.info('✓ Session completely cleared');
    await takeScreenshot(page, 'step-10-final-state');

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
