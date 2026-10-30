const { runModuleSuites } = require('./common');

async function runLoginTests() {
  return runModuleSuites({
    moduleName: 'login',
    moduleDir: __dirname,
    suites: [
      { name: 'Login Full Suite', script: 'modules/01_login/run-login-tests.js' },
    ],
  });
}

if (require.main === module) {
  runLoginTests().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}

module.exports = runLoginTests;
