/**
 * Common Utility Functions for Vedak CRM Tests
 */

const { chromium, firefox, webkit } = require('@playwright/test');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const logger = require('./logger');

class CommonUtils {
  constructor() {
    this.browser = null;
    this.page = null;
    this.context = null;
    this.screenshotCounter = 0;
  }

  /**
   * Initialize browser
   */
  async initializeBrowser(browserType = 'chromium') {
    try {
      const browserMap = {
        chromium: chromium,
        firefox: firefox,
        webkit: webkit
      };

      const selectedBrowser = browserMap[browserType] || chromium;

      this.browser = await selectedBrowser.launch({
        headless: process.env.HEADLESS === 'true',
        slowMo: parseInt(process.env.SLOW_MO) || 0,
        args: ['--disable-gpu', '--no-sandbox']
      });

      logger.info(`Browser initialized: ${browserType}`);
      return this.browser;
    } catch (error) {
      logger.error(`Failed to initialize browser: ${error.message}`);
      throw error;
    }
  }

  /**
   * Create browser context and page
   */
  async createPage() {
    try {
      this.context = await this.browser.newContext({
        recordVideo: process.env.RECORD_VIDEO === 'true' 
          ? { dir: process.env.VIDEO_PATH || './screenshots/videos' }
          : undefined,
        viewport: { width: 1920, height: 1080 }
      });

      this.page = await this.context.newPage();

      // Set default timeout
      this.page.setDefaultTimeout(parseInt(process.env.TIMEOUT) || 30000);
      this.page.setDefaultNavigationTimeout(parseInt(process.env.TIMEOUT) || 30000);

      logger.info('Page created successfully');
      return this.page;
    } catch (error) {
      logger.error(`Failed to create page: ${error.message}`);
      throw error;
    }
  }

  /**
   * Navigate to URL
   */
  async navigateTo(url) {
    try {
      await this.page.goto(url, { waitUntil: 'networkidle' });
      logger.info(`Navigated to: ${url}`);
      await this.takeScreenshot('page-loaded');
    } catch (error) {
      logger.error(`Failed to navigate to ${url}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Take screenshot
   */
  async takeScreenshot(name = 'screenshot') {
    try {
      if (!this.page) {
        logger.warn('No page available for screenshot');
        return;
      }

      const screenshotDir = process.env.SCREENSHOT_PATH || './screenshots';
      if (!fs.existsSync(screenshotDir)) {
        fs.mkdirSync(screenshotDir, { recursive: true });
      }

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `${name}_${timestamp}_${++this.screenshotCounter}.png`;
      const filepath = path.join(screenshotDir, filename);

      await this.page.screenshot({ path: filepath });
      logger.debug(`Screenshot saved: ${filename}`);

      return filepath;
    } catch (error) {
      logger.error(`Failed to take screenshot: ${error.message}`);
    }
  }

  /**
   * Static method to take screenshot (for use in individual test files)
   */
  static async takeScreenshot(page, testId, stepName) {
    try {
      if (!page) {
        logger.warn('No page available for screenshot');
        return;
      }

      const screenshotDir = path.join(process.env.SCREENSHOT_PATH || './screenshots', testId);
      if (!fs.existsSync(screenshotDir)) {
        fs.mkdirSync(screenshotDir, { recursive: true });
      }

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `${stepName}_${timestamp}.png`;
      const filepath = path.join(screenshotDir, filename);

      await page.screenshot({ path: filepath });
      logger.debug(`Screenshot saved: ${filepath}`);

      return filepath;
    } catch (error) {
      logger.error(`Failed to take screenshot: ${error.message}`);
    }
  }

  /**
   * Click element
   */
  async clickElement(selector, description = '') {
    try {
      await this.page.click(selector);
      logger.info(`Clicked element: ${description || selector}`);
      await this.takeScreenshot(`after-click-${description}`);
    } catch (error) {
      logger.error(`Failed to click element ${selector}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Fill input field
   */
  async fillInput(selector, value, description = '') {
    try {
      await this.page.fill(selector, value);
      logger.info(`Filled input: ${description || selector} with value`);
      await this.takeScreenshot(`after-fill-${description}`);
    } catch (error) {
      logger.error(`Failed to fill input ${selector}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get element text
   */
  async getElementText(selector) {
    try {
      const text = await this.page.textContent(selector);
      logger.info(`Got text from ${selector}: ${text}`);
      return text;
    } catch (error) {
      logger.error(`Failed to get text from ${selector}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Check if element is visible
   */
  async isElementVisible(selector) {
    try {
      return await this.page.isVisible(selector);
    } catch (error) {
      logger.error(`Failed to check visibility of ${selector}: ${error.message}`);
      return false;
    }
  }

  /**
   * Wait for element
   */
  async waitForElement(selector, timeout = 30000) {
    try {
      await this.page.waitForSelector(selector, { timeout });
      logger.info(`Element appeared: ${selector}`);
      return true;
    } catch (error) {
      logger.error(`Element not found within timeout: ${selector}`);
      return false;
    }
  }

  /**
   * Wait for navigation
   */
  async waitForNavigation() {
    try {
      await this.page.waitForNavigation({ waitUntil: 'networkidle' });
      logger.info('Page navigation completed');
    } catch (error) {
      logger.error(`Navigation timeout: ${error.message}`);
    }
  }

  /**
   * Get page title
   */
  async getPageTitle() {
    try {
      const title = await this.page.title();
      logger.info(`Page title: ${title}`);
      return title;
    } catch (error) {
      logger.error(`Failed to get page title: ${error.message}`);
      throw error;
    }
  }

  /**
   * Close browser
   */
  async closeBrowser() {
    try {
      if (this.context) {
        await this.context.close();
      }
      if (this.browser) {
        await this.browser.close();
      }
      logger.info('Browser closed');
    } catch (error) {
      logger.error(`Failed to close browser: ${error.message}`);
    }
  }

  /**
   * Get session storage
   */
  async getSessionStorage() {
    try {
      return await this.page.evaluate(() => {
        return JSON.stringify(window.sessionStorage);
      });
    } catch (error) {
      logger.error(`Failed to get session storage: ${error.message}`);
      return null;
    }
  }

  /**
   * Get local storage
   */
  async getLocalStorage() {
    try {
      return await this.page.evaluate(() => {
        return JSON.stringify(window.localStorage);
      });
    } catch (error) {
      logger.error(`Failed to get local storage: ${error.message}`);
      return null;
    }
  }

  /**
   * Get cookies
   */
  async getCookies() {
    try {
      return await this.context.cookies();
    } catch (error) {
      logger.error(`Failed to get cookies: ${error.message}`);
      return [];
    }
  }

  /**
   * Clear cookies
   */
  async clearCookies() {
    try {
      await this.context.clearCookies();
      logger.info('Cookies cleared');
    } catch (error) {
      logger.error(`Failed to clear cookies: ${error.message}`);
    }
  }
}

module.exports = CommonUtils;
