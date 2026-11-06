/**
 * Major Tests Runner
 */

const logger = require('../utils/logger');
const ReportGenerator = require('../utils/report-generator');

const majorTest01 = require('./major-test-01-session-creation');
const majorTest02 = require('./major-test-02-domain-validation');
const majorTest03 = require('./major-test-03-oauth-integration');

const tests = [
  majorTest01,
  majorTest02,
  majorTest03
];

async function runMajorTests() {
  logger.separator();
  logger.info('Starting Major Tests Suite');
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
  runMajorTests().then(outcome => {
    process.exit(outcome.success ? 0 : 1);
  }).catch(err => {
    logger.error(`Major Tests execution failed: ${err.message}`);
    process.exit(1);
  });
}

module.exports = { runMajorTests };
