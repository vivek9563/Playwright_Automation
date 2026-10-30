const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const nodemailer = require('nodemailer');

const RECIPIENT_EMAIL = 'vivek.k@vedak.com';
const MASTER_EXCEL = path.join(__dirname, '../reports/Master_Test_Report.xlsx');
const MASTER_HTML = path.join(__dirname, '../reports/Master_Test_Report.html');
const MASTER_JSON = path.join(__dirname, '../reports/test-results/master-results.json');

async function sendMasterReportEmail() {
  try {
    const masterData = JSON.parse(fs.readFileSync(MASTER_JSON, 'utf8'));
    
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_EMAIL || process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD
      }
    });

    const emailContent = `
    <html>
    <head>
        <style>
            body { font-family: Arial, sans-serif; background: #f5f5f5; }
            .container { max-width: 800px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
            .header h1 { margin: 0; font-size: 24px; }
            .summary { margin: 20px 0; }
            .stat-box { display: inline-block; margin: 10px 15px 10px 0; padding: 15px; background: #f0f0f0; border-radius: 5px; }
            .stat-box .label { color: #666; font-size: 12px; }
            .stat-box .value { font-size: 28px; font-weight: bold; color: #667eea; }
            .stat-box.passed .value { color: #28a745; }
            .stat-box.failed .value { color: #dc3545; }
            .modules { margin: 20px 0; }
            .module { padding: 15px; border-left: 4px solid #667eea; background: #f9f9f9; margin-bottom: 10px; border-radius: 5px; }
            .module h3 { margin-top: 0; color: #333; }
            .module-stat { display: flex; justify-content: space-between; padding: 5px 0; }
            .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 12px; }
            .success { color: #28a745; font-weight: bold; }
            .highlight { background: #fffbf0; padding: 15px; border-left: 4px solid #FFC107; border-radius: 5px; margin: 15px 0; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🧪 Master Test Report</h1>
                <p style="margin: 10px 0 0 0; opacity: 0.9;">Vedak CRM - Comprehensive Automated Testing</p>
            </div>
            
            <div class="summary">
                <h2>Test Execution Summary</h2>
                <div class="stat-box">
                    <div class="label">Total Tests</div>
                    <div class="value">${masterData.summary.totalTests}</div>
                </div>
                <div class="stat-box passed">
                    <div class="label">Passed</div>
                    <div class="value">${masterData.summary.passedTests}</div>
                </div>
                <div class="stat-box failed">
                    <div class="label">Failed</div>
                    <div class="value">${masterData.summary.failedTests}</div>
                </div>
                <div class="stat-box">
                    <div class="label">Success Rate</div>
                    <div class="value" style="color: #28a745;">${masterData.summary.passRate}%</div>
                </div>
            </div>
            
            ${masterData.summary.failedTests === 0 ? `
                <div class="highlight">
                    <strong class="success">✓ ALL TESTS PASSED!</strong>
                    <p>All ${masterData.summary.totalTests} test cases executed successfully with 100% pass rate.</p>
                </div>
            ` : ''}
            
            <div class="modules">
                <h2>Module Breakdown</h2>
                ${Object.entries(masterData.modules).map(([module, data]) => `
                    <div class="module">
                        <h3>${module.toUpperCase()}</h3>
                        <div class="module-stat">
                            <span>Total Tests:</span>
                            <strong>${data.totalTests}</strong>
                        </div>
                        <div class="module-stat">
                            <span>Passed:</span>
                            <strong style="color: #28a745;">${data.passed} ✓</strong>
                        </div>
                        <div class="module-stat">
                            <span>Failed:</span>
                            <strong style="color: #dc3545;">${data.failed} ✗</strong>
                        </div>
                        <div class="module-stat">
                            <span>Success Rate:</span>
                            <strong>${data.successRate}</strong>
                        </div>
                    </div>
                `).join('')}
            </div>
            
            <div class="footer">
                <p><strong>Attachments Included:</strong></p>
                <ul>
                    <li>Master_Test_Report.xlsx - Comprehensive Excel report with all modules</li>
                    <li>Master_Test_Report.html - Interactive HTML dashboard</li>
                </ul>
                <p>Report Generated: ${new Date().toLocaleString()}</p>
                <p>Vedak CRM Automated Testing Suite</p>
            </div>
        </div>
    </body>
    </html>
    `;

    const info = await transporter.sendMail({
      from: process.env.GMAIL_EMAIL || process.env.GMAIL_USER,
      to: RECIPIENT_EMAIL,
      subject: `Master Test Report - ${masterData.summary.totalTests} Tests | ${masterData.summary.passRate}% Success Rate`,
      html: emailContent,
      attachments: [
        {
          filename: 'Master_Test_Report.xlsx',
          path: MASTER_EXCEL
        },
        {
          filename: 'Master_Test_Report.html',
          path: MASTER_HTML
        }
      ]
    });

    console.log(`\n✓ Master Test Report Email Sent Successfully!`);
    console.log(`  To: ${RECIPIENT_EMAIL}`);
    console.log(`  Subject: Master Test Report - ${masterData.summary.totalTests} Tests | ${masterData.summary.passRate}% Success`);
    console.log(`  Message ID: ${info.messageId}`);
    console.log(`  Attachments: 2 files (Excel + HTML)`);
    console.log(`\n📊 Report Summary:`);
    console.log(`  Total Tests: ${masterData.summary.totalTests}`);
    console.log(`  Passed: ${masterData.summary.passedTests} ✓`);
    console.log(`  Failed: ${masterData.summary.failedTests} ✗`);
    console.log(`  Success Rate: ${masterData.summary.passRate}%`);
    
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`\n❌ Error sending email: ${error.message}`);
    if (error.message.includes('EAUTH')) {
      console.error('⚠️  Gmail authentication failed. Please check:');
      console.error('  1. GMAIL_EMAIL is set correctly');
      console.error('  2. GMAIL_APP_PASSWORD is set (not your regular Gmail password)');
      console.error('  3. .env file exists in project root');
    }
    throw error;
  }
}

sendMasterReportEmail().catch(err => {
  console.error('Failed to send report:', err.message);
  process.exit(1);
});

module.exports = sendMasterReportEmail;
