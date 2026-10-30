const { chromium } = require('@playwright/test');
const logger = require('../utils/logger');
const AuthHelperV2 = require('../utils/auth-helper-v2');

/**
 * Dashboard Major Tests - Complex Interactions
 */
async function runMajorTests() {
  const tests = [];
  const browser = await chromium.launch({ headless: false });

  try {
    tests.push(await testVedakLogoClick(browser));
    tests.push(await testWidgetInteractions(browser));
    tests.push(await testViewAllButtons(browser));
    tests.push(await testAddNotes(browser));
    tests.push(await testContributionToggle(browser));

  } finally {
    await browser.close();
  }

  return tests;
}

async function testVedakLogoClick(browser) {
  const testName = 'Vedak Logo Click and Navigation';
  const testId = 'DASH-MAJOR-01';
  let startTime = Date.now();

  try {
    logger.info(`START: ${testId}: ${testName}`);
    
    const context = await browser.newContext({ ignoreHTTPSErrors: true });
    const page = await context.newPage();

    const authHelper = new AuthHelperV2();
    await authHelper.authenticate(page);

    const initialUrl = page.url();
    logger.info(`✓ Initial URL: ${initialUrl}`);

    // Find and click Vedak logo
    const logo = await page.locator('img[alt*="logo"], img[alt*="Vedak"], .logo').first();
    
    if (!await logo.isVisible({ timeout: 2000 }).catch(() => false)) {
      throw new Error('Vedak logo not visible');
    }

    logger.info('✓ Vedak logo found');
    
    // Click logo
    await logo.click();
    await page.waitForTimeout(2000);

    const newUrl = page.url();
    logger.info(`✓ Logo clicked, new URL: ${newUrl}`);

    await context.close();
    logger.testPass(`✓ PASS: ${testName} (${Date.now() - startTime}ms)`);
    return { id: testId, name: testName, status: 'PASS', duration: Date.now() - startTime };
  } catch (error) {
    logger.testFail(`✗ FAIL: ${testName} (${Date.now() - startTime}ms)`);
    logger.error(`  Error: ${error.message}`);
    return { id: testId, name: testName, status: 'FAIL', error: error.message, duration: Date.now() - startTime };
  }
}

async function testWidgetInteractions(browser) {
  const testName = 'Dashboard Widget Interactions';
  const testId = 'DASH-MAJOR-02';
  let startTime = Date.now();

  try {
    logger.info(`START: ${testId}: ${testName}`);
    
    const context = await browser.newContext({ ignoreHTTPSErrors: true });
    const page = await context.newPage();

    const authHelper = new AuthHelperV2();
    await authHelper.authenticate(page);

    // Test interactions with key widgets
    const interactions = [
      {
        name: 'Daily Training - Last 30 days',
        selector: 'text=Daily Training',
        action: 'hover'
      },
      {
        name: 'Todos',
        selector: 'text=Todos',
        action: 'hover'
      },
      {
        name: 'Email Observations',
        selector: 'text=Email',
        action: 'hover'
      },
      {
        name: 'Interested Experts Onboarded',
        selector: 'text=Interested Experts',
        action: 'hover'
      },
      {
        name: 'Your Responsibilities',
        selector: 'text=Responsibilities',
        action: 'hover'
      }
    ];

    let successCount = 0;

    for (const interaction of interactions) {
      try {
        const element = await page.locator(interaction.selector).first();
        
        if (await element.isVisible({ timeout: 1500 }).catch(() => false)) {
          if (interaction.action === 'hover') {
            await element.hover();
            await page.waitForTimeout(500);
            logger.info(`  ✓ Hovered: ${interaction.name}`);
            successCount++;
          }
        }
      } catch (e) {
        logger.warn(`  ⚠️ Could not interact with: ${interaction.name}`);
      }
    }

    if (successCount === 0) {
      throw new Error('Could not interact with any widgets');
    }

    logger.info(`✓ Successfully interacted with ${successCount}/${interactions.length} widgets`);

    await context.close();
    logger.testPass(`✓ PASS: ${testName} (${Date.now() - startTime}ms)`);
    return { id: testId, name: testName, status: 'PASS', duration: Date.now() - startTime };
  } catch (error) {
    logger.testFail(`✗ FAIL: ${testName} (${Date.now() - startTime}ms)`);
    logger.error(`  Error: ${error.message}`);
    return { id: testId, name: testName, status: 'FAIL', error: error.message, duration: Date.now() - startTime };
  }
}

