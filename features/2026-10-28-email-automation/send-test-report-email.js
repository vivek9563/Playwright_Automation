const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
  bold: '\x1b[1m'
};

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ ${msg}${colors.reset}`),
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  warn: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
};

async function sendTestReportEmail(recipientEmail = null) {
  try {
    log.info(`\n${'='.repeat(70)}`);
    log.info('AUTOMATED TEST REPORT EMAIL');
    log.info(`${'='.repeat(70)}\n`);

    // Get email configuration
    const emailAddress = recipientEmail || process.env.RECIPIENT_EMAIL || 'vivek.k@vedak.com';
    const gmailUser = process.env.GMAIL_EMAIL || 'vivek.k@vedak.com';
    const gmailPassword = process.env.GMAIL_APP_PASSWORD;

    if (!gmailPassword) {
      log.error('GMAIL_APP_PASSWORD not found in .env file');
      log.warn('Please add GMAIL_APP_PASSWORD to your .env file');
      log.info('Steps to generate Gmail App Password:');
      log.info('1. Go to https://myaccount.google.com/apppasswords');
      log.info('2. Select Mail and Windows Computer');
      log.info('3. Copy the 16-character password');
      log.info('4. Add to .env: GMAIL_APP_PASSWORD=<password>');
      return false;
    }

    log.info(`Sender Email: ${gmailUser}`);
    log.info(`Recipient: ${emailAddress}`);

    // Configure email transport
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: gmailUser,
        pass: gmailPassword
      }
    });

    // Verify connection
    log.info('Verifying email connection...');
    await transporter.verify();
    log.success('Email connection verified\n');

    // Prepare attachments
    const attachments = [];
    const reportFiles = [
      {
        path: path.join(__dirname, '../../reports/Master_Test_Report.xlsx'),
        filename: 'Master_Test_Report.xlsx',
        description: 'Excel test report with all 80 tests'
      },
      {
        path: path.join(__dirname, '../../reports/test-reports', 'master-test-report.html'),
        filename: 'Vedak_CRM_Test_Report.html',
        description: 'Interactive HTML dashboard report'
      }
    ];

    // Check and add available files
    for (const file of reportFiles) {
      if (fs.existsSync(file.path)) {
        log.success(`Found: ${file.filename} (${file.description})`);
        attachments.push({
          filename: file.filename,
          path: file.path
        });
      } else {
        log.warn(`Missing: ${file.filename}`);
      }
    }

    if (attachments.length === 0) {
      log.error('No report files found to attach!');
      return false;
    }

    log.info(`\nAttachments ready: ${attachments.length} files\n`);

    // Get test summary from cache
    let testSummary = '';
    const cacheFile = path.join(__dirname, '../../reports/test-reports', 'results-cache.json');
    
    if (fs.existsSync(cacheFile)) {
      try {
        const cacheData = JSON.parse(fs.readFileSync(cacheFile, 'utf8'));
        if (cacheData.summary) {
          testSummary = `
<p><strong>Test Summary:</strong></p>
<ul>
  <li>Total Tests: ${cacheData.summary.totalTests || 'N/A'}</li>
  <li>Passed: ${cacheData.summary.passed || 'N/A'}</li>
  <li>Failed: ${cacheData.summary.failed || 'N/A'}</li>
  <li>Graceful: ${cacheData.summary.graceful || 'N/A'}</li>
  <li>Pass Rate: ${cacheData.summary.passRate || 'N/A'}</li>
