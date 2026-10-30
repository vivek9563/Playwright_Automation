/**
 * Session Management Demo
 * Shows how session persistence works
 */
require('dotenv').config();
const SessionManager = require('./utils/session-manager');
const AuthHelperV2 = require('./utils/auth-helper-v2');
const logger = require('./utils/logger');

async function demonstrateSessionFlow() {
  logger.separator('🎬 SESSION MANAGEMENT DEMONSTRATION');

  const sessionMgr = new SessionManager();
  const authHelper = new AuthHelperV2();

  try {
    // Step 1: Check existing session
    logger.info('\n📋 STEP 1: Checking for existing session...');
    const existingSession = sessionMgr.getSessionInfo();
    
    if (existingSession) {
      logger.info('✅ Found existing session:');
      logger.info(`   Saved: ${existingSession.savedAt}`);
      logger.info(`   Cookies: ${existingSession.cookieCount}`);
      logger.info(`   Storage items: ${existingSession.storageItemCount}`);
    } else {
      logger.info('⚠️  No session found (first run)');
    }

    // Step 2: Session validation
    logger.info('\n🔍 STEP 2: Validating session freshness...');
    const savedSession = sessionMgr.loadSession();
    
    if (savedSession) {
      const isValid = sessionMgr.isSessionValid(savedSession, 480);
      logger.info(isValid ? '✅ Session is FRESH' : '❌ Session is EXPIRED');
    } else {
      logger.info('ℹ️  No session to validate');
    }

    // Step 3: Session persistence workflow
    logger.info('\n📦 STEP 3: Session Persistence Workflow');
    logger.info('When you run tests:');
    logger.info('  1. Browser initializes');
    logger.info('  2. Saved cookies auto-loaded');
    logger.info('  3. If session valid → Skip login');
    logger.info('  4. If session expired → Fresh login');
    logger.info('  5. New session saved');

    // Step 4: Available operations
    logger.separator('\n🎛️  Available Operations');
    logger.info('Command: npm run init:session');
    logger.info('Purpose: Force fresh login and save session');
    logger.info('');
    logger.info('Command: npm run test:dashboard');
    logger.info('Purpose: Run tests with auto-session management');
    logger.info('');
    logger.info('Command: rm sessions/session-data.json');
    logger.info('Purpose: Clear session (forces new login on next run)');

    // Step 5: Configuration
    logger.separator('\n⚙️  Configuration Status');
    logger.info(`✅ Email: ${process.env.GMAIL_EMAIL}`);
    logger.info(`✅ App URL: ${process.env.APP_URL}`);
    logger.info(`✅ Headless: ${process.env.HEADLESS || 'false'}`);
    logger.info(`✅ Session storage: ./sessions/session-data.json`);

    logger.separator('');
    logger.testPass('✅ DEMONSTRATION COMPLETE');
    logger.info('\n🚀 To initialize session, run:');
    logger.info('   npm run init:session');
    logger.info('\n🧪 Then run tests with saved session:');
    logger.info('   npm run test:dashboard');
    logger.separator('');

  } catch (error) {
    logger.error('❌ Demo error: ' + error.message);
    process.exit(1);
  }
}

demonstrateSessionFlow();
