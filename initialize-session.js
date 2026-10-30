require('dotenv').config();
const { chromium } = require('@playwright/test');
const logger = require('./utils/logger');
const AuthHelperV2 = require('./utils/auth-helper-v2');

/**
 * Initialize Session Script
 * Logs in to the application and saves session for reuse
 * Run this before test suite to ensure fresh login
 */
async function initializeSession() {
  let browser = null;

  try {
    logger.separator('🚀 VEDAK CRM - SESSION INITIALIZATION');
    logger.info('Purpose: Login and save session for test suite');
    logger.info('This session will be reused across all test runs');
    logger.separator();

    // Launch browser
    logger.info('🌐 Launching browser...');
    browser = await chromium.launch({
      headless: false, // Show browser window
      args: ['--no-sandbox'],
    });

    // Create context
    const context = await browser.newContext({
      ignoreHTTPSErrors: true,
      viewport: { width: 1920, height: 1080 },
    });

    // Create page
    const page = await context.newPage();

    // Get auth helper
    const authHelper = new AuthHelperV2();

    // Check current session
    const sessionInfo = authHelper.getSessionInfo();
    if (sessionInfo) {
      logger.info('📦 Existing session found:');
      logger.info(`   Saved at: ${sessionInfo.savedAt}`);
      logger.info(`   Used by: ${sessionInfo.lastUsedBy}`);
      logger.info(`   Cookies: ${sessionInfo.cookieCount}`);
      logger.separator();
    }

    // Authenticate (will reuse if valid, otherwise login fresh)
    logger.info('🔐 Starting authentication process...');
    const authResult = await authHelper.authenticate(page, false); // false = allow session reuse

    if (!authResult.success) {
      logger.error('❌ Authentication failed!');
      logger.error(`Error: ${authResult.error}`);
      process.exit(1);
    }

    if (authResult.sessionReused) {
      logger.testPass('✅ EXISTING SESSION REUSED SUCCESSFULLY');
      logger.info('📦 Session restored from previous login');
      logger.info('✨ All tests will use this active session');
    } else {
      logger.testPass('✅ NEW SESSION CREATED AND SAVED');
      logger.info('📧 Logged in as: ' + authResult.email);
      logger.info('💾 Session saved to: ./sessions/session-data.json');
      logger.info('✨ Ready to run test suite');
    }

    // Save final session state
    await authHelper.saveSessionForReuse(page);

    logger.separator('✅ SESSION INITIALIZATION COMPLETE');
    logger.info('You can now run tests with: npm run test:dashboard');
    logger.separator();

    // Keep browser open briefly to show success
    await page.waitForTimeout(2000);

    await context.close();
    await browser.close();
  } catch (error) {
    logger.error('❌ Fatal error during session initialization:');
    logger.error(error.message);
    console.error(error);
    process.exit(1);
  } finally {
    if (browser) {
      try {
        await browser.close();
      } catch (e) {
        // Ignore close errors
      }
    }
  }
}

// Run initialization
initializeSession();
