require('dotenv').config();
const { chromium } = require('@playwright/test');
const logger = require('./logger');
const SessionManager = require('./session-manager');

/**
 * AuthHelperV2 - Enhanced authentication with session persistence
 * Reuses saved sessions and automatically logs in if expired
 */
class AuthHelperV2 {
  constructor() {
    this.sessionManager = new SessionManager();
    this.appUrl = process.env.APP_URL || 'http://localhost:5173/';
    this.gmailEmail = process.env.GMAIL_EMAIL;
    this.gmailPassword = process.env.GMAIL_PASSWORD;
  }

  /**
   * Main authentication flow with session reuse
   */
  async authenticate(page, forceNewLogin = false) {
    logger.separator('🔐 AUTHENTICATION FLOW');

    try {
      // Check for saved session
      const savedSession = this.sessionManager.loadSession();
      const sessionIsValid = this.sessionManager.isSessionValid(savedSession, 480); // 8 hours

      if (savedSession && sessionIsValid && !forceNewLogin) {
        logger.info('📦 Attempting to use saved session...');

        // IMPORTANT: Restore cookies BEFORE navigating
        const restored = await this.sessionManager.restoreSession(page.context(), savedSession);
        
        if (restored) {
          // Now navigate with restored cookies
          logger.info('🌐 Navigating to app with restored session...');
          await page.goto(this.appUrl, { waitUntil: 'networkidle' });
          await page.waitForTimeout(3000);

          // Check if already logged in
          const isLoggedIn = await this.checkIfLoggedIn(page);

          if (isLoggedIn) {
            logger.testPass('✅ SESSION REUSED - User already logged in!');
            return { success: true, loggedIn: true, sessionReused: true };
          }

          logger.warn('⚠️  Session cookies might be expired, attempting fresh login...');
        } else {
          logger.warn('⚠️  Could not restore session cookies, attempting fresh login...');
        }
      }

      if (!this.gmailEmail || !this.gmailPassword) {
        logger.error('❌ Missing GMAIL_EMAIL or GMAIL_PASSWORD in .env file');
        return { success: false, error: 'Missing credentials' };
      }

      // Perform new login
      logger.info('🔄 Starting fresh Google login...');
      const loginResult = await this.performGoogleLogin(page);

      if (loginResult.success) {
        // Wait for redirect to dashboard
        await page.waitForTimeout(3000);

        // Verify login success
        const verifyLogin = await this.checkIfLoggedIn(page);
        if (verifyLogin) {
          logger.testPass('✅ LOGIN SUCCESSFUL');

          // Save session for future use
          await this.saveSessionForReuse(page);

          return {
            success: true,
            loggedIn: true,
            sessionReused: false,
            email: this.gmailEmail,
          };
        }
      }

      return { success: false, error: 'Login verification failed' };
    } catch (error) {
      logger.error(`❌ Authentication failed: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  /**
   * Perform Google OAuth login flow
   */
  async performGoogleLogin(page) {
    let popup = null;
    
    try {
      logger.info('🌐 Navigating to application...');
      await page.goto(this.appUrl, { waitUntil: 'networkidle' });
      await page.waitForTimeout(3000);

      logger.info('🔍 Looking for "Continue with Google" button...');
      
      // Try multiple selectors for the Google button
      const selectors = [
        'button:has-text("Continue with Google")',
        'button:has-text("Google")',
        '[data-testid="google-login"]',
        '.google-login-btn',
        'button[type="button"]:has-text("Google")',
        'button:has-text("Continue")',
      ];

      let googleButton = null;
      for (const selector of selectors) {
        try {
          const btn = page.locator(selector).first();
          if (await btn.isVisible({ timeout: 2000 })) {
            googleButton = btn;
            logger.info(`✅ Found Google button with selector: ${selector}`);
            break;
          }
        } catch (e) {
          // Continue to next selector
        }
      }

      if (!googleButton) {
        logger.warn('⚠️  Google button not found with standard selectors');
        logger.info('📸 Taking screenshot to debug...');
        await page.screenshot({ path: './debug-login-page.png' });
        logger.info('💾 Screenshot saved to debug-login-page.png');
        return { success: false };
      }

      logger.info('✅ Found Google login button, setting up popup listener...');
      
      // Set up popup listener BEFORE clicking
      logger.info('⏳ Waiting for OAuth popup (up to 30 seconds)...');
      try {
        const popupPromise = page.context().waitForEvent('page', { timeout: 30000 });
        
        logger.info('🖱️ Clicking Google button...');
        await googleButton.click();
        
        popup = await popupPromise;
      } catch (e) {
        logger.error('❌ OAuth popup did not appear within 30 seconds');
        logger.info('💡 Checking if Google login button selector needs updating...');
        return { success: false };
      }

      if (!popup) {
        logger.error('❌ OAuth popup is null');
        return { success: false };
      }

      logger.info('📱 OAuth popup opened, handling Google login...');
      await this.handleGoogleOAuth(popup);

      // Wait for popup to close/redirect
      logger.info('⏳ Waiting for OAuth popup to close...');
      try {
        await popup.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
      } catch (e) {
        // Popup might close during redirect
      }

      // Wait a bit for the main page to get the OAuth callback
      logger.info('⏳ Waiting for main page to process OAuth callback...');
      await page.waitForTimeout(3000);

      // Check if back on main app
      const currentUrl = page.url();
      logger.info(`📍 Current URL after OAuth: ${currentUrl}`);

      // Try to close popup if still open
      if (!popup.isClosed && popup.isClosed !== undefined) {
        try {
          await popup.close();
        } catch (e) {
          // Already closed
        }
      }

      return { success: true };
    } catch (error) {
      logger.error(`❌ Google login failed: ${error.message}`);
      return { success: false };
    }
  }

  /**
   * Handle Google OAuth popup interaction
   */
  async handleGoogleOAuth(popup) {
    try {
      logger.info('🔐 Handling Google OAuth flow...');

      // Wait for the Google login page to load
      logger.info('⏳ Waiting for Google login page to load...');
      await popup.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
      await popup.waitForTimeout(2000);

      // Try different email input selectors
      const emailSelectors = [
        'input[type="email"]',
        'input#identifierId',
        'input[autocomplete="username"]',
        'input[name="identifier"]',
      ];

      let emailInput = null;
      for (const selector of emailSelectors) {
        try {
          const input = popup.locator(selector).first();
          if (await input.isVisible({ timeout: 3000 }).catch(() => false)) {
            emailInput = input;
            logger.info(`✅ Found email input with selector: ${selector}`);
            break;
          }
        } catch (e) {
          // Continue to next selector
        }
      }

      if (!emailInput) {
        logger.error('❌ Could not find email input on Google login page');
        logger.info('📸 Taking screenshot for debugging...');
        await popup.screenshot({ path: './debug-google-oauth-email.png' });
        throw new Error('Email input not found');
      }

      // Enter email
      logger.info(`📧 Entering email: ${this.gmailEmail}`);
      await emailInput.fill(this.gmailEmail);
      await popup.waitForTimeout(1000);

      // Click Next or similar button
      logger.info('📤 Clicking Next button...');
      const nextSelectors = [
        'button:has-text("Next")',
        'button:has-text("Sign in")',
        'button[type="button"]:not([disabled])',
        'div[role="button"]:has-text("Next")',
      ];

      let nextButton = null;
      for (const selector of nextSelectors) {
        try {
          const btn = popup.locator(selector).first();
          if (await btn.isVisible({ timeout: 2000 }).catch(() => false)) {
            nextButton = btn;
            logger.info(`✅ Found next button with selector: ${selector}`);
            break;
          }
        } catch (e) {
          // Continue
        }
      }

      if (nextButton) {
        await nextButton.click();
      } else {
        logger.warn('⚠️  Next button not found, pressing Enter');
        await emailInput.press('Enter');
      }

      await popup.waitForTimeout(3000);

      // Wait for password input
      logger.info('⏳ Waiting for password input field...');
      const passwordSelectors = [
        'input[type="password"]',
        'input[name="password"]',
        'input[autocomplete="current-password"]',
      ];

      let passwordInput = null;
      for (const selector of passwordSelectors) {
        try {
          const input = popup.locator(selector).first();
          if (await input.isVisible({ timeout: 5000 }).catch(() => false)) {
            passwordInput = input;
            logger.info(`✅ Found password input with selector: ${selector}`);
            break;
          }
        } catch (e) {
          // Continue
        }
      }

      if (!passwordInput) {
        logger.error('❌ Could not find password input');
        logger.info('📸 Taking screenshot for debugging...');
        await popup.screenshot({ path: './debug-google-oauth-password.png' });
        throw new Error('Password input not found');
      }

      // Enter password
      logger.info(`🔐 Entering password...`);
      await passwordInput.fill(this.gmailPassword);
      await popup.waitForTimeout(1000);

      // Click Next for password
      logger.info('📤 Clicking Next/Sign in button for password...');
      nextButton = null;
      for (const selector of nextSelectors) {
        try {
          const btn = popup.locator(selector).first();
          if (await btn.isVisible({ timeout: 2000 }).catch(() => false)) {
            nextButton = btn;
            break;
          }
        } catch (e) {
          // Continue
        }
      }

      if (nextButton) {
        await nextButton.click();
      } else {
        logger.warn('⚠️  Next button not found, pressing Enter');
        await passwordInput.press('Enter');
      }

      logger.info('⏳ Waiting for OAuth completion (up to 15 seconds)...');
      await popup.waitForTimeout(15000);

      logger.info('✅ Google OAuth flow completed');
      return true;
    } catch (error) {
      logger.error(`❌ OAuth handling failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Check if user is currently logged in
   */
  async checkIfLoggedIn(page) {
    try {
      // Check for common logged-in indicators
      const indicators = [
        'div[class*="dashboard"], main[class*="dashboard"]',
        'div[class*="sidebar"], nav[class*="sidebar"]',
        'button:has-text("Logout"), button[aria-label*="logout"]',
        'img[alt*="profile"], .user-avatar',
      ];

      for (const indicator of indicators) {
        try {
          const element = await page.locator(indicator).first();
          if (await element.isVisible({ timeout: 2000 }).catch(() => false)) {
            logger.info(`✅ Found login indicator: ${indicator}`);
            return true;
          }
        } catch (e) {
          // Continue to next indicator
        }
      }

      // Check if still on login page
      const currentUrl = page.url();
      if (currentUrl.includes('login') || currentUrl.includes('signin') || currentUrl.includes('auth')) {
        logger.info('⚠️  Still on login page');
        return false;
      }

      logger.info('✅ User appears to be logged in (URL check)');
      return true;
    } catch (error) {
      logger.error(`⚠️  Could not verify login status: ${error.message}`);
      return false;
    }
  }

  /**
   * Save session for reuse
   */
  async saveSessionForReuse(page) {
    try {
      const context = page.context();
      await this.sessionManager.saveSession(page, context, 'authentication');
      logger.info('💾 Session saved for future test runs');
    } catch (error) {
      logger.warn(`⚠️  Could not save session: ${error.message}`);
    }
  }

  /**
   * Clear saved session (for logout or new login)
   */
  clearSavedSession() {
    this.sessionManager.clearSession();
    logger.info('🗑️  Saved session cleared');
  }

  /**
   * Get session info
   */
  getSessionInfo() {
    return this.sessionManager.getSessionInfo();
  }
}

module.exports = AuthHelperV2;
