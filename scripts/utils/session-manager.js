const fs = require('fs');
const path = require('path');
const logger = require('./logger');

/**
 * SessionManager - Handles session persistence and reuse across test runs
 * Stores cookies/auth tokens to avoid repeated login
 * Automatically logs in again if session expires
 */
class SessionManager {
  constructor() {
    this.sessionsDir = path.join(__dirname, '../sessions');
    this.sessionFile = path.join(this.sessionsDir, 'session-data.json');
    this.ensureSessionsDirectory();
  }

  /**
   * Ensure sessions directory exists
   */
  ensureSessionsDirectory() {
    if (!fs.existsSync(this.sessionsDir)) {
      fs.mkdirSync(this.sessionsDir, { recursive: true });
      logger.info('Created sessions directory: ' + this.sessionsDir);
    }
  }

  /**
   * Save browser cookies and session data
   */
  async saveSession(page, context, testName = 'default') {
    try {
      // If context is provided, use it; otherwise use page.context()
      const ctx = context || (page ? page.context() : null);
      
      if (!ctx) {
        logger.error('❌ No context or page provided to save session');
        return false;
      }

      const cookies = await ctx.cookies();
      
      // Get localStorage from page if available
      let localStorage = {};
      if (page) {
        localStorage = await page.evaluate(() => {
          const items = {};
          try {
            for (let i = 0; i < window.localStorage.length; i++) {
              const key = window.localStorage.key(i);
              items[key] = window.localStorage.getItem(key);
            }
          } catch (e) {
            // localStorage might not be accessible
          }
          return items;
        }).catch(() => ({}));
      }

      // Get userAgent
      let userAgent = 'unknown';
      if (page) {
        userAgent = await page.evaluate(() => navigator.userAgent).catch(() => 'unknown');
      }

      const sessionData = {
        timestamp: new Date().toISOString(),
        testName: testName,
        cookies: cookies,
        localStorage: localStorage,
        userAgent: userAgent,
      };

      fs.writeFileSync(this.sessionFile, JSON.stringify(sessionData, null, 2));
      logger.info(`✅ Session saved successfully for test: ${testName}`);
      logger.info(`   Location: ${this.sessionFile}`);
      return true;
    } catch (error) {
      logger.error(`❌ Failed to save session: ${error.message}`);
      return false;
    }
  }

  /**
   * Load saved session cookies
   */
  loadSession() {
    try {
      if (!fs.existsSync(this.sessionFile)) {
        logger.info('⚠️  No saved session found');
        return null;
      }

      const sessionData = JSON.parse(fs.readFileSync(this.sessionFile, 'utf8'));
      const savedTime = new Date(sessionData.timestamp);
      const now = new Date();
      const ageMinutes = (now - savedTime) / (1000 * 60);

      logger.info(`📦 Found saved session (${ageMinutes.toFixed(1)} minutes old)`);
      logger.info(`   Last used by: ${sessionData.testName}`);
      logger.info(`   Saved at: ${sessionData.timestamp}`);

      return sessionData;
    } catch (error) {
      logger.error(`❌ Failed to load session: ${error.message}`);
      return null;
    }
  }

  /**
   * Restore cookies to a new context
   */
  async restoreSession(context, sessionData) {
    try {
      if (!sessionData || !sessionData.cookies) {
        logger.warn('⚠️  No session data to restore');
        return false;
      }

      // Add cookies to context
      if (sessionData.cookies && sessionData.cookies.length > 0) {
        await context.addCookies(sessionData.cookies);
        logger.info(`✅ Restored ${sessionData.cookies.length} cookies`);
      }

      return true;
    } catch (error) {
      logger.error(`❌ Failed to restore session: ${error.message}`);
      return false;
    }
  }

  /**
   * Check if session is likely still valid
   */
  isSessionValid(sessionData, maxAgeMinutes = 480) {
    // 480 minutes = 8 hours (default browser session timeout)
    if (!sessionData) return false;

    const savedTime = new Date(sessionData.timestamp);
    const now = new Date();
    const ageMinutes = (now - savedTime) / (1000 * 60);

    const isValid = ageMinutes < maxAgeMinutes;
    logger.info(`Session validity check: ${isValid ? '✅ VALID' : '❌ EXPIRED'} (Age: ${ageMinutes.toFixed(1)} min)`);

    return isValid;
  }

  /**
   * Clear saved session
   */
  clearSession() {
    try {
      if (fs.existsSync(this.sessionFile)) {
        fs.unlinkSync(this.sessionFile);
        logger.info('✅ Session cleared successfully');
        return true;
      }
      return true;
    } catch (error) {
      logger.error(`❌ Failed to clear session: ${error.message}`);
      return false;
    }
  }

  /**
   * Get session info
   */
  getSessionInfo() {
    try {
      if (!fs.existsSync(this.sessionFile)) {
        return null;
      }

      const sessionData = JSON.parse(fs.readFileSync(this.sessionFile, 'utf8'));
      return {
        savedAt: sessionData.timestamp,
        lastUsedBy: sessionData.testName,
        cookieCount: sessionData.cookies ? sessionData.cookies.length : 0,
        storageItemCount: sessionData.localStorage ? Object.keys(sessionData.localStorage).length : 0,
      };
    } catch (error) {
      return null;
    }
  }
}

module.exports = SessionManager;
