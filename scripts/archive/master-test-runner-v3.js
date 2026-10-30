const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

// Import module runners
const runLoginTests = require('../modules/login/test-runner');
const runDashboardTests = require('../modules/dashboard/test-runner');
const runOrganizationTests = require('../modules/organization/test-runner');
const runProjectsTests = require('../modules/projects/test-runner');

const generateEnhancedReport = require('../features/2026-10-28-enhanced-html-report/generate-enhanced-report');
const sendTestReportEmail = require('../features/2026-10-28-email-automation/send-test-report-email');

async function runAllTests() {
  console.log('\n' + '█'.repeat(60));
  console.log('█' + ' '.repeat(58) + '█');
  console.log('█' + '  VEDAK CRM - COMPLETE AUTOMATED TEST SUITE  '.padEnd(59) + '█');
  console.log('█' + ' '.repeat(58) + '█');
  console.log('█'.repeat(60) + '\n');

  const startTime = Date.now();
  const allResults = {
    modules: {}
  };

  try {
    // Step 1: Run Login Tests
    console.log('\n🔵 STEP 1: Running Login Module Tests');
    console.log('▔'.repeat(60));
    const loginResults = await runLoginTests();
    allResults.modules.login = loginResults;

    // Step 2: Run Dashboard Tests
    console.log('\n🟡 STEP 2: Running Dashboard Module Tests');
    console.log('▔'.repeat(60));
    const dashboardResults = await runDashboardTests();
    allResults.modules.dashboard = dashboardResults;

    // Step 3: Run Organization Tests
    console.log('\n🟢 STEP 3: Running Organization Module Tests');
    console.log('▔'.repeat(60));
    const organizationResults = await runOrganizationTests();
    allResults.modules.organization = organizationResults;

    // Step 4: Run Projects Tests
    console.log('\n🔴 STEP 4: Running Projects Module Tests');
    console.log('▔'.repeat(60));
    const projectsResults = await runProjectsTests();
    allResults.modules.projects = projectsResults;

    // Calculate totals
    allResults.totalPassed = 
      (loginResults.passed || 0) + 
      (dashboardResults.passed || 0) + 
      (organizationResults.passed || 0) + 
      (projectsResults.passed || 0);

    allResults.totalFailed = 
      (loginResults.failed || 0) + 
      (dashboardResults.failed || 0) + 
      (organizationResults.failed || 0) + 
      (projectsResults.failed || 0);

    // Step 5: Generate Enhanced HTML Report
    console.log('\n🟣 STEP 5: Generating Enhanced HTML Report');
    console.log('▔'.repeat(60));
    try {
      await generateEnhancedReport();
      console.log('✓ Enhanced HTML report generated successfully');
    } catch (error) {
      console.error('✗ Error generating report:', error.message);
    }

    // Step 6: Send Email Report
    console.log('\n🟠 STEP 6: Sending Test Report via Email');
    console.log('▔'.repeat(60));
    try {
      if (process.env.GMAIL_EMAIL && process.env.RECIPIENT_EMAIL) {
        await sendTestReportEmail();
        console.log('✓ Test report email sent successfully');
      } else {
        console.log('⚠ Email configuration not set. Skipping email send.');
      }
    } catch (error) {
      console.error('✗ Error sending email:', error.message);
    }

    // Print final summary
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log('\n' + '█'.repeat(60));
    console.log('█' + ' '.repeat(58) + '█');
    console.log('█' + '  FINAL TEST SUMMARY  '.padEnd(59) + '█');
    console.log('█' + ' '.repeat(58) + '█');
    console.log('█'.repeat(60));
    console.log('\nModule Results:');
    console.log('  🔵 Login Tests:        ' + (loginResults.passed || 0) + ' passed, ' + (loginResults.failed || 0) + ' failed');
    console.log('  🟡 Dashboard Tests:    ' + (dashboardResults.passed || 0) + ' passed, ' + (dashboardResults.failed || 0) + ' failed');
    console.log('  🟢 Organization Tests: ' + (organizationResults.passed || 0) + ' passed, ' + (organizationResults.failed || 0) + ' failed');
    console.log('  🔴 Projects Tests:     ' + (projectsResults.passed || 0) + ' passed, ' + (projectsResults.failed || 0) + ' failed');
    console.log('-'.repeat(60));
    console.log('  📊 TOTAL:             ' + allResults.totalPassed + ' passed, ' + allResults.totalFailed + ' failed');
    console.log('  ⏱  Duration:           ' + duration + ' seconds');
    console.log('█'.repeat(60) + '\n');

    return allResults;

  } catch (error) {
    console.error('\n✗ CRITICAL ERROR:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  runAllTests();
}

module.exports = runAllTests;
