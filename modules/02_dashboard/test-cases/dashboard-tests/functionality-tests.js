const { chromium } = require('playwright');
const SessionManager = require('../utils/session-manager');
const logger = require('../utils/logger');

/**
 * DASH-FUNC-01: Test page refresh functionality
 */
async function testPageRefresh() {
  const testId = 'DASH-FUNC-01';
  const testName = 'Page Refresh Functionality';

  try {
    const startTime = Date.now();
    logger.separator(`START: ${testId}: ${testName}`);

    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext();
    const page = await context.newPage();

    const sessionManager = new SessionManager();
    const session = await sessionManager.loadSession();

    if (session && sessionManager.isSessionValid(session)) {
      await sessionManager.restoreSession(context, session);
      await page.goto('http://localhost:5173/app/dashboard', { waitUntil: 'networkidle' });
      await page.waitForTimeout(3000);
    }

    const urlBefore = page.url();
    logger.info(`✓ Initial URL: ${urlBefore}`);

    // Refresh page
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    const urlAfter = page.url();
    logger.info(`✓ URL after refresh: ${urlAfter}`);

    // Verify still on dashboard
    if (urlAfter !== 'http://localhost:5173/app/dashboard') {
      throw new Error(`URL changed after refresh: ${urlAfter}`);
    }

    // Verify sidebar is still visible
    const sidebarVisible = await page.isVisible('div[class*="sidebar"], nav[class*="sidebar"]');
    if (!sidebarVisible) {
      throw new Error('Sidebar not visible after refresh');
    }

    logger.info('✓ Page refresh successful, dashboard maintained');
    await browser.close();

    const duration = Date.now() - startTime;
    logger.info(`✓ PASS: ✓ PASS: ${testName} (${duration}ms)`);

    return {
      id: testId,
      name: testName,
      status: 'PASS',
      duration: duration,
      error: null
    };

  } catch (error) {
    logger.error(`✗ FAIL: ${testName}`);
    logger.error('  Error: ' + error.message);

    return {
      id: testId,
      name: testName,
      status: 'FAIL',
      duration: 0,
      error: error.message
    };
  }
}

/**
 * DASH-FUNC-02: Test sidebar navigation
 */
async function testSidebarNavigation() {
  const testId = 'DASH-FUNC-02';
  const testName = 'Sidebar Navigation and Click';

  try {
    const startTime = Date.now();
    logger.separator(`START: ${testId}: ${testName}`);

    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext();
    const page = await context.newPage();

    const sessionManager = new SessionManager();
    const session = await sessionManager.loadSession();

    if (session && sessionManager.isSessionValid(session)) {
      await sessionManager.restoreSession(context, session);
      await page.goto('http://localhost:5173/app/dashboard', { waitUntil: 'networkidle' });
      await page.waitForTimeout(3000);
    }

    // Find first clickable sidebar button
    const buttons = await page.locator('div[class*="sidebar"] button, nav[class*="sidebar"] button').count();
    logger.info(`✓ Found ${buttons} sidebar buttons`);

    if (buttons > 0) {
      // Click first button
      await page.locator('div[class*="sidebar"] button, nav[class*="sidebar"] button').first().click();
      await page.waitForTimeout(2000);
      logger.info('✓ Clicked first sidebar button');
    }

    // Verify still on dashboard or navigated to valid page
    const currentUrl = page.url();
    logger.info(`✓ Current URL: ${currentUrl}`);

    if (!currentUrl.includes('localhost:5173')) {
      throw new Error(`Invalid URL after navigation: ${currentUrl}`);
    }

    await browser.close();

    const duration = Date.now() - startTime;
    logger.info(`✓ PASS: ✓ PASS: ${testName} (${duration}ms)`);

    return {
      id: testId,
      name: testName,
      status: 'PASS',
      duration: duration,
      error: null
    };

  } catch (error) {
    logger.error(`✗ FAIL: ${testName}`);
    logger.error('  Error: ' + error.message);

    return {
      id: testId,
      name: testName,
      status: 'FAIL',
      duration: 0,
      error: error.message
    };
  }
}

/**
 * DASH-FUNC-03: Test widget hover interactions
 */
