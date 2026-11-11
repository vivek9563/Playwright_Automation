const { runModuleSuites } = require('./common');

async function runProjectsTests() {
  return runModuleSuites({
    moduleName: 'projects',
    moduleDir: __dirname,
    suites: [
      {
        name: 'Projects Submenu Tests',
        script: 'modules/04_projects/test-cases/projects-submenu-tests/run-projects-submenu-tests.js',
      },
      {
        name: 'Sidebar Tests',
        script: 'modules/04_projects/test-cases/sidebar-tests/run-sidebar-tests.js',
      },
      {
        name: 'Recent Projects Tests',
        script: 'modules/04_projects/test-cases/recent-projects-tests/run-recent-projects-tests.js',
      },
    ],
  });
}

if (require.main === module) {
  runProjectsTests().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}

module.exports = runProjectsTests;
