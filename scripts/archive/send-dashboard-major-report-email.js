const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const nodemailer = require('nodemailer');

const RECIPIENT_EMAIL = 'vivek.k@vedak.com';
const REPORT_FILE = path.join(__dirname, '../reports/Dashboard_Major_Test_Report.html');
const RESULTS_FILE = path.join(__dirname, '../reports/test-results/dashboard-major-results.json');

async function sendTestReportEmail() {
  try {
    const resultsData = fs.readFileSync(RESULTS_FILE, 'utf8');
    const results = JSON.parse(resultsData);

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
            body { font-family: Arial, sans-serif; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; }
            .summary { margin: 20px 0; }
            .summary-item { margin: 10px 0; }
            .passed { color: #28a745; font-weight: bold; }
            .failed { color: #dc3545; font-weight: bold; }
            .rate { color: #667eea; font-weight: bold; }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>🧪 Dashboard Major Functionality Test Report</h1>
            <p>Vedak CRM Automated Testing Suite</p>
        </div>
        
        <div class="summary">
            <h2>Test Summary</h2>
            <div class="summary-item">Total Tests: <strong>${results.totalTests}</strong></div>
            <div class="summary-item"><span class="passed">✓ Passed: ${results.passed}</span></div>
            <div class="summary-item"><span class="failed">✗ Failed: ${results.failed}</span></div>
            <div class="summary-item">Success Rate: <span class="rate">${results.successRate}</span></div>
        </div>

        <h3>Recent Test Results:</h3>
        <ul>
            ${results.tests.slice(-5).map(test => `
                <li><strong>${test.name}</strong> - ${test.status}${test.details ? ': ' + test.details.substring(0, 100) : ''}</li>
            `).join('')}
        </ul>

        <p style="margin-top: 30px; color: #666;">
            View the full interactive report attached below<br>
            Report Generated: ${new Date().toLocaleString()}
        </p>
    </body>
    </html>
    `;

    const info = await transporter.sendMail({
      from: process.env.GMAIL_EMAIL || process.env.GMAIL_USER,
      to: RECIPIENT_EMAIL,
      subject: `Dashboard Major Functionality Test Report - ${results.successRate} Success Rate`,
      html: emailContent,
      attachments: [
        {
          filename: 'Dashboard_Major_Test_Report.html',
          path: REPORT_FILE
        }
      ]
    });

    console.log(`\n✓ Email sent successfully!`);
    console.log(`  To: ${RECIPIENT_EMAIL}`);
    console.log(`  Message ID: ${info.messageId}`);
    console.log(`  Report attached: Dashboard_Major_Test_Report.html`);
    
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`Error sending email: ${error.message}`);
    if (error.message.includes('EAUTH')) {
      console.error('⚠️  Gmail authentication failed. Please check:');
      console.error('  1. GMAIL_EMAIL is set correctly');
      console.error('  2. GMAIL_APP_PASSWORD is set (not your regular Gmail password)');
      console.error('  3. .env file exists in project root');
    }
    throw error;
  }
}

sendTestReportEmail().catch(err => {
  console.error('Failed to send report:', err.message);
  process.exit(1);
});

module.exports = sendTestReportEmail;
