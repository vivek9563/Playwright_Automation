/**
 * Functionality Tests Runner
 */

const logger = require('../utils/logger');
const ReportGenerator = require('../utils/report-generator');

const funcTest01 = require('./func-test-01-valid-login');
const funcTest02 = require('./func-test-02-invalid-domain');
const funcTest03 = require('./func-test-03-oauth-popup');
const funcTest04 = require('./func-test-04-session-persistence');
const funcTest05 = require('./func-test-05-login-cancel');

const tests = [
  funcTest01,
  funcTest02,
  funcTest03,
  funcTest04,
  funcTest05
];

async function runFunctionalityTests() {
  logger.separator();
  logger.info('Starting Functionality Tests Suite');
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
  runFunctionalityTests().then(outcome => {
    process.exit(outcome.success ? 0 : 1);
  }).catch(err => {
    logger.error(`Functionality Tests execution failed: ${err.message}`);
    process.exit(1);
  });
}

module.exports = { runFunctionalityTests };
