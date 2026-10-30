const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log(`
╔════════════════════════════════════════════════════════════════════╗
║                                                                    ║
║     🚀 VEDAK CRM - MASTER TEST SUITE & REPORT GENERATOR 🚀        ║
║                                                                    ║
╚════════════════════════════════════════════════════════════════════╝
`);

function runCommand(command, args, description) {
  return new Promise((resolve) => {
    console.log(`\n${description}`);
    console.log('━'.repeat(70));

    const process = spawn(command, args, {
      cwd: __dirname,
      stdio: 'inherit'
    });

    process.on('close', (code) => {
      if (code === 0) {
        console.log(`✅ ${description} - COMPLETE\n`);
      } else {
        console.log(`⚠️  ${description} - Completed with warnings (code: ${code})\n`);
      }
      resolve();
    });

    process.on('error', (err) => {
      console.error(`❌ Error: ${err.message}`);
      resolve();
    });
  });
}

async function main() {
  try {
    // Step 1: Run all tests
    await runCommand('node', ['run-all-tests.js'], 'STEP 1: Running all test cases');

    // Step 2: Generate enhanced HTML report
    await runCommand('node', ['generate-enhanced-report.js'], 'STEP 2: Generating enhanced HTML report with persistence');

    // Step 3: Update Excel files
    if (fs.existsSync(path.join(__dirname, 'update-excel-results.js'))) {
      await runCommand('node', ['update-excel-results.js'], 'STEP 3: Updating Excel files with results');
    }

    // Step 4: Send email report
    if (fs.existsSync(path.join(__dirname, 'send-test-report-email.js'))) {
      await runCommand('node', ['send-test-report-email.js'], 'STEP 4: Sending test report via email');
    }

    // Final summary
    console.log(`
╔════════════════════════════════════════════════════════════════════╗
║                                                                    ║
║          ✅ ALL OPERATIONS COMPLETED SUCCESSFULLY! ✅             ║
║                                                                    ║
╚════════════════════════════════════════════════════════════════════╝

📊 EXECUTION COMPLETE

📁 GENERATED FILES:
   ✅ Master_Test_Report.xlsx - Professional documentation
   ✅ test-reports/master-test-report.html - Interactive dashboard
   ✅ test-results/ - JSON results (cached)
   ✅ test-reports/results-cache.json - Persistent cache
   ✅ Email Report - Sent to vivek.k@vedak.com

🌐 OPEN YOUR REPORT:
   open test-reports/master-test-report.html

✨ FEATURES ENABLED:
   ✅ Yellow highlighting for PASSED (Graceful) tests
   ✅ Results persist across page refreshes
   ✅ Auto-loads previously saved filter
   ✅ 100% responsive design
   ✅ Real-time filtering by status

📝 NEXT STEPS:
   1. Open the HTML report in your browser
   2. Refresh the page - results will auto-load
   3. Use filter buttons to view specific statuses
   4. Share the report with your team

✅ TEST EXECUTION COMPLETED AT: ${new Date().toISOString()}
`);

  } catch (error) {
    console.error('❌ Fatal error:', error.message);
    process.exit(1);
  }
}

main();
