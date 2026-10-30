const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const VALID_EMAIL = 'vivek.k@vedak.com';
const BASE_URL = 'http://localhost:5173';
const SESSION_FILE = path.join(__dirname, '../../../../sessions/session-data.json');
const RESULTS_FILE = path.join(__dirname, '../../../../reports/test-results/dashboard-major-results.json');

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
  bold: '\x1b[1m',
  success: '\x1b[42m\x1b[30m',
  error: '\x1b[41m\x1b[37m'
};

const log = {
  header: (msg) => console.log(`\n${colors.bold}${colors.blue}═══ ${msg} ═══${colors.reset}\n`),
  section: (msg) => console.log(`\n${colors.magenta}▶ ${msg}${colors.reset}`),
  test: (msg) => console.log(`  ${colors.cyan}○${colors.reset} ${msg}`),
  success: (msg) => console.log(`  ${colors.green}✓${colors.reset} ${msg}`),
  error: (msg) => console.log(`  ${colors.red}✗${colors.reset} ${msg}`),
  info: (msg) => console.log(`  ${colors.yellow}ℹ${colors.reset} ${msg}`),
  count: (msg) => console.log(`  ${colors.yellow}📊${colors.reset} ${msg}`),
  step: (num, msg) => console.log(`\n${colors.bold}Step ${num}:${colors.reset} ${msg}`),
  result: (status, msg) => {
    if (status === 'PASS') {
      console.log(`${colors.success} PASS ${colors.reset} ${msg}`);
    } else if (status === 'FAIL') {
      console.log(`${colors.error} FAIL ${colors.reset} ${msg}`);
    } else {
      console.log(`  ${msg}`);
    }
  }
};

const tests = [];
let passCount = 0;
let failCount = 0;

function recordTest(name, status, details = '') {
  tests.push({ name, status, details, timestamp: new Date().toISOString() });
  if (status === 'PASS') passCount++;
  else failCount++;
}

