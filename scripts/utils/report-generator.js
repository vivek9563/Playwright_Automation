/**
 * HTML Report Generator for Vedak CRM Tests
 */

const fs = require('fs');
const path = require('path');
require('dotenv').config();

class ReportGenerator {
  constructor() {
    this.reportPath = process.env.REPORT_PATH || './reports';
    this.testResults = [];
    this.startTime = new Date();
  }

  addTestResult(testCase) {
    this.testResults.push(testCase);
  }

  generateReport(summary) {
    const reportDir = this.reportPath;
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }

    const endTime = new Date();
    const duration = endTime - this.startTime;

    const html = this.generateHTML(summary, duration);
    const reportFile = path.join(reportDir, 'test-report.html');

    fs.writeFileSync(reportFile, html);
    console.log(`\n✓ Report generated: ${reportFile}\n`);

    return reportFile;
  }

  generateHTML(summary, duration) {
    const rows = this.testResults.map((test, index) => `
      <tr class="${test.status.toLowerCase()}">
        <td>${index + 1}</td>
        <td>${test.testId}</td>
        <td>${test.name}</td>
        <td>${test.description}</td>
        <td class="status-${test.status.toLowerCase()}">
          <span class="status-badge">${test.status}</span>
        </td>
        <td>${test.duration}ms</td>
        <td>${test.error || '-'}</td>
      </tr>
    `).join('');

    const passPercentage = summary.total > 0 
      ? ((summary.passed / summary.total) * 100).toFixed(2)
      : 0;

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Vedak CRM - Test Report</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 20px;
            min-height: 100vh;
        }

        .container {
            max-width: 1400px;
            margin: 0 auto;
            background: white;
            border-radius: 12px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            overflow: hidden;
        }

        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 40px 30px;
            text-align: center;
        }

        .header h1 {
            font-size: 2.5em;
            margin-bottom: 10px;
        }

        .header p {
            font-size: 1.1em;
            opacity: 0.9;
        }

        .summary {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            padding: 30px;
            background: #f8f9fa;
            border-bottom: 2px solid #e9ecef;
        }

        .summary-card {
            background: white;
            padding: 20px;
            border-radius: 8px;
            text-align: center;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            border-top: 4px solid #667eea;
        }

        .summary-card.pass {
            border-top-color: #28a745;
        }

        .summary-card.fail {
            border-top-color: #dc3545;
        }

        .summary-card.skip {
            border-top-color: #ffc107;
        }

        .summary-card h3 {
            font-size: 2.5em;
            margin-bottom: 10px;
            color: #667eea;
        }

        .summary-card.pass h3 {
            color: #28a745;
        }

        .summary-card.fail h3 {
            color: #dc3545;
        }

        .summary-card.skip h3 {
            color: #ffc107;
        }

        .summary-card p {
            color: #666;
            font-size: 0.95em;
        }

        .content {
            padding: 30px;
        }

        .table-wrapper {
            overflow-x: auto;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
        }

        th {
            background: #667eea;
            color: white;
            padding: 15px;
            text-align: left;
            font-weight: 600;
        }

        td {
            padding: 12px 15px;
            border-bottom: 1px solid #e9ecef;
        }

        tr:hover {
            background-color: #f8f9fa;
        }

        tr.pass {
            background-color: #f0f8f5;
        }

        tr.fail {
            background-color: #ffe5e5;
        }

        tr.skip {
            background-color: #fff8f0;
        }

        .status-badge {
            display: inline-block;
            padding: 6px 12px;
            border-radius: 20px;
            font-weight: 600;
            font-size: 0.9em;
        }

        .status-pass .status-badge {
            background-color: #28a745;
            color: white;
        }

        .status-fail .status-badge {
            background-color: #dc3545;
            color: white;
        }

        .status-skip .status-badge {
            background-color: #ffc107;
            color: black;
        }

        .footer {
            background: #f8f9fa;
            padding: 20px;
            text-align: center;
            color: #666;
            border-top: 2px solid #e9ecef;
        }

        .timestamp {
            color: #999;
            font-size: 0.9em;
        }

        .error-text {
            color: #dc3545;
            font-family: monospace;
            font-size: 0.9em;
        }

        .percentage {
            display: inline-block;
            margin-left: 10px;
            padding: 4px 8px;
            background: #667eea;
            color: white;
            border-radius: 4px;
            font-size: 0.9em;
        }

        .no-data {
            text-align: center;
            padding: 30px;
            color: #999;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🧪 Vedak CRM Test Report</h1>
            <p>Automated Login Module Testing</p>
        </div>

        <div class="summary">
            <div class="summary-card pass">
                <h3>${summary.passed}</h3>
                <p>Tests Passed</p>
            </div>
            <div class="summary-card fail">
                <h3>${summary.failed}</h3>
                <p>Tests Failed</p>
            </div>
            <div class="summary-card skip">
                <h3>${summary.skipped || 0}</h3>
                <p>Tests Skipped</p>
            </div>
            <div class="summary-card">
                <h3>${summary.total}</h3>
                <p>Total Tests</p>
                <div class="percentage">${passPercentage}% Pass</div>
            </div>
        </div>

        <div class="content">
            <h2>Test Results</h2>
            <div class="table-wrapper">
                <table>
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Test ID</th>
                            <th>Test Name</th>
                            <th>Description</th>
                            <th>Status</th>
                            <th>Duration</th>
                            <th>Error Message</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rows.length > 0 ? rows : '<tr><td colspan="7" class="no-data">No test results available</td></tr>'}
                    </tbody>
                </table>
            </div>
        </div>

        <div class="footer">
            <p>Report generated on: <span class="timestamp">${new Date().toLocaleString()}</span></p>
            <p>Total execution time: <strong>${(duration / 1000).toFixed(2)}s</strong></p>
            <p style="margin-top: 10px; font-size: 0.9em; opacity: 0.8;">Vedak CRM Test Suite v1.0</p>
        </div>
    </div>
</body>
</html>
    `;
  }

  generateTestResult(testId, name, description, status, duration, error = null) {
    return {
      testId,
      name,
      description,
      status,
      duration,
      error
    };
  }
}

module.exports = ReportGenerator;
