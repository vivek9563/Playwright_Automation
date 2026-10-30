/**
 * UI Tests Runner
 * Executes all UI tests and generates summary report
 */

const logger = require('../utils/logger');
const ReportGenerator = require('../utils/report-generator');

const uiTest01 = require('./ui-test-01-page-loading');
const uiTest02 = require('./ui-test-02-welcome-text');
const uiTest03 = require('./ui-test-03-button-verification');

const tests = [
  uiTest01,
  uiTest02,
  uiTest03
];

async function runUITests() {
  logger.separator();
  logger.info('Starting UI Tests Suite');
  logger.separator();

  const reportGenerator = new ReportGenerator();
  const results = [];
  let passed = 0, failed = 0, skipped = 0;

  for (const test of tests) {
    try {
      logger.info(`Running: ${test.TEST_NAME}`);
      const result = await test.runTest();
      results.push(result);

      if (result.status === 'PASS') {
        passed++;
      } else if (result.status === 'FAIL') {
        failed++;
      } else {
        skipped++;
      }
    } catch (error) {
      logger.error(`Test execution error: ${error.message}`);
      failed++;
    }
  }

  // Log summary
  logger.separator();
  logger.summary(tests.length, passed, failed, skipped);

  // Generate report
  results.forEach(result => {
    reportGenerator.addTestResult(result);
  });

  const summary = {
    total: tests.length,
    passed,
    failed,
    skipped
  };

  reportGenerator.generateReport(summary);

  return {
    summary,
    results,
    success: failed === 0
  };
}

if (require.main === module) {
  runUITests().then(outcome => {
    process.exit(outcome.success ? 0 : 1);
  }).catch(err => {
    logger.error(`UI Tests execution failed: ${err.message}`);
    process.exit(1);
  });
}

module.exports = { runUITests };