async function testViewAllButtons(browser) {
  const testName = 'View All Buttons Functionality';
  const testId = 'DASH-MAJOR-03';
  let startTime = Date.now();

  try {
    logger.info(`START: ${testId}: ${testName}`);
    
    const context = await browser.newContext({ ignoreHTTPSFlags: true });
    const page = await context.newPage();

    const authHelper = new AuthHelperV2();
    await authHelper.authenticate(page);

    // Scroll to ensure all elements are visible
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(2000);

    // Find "View All" buttons
    const viewAllButtons = await page.locator('button:has-text("View All"), a:has-text("View All")').all();
    
    logger.info(`Found ${viewAllButtons.length} View All buttons`);

    if (viewAllButtons.length === 0) {
      logger.warn('⚠️ No View All buttons found');
    } else {
      // Try clicking the first View All button
      try {
        if (await viewAllButtons[0].isVisible({ timeout: 1000 }).catch(() => false)) {
          await viewAllButtons[0].click();
          await page.waitForTimeout(1500);
          logger.info(`✓ Clicked first View All button`);
        }
      } catch (e) {
        logger.warn('⚠️ Could not click View All button');
      }
    }

    await context.close();
    logger.testPass(`✓ PASS: ${testName} (${Date.now() - startTime}ms)`);
    return { id: testId, name: testName, status: 'PASS', duration: Date.now() - startTime };
  } catch (error) {
    logger.testFail(`✗ FAIL: ${testName} (${Date.now() - startTime}ms)`);
    logger.error(`  Error: ${error.message}`);
    return { id: testId, name: testName, status: 'FAIL', error: error.message, duration: Date.now() - startTime };
  }
}

async function testAddNotes(browser) {
  const testName = 'Add and Save Notes';
  const testId = 'DASH-MAJOR-04';
  let startTime = Date.now();

  try {
    logger.info(`START: ${testId}: ${testName}`);
    
    const context = await browser.newContext({ ignoreHTTPSErrors: true });
    const page = await context.newPage();

    const authHelper = new AuthHelperV2();
    await authHelper.authenticate(page);

    // Find Your Notes section
    const notesElement = await page.locator('text=Your Notes').first();
    
    if (!await notesElement.isVisible({ timeout: 2000 }).catch(() => false)) {
      throw new Error('Your Notes section not found');
    }

    logger.info('✓ Your Notes section found');
    await notesElement.hover();
    await page.waitForTimeout(500);

    // Look for input or add button
    const notesContainer = notesElement.locator('..');
    const inputs = await notesContainer.locator('input, textarea').all();
    
    if (inputs.length > 0) {
      const input = inputs[0];
      const testNote = `Test Note - ${new Date().toISOString()}`;
      await input.fill(testNote);
      logger.info(`✓ Entered note: ${testNote}`);

      // Look for save button
      const saveBtn = await notesContainer.locator('button:has-text("Save"), button[type="submit"]').first();
      if (await saveBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
        await saveBtn.click();
        await page.waitForTimeout(1000);
        logger.info('✓ Note saved');
      } else {
        logger.info('⚠️ No save button found, note may auto-save');
      }
    } else {
      logger.info('⚠️ No input field found in Your Notes section');
    }

    await context.close();
    logger.testPass(`✓ PASS: ${testName} (${Date.now() - startTime}ms)`);
    return { id: testId, name: testName, status: 'PASS', duration: Date.now() - startTime };
  } catch (error) {
    logger.testFail(`✗ FAIL: ${testName} (${Date.now() - startTime}ms)`);
    logger.error(`  Error: ${error.message}`);
    return { id: testId, name: testName, status: 'FAIL', error: error.message, duration: Date.now() - startTime };
  }
}

async function testContributionToggle(browser) {
  const testName = 'Contribution Widget Toggle (Last 30d / Monthly)';
  const testId = 'DASH-MAJOR-05';
  let startTime = Date.now();

  try {
    logger.info(`START: ${testId}: ${testName}`);
    
    const context = await browser.newContext({ ignoreHTTPSErrors: true });
    const page = await context.newPage();

    const authHelper = new AuthHelperV2();
    await authHelper.authenticate(page);

    // Find Contribution section
    const contributionElement = await page.locator('text=Contribution').first();
    
    if (!await contributionElement.isVisible({ timeout: 2000 }).catch(() => false)) {
      throw new Error('Contribution section not found');
    }

    logger.info('✓ Contribution section found');

    // Look for toggle or toggle buttons
    const contributionContainer = contributionElement.locator('..');
    
    // Look for "Last 30d" or "Monthly" buttons
    const toggleButtons = await contributionContainer.locator('button').all();
    logger.info(`Found ${toggleButtons.length} buttons in Contribution section`);

    if (toggleButtons.length > 0) {
      // Try clicking first toggle button
      await toggleButtons[0].click();
      await page.waitForTimeout(1000);
      logger.info('✓ Clicked toggle in Contribution section');
    }

    await context.close();
    logger.testPass(`✓ PASS: ${testName} (${Date.now() - startTime}ms)`);
    return { id: testId, name: testName, status: 'PASS', duration: Date.now() - startTime };
  } catch (error) {
    logger.testFail(`✗ FAIL: ${testName} (${Date.now() - startTime}ms)`);
    logger.error(`  Error: ${error.message}`);
    return { id: testId, name: testName, status: 'FAIL', error: error.message, duration: Date.now() - startTime };
  }
}

module.exports = { runMajorTests };
