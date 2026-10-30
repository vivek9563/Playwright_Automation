const fs = require('fs');
const path = require('path');

const RESULTS_FILE = path.join(__dirname, '../reports/test-results/dashboard-major-results.json');
const REPORT_FILE = path.join(__dirname, '../reports/Dashboard_Major_Test_Report.html');

function generateHTMLReport() {
  try {
    const resultsData = fs.readFileSync(RESULTS_FILE, 'utf8');
    const results = JSON.parse(resultsData);
    
    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard Major Functionality Test Report</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: #333;
            line-height: 1.6;
            padding: 20px;
        }

        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 10px;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
            overflow: hidden;
        }

        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 40px;
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
            padding: 40px;
            background: #f8f9fa;
            border-bottom: 2px solid #e9ecef;
        }

        .summary-card {
            background: white;
            padding: 20px;
            border-radius: 8px;
            text-align: center;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            transition: transform 0.3s ease;
        }

        .summary-card:hover {
            transform: translateY(-5px);
        }

        .summary-card h3 {
            color: #667eea;
            font-size: 0.9em;
            text-transform: uppercase;
            margin-bottom: 10px;
        }

        .summary-card .value {
            font-size: 2.5em;
            font-weight: bold;
            color: #333;
        }

        .content {
            padding: 40px;
        }

        .filter-buttons {
            display: flex;
            gap: 10px;
            margin-bottom: 30px;
            flex-wrap: wrap;
        }

        .filter-btn {
            padding: 10px 20px;
            border: 2px solid #667eea;
            background: white;
            color: #667eea;
            border-radius: 5px;
            cursor: pointer;
            font-weight: 600;
            transition: all 0.3s ease;
        }

        .filter-btn:hover {
            background: #667eea;
            color: white;
        }

        .filter-btn.active {
            background: #667eea;
            color: white;
        }

        .tests-list {
            display: grid;
            gap: 15px;
        }

        .test-item {
            background: #f8f9fa;
            border-left: 5px solid #e9ecef;
            padding: 20px;
            border-radius: 5px;
            transition: all 0.3s ease;
        }

        .test-item:hover {
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
        }

        .test-item.PASS {
            border-left-color: #28a745;
            background: linear-gradient(to right, rgba(40, 167, 69, 0.05), transparent);
        }

        .test-item.FAIL {
            border-left-color: #dc3545;
            background: linear-gradient(to right, rgba(220, 53, 69, 0.05), transparent);
        }

        .test-status {
            display: inline-block;
            padding: 5px 15px;
            border-radius: 20px;
            font-weight: 600;
            font-size: 0.9em;
            margin-bottom: 10px;
        }

        .test-status.PASS {
            background: #d4edda;
            color: #155724;
        }

        .test-status.FAIL {
            background: #f8d7da;
            color: #721c24;
        }

        .test-name {
            font-size: 1.1em;
            font-weight: 600;
            color: #333;
            margin-bottom: 8px;
        }

        .test-details {
            color: #666;
            font-size: 0.9em;
            line-height: 1.4;
        }

        .test-time {
            color: #999;
            font-size: 0.85em;
            margin-top: 10px;
        }

        .footer {
            background: #f8f9fa;
            padding: 20px 40px;
            text-align: center;
            color: #666;
            font-size: 0.9em;
        }

        .progress-bar {
            width: 100%;
            height: 30px;
            background: #e9ecef;
            border-radius: 15px;
            overflow: hidden;
            margin-bottom: 10px;
        }

        .progress-fill {
            height: 100%;
            background: linear-gradient(to right, #28a745, #20c997);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: 600;
            font-size: 0.9em;
        }

        .hidden {
            display: none !important;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🧪 Dashboard Major Functionality Test Report</h1>
            <p>Vedak CRM Automated Testing Suite</p>
        </div>

        <div class="summary">
            <div class="summary-card">
                <h3>Total Tests</h3>
                <div class="value">${results.totalTests}</div>
            </div>
            <div class="summary-card">
                <h3>Passed ✓</h3>
                <div class="value" style="color: #28a745;">${results.passed}</div>
            </div>
            <div class="summary-card">
                <h3>Failed ✗</h3>
                <div class="value" style="color: #dc3545;">${results.failed}</div>
            </div>
            <div class="summary-card">
                <h3>Success Rate</h3>
                <div class="value" style="color: #667eea;">${results.successRate}</div>
            </div>
        </div>

        <div class="content">
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${parseFloat(results.successRate)}%;">
                    ${results.successRate}
                </div>
            </div>

            <h2 style="margin-bottom: 20px; color: #333;">Test Results</h2>

            <div class="filter-buttons">
                <button class="filter-btn active" onclick="filterTests('all')">All Tests (${results.totalTests})</button>
                <button class="filter-btn" onclick="filterTests('PASS')">✓ Passed (${results.passed})</button>
                <button class="filter-btn" onclick="filterTests('FAIL')">✗ Failed (${results.failed})</button>
            </div>

            <div class="tests-list" id="testsList">
                ${results.tests.map((test, index) => `
                    <div class="test-item ${test.status}" data-status="${test.status}">
                        <div class="test-status ${test.status}">${test.status}</div>
                        <div class="test-name">${test.name}</div>
                        <div class="test-details">${test.details || 'Test executed'}</div>
                        <div class="test-time">Executed at: ${new Date(test.timestamp).toLocaleString()}</div>
                    </div>
                `).join('')}
            </div>
        </div>

        <div class="footer">
            <p>Report Generated: ${new Date().toLocaleString()}</p>
            <p>Vedak CRM Automation Suite - © 2026</p>
        </div>
    </div>

    <script>
        function filterTests(status) {
            const items = document.querySelectorAll('.test-item');
            const buttons = document.querySelectorAll('.filter-btn');

            buttons.forEach(btn => btn.classList.remove('active'));
            event.target.classList.add('active');

            items.forEach(item => {
                if (status === 'all') {
                    item.classList.remove('hidden');
                } else {
                    if (item.getAttribute('data-status') === status) {
                        item.classList.remove('hidden');
                    } else {
                        item.classList.add('hidden');
                    }
                }
            });
        }

        // Save state to localStorage
        window.addEventListener('beforeunload', function() {
            localStorage.setItem('dashboardMajorTestsState', JSON.stringify({
                timestamp: new Date().toISOString(),
                results: ${JSON.stringify(results)}
            }));
        });

        // Load state from localStorage on page load
        window.addEventListener('load', function() {
            const savedState = localStorage.getItem('dashboardMajorTestsState');
            if (savedState) {
                const state = JSON.parse(savedState);
                console.log('Loaded saved test state:', state.timestamp);
            }
        });
    </script>
</body>
</html>
    `;

    fs.writeFileSync(REPORT_FILE, htmlContent);
    console.log(`\n✓ HTML Report generated: ${REPORT_FILE}`);
    console.log(`  Total Tests: ${results.totalTests}`);
    console.log(`  Passed: ${results.passed}`);
    console.log(`  Failed: ${results.failed}`);
    console.log(`  Success Rate: ${results.successRate}`);
    
    return { success: true, reportPath: REPORT_FILE, results };
  } catch (error) {
    console.error(`Error generating HTML report: ${error.message}`);
    throw error;
  }
}

const report = generateHTMLReport();
module.exports = report;
