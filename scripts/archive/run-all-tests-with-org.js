const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('\n╔════════════════════════════════════════════════════════════╗');
console.log('║   🚀 VEDAK CRM - MASTER TEST SUITE EXECUTION             ║');
console.log('╚════════════════════════════════════════════════════════════╝\n');

const tests = [
  {
    name: 'Login Module',
    script: './login-tests/run-login-tests.js',
    resultsKey: 'login'
  },
  {
    name: 'Dashboard Module',
    script: './dashboard-tests/run-optimized-tests.js',
    resultsKey: 'dashboard'
  },
  {
    name: 'Organization Module',
    script: './organization-tests/run-organization-tests.js',
    resultsKey: 'organization'
  }
];

let allResults = {
  summary: {},
  modules: {}
};

async function runTest(test) {
  return new Promise((resolve, reject) => {
    console.log(`\nSTEP ${tests.indexOf(test) + 1}: Running ${test.name} tests...`);
    console.log('─'.repeat(60));

    const proc = spawn('node', [test.script], {
      cwd: process.cwd(),
      stdio: 'inherit'
    });

    proc.on('close', (code) => {
      if (code === 0) {
        try {
          const resultsFile = path.join(__dirname, `test-results/${test.resultsKey}-results.json`);
          if (fs.existsSync(resultsFile)) {
            const data = JSON.parse(fs.readFileSync(resultsFile, 'utf8'));
            allResults.modules[test.resultsKey] = data;
          }
          resolve();
        } catch (error) {
          console.log(`⚠️  Could not load results for ${test.name}:`, error.message);
          resolve();
        }
      } else {
        reject(new Error(`${test.name} tests failed with code ${code}`));
      }
    });

    proc.on('error', reject);
  });
}

async function executeAllTests() {
  try {
    for (const test of tests) {
      await runTest(test);
    }

    // Calculate summary
    let totalTests = 0;
    let totalPassed = 0;
    let totalFailed = 0;

    for (const [module, data] of Object.entries(allResults.modules)) {
      if (data.summary) {
        totalTests += data.summary.total || 0;
        totalPassed += data.summary.passed || 0;
        totalFailed += data.summary.failed || 0;
      }
    }

    allResults.summary = {
      totalTests,
      totalPassed,
      totalFailed,
      passRate: totalTests > 0 ? ((totalPassed / totalTests) * 100).toFixed(2) : 0
    };

    // Save aggregated results
    const aggregatedFile = path.join(__dirname, 'test-results/all-results-aggregated.json');
    fs.writeFileSync(aggregatedFile, JSON.stringify(allResults, null, 2));

    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║   📊 OVERALL TEST EXECUTION SUMMARY                      ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    console.log(`Total Tests:    ${allResults.summary.totalTests}`);
    console.log(`✅ Passed:      ${allResults.summary.totalPassed}`);
    console.log(`❌ Failed:      ${allResults.summary.totalFailed}`);
    console.log(`Pass Rate:      ${allResults.summary.passRate}%\n`);

    console.log('Module Breakdown:');
    for (const [module, data] of Object.entries(allResults.modules)) {
      if (data.summary) {
        console.log(`  ${module.toUpperCase()}: ${data.summary.passed}/${data.summary.total} passed`);
      }
    }

    console.log(`\n✅ Aggregated results saved to: ${aggregatedFile}`);

  } catch (error) {
    console.error('\n❌ Error during test execution:', error.message);
    process.exit(1);
  }
}

executeAllTests();
