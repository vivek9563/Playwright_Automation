const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m'
};

const projectsMenuTests = [
  { id: 'PROJ-01', name: 'Recent Projects' },
  { id: 'PROJ-02', name: 'Links' },
  { id: 'PROJ-03', name: 'All Projects' },
  { id: 'PROJ-04', name: 'Subproject Stats' },
  { id: 'PROJ-05', name: 'Targets' },
  { id: 'PROJ-06', name: 'Project Summary' },
  { id: 'PROJ-07', name: 'Client Portal Requests' },
  { id: 'PROJ-08', name: 'Public Projects' },
  { id: 'PROJ-09', name: 'Check Points' },
  { id: 'PROJ-10', name: 'Experts Rating' },
  { id: 'PROJ-11', name: 'Project Lifecycle' }
];

const sessionPath = path.join(__dirname, '..', 'sessions', 'session-data.json');

async function loadSessionCookies() {
  try {
    if (fs.existsSync(sessionPath)) {
      const sessionData = JSON.parse(fs.readFileSync(sessionPath, 'utf8'));
      return sessionData.cookies || [];
    }
  } catch (error) {
    console.log(`${colors.yellow}⚠️  Could not load session${colors.reset}`);
  }
  return [];
}

async function runProjectsMenuTests() {
  console.log(`\n${colors.cyan}${'='.repeat(70)}${colors.reset}`);
  console.log(`${colors.bright}${colors.blue}🚀 VEDAK CRM - PROJECTS MENU TEST SUITE${colors.reset}`);
  console.log(`${colors.cyan}${'='.repeat(70)}${colors.reset}\n`);

  let browser;
  let passedTests = 0;
  let failedTests = 0;
  const results = [];

  try {
    browser = await chromium.launch({ headless: false });
    const context = await browser.newContext();

    const cookies = await loadSessionCookies();
    if (cookies.length > 0) {
      // Filter only localhost cookies to avoid domain mismatch errors
      const localhostCookies = cookies.filter(c =>
        c.domain === 'localhost' || c.domain === '127.0.0.1'
      );
      if (localhostCookies.length > 0) {
        await context.addCookies(localhostCookies);
        console.log(`${colors.green}✅ Session loaded (${localhostCookies.length} auth cookies)${colors.reset}\n`);
      } else {
        console.log(`${colors.yellow}⚠️  No localhost cookies found in session file${colors.reset}\n`);
      }
    } else {
      console.log(`${colors.yellow}⚠️  No session file found — will proceed unauthenticated${colors.reset}\n`);
    }

    const page = await context.newPage();

    console.log(`${colors.yellow}📍 Navigating to dashboard...${colors.reset}`);
    await page.goto('http://localhost:5173/app/dashboard', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(2000);

    // Check if we got redirected to login
    const currentUrl = page.url();
    if (currentUrl.includes('/login')) {
      console.log(`${colors.yellow}⚠️  Redirected to login page — session may be expired. Continuing anyway...${colors.reset}\n`);
    } else {
      console.log(`${colors.green}✅ Dashboard loaded at: ${currentUrl}${colors.reset}\n`);
    }

    console.log(`${colors.cyan}${'='.repeat(70)}${colors.reset}`);
    console.log(`${colors.bright}TEST EXECUTION STARTED${colors.reset}`);
    console.log(`${colors.cyan}${'='.repeat(70)}${colors.reset}\n`);

    // Click on Projects menu — try multiple selector strategies
    console.log(`${colors.blue}📂 Opening Projects Menu...${colors.reset}`);
    try {
      // Try multiple selectors: button, nav link, sidebar item, span
      const projectsSelector = [
        'button:has-text("Projects")',
        'a:has-text("Projects")',
        'li:has-text("Projects")',
        '[data-menu="projects"]',
        'nav span:has-text("Projects")',
        'div[class*="sidebar"] :text("Projects")',
        ':text-is("Projects")',
      ].join(', ');
      const projectsButton = page.locator(projectsSelector).first();
      await projectsButton.click({ timeout: 8000 });
      await page.waitForTimeout(1500);
      console.log(`${colors.green}✅ Projects Menu opened${colors.reset}\n`);
    } catch (error) {
      console.log(`${colors.red}❌ Failed to open Projects Menu: ${error.message}${colors.reset}\n`);
    }

    // Test each submenu
    for (let i = 0; i < projectsMenuTests.length; i++) {
      const test = projectsMenuTests[i];
      const testNumber = i + 1;
      const totalTests = projectsMenuTests.length;

      console.log(`${colors.bright}[${testNumber}/${totalTests}] ${test.id}: ${test.name}${colors.reset}`);

      try {
        await page.waitForTimeout(300);

        // Try multiple selector strategies
        let menuItem = null;

        // Strategy 1: Direct text match
        try {
          menuItem = page.locator(`a:has-text("${test.name}"), li:has-text("${test.name}"), button:has-text("${test.name}"), div:has-text("${test.name}")`).first();
          await menuItem.click({ timeout: 5000 });
        } catch (e) {
          // Strategy 2: Partial text match
          menuItem = page.locator(`text=${test.name}`).first();
          await menuItem.click({ timeout: 5000 });
        }

        await page.waitForTimeout(2000);

        const currentUrl = page.url();
        const pageTitle = await page.title();

        console.log(`${colors.green}   ✅ SUCCESS: ${test.name} clicked${colors.reset}`);
        console.log(`${colors.green}   📍 URL: ${currentUrl}${colors.reset}`);
        console.log(`${colors.green}   📄 Page Title: ${pageTitle}${colors.reset}`);
        passedTests++;
        results.push({
          id: test.id,
          name: test.name,
          status: 'PASSED',
          timestamp: new Date().toISOString(),
          url: currentUrl,
          pageTitle: pageTitle
        });

        // Return to dashboard
        await page.goto('http://localhost:5173/app/dashboard', { waitUntil: 'domcontentloaded', timeout: 15000 });
        await page.waitForTimeout(1000);

        // Reopen Projects menu for next iteration
        if (i < projectsMenuTests.length - 1) {
          const projBtn = page.locator('button:has-text("Projects")').first();
          await projBtn.click({ timeout: 5000 });
          await page.waitForTimeout(1000);
        }

        console.log(`${colors.cyan}   └─ Returned to Dashboard${colors.reset}\n`);

      } catch (error) {
        console.log(`${colors.red}   ❌ FAILED: ${error.message}${colors.reset}\n`);
        failedTests++;
        results.push({
          id: test.id,
          name: test.name,
          status: 'FAILED',
          error: error.message,
          timestamp: new Date().toISOString()
        });

        try {
          await page.goto('http://localhost:5173/app/dashboard', { waitUntil: 'domcontentloaded', timeout: 10000 });
          await page.waitForTimeout(800);
        } catch (e) {
          console.log(`${colors.yellow}   ⚠️  Navigation error${colors.reset}`);
        }
      }
    }

    // Summary
    console.log(`${colors.cyan}${'='.repeat(70)}${colors.reset}`);
    console.log(`${colors.bright}TEST EXECUTION SUMMARY${colors.reset}`);
    console.log(`${colors.cyan}${'='.repeat(70)}${colors.reset}\n`);

    console.log(`${colors.bright}Total Tests:${colors.reset} ${projectsMenuTests.length}`);
    console.log(`${colors.green}✅ Passed:${colors.reset} ${passedTests}`);
    console.log(`${colors.red}❌ Failed:${colors.reset} ${failedTests}`);
    console.log(`${colors.yellow}📊 Pass Rate:${colors.reset} ${((passedTests / projectsMenuTests.length) * 100).toFixed(1)}%\n`);

    const resultsPath = path.join(__dirname, '..', 'modules', 'test-results', 'projects-menu-results.json');
    fs.mkdirSync(path.dirname(resultsPath), { recursive: true });
    fs.writeFileSync(resultsPath, JSON.stringify({
      module: 'Projects Menu',
      summary: {
        totalTests: projectsMenuTests.length,
        passedTests: passedTests,
        failedTests: failedTests,
        passRate: ((passedTests / projectsMenuTests.length) * 100).toFixed(2)
      },
      timestamp: new Date().toISOString(),
      results: results
    }, null, 2));

    console.log(`${colors.green}✅ Results saved to: test-results/projects-menu-results.json${colors.reset}\n`);

    await context.close();
    await browser.close();

  } catch (error) {
    console.log(`${colors.red}❌ Fatal Error: ${error.message}${colors.reset}`);
    if (browser) await browser.close();
    process.exit(1);
  }
}

runProjectsMenuTests().catch(error => {
  console.error(`${colors.red}Unexpected error: ${error.message}${colors.reset}`);
  process.exit(1);
});
