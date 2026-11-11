const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const resultsDir = path.join(__dirname, '../test-results');
const sessionsDir = path.join(__dirname, '../sessions');

if (!fs.existsSync(resultsDir)) {
  fs.mkdirSync(resultsDir, { recursive: true });
}

// Projects submenu test cases
const projectsSubmenumTests = [
  {
    id: 'PROJECTS-01',
    name: 'Navigate to Recent Projects',
    category: 'Functionality',
    url: 'http://localhost:5173/app/projects',
    description: 'Verify Recent Projects page loads'
  },
  {
    id: 'PROJECTS-02',
    name: 'Navigate to Links',
    category: 'Functionality',
    url: 'http://localhost:5173/app/project-expert-links',
    description: 'Verify Links page loads'
  },
  {
    id: 'PROJECTS-03',
    name: 'Navigate to All Projects',
    category: 'Functionality',
    url: 'http://localhost:5173/app/projects?recent=false',
    description: 'Verify All Projects page loads'
  },
  {
    id: 'PROJECTS-04',
    name: 'Navigate to All Subproject Stats',
    category: 'Functionality',
    url: 'http://localhost:5173/app/projects/subprojects?data_start=2026-10-26&data_end=2026-10-27&allData=0&page=1&orderColumn=createdAt&orderBy=desc',
    description: 'Verify Subproject Stats page loads'
  },
  {
    id: 'PROJECTS-05',
    name: 'Navigate to Targets',
    category: 'Functionality',
    url: 'http://localhost:5173/app/targets',
    description: 'Verify Targets page loads'
  },
  {
    id: 'PROJECTS-06',
    name: 'Navigate to Project Summary',
    category: 'Functionality',
    url: 'http://localhost:5173/app/project_summary?data_start=2026-10-26&data_end=2026-10-27',
    description: 'Verify Project Summary page loads'
  },
  {
    id: 'PROJECTS-07',
    name: 'Navigate to Client Portal Requests',
    category: 'Functionality',
    url: 'http://localhost:5173/app/client_portal_requests',
    description: 'Verify Client Portal Requests page loads'
  },
  {
    id: 'PROJECTS-08',
    name: 'Navigate to Public Projects',
    category: 'Functionality',
    url: 'http://localhost:5173/app/public-projects',
    description: 'Verify Public Projects page loads'
  },
  {
    id: 'PROJECTS-09',
    name: 'Navigate to Check Points',
    category: 'Functionality',
    url: 'http://localhost:5173/app/check-points',
    description: 'Verify Check Points page loads'
  },
  {
    id: 'PROJECTS-10',
    name: 'Navigate to Experts Rating',
    category: 'Functionality',
    url: 'http://localhost:5173/app/experts-rating',
    description: 'Verify Experts Rating page loads'
  },
  {
    id: 'PROJECTS-11',
    name: 'Navigate to Project Lifecycle',
    category: 'Functionality',
    url: 'http://localhost:5173/app/projects?recent=false&tab=idle',
    description: 'Verify Project Lifecycle page loads'
  }
];

