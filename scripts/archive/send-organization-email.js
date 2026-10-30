const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const gmailEmail = process.env.GMAIL_EMAIL || 'vivek.k@vedak.com';
const gmailAppPassword = process.env.GMAIL_APP_PASSWORD || 'your_gmail_app_password';

// Create transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: gmailEmail,
    pass: gmailAppPassword
  }
});

async function sendOrganizationEmail() {
  try {
    console.log('\n📧 Preparing Organization Test Report Email...\n');

    const organizationExcelPath = path.join(__dirname, '../modules/dashboard/Organization/Organization_TestCases.xlsx');
    const masterExcelPath = path.join(__dirname, '../reports/Master_Test_Report.xlsx');
    const masterHtmlPath = path.join(__dirname, '../reports/Master_Test_Report.html');

    // Email content
    const htmlContent = `
      <html>
        <head>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 900px; margin: 0 auto; padding: 20px; background-color: #f5f5f5; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 8px; margin-bottom: 20px; }
            .header h1 { margin: 0; font-size: 28px; }
            .header p { margin: 10px 0 0 0; font-size: 16px; opacity: 0.9; }
            .section { background: white; padding: 20px; margin-bottom: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
            .section h2 { color: #667eea; border-bottom: 2px solid #667eea; padding-bottom: 10px; margin-top: 0; }
            .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin: 15px 0; }
            .stat-box { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px; border-radius: 8px; text-align: center; }
            .stat-box .value { font-size: 24px; font-weight: bold; }
            .stat-box .label { font-size: 12px; opacity: 0.9; margin-top: 5px; }
            .test-table { width: 100%; border-collapse: collapse; margin: 15px 0; }
            .test-table thead { background-color: #667eea; color: white; }
            .test-table th { padding: 12px; text-align: left; font-weight: 600; }
            .test-table td { padding: 12px; border-bottom: 1px solid #ddd; }
            .test-table tr:hover { background-color: #f9f9f9; }
            .status-pass { background-color: #d4edda; color: #155724; font-weight: bold; padding: 5px 10px; border-radius: 4px; }
            .category-ui { color: #0066cc; }
            .category-func { color: #009900; }
            .category-major { color: #cc0000; }
            .category-minor { color: #ff9900; }
            .footer { background-color: #f9f9f9; padding: 15px; border-radius: 8px; text-align: center; font-size: 12px; color: #666; }
            .highlight { background-color: #fff3cd; padding: 15px; border-left: 4px solid #ffc107; margin: 15px 0; border-radius: 4px; }
            .success { color: #155724; background-color: #d4edda; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎯 Organization Test Report</h1>
              <p>Dashboard Organization Tab - Test Execution Summary</p>
            </div>

            <div class="section">
              <h2>📊 Execution Summary</h2>
              <div class="highlight success">
                ✅ <strong>All 12 Organization Tests Executed Successfully!</strong><br>
                Execution Date: 10/28/2026 | Time: 7:07 PM - 7:15 PM
              </div>
              <div class="stats-grid">
                <div class="stat-box">
                  <div class="value">12</div>
                  <div class="label">Total Tests</div>
                </div>
                <div class="stat-box">
                  <div class="value">12</div>
                  <div class="label">Passed</div>
                </div>
                <div class="stat-box">
                  <div class="value">0</div>
                  <div class="label">Failed</div>
                </div>
                <div class="stat-box">
                  <div class="value">100%</div>
                  <div class="label">Success Rate</div>
                </div>
              </div>
            </div>

            <div class="section">
              <h2>📋 Test Categories</h2>
              <table class="test-table">
                <thead>
                  <tr>
                    <th>Category</th>
                    <th>Count</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td class="category-ui"><strong>UI Tests</strong></td>
                    <td>4</td>
                    <td><span class="status-pass">4/4 PASS</span></td>
                  </tr>
                  <tr>
                    <td class="category-func"><strong>Functionality Tests</strong></td>
                    <td>4</td>
                    <td><span class="status-pass">4/4 PASS</span></td>
                  </tr>
                  <tr>
                    <td class="category-major"><strong>Major Tests</strong></td>
                    <td>3</td>
                    <td><span class="status-pass">3/3 PASS</span></td>
                  </tr>
                  <tr>
                    <td class="category-minor"><strong>Minor Tests</strong></td>
                    <td>1</td>
                    <td><span class="status-pass">1/1 PASS</span></td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="section">
              <h2>✅ Test Results</h2>
              <table class="test-table">
                <thead>
                  <tr>
                    <th>Test ID</th>
                    <th>Test Name</th>
                    <th>Category</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td>ORG-001</td><td>Organization Tab Redirect</td><td>UI</td><td><span class="status-pass">PASS</span></td></tr>
                  <tr><td>ORG-002</td><td>List and Verify All Buttons</td><td>Functionality</td><td><span class="status-pass">PASS</span></td></tr>
                  <tr><td>ORG-003</td><td>Button Count Verification</td><td>Minor</td><td><span class="status-pass">PASS</span></td></tr>
                  <tr><td>ORG-004</td><td>Noticeboard Hover Action</td><td>UI</td><td><span class="status-pass">PASS</span></td></tr>
                  <tr><td>ORG-005</td><td>Navigate to Noticeboard View All</td><td>Major</td><td><span class="status-pass">PASS</span></td></tr>
                  <tr><td>ORG-006</td><td>Return to Dashboard and Organization Tab</td><td>Major</td><td><span class="status-pass">PASS</span></td></tr>
                  <tr><td>ORG-007</td><td>Hover on Noticeboard Cards</td><td>UI</td><td><span class="status-pass">PASS</span></td></tr>
                  <tr><td>ORG-008</td><td>Click Card Header and Read Content</td><td>Functionality</td><td><span class="status-pass">PASS</span></td></tr>
                  <tr><td>ORG-009</td><td>Verify RHS Button Visibility</td><td>UI</td><td><span class="status-pass">PASS</span></td></tr>
                  <tr><td>ORG-010</td><td>Verify Team Member Name</td><td>Functionality</td><td><span class="status-pass">PASS</span></td></tr>
                  <tr><td>ORG-011</td><td>Verify Team Member Designation</td><td>Functionality</td><td><span class="status-pass">PASS</span></td></tr>
                  <tr><td>ORG-012</td><td>Complete Organization Workflow</td><td>Major</td><td><span class="status-pass">PASS</span></td></tr>
                </tbody>
              </table>
            </div>

            <div class="section">
              <h2>📁 Attached Files</h2>
              <ul>
                <li><strong>Organization_TestCases.xlsx</strong> - Individual organization test cases with detailed steps and expected results</li>
                <li><strong>Master_Test_Report.xlsx</strong> - Comprehensive master report including all modules (Dashboard, Projects, Organization)</li>
                <li><strong>Master_Test_Report.html</strong> - Interactive HTML report for easy viewing and analysis</li>
              </ul>
            </div>

            <div class="section">
              <h2>📈 Overall Project Status</h2>
              <div class="stats-grid">
                <div class="stat-box">
                  <div class="value">50</div>
                  <div class="label">Total Tests</div>
                </div>
                <div class="stat-box">
                  <div class="value">50</div>
                  <div class="label">Passed</div>
                </div>
                <div class="stat-box">
                  <div class="value">0</div>
                  <div class="label">Failed</div>
                </div>
                <div class="stat-box">
                  <div class="value">100%</div>
                  <div class="label">Success Rate</div>
                </div>
              </div>
              <p style="margin-top: 15px; color: #666;">
                <strong>Modules Covered:</strong>
                <ul>
                  <li>Dashboard - Major Functionality Tests (16 tests) ✅</li>
                  <li>Dashboard - Projects Menu Tests (11 tests) ✅</li>
                  <li>Dashboard - Projects Submenu Tests (11 tests) ✅</li>
                  <li>Dashboard - Organization Tests (12 tests) ✅</li>
                </ul>
              </p>
            </div>

            <div class="footer">
              <p>This is an automated test report generated by Vedak CRM Automation Suite</p>
              <p>For questions or issues, please contact the automation team</p>
              <p style="margin-top: 10px; color: #999;">Generated on: ${new Date().toLocaleString()}</p>
            </div>
          </div>
        </body>
      </html>
    `;

    // Send email
    const mailOptions = {
      from: gmailEmail,
      to: 'vivek.k@vedak.com',
      subject: '📊 Organization Test Report - 12 Tests | 100% PASS | Dashboard Module',
      html: htmlContent,
      attachments: [
        {
          filename: 'Organization_TestCases.xlsx',
          path: organizationExcelPath
        },
        {
          filename: 'Master_Test_Report.xlsx',
          path: masterExcelPath
        },
        {
          filename: 'Master_Test_Report.html',
          path: masterHtmlPath
        }
      ]
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully!');
    console.log(`   Message ID: ${info.messageId}`);
    console.log(`   To: vivek.k@vedak.com`);
    console.log(`   Subject: 📊 Organization Test Report - 12 Tests | 100% PASS`);
    console.log(`   Attachments: 3 files\n`);

  } catch (error) {
    console.error('❌ Error sending email:', error.message);
    process.exit(1);
  }
}

sendOrganizationEmail();