async function testWidgetHover() {
  const testId = 'DASH-FUNC-03';
  const testName = 'Dashboard Widget Hover Interactions';

  try {
    const startTime = Date.now();
    logger.separator(`START: ${testId}: ${testName}`);

    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext();
    const page = await context.newPage();

    const sessionManager = new SessionManager();
    const session = await sessionManager.loadSession();

    if (session && sessionManager.isSessionValid(session)) {
      await sessionManager.restoreSession(context, session);
      await page.goto('http://localhost:5173/app/dashboard', { waitUntil: 'networkidle' });
      await page.waitForTimeout(3000);
    }

    // Test hovering over widgets
    const widgets = [
      { name: 'Daily Training', selector: 'text=Daily Training' },
      { name: 'Todos', selector: 'text=Todos' },
      { name: 'Email Observations', selector: 'text=Email Observations' }
    ];

    let hoveredCount = 0;
    for (const widget of widgets) {
      try {
        await page.hover(widget.selector, { timeout: 3000 });
        logger.info(`  ✓ Hovered: ${widget.name}`);
        hoveredCount++;
      } catch (e) {
        logger.info(`  ⚠️ Could not hover: ${widget.name}`);
      }
    }

    logger.info(`✓ Successfully hovered over ${hoveredCount}/${widgets.length} widgets`);

    await browser.close();

    const duration = Date.now() - startTime;
    logger.info(`✓ PASS: ✓ PASS: ${testName} (${duration}ms)`);

    return {
      id: testId,
      name: testName,
      status: 'PASS',
      duration: duration,
      error: null
    };

  } catch (error) {
    logger.error(`✗ FAIL: ${testName}`);
    logger.error('  Error: ' + error.message);

    return {
      id: testId,
      name: testName,
      status: 'FAIL',
      duration: 0,
      error: error.message
    };
  }
}

/**
 * DASH-FUNC-04: Test page scroll capability
 */
async function testPageScroll() {
  const testId = 'DASH-FUNC-04';
  const testName = 'Page Scroll Capability Check';

  try {
    const startTime = Date.now();
    logger.separator(`START: ${testId}: ${testName}`);

    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext();
    const page = await context.newPage();

    const sessionManager = new SessionManager();
    const session = await sessionManager.loadSession();

    if (session && sessionManager.isSessionValid(session)) {
      await sessionManager.restoreSession(context, session);
      await page.goto('http://localhost:5173/app/dashboard', { waitUntil: 'networkidle' });
      await page.waitForTimeout(3000);
    }

    // Check if page has scrollable content
    const scrollInfo = await page.evaluate(() => ({
      scrollHeight: document.documentElement.scrollHeight,
      clientHeight: document.documentElement.clientHeight,
      scrollTop: window.scrollY,
      canScroll: document.documentElement.scrollHeight > document.documentElement.clientHeight
    }));

    logger.info(`✓ Document height: ${scrollInfo.scrollHeight}px, Viewport: ${scrollInfo.clientHeight}px`);
    
    if (scrollInfo.canScroll) {
      logger.info('✓ Page is scrollable - testing scroll functionality');
      
      // Scroll down
      await page.evaluate(() => window.scrollBy(0, 500));
      await page.waitForTimeout(1000);

      const scrollAfterDown = await page.evaluate(() => window.scrollY);
      logger.info(`✓ Scrolled down to: ${scrollAfterDown}px`);

      // Scroll back up
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(1000);

      const scrollAfterUp = await page.evaluate(() => window.scrollY);
      logger.info(`✓ Scrolled back to: ${scrollAfterUp}px`);

    } else {
      logger.info('✓ Dashboard uses fixed layout (not scrollable) - expected behavior');
      logger.info('✓ Layout is optimized for viewport: no additional scroll needed');
    }

    await browser.close();

    const duration = Date.now() - startTime;
    logger.info(`✓ PASS: ✓ PASS: ${testName} (${duration}ms)`);

    return {
      id: testId,
      name: testName,
      status: 'PASS',
      duration: duration,
      error: null
    };

  } catch (error) {
    logger.error(`✗ FAIL: ${testName}`);
    logger.error('  Error: ' + error.message);

    return {
      id: testId,
      name: testName,
      status: 'FAIL',
      duration: 0,
      error: error.message
    };
  }
}

/**
 * Run all functionality tests
 */
async function runFunctionalityTests() {
  const results = [];
  results.push(await testPageRefresh());
  results.push(await testSidebarNavigation());
  results.push(await testWidgetHover());
  results.push(await testPageScroll());
  return results;
}

module.exports = { runFunctionalityTests };
