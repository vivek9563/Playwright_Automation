const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');
const ReportGenerator = require('../utils/report-generator');

// Import test suites
const { runUITests } = require('./ui-tests');
const { runFunctionalityTests } = require('./functionality-tests');
const { runMajorTests } = require('./major-tests');

/**
 * Main Dashboard Test Runner
 */
async function runAllDashboardTests() {
  const reportGenerator = new ReportGenerator();
  const allResults = [];
  
  try {
    logger.separator('🚀 VEDAK CRM DASHBOARD TEST SUITE - STARTING');
    logger.info(`Started at: ${new Date().toLocaleString()}`);
    logger.separator();

    // Run UI Tests
    logger.separator('▶ Running Dashboard UI Tests...');
    const uiTests = await runUITests();
    allResults.push(...uiTests);

    // Run Functionality Tests
    logger.separator('▶ Running Dashboard Functionality Tests...');
    const funcTests = await runFunctionalityTests();
    allResults.push(...funcTests);

    // Run Major Tests
    logger.separator('▶ Running Dashboard Major Tests...');
    const majorTests = await runMajorTests();
    allResults.push(...majorTests);

    // Summary
    logger.separator();
    logger.info('📊 FINAL DASHBOARD TEST SUMMARY');
    
    const total = allResults.length;
    const passed = allResults.filter(t => t.status === 'PASS').length;
    const failed = allResults.filter(t => t.status === 'FAIL').length;
    const passRate = ((passed / total) * 100).toFixed(2);

    logger.info(`Total: ${total}`);
    logger.info(`Passed: ${passed} (${passRate}%)`);
    logger.info(`Failed: ${failed}`);
    logger.info('');

    // Show passed tests
    const passedTests = allResults.filter(t => t.status === 'PASS');
    if (passedTests.length > 0) {
      logger.info('✅ PASSED TESTS:');
      passedTests.forEach(test => {
        logger.info(`  ✓ ${test.id}: ${test.name} (${test.duration}ms)`);
      });
    }

    // Show failed tests
    const failedTests = allResults.filter(t => t.status === 'FAIL');
    if (failedTests.length > 0) {
      logger.info('');
      logger.info('❌ FAILED TESTS:');
      failedTests.forEach(test => {
        logger.info(`  ✗ ${test.id}: ${test.name}`);
        if (test.error) {
          logger.info(`    Error: ${test.error}`);
        }
      });
    }

    logger.separator();
    
    // Generate report
    logger.info('📄 Generating HTML report...');
    const reportPath = await reportGenerator.generateReport(allResults, 'dashboard');
    logger.info(`✅ Report generated: ${reportPath}`);

    logger.separator('✅ Dashboard test suite completed');
    logger.separator();

  } catch (error) {
    logger.error('❌ Test suite error:');
    logger.error(error.message);
    process.exit(1);
  }
}

// Run tests
runAllDashboardTests().catch(error => {
  logger.error('Fatal error:', error);
  process.exit(1);
});
