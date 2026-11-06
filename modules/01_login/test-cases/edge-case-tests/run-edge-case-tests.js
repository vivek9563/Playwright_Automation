/**
 * Edge Case Tests Runner
 */

const logger = require('../utils/logger');
const ReportGenerator = require('../utils/report-generator');

const edgeTest01 = require('./edge-test-01-slow-network');
const edgeTest02 = require('./edge-test-02-mobile-simulation');
const edgeTest03 = require('./edge-test-03-rapid-clicks');
const edgeTest04 = require('./edge-test-04-session-timeout');
const edgeTest05 = require('./edge-test-05-back-button');

const tests = [
  edgeTest01,
  edgeTest02,
  edgeTest03,
  edgeTest04,
  edgeTest05
];

async function runEdgeCaseTests() {
  logger.separator();
  logger.info('Starting Edge Case Tests Suite');
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
  runEdgeCaseTests().then(outcome => {
    process.exit(outcome.success ? 0 : 1);
  }).catch(err => {
    logger.error(`Edge Case Tests execution failed: ${err.message}`);
    process.exit(1);
  });
}

module.exports = { runEdgeCaseTests };
