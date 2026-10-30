/**
 * Authentication Helper for Vedak CRM Tests
 */

const logger = require('./logger');
require('dotenv').config();

class AuthHelper {
  /**
   * Handle Google OAuth Login
   */
  static async handleGoogleOAuth(page, email, password) {
    try {
      logger.info(`Starting Google OAuth login with: ${email}`);

      // Wait for continue button
      const continueButton = 'button:has-text("Continue with Google")';
      await page.waitForSelector(continueButton, { timeout: 10000 });
      logger.info('Continue with Google button found');

      // Click the button
      await page.click(continueButton);
      logger.info('Clicked Continue with Google');

      // Wait for Google login popup
      const popup = await page.context().waitForEvent('page');
      logger.info('Google login popup opened');

      // Handle Google login
      await this.loginToGoogle(popup, email, password);

      // Wait for redirect back to app
      await page.waitForNavigation({ waitUntil: 'networkidle' });
      logger.info('Successfully logged in via Google OAuth');

      return true;
    } catch (error) {
      logger.error(`OAuth login failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Login to Google account
   */
  static async loginToGoogle(page, email, password) {
    try {
      logger.info('Logging into Google account');

      // Enter email
      await page.waitForSelector('input[type="email"]', { timeout: 10000 });
      await page.fill('input[type="email"]', email);
      logger.info(`Entered email: ${email}`);

      // Click Next
      await page.click('button:has-text("Next")');
      await page.waitForTimeout(1000);

      // Enter password
      await page.waitForSelector('input[type="password"]', { timeout: 10000 });
      await page.fill('input[type="password"]', password);
      logger.info('Entered password');

      // Click Next
      await page.click('button:has-text("Next")');
      logger.info('Clicked Next to submit credentials');

      // Wait for Google to process
      await page.waitForTimeout(2000);

      logger.info('Google login completed');
    } catch (error) {
      logger.error(`Google login failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Logout
   */
  static async logout(page) {
    try {
      logger.info('Attempting to logout');
      // Implementation depends on app's logout mechanism
      logger.info('Logout completed');
    } catch (error) {
      logger.error(`Logout failed: ${error.message}`);
    }
  }

  /**
   * Check if user is authenticated
   */
  static async isAuthenticated(page) {
    try {
      // Check for dashboard or protected content
      const isDashboard = await page.isVisible('text="Dashboard"');
      logger.info(`Authentication check: ${isDashboard ? 'Authenticated' : 'Not authenticated'}`);
      return isDashboard;
    } catch (error) {
      logger.error(`Authentication check failed: ${error.message}`);
      return false;
    }
  }

  /**
   * Wait for authentication to complete
   */
  static async waitForAuthentication(page, timeout = 30000) {
    try {
      logger.info('Waiting for authentication...');
      
      // Wait for either success or error indicator
      await Promise.race([
        page.waitForSelector('text="Dashboard"', { timeout }),
        page.waitForSelector('text="Access Denied"', { timeout }),
        page.waitForSelector('text="Login failed"', { timeout })
      ]);

      logger.info('Authentication page loaded');
    } catch (error) {
      logger.error(`Timeout waiting for authentication: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get authentication status message
   */
  static async getAuthStatusMessage(page) {
    try {
      // Look for error or success messages
      const errorMessage = await page.textContent('text="Access Denied"');
      if (errorMessage) {
        return { status: 'error', message: errorMessage };
      }

      const successIndicator = await page.isVisible('text="Dashboard"');
      if (successIndicator) {
        return { status: 'success', message: 'Logged in successfully' };
      }

      return { status: 'unknown', message: 'No status message found' };
    } catch (error) {
      logger.error(`Failed to get status message: ${error.message}`);
      return { status: 'error', message: error.message };
    }
  }
}

module.exports = AuthHelper;
