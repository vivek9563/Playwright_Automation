/**
 * Minor Tests Runner
 */

const logger = require('../utils/logger');
const ReportGenerator = require('../utils/report-generator');

const minorTest01 = require('./minor-test-01-performance');
const minorTest02 = require('./minor-test-02-chrome-compatibility');
const minorTest03 = require('./minor-test-03-firefox-compatibility');

const tests = [
  minorTest01,
  minorTest02,
  minorTest03
];

async function runMinorTests() {
  logger.separator();
  logger.info('Starting Minor Tests Suite');
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
  runMinorTests().then(outcome => {
    process.exit(outcome.success ? 0 : 1);
  }).catch(err => {
    logger.error(`Minor Tests execution failed: ${err.message}`);
    process.exit(1);
  });
}

module.exports = { runMinorTests };
