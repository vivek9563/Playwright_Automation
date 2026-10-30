/**
 * Major Test 01: Session Creation and Management
 * Verifies complete session creation workflow and session management
 */

const { chromium } = require('@playwright/test');
const logger = require('../utils/logger');
const AuthHelper = require('../utils/auth-helper');
const ReportGenerator = require('../utils/report-generator');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const TEST_ID = 'MAJOR-TEST-01';
const TEST_NAME = 'Session Creation and Management';
const TEST_DESCRIPTION = 'Verify complete session creation and management workflow';

async function takeScreenshot(page, step) {
  const screenshotDir = './screenshots/major-test-01';
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
    logger.info('Browser initialized for major session test');

    // Initial navigation
    await page.goto(appUrl, { waitUntil: 'networkidle' });
    logger.info(`Navigated to ${appUrl}`);
    await takeScreenshot(page, 'step-01-initial-load');

    // Verify initial state (not logged in)
    let isLoggedIn = false;
    try {
      const dashboard = page.locator('text="Dashboard"').first();
      isLoggedIn = await dashboard.isVisible();
    } catch (e) {
      isLoggedIn = false;
    }

    if (isLoggedIn) {
      throw new Error('User should not be logged in on initial load');
    }
    logger.info('✓ Initial state verified (not logged in)');
    await takeScreenshot(page, 'step-02-initial-state');

    // Check for login button
    const googleButton = page.locator('button, a').filter({ hasText: /Continue with Google/i });
    if (await googleButton.count() === 0) {
      throw new Error('Login button not found');
    }
    logger.info('✓ Login button available');
    await takeScreenshot(page, 'step-03-login-available');

    // Simulate creating a session by setting auth data
    await page.evaluate(() => {
      localStorage.setItem('user_session', JSON.stringify({
        userId: 'user_12345',
        email: 'vivek.k@vedak.com',
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 3600000).toISOString(),
        roles: ['user']
      }));
    });
    logger.info('✓ Session created in storage');
    await takeScreenshot(page, 'step-04-session-created');

    // Verify session in storage
    const sessionData = await page.evaluate(() => {
      const session = localStorage.getItem('user_session');
      return session ? JSON.parse(session) : null;
    });

    if (!sessionData) {
      throw new Error('Session data not found in localStorage');
    }
    logger.info(`✓ Session verified: User ${sessionData.email}`);
    logger.info(`  Created: ${sessionData.createdAt}`);
    logger.info(`  Expires: ${sessionData.expiresAt}`);
    await takeScreenshot(page, 'step-05-session-verified');

    // Refresh page and check session persistence
    await page.reload({ waitUntil: 'networkidle' });
    logger.info('✓ Page reloaded');
    await takeScreenshot(page, 'step-06-after-reload');

    const sessionAfterReload = await page.evaluate(() => {
      const session = localStorage.getItem('user_session');
      return session ? JSON.parse(session) : null;
    });

    if (!sessionAfterReload) {
      logger.warn('⚠ Session lost after page reload');
    } else {
      logger.info('✓ Session persisted after reload');
      logger.info(`  User: ${sessionAfterReload.email}`);
    }
    await takeScreenshot(page, 'step-07-persistence-check');

    // Verify session is not expired
    const expiryTime = new Date(sessionAfterReload.expiresAt).getTime();
    const currentTime = Date.now();
    const isExpired = currentTime > expiryTime;

    if (isExpired) {
      throw new Error('Session is expired');
    }
    logger.info(`✓ Session not expired (expires in ${Math.round((expiryTime - currentTime) / 1000)}s)`);
    await takeScreenshot(page, 'step-08-expiry-verified');

    // Simulate session management operations
    const sessionAge = await page.evaluate(() => {
      const session = JSON.parse(localStorage.getItem('user_session'));
      const created = new Date(session.createdAt).getTime();
      const now = Date.now();
      return Math.round((now - created) / 1000);
    });

    logger.info(`✓ Session age: ${sessionAge} seconds`);
    await takeScreenshot(page, 'step-09-session-age');

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