</ul>`;
        }
      } catch (e) {
        log.warn('Could not parse cache file for summary');
      }
    }

    // Prepare email content
    const currentTime = new Date().toLocaleString('en-IN', { 
      timeZone: 'Asia/Kolkata' 
    });

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 5px 5px 0 0; }
    .header h1 { margin: 0; font-size: 24px; }
    .content { background: #f9f9f9; padding: 20px; border: 1px solid #ddd; border-radius: 0 0 5px 5px; }
    .section { margin: 15px 0; }
    .success { color: #4CAF50; font-weight: bold; }
    .warning { color: #FFC107; font-weight: bold; }
    .failed { color: #f44336; font-weight: bold; }
    .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
    ul { margin: 10px 0; padding-left: 20px; }
    li { margin: 5px 0; }
    .badge { display: inline-block; padding: 5px 10px; border-radius: 3px; margin: 2px; font-size: 12px; }
    .badge-success { background: #4CAF50; color: white; }
    .badge-graceful { background: #FFC107; color: #333; }
    .badge-failed { background: #f44336; color: white; }
    table { width: 100%; border-collapse: collapse; margin: 10px 0; }
    th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
    th { background: #667eea; color: white; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎯 Vedak CRM Automated Test Report</h1>
      <p style="margin: 5px 0;">Test Execution Summary</p>
    </div>
    
    <div class="content">
      <div class="section">
        <p>Hello,</p>
        <p>Your automated test suite for <strong>Vedak CRM</strong> has completed successfully! 📊</p>
      </div>

      <div class="section">
        <h3>📋 Report Details</h3>
        <p><strong>Execution Time:</strong> ${currentTime}</p>
        <p><strong>Test Framework:</strong> Playwright</p>
        <p><strong>Test Modules:</strong> 4 (Login, Dashboard, Organization, Projects)</p>
        ${testSummary}
      </div>

      <div class="section">
        <h3>📎 Attached Reports</h3>
        <ul>
          <li><strong>Master_Test_Report.xlsx</strong> - Complete Excel report with all test cases and statuses</li>
          <li><strong>Vedak_CRM_Test_Report.html</strong> - Interactive HTML dashboard with filtering capabilities</li>
        </ul>
      </div>

      <div class="section">
        <h3>📊 How to View Reports</h3>
        <ul>
          <li><strong>Excel Report:</strong> Open in Microsoft Excel or Google Sheets for detailed test case information</li>
          <li><strong>HTML Report:</strong> Open in any web browser for interactive filtering and visualization</li>
          <li><strong>Features:</strong> Filter by status (Passed/Failed/Graceful), search tests, view execution time</li>
        </ul>
      </div>

      <div class="section">
        <h3>✨ Key Features</h3>
        <ul>
          <li>✅ Yellow highlighting for graceful passes (UI degradation handled)</li>
          <li>✅ Persistent data storage - results saved across sessions</li>
          <li>✅ Auto-load previous results - no re-running needed</li>
          <li>✅ Professional formatting and color coding</li>
          <li>✅ Mobile-responsive design</li>
        </ul>
      </div>

      <div class="section">
        <h3>🔄 Next Steps</h3>
        <ol>
          <li>Download the attached reports</li>
          <li>Review test results in your preferred format</li>
          <li>Check for any failed tests requiring attention</li>
          <li>Use HTML report for interactive analysis</li>
          <li>Share with your team via the HTML file</li>
        </ol>
      </div>

      <div class="section" style="background: #e3f2fd; padding: 10px; border-left: 4px solid #2196F3; border-radius: 3px;">
        <p style="margin: 0;"><strong>💡 Pro Tip:</strong> Open the HTML report to instantly view cached results without re-running tests. The report persists data across browser sessions!</p>
      </div>

      <div class="footer">
        <p>This is an automated email from Vedak CRM Test Automation Suite</p>
        <p>Generated at: ${currentTime}</p>
        <p>For support, contact your QA team</p>
      </div>
    </div>
  </div>
</body>
</html>`;

    // Send email
    log.info('Sending email...\n');

    const mailOptions = {
      from: gmailUser,
      to: emailAddress,
      subject: `[Vedak CRM] 🎯 Automated Test Report - ${new Date().toLocaleDateString('en-IN')}`,
      html: htmlContent,
      attachments: attachments,
      priority: 'high'
    };

    const info = await transporter.sendMail(mailOptions);

    log.success(`Email sent successfully!`);
    log.info(`Message ID: ${info.messageId}\n`);
    
    log.info(`${'='.repeat(70)}`);
    log.success('TEST REPORT EMAILED SUCCESSFULLY');
    log.info(`${'='.repeat(70)}\n`);
    
    console.log(`📧 Email sent to: ${emailAddress}`);
    console.log(`📎 Attachments: ${attachments.length} files`);
    console.log(`⏰ Time: ${currentTime}\n`);

    return true;

  } catch (error) {
    log.error(`Failed to send email: ${error.message}\n`);
    
    if (error.message.includes('Invalid login')) {
      log.error('Authentication failed. Please check:');
      log.info('1. GMAIL_EMAIL is correct in .env');
      log.info('2. GMAIL_APP_PASSWORD is a valid app-specific password');
      log.info('3. 2FA is enabled on your Gmail account');
    }
    
    console.error('Full error:', error);
    return false;
  }
}

// Run if called directly
if (require.main === module) {
  const recipientEmail = process.argv[2];
  sendTestReportEmail(recipientEmail)
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('Unexpected error:', error);
      process.exit(1);
    });
}

module.exports = { sendTestReportEmail };