async function runProjectsSubmenuTests() {
  let browser;
  const testResults = [];
  const startTime = Date.now();

  try {
    console.log('\n╔══════════════════════════════════════════════════════════════╗');
    console.log('║        PROJECTS SUBMENU NAVIGATION TESTS - START             ║');
    console.log('╚══════════════════════════════════════════════════════════════╝\n');

    browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();

    // Restore session cookies
    const sessionFile = path.join(sessionsDir, 'session-data.json');
    if (fs.existsSync(sessionFile)) {
      const sessionData = JSON.parse(fs.readFileSync(sessionFile, 'utf8'));
      if (sessionData.cookies && sessionData.cookies.length > 0) {
        await page.context().addCookies(sessionData.cookies);
        console.log('✅ Session restored from saved cookies\n');
      }
    }

    // Run each test
    for (let i = 0; i < projectsSubmenumTests.length; i++) {
      const test = projectsSubmenumTests[i];
      const testNumber = i + 1;
      const totalTests = projectsSubmenumTests.length;

      console.log(`\n┌──────────────────────────────────────────────────────────────┐`);
      console.log(`│ TEST [${testNumber}/${totalTests}] - ${test.id.padEnd(12)} │`);
      console.log(`└──────────────────────────────────────────────────────────────┘`);
      console.log(`📄 Name: ${test.name}`);

      const testStartTime = Date.now();

      try {
        // Navigate to projects submenu URL
        console.log(`→ Navigating to: ${test.url.substring(0, 55)}...`);
        await page.goto(test.url, { waitUntil: 'networkidle', timeout: 20000 });
        await page.waitForTimeout(1500);

        // Verify page loaded
        const currentUrl = page.url();
        const executionTime = Date.now() - testStartTime;
        
        console.log(`\n✅ SUCCESS MESSAGE: "${test.name}" page loaded successfully!`);
        console.log(`   ✓ Current URL: ${currentUrl}`);
        console.log(`   ✓ Execution Time: ${executionTime}ms`);
        
        testResults.push({
          id: test.id,
          name: test.name,
          category: test.category,
          status: 'PASSED',
          executionTime: executionTime,
          url: currentUrl,
          description: test.description,
          timestamp: new Date().toISOString()
        });

      } catch (error) {
        const executionTime = Date.now() - testStartTime;
        
        console.log(`\n❌ FAILED: ${test.name}`);
        console.log(`   Error: ${error.message}`);
        console.log(`   Execution Time: ${executionTime}ms`);
        
        testResults.push({
          id: test.id,
          name: test.name,
          category: test.category,
          status: 'FAILED',
          executionTime: executionTime,
          error: error.message,
          timestamp: new Date().toISOString()
        });
      }

      // Add gap between tests
      if (i < projectsSubmenumTests.length - 1) {
        await page.waitForTimeout(1000);
      }
    }

    // Navigate back to dashboard
    console.log(`\n┌──────────────────────────────────────────────────────────────┐`);
    console.log(`│ RETURNING TO DASHBOARD                                       │`);
    console.log(`└──────────────────────────────────────────────────────────────┘`);
    console.log(`🏠 Navigating to Dashboard...`);
    await page.goto('http://localhost:5173/app/dashboard', { waitUntil: 'networkidle', timeout: 20000 });
    console.log(`✅ Successfully returned to Dashboard\n`);

    // Generate execution summary
    const passedTests = testResults.filter(r => r.status === 'PASSED').length;
    const failedTests = testResults.filter(r => r.status === 'FAILED').length;
    const totalExecutionTime = Date.now() - startTime;

    console.log('╔══════════════════════════════════════════════════════════════╗');
    console.log('║                    EXECUTION SUMMARY                         ║');
    console.log('╚══════════════════════════════════════════════════════════════╝\n');
    
    console.log(`📊 Test Results:`);
    console.log(`   ✅ Passed Tests:  ${passedTests}/${projectsSubmenumTests.length}`);
    console.log(`   ❌ Failed Tests:  ${failedTests}/${projectsSubmenumTests.length}`);
    console.log(`   📈 Pass Rate:     ${((passedTests / projectsSubmenumTests.length) * 100).toFixed(2)}%`);
    console.log(`   ⏱️  Total Time:    ${(totalExecutionTime / 1000).toFixed(2)}s\n`);

    // Save results to JSON
    const resultsFile = path.join(resultsDir, 'projects-submenu-results.json');
    fs.writeFileSync(resultsFile, JSON.stringify({
      testSuite: 'Projects Submenu Navigation',
      totalTests: projectsSubmenumTests.length,
      passed: passedTests,
      failed: failedTests,
      passRate: ((passedTests / projectsSubmenumTests.length) * 100).toFixed(2),
      executionTime: totalExecutionTime,
      executedAt: new Date().toISOString(),
      tests: testResults
    }, null, 2));

    console.log(`📁 Results saved to: test-results/projects-submenu-results.json\n`);

    // Close browser
    await browser.close();

    return { passed: passedTests, failed: failedTests, total: projectsSubmenumTests.length };

  } catch (error) {
    console.error('❌ Test execution error:', error);
    if (browser) await browser.close();
    process.exit(1);
  }
}

// Run tests
runProjectsSubmenuTests().then(results => {
  if (results.failed === 0) {
    console.log('🎉 All Projects Submenu Tests Completed Successfully!\n');
    process.exit(0);
  } else {
    console.log(`\n⚠️  ${results.failed} test(s) failed\n`);
    process.exit(1);
  }
});
