const { runModuleSuites } = require('./common');

async function runDashboardTests() {
  return runModuleSuites({
    moduleName: 'dashboard',
    moduleDir: __dirname,
    suites: [
      {
        name: 'Dashboard Major Functionality',
        script: 'modules/02_dashboard/test-cases/dashboard-tests/dashboard-major-func-tests-fixed.js',
      },
    ],
  });
}

if (require.main === module) {
  runDashboardTests().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}

module.exports = runDashboardTests;
