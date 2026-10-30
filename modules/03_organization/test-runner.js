const { runModuleSuites } = require('./common');

async function runOrganizationTests() {
  return runModuleSuites({
    moduleName: 'organization',
    moduleDir: __dirname,
    suites: [
      {
        name: 'Organization Suite',
        script: 'modules/03_organization/test-cases/organization-tests/run-organization-tests.js',
      },
    ],
  });
}

if (require.main === module) {
  runOrganizationTests().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}

module.exports = runOrganizationTests;
