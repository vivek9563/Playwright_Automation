#!/usr/bin/env node

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

async function runCommand(command, args) {
  return new Promise((resolve, reject) => {
    const proc = spawn(command, args, { stdio: 'inherit' });
    proc.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`${command} exited with code ${code}`));
      }
    });
  });
}

async function main() {
  console.log('\n╔════════════════════════════════════════════════════════════════════╗');
  console.log('║                                                                    ║');
  console.log('║        🚀 VEDAK CRM - MASTER TEST SUITE & REPORT GENERATOR 🚀    ║');
  console.log('║                                                                    ║');
  console.log('╚════════════════════════════════════════════════════════════════════╝\n');

  try {
    // Step 1: Run all tests
    console.log('STEP 1: Running all test cases...\n');
    await runCommand('node', ['run-all-tests.js']);

    // Step 2: Generate HTML report
    console.log('\n\nSTEP 2: Generating interactive HTML report...\n');
    await runCommand('node', ['generate-html-report.js']);

    // Step 3: Update Excel files
    console.log('\n\nSTEP 3: Updating Excel sheets with results...\n');
    try {
      await runCommand('node', ['update-excel-results.js']);
    } catch (error) {
      console.warn('⚠️  Excel update skipped (ExcelJS may need installation)');
      console.warn('    Run: npm install exceljs');
    }

    // Print summary
    const resultsFile = path.join(__dirname, 'test-results', 'latest-results.json');
    const results = JSON.parse(fs.readFileSync(resultsFile, 'utf8'));
    const reportFile = path.join(__dirname, 'test-reports', 'test-report.html');

    console.log('\n\n╔════════════════════════════════════════════════════════════════════╗');
    console.log('║                   📊 EXECUTION COMPLETE 📊                        ║');
    console.log('╚════════════════════════════════════════════════════════════════════╝\n');

    console.log('📈 TEST RESULTS SUMMARY:');
    console.log(`   Total Tests:    ${results.summary.totalTests}`);
    console.log(`   ✅ Passed:      ${results.summary.passed}`);
    console.log(`   ❌ Failed:      ${results.summary.failed}`);
    console.log(`   Pass Rate:      ${((results.summary.passed / results.summary.totalTests) * 100).toFixed(2)}%\n`);

    console.log('📁 FILES GENERATED:');
    console.log(`   • JSON Results:  ${resultsFile}`);
    console.log(`   • HTML Report:   ${reportFile}`);
    console.log(`   • Excel Files:   Master_Test_Report.xlsx (if ExcelJS installed)\n`);

    console.log('🌐 OPEN HTML REPORT:');
    console.log(`   file://${reportFile}\n`);

    console.log('📋 Module Breakdown:');
    console.log(`   Login Module:     ${results.modules.login.summary.passed}/${results.modules.login.summary.total} passed`);
    console.log(`   Dashboard Module: ${results.modules.dashboard.summary.passed}/${results.modules.dashboard.summary.total} passed\n`);

    console.log('✅ All operations completed successfully!\n');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

main();