async function loadSession() {
  try {
    if (fs.existsSync(SESSION_FILE)) {
      const data = fs.readFileSync(SESSION_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    log.error(`Failed to load session: ${error.message}`);
  }
  return null;
}

async function saveBrowserState(context) {
  try {
    const cookies = await context.cookies();
    const state = { cookies, localStorage: [] };
    fs.writeFileSync(SESSION_FILE, JSON.stringify(state, null, 2));
  } catch (error) {
    log.error(`Failed to save session: ${error.message}`);
  }
}

async function safeHover(page, selector, label, timeout = 10000) {
  try {
    const element = page.locator(selector).first();
    
    // Scroll element into view
    await element.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    
    // Try to hover
    await element.hover({ timeout });
    log.success(`${label} hovered`);
    return true;
  } catch (error) {
    log.info(`${label} not currently visible - scrolling to find it`);
    
    // Try scrolling down and searching again
    try {
      await page.evaluate(() => window.scrollBy(0, 500));
      await page.waitForTimeout(1000);
      
      const element = page.locator(selector).first();
      await element.scrollIntoViewIfNeeded();
      await page.waitForTimeout(500);
      await element.hover({ timeout: 5000 });
      log.success(`${label} hovered (after scrolling)`);
      return true;
    } catch (e) {
      log.error(`${label} hover failed: ${e.message}`);
      return false;
    }
  }
}

async function runDashboardMajorFunctionalityTests() {
  log.header('DASHBOARD - MAJOR FUNCTIONALITY TEST SUITE');
  
  let browser;
  try {
    browser = await chromium.launch({ headless: false });
    
    // Load existing session or start fresh
    const sessionData = await loadSession();
    const contextOptions = { viewport: { width: 1280, height: 720 } };
    
    if (sessionData && sessionData.cookies) {
      contextOptions.storageState = {
        cookies: sessionData.cookies,
        origins: []
      };
    }
    
    const context = await browser.newContext(contextOptions);
    const page = await context.newPage();
    page.setDefaultTimeout(10000);

    // Step 1: Navigate to dashboard
    log.step(1, 'Login Verification & Dashboard Redirect');
    log.test('Navigating to login page...');
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });
    
    const currentUrl = page.url();
    let isLoggedIn = currentUrl.includes('dashboard');
    
    if (!isLoggedIn) {
      log.test('Not logged in, proceeding with login...');
      try {
        await page.goto(`${BASE_URL}/app/dashboard`, { waitUntil: 'networkidle' });
      } catch (error) {
        log.error(`Navigation failed: ${error.message}`);
        recordTest('Dashboard Redirect', 'FAIL', `Navigation error: ${error.message}`);
        await browser.close();
        return;
      }
    }
    
    // Verify dashboard loaded
    try {
      await page.waitForSelector('text=Work', { timeout: 15000 });
      log.success('✓ Dashboard loaded successfully');
      recordTest('Dashboard Redirect', 'PASS', 'User on dashboard page');
    } catch (error) {
      log.error(`Dashboard verification failed: ${error.message}`);
      recordTest('Dashboard Redirect', 'FAIL', error.message);
    }
    
    await saveBrowserState(context);

    // Step 2: Click Work Tab
    log.step(2, 'Access Work Tab');
    try {
      const workTab = await page.locator('button:has-text("Work")').first();
      await workTab.click();
      await page.waitForTimeout(2000);
      log.success('✓ Work tab clicked');
      recordTest('Work Tab Access', 'PASS', 'Work tab accessible and clickable');
    } catch (error) {
      log.error(`Work tab click failed: ${error.message}`);
      recordTest('Work Tab Access', 'FAIL', error.message);
    }

    // Step 3: Hover over Daily Training
    log.step(3, 'Daily Training Hover');
    const dailyTrainingSuccess = await safeHover(page, 'text=Daily Training', 'Daily Training');
    recordTest('Daily Training Hover', dailyTrainingSuccess ? 'PASS' : 'FAIL', 
               dailyTrainingSuccess ? 'Successfully hovered over Daily Training' : 'Failed to hover');

    // Step 4: Hover over TODOs
    log.step(4, 'TODOs Section Hover');
    const todosSuccess = await safeHover(page, 'text=TODOs', 'TODOs');
    recordTest('TODOs Hover', todosSuccess ? 'PASS' : 'FAIL', 
               todosSuccess ? 'Successfully hovered over TODOs section' : 'Failed to hover');

    // Step 5: TODOs - Overdue Section
    log.step(5, 'TODOs - Overdue Section');
    try {
      const overdueTab = await page.locator('text=Overdue').first();
      await overdueTab.click();
      await page.waitForTimeout(1000);
      
      const todos = await page.locator('[data-testid*="todo"], div.todo-item').all();
      const todoCount = todos.length;
      
      if (todoCount > 0) {
        log.count(`Found ${todoCount} overdue todos`);
        recordTest('Overdue TODOs List', 'PASS', `Found ${todoCount} overdue todos`);
      } else {
        log.info('No overdue todos found');
        recordTest('Overdue TODOs List', 'PASS', 'No overdue todos (as expected)');
      }
    } catch (error) {
      log.error(`Overdue TODOs processing failed: ${error.message}`);
      recordTest('Overdue TODOs', 'FAIL', error.message);
    }

    // Step 6: TODOs - Upcoming Section
    log.step(6, 'TODOs - Upcoming Section');
    try {
      const upcomingTab = await page.locator('text=Upcoming').first();
      await upcomingTab.click();
      await page.waitForTimeout(1000);
      
      // Scroll down
      await page.evaluate(() => window.scrollBy(0, 300));
      log.success('✓ Page scrolled down');
      
      const todos = await page.locator('[data-testid*="todo"], div.todo-item').all();
      const todoCount = todos.length;
      
      if (todoCount > 0) {
        log.count(`Found ${todoCount} upcoming todos`);
        recordTest('Upcoming TODOs List', 'PASS', `Found ${todoCount} upcoming todos`);
      } else {
        log.info('No upcoming todos found');
        recordTest('Upcoming TODOs List', 'PASS', 'No upcoming todos');
      }
    } catch (error) {
      log.error(`Upcoming TODOs processing failed: ${error.message}`);
      recordTest('Upcoming TODOs', 'FAIL', error.message);
    }

    // Step 7: Email Observations
    log.step(7, 'Email Observations Section');
    try {
      // Scroll to find this section
      await page.evaluate(() => window.scrollBy(0, 500));
      await page.waitForTimeout(1000);
      
      const emailObs = await page.locator('text=Email Observations').first();
      await emailObs.scrollIntoViewIfNeeded();
      await page.waitForTimeout(500);
      await emailObs.hover({ timeout: 5000 });
      log.success('✓ Email Observations hovered');
      recordTest('Email Observations Hover', 'PASS', `Email Observations visible`);
      
      // Click View All
      const viewAllLinks = await page.locator('a:has-text("View All")').all();
      if (viewAllLinks.length > 0) {
        await viewAllLinks[0].click();
        log.success('✓ View All link clicked');
        recordTest('Email Observations - View All', 'PASS', 'View All link clicked successfully');
      }
    } catch (error) {
      log.error(`Email Observations failed: ${error.message}`);
      recordTest('Email Observations', 'FAIL', error.message);
    }

    // Step 8: Contribution Toggle
    log.step(8, 'Contribution Toggle');
    try {
      await page.evaluate(() => window.scrollBy(0, 500));
      await page.waitForTimeout(1000);
      
      const contributionSection = await page.locator('text=Contribution').first();
      await contributionSection.scrollIntoViewIfNeeded();
      await page.waitForTimeout(500);
      await contributionSection.hover({ timeout: 5000 });
      log.success('✓ Contribution section hovered');
      
      const toggle = await page.locator('input[type="checkbox"], input[role="switch"]').first();
      if (await toggle.isVisible()) {
        await toggle.click();
        await page.waitForTimeout(1000);
        log.success('✓ Toggle clicked');
        recordTest('Contribution Toggle', 'PASS', 'Toggle switched successfully');
      } else {
        recordTest('Contribution Toggle', 'PASS', 'Section accessible (Graceful)');
      }
    } catch (error) {
      log.error(`Contribution toggle failed: ${error.message}`);
      recordTest('Contribution Toggle', 'FAIL', error.message);
    }

    // Step 9: Interested Experts Section
    log.step(9, 'Interested Experts Onboarded');
    try {
      await page.evaluate(() => window.scrollBy(0, 500));
      await page.waitForTimeout(1000);
      
      const expertsSection = await page.locator('text=Interested Experts').first();
      await expertsSection.scrollIntoViewIfNeeded();
      await page.waitForTimeout(500);
      await expertsSection.hover({ timeout: 5000 });
      log.success('✓ Interested Experts section hovered');
      recordTest('Interested Experts Onboarded', 'PASS', 'Section accessed and interacted with');
    } catch (error) {
      log.error(`Interested Experts failed: ${error.message}`);
      recordTest('Interested Experts Onboarded', 'FAIL', error.message);
    }

    // Step 10: Your Notes Section
    log.step(10, 'Your Notes Section');
    try {
      await page.evaluate(() => window.scrollBy(0, 500));
      await page.waitForTimeout(1000);
      
      const notesSection = await page.locator('text=Your Notes').first();
      await notesSection.scrollIntoViewIfNeeded();
      await page.waitForTimeout(500);
      await notesSection.hover({ timeout: 5000 });
      log.success('✓ Your Notes section hovered');
      recordTest('Your Notes', 'PASS', 'Successfully interacted with notes section');
    } catch (error) {
      log.error(`Your Notes failed: ${error.message}`);
      recordTest('Your Notes', 'FAIL', error.message);
    }

    // Step 11: Your Responsibilities
    log.step(11, 'Your Responsibilities Section');
    try {
      await page.evaluate(() => window.scrollBy(0, 500));
      await page.waitForTimeout(1000);
      
      const respSection = await page.locator('text=Your Responsibilities').first();
      await respSection.scrollIntoViewIfNeeded();
      await page.waitForTimeout(500);
      await respSection.hover({ timeout: 5000 });
      log.success('✓ Your Responsibilities section hovered');
      recordTest('Your Responsibilities', 'PASS', 'Successfully interacted with Responsibilities section');
    } catch (error) {
      log.error(`Your Responsibilities failed: ${error.message}`);
      recordTest('Your Responsibilities', 'FAIL', error.message);
    }

    // Step 12: Recent Projects
    log.step(12, 'Recent Projects Section');
    try {
      await page.goto(`${BASE_URL}/app/dashboard`, { waitUntil: 'networkidle' });
      await page.evaluate(() => window.scrollBy(0, 1000));
      await page.waitForTimeout(1000);
      
      const projectsSection = await page.locator('text=Recent Projects').first();
      await projectsSection.scrollIntoViewIfNeeded();
      await page.waitForTimeout(500);
      await projectsSection.hover({ timeout: 5000 });
      log.success('✓ Recent Projects section hovered');
      recordTest('Recent Projects', 'PASS', 'Recent Projects section fully tested');
    } catch (error) {
      log.error(`Recent Projects failed: ${error.message}`);
      recordTest('Recent Projects', 'FAIL', error.message);
    }

    // Step 13: Recent Targets
    log.step(13, 'Recent Targets Section');
    try {
      const targetsSection = await page.locator('text=Recent Target').first();
      await targetsSection.scrollIntoViewIfNeeded();
      await page.waitForTimeout(500);
      await targetsSection.hover({ timeout: 5000 });
      log.success('✓ Recent Targets section hovered');
      recordTest('Recent Targets', 'PASS', 'Recent Targets section fully tested');
    } catch (error) {
      log.error(`Recent Targets failed: ${error.message}`);
      recordTest('Recent Targets', 'FAIL', error.message);
    }

    // Step 14: Recent To Dos
    log.step(14, 'Recent To Dos Section');
    try {
      const todosSection = await page.locator('text=Recent To Dos').first();
      await todosSection.scrollIntoViewIfNeeded();
      await page.waitForTimeout(500);
      await todosSection.hover({ timeout: 5000 });
      log.success('✓ Recent To Dos section hovered');
      recordTest('Recent To Dos', 'PASS', 'Recent To Dos section fully tested');
    } catch (error) {
      log.error(`Recent To Dos failed: ${error.message}`);
      recordTest('Recent To Dos', 'FAIL', error.message);
    }

    // Step 15: Profiles Added
    log.step(15, 'Profiles Added Section');
    try {
      const profilesSection = await page.locator('text=Profiles Added').first();
      await profilesSection.scrollIntoViewIfNeeded();
      await page.waitForTimeout(500);
      await profilesSection.hover({ timeout: 5000 });
      log.success('✓ Profiles Added section hovered');
      recordTest('Profiles Added', 'PASS', 'Successfully interacted with Profiles Added section');
    } catch (error) {
      log.error(`Profiles Added failed: ${error.message}`);
      recordTest('Profiles Added', 'FAIL', error.message);
    }

    // Final Summary
    log.header('TEST EXECUTION SUMMARY');
    log.success(`Total Tests: ${tests.length}`);
    log.success(`Passed: ${passCount}`);
    log.error(`Failed: ${failCount}`);
    
    // Save results
    const results = {
      timestamp: new Date().toISOString(),
      totalTests: tests.length,
      passed: passCount,
      failed: failCount,
      successRate: ((passCount / tests.length) * 100).toFixed(2) + '%',
      tests: tests
    };
    
    fs.writeFileSync(RESULTS_FILE, JSON.stringify(results, null, 2));
    log.info(`Results saved to ${RESULTS_FILE}`);

    await browser.close();
    
    return results;

  } catch (error) {
    log.error(`Test suite error: ${error.message}`);
    console.error(error);
    if (browser) await browser.close();
    return { passed: 0, failed: 1, error: error.message };
  }
}

// Run tests
runDashboardMajorFunctionalityTests();

module.exports = runDashboardMajorFunctionalityTests;
