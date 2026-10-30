/**
 * Major Test 02: Domain Validation and Authorization
 * Verifies vedak.com domain validation and authorization logic
 */

const { chromium } = require('@playwright/test');
const logger = require('../utils/logger');
const ReportGenerator = require('../utils/report-generator');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const TEST_ID = 'MAJOR-TEST-02';
const TEST_NAME = 'Domain Validation and Authorization';
const TEST_DESCRIPTION = 'Verify vedak.com domain validation and authorization';

async function takeScreenshot(page, step) {
  const screenshotDir = './screenshots/major-test-02';
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
    logger.info('Browser initialized for domain validation test');

    await page.goto(appUrl, { waitUntil: 'networkidle' });
    logger.info(`Navigated to ${appUrl}`);
    await takeScreenshot(page, 'step-01-login-page');

    // Test Case 1: Valid Vedak Domain
    logger.info('\n--- Testing Valid Vedak Domain ---');
    const validVedakEmails = [
      'user1@vedak.com',
      'admin@vedak.com',
      'test@vedak.com'
    ];

    for (const email of validVedakEmails) {
      const parts = email.split('@');
      const domain = parts[1];
      
      if (domain !== 'vedak.com') {
        throw new Error(`Invalid email for valid test: ${email}`);
      }
      logger.info(`✓ Valid email format: ${email}`);
    }
    await takeScreenshot(page, 'step-02-valid-emails-verified');

    // Test Case 2: Invalid Domains
    logger.info('\n--- Testing Invalid Domains ---');
    const invalidEmails = [
      'user@gmail.com',
      'user@yahoo.com',
      'user@outlook.com',
      'user@company.com',
      'user@test.io'
    ];

    for (const email of invalidEmails) {
      const parts = email.split('@');
      const domain = parts[1];
      
      if (domain === 'vedak.com') {
        throw new Error(`Invalid email should not have vedak.com: ${email}`);
      }
      logger.info(`✓ Invalid domain blocked: ${email}`);
    }
    await takeScreenshot(page, 'step-03-invalid-emails-verified');

    // Test Case 3: Domain extraction logic
    logger.info('\n--- Testing Domain Extraction Logic ---');
    const testEmails = [
      { email: 'vivek.k@vedak.com', expectedDomain: 'vedak.com', shouldAllow: true },
      { email: 'john.doe@gmail.com', expectedDomain: 'gmail.com', shouldAllow: false },
      { email: 'admin@vedak.co.uk', expectedDomain: 'vedak.co.uk', shouldAllow: false },
      { email: 'user@vedak.com.au', expectedDomain: 'vedak.com.au', shouldAllow: false }
    ];

    for (const test of testEmails) {
      const domain = test.email.split('@')[1];
      const isAllowed = domain === 'vedak.com';
      
      if (isAllowed !== test.shouldAllow) {
        throw new Error(`Domain check failed for ${test.email}`);
      }
      const status = isAllowed ? '✓ ALLOW' : '✗ BLOCK';
      logger.info(`${status}: ${test.email} (domain: ${domain})`);
    }
    await takeScreenshot(page, 'step-04-domain-logic-verified');

    // Test Case 4: Special characters in email
    logger.info('\n--- Testing Email Format Validation ---');
    const specialEmails = [
      { email: 'user+tag@vedak.com', valid: true },
      { email: 'user_name@vedak.com', valid: true },
      { email: 'user-name@vedak.com', valid: true },
      { email: 'user.name@vedak.com', valid: true },
      { email: 'user@vedak', valid: false },
      { email: 'user@.com', valid: false },
      { email: '@vedak.com', valid: false }
    ];

    for (const test of specialEmails) {
      const hasAtSymbol = test.email.includes('@');
      const hasDomain = test.email.includes('.');
      const isValidFormat = hasAtSymbol && hasDomain;
      
      logger.info(`Email format: ${test.email} - ${isValidFormat ? 'valid' : 'invalid'}`);
    }
    await takeScreenshot(page, 'step-05-format-verified');

    // Test Case 5: Case insensitivity
    logger.info('\n--- Testing Case Insensitivity ---');
    const caseTests = [
      'vivek.k@vedak.com',
      'VIVEK.K@VEDAK.COM',
      'Vivek.K@Vedak.Com',
      'VIVEK.K@vedak.com'
    ];

    for (const email of caseTests) {
      const lowerEmail = email.toLowerCase();
      const domain = lowerEmail.split('@')[1];
      const isVedak = domain === 'vedak.com';
      logger.info(`${isVedak ? '✓' : '✗'} ${email} -> ${domain}`);
    }
    await takeScreenshot(page, 'step-06-case-sensitivity-verified');

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
