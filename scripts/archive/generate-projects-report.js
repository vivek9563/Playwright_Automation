const fs = require('fs');
const path = require('path');

function generateProjectsReport() {
  try {
    // Read projects test results
    const projectsResultsFile = path.join(__dirname, 'test-results/projects-submenu-results.json');
    const projectsData = JSON.parse(fs.readFileSync(projectsResultsFile, 'utf8'));

    // Create HTML report
    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Projects Submenu Navigation Tests - Report</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 40px 20px;
        }

        .container {
            max-width: 1400px;
            margin: 0 auto;
        }

        .header {
            background: white;
            border-radius: 12px;
            padding: 40px;
            margin-bottom: 30px;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
        }

        .header h1 {
            color: #333;
            font-size: 32px;
            margin-bottom: 10px;
            display: flex;
            align-items: center;
            gap: 15px;
        }

        .header .emoji {
            font-size: 40px;
        }

        .header p {
            color: #666;
            font-size: 16px;
            margin: 5px 0;
        }

        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-top: 20px;
        }

        .stat-card {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 25px;
            border-radius: 10px;
            text-align: center;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
        }

        .stat-card.passed {
            background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
        }

        .stat-card.failed {
            background: linear-gradient(135deg, #f44336 0%, #da190b 100%);
        }

        .stat-card .number {
            font-size: 48px;
            font-weight: bold;
            margin: 10px 0;
        }

        .stat-card .label {
            font-size: 14px;
            opacity: 0.9;
        }

        .filters {
            display: flex;
            gap: 15px;
            margin-bottom: 30px;
            flex-wrap: wrap;
        }

        .filter-btn {
            background: white;
            border: 2px solid #667eea;
            color: #667eea;
            padding: 12px 24px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 16px;
            font-weight: 600;
            transition: all 0.3s ease;
        }

        .filter-btn:hover {
            background: #667eea;
            color: white;
            transform: translateY(-2px);
        }

        .filter-btn.active {
            background: #667eea;
            color: white;
        }

        .tests-container {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }

        .test-card {
            background: white;
            border-radius: 10px;
            padding: 25px;
            box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
            border-left: 5px solid #667eea;
            transition: all 0.3s ease;
        }

        .test-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
        }

        .test-card.failed {
            border-left-color: #f44336;
        }

        .test-card.passed {
            border-left-color: #4CAF50;
        }

        .test-id {
            color: #667eea;
            font-weight: bold;
            font-size: 14px;
            text-transform: uppercase;
            margin-bottom: 8px;
        }

        .test-name {
            font-size: 18px;
            font-weight: bold;
            color: #333;
            margin-bottom: 10px;
        }

        .test-category {
            display: inline-block;
            background: #f0f0f0;
            color: #666;
            padding: 6px 12px;
            border-radius: 6px;
            font-size: 12px;
            margin-bottom: 10px;
        }

        .test-status {
            display: flex;
            align-items: center;
            gap: 8px;
            font-weight: 600;
            margin: 10px 0;
        }

        .test-status.passed {
            color: #4CAF50;
        }

        .test-status.failed {
            color: #f44336;
        }

        .test-details {
            font-size: 14px;
            color: #666;
            margin-top: 15px;
            line-height: 1.6;
        }

        .test-url {
            background: #f5f5f5;
            padding: 10px;
            border-radius: 6px;
            font-family: monospace;
            font-size: 12px;
            word-break: break-all;
            margin-top: 10px;
            color: #333;
        }

        .test-time {
            color: #999;
            font-size: 12px;
            margin-top: 10px;
        }

        .hidden {
            display: none;
        }

        footer {
            text-align: center;
            color: white;
            margin-top: 40px;
            padding: 20px;
        }

        .summary-table {
            background: white;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
            margin-bottom: 30px;
        }

        .summary-table table {
            width: 100%;
            border-collapse: collapse;
        }

        .summary-table th {
            background: #667eea;
            color: white;
            padding: 18px;
            text-align: left;
            font-weight: 600;
        }

        .summary-table td {
            padding: 18px;
            border-bottom: 1px solid #eee;
        }

        .summary-table tr:last-child td {
            border-bottom: none;
        }

        .summary-table tr:nth-child(even) {
            background: #f9f9f9;
        }

        .status-badge {
            display: inline-block;
            padding: 6px 12px;
            border-radius: 20px;
            font-weight: 600;
            font-size: 12px;
        }

        .status-badge.passed {
            background: #d4edda;
            color: #155724;
        }

        .status-badge.failed {
            background: #f8d7da;
            color: #721c24;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>
                <span class="emoji">🔗</span>
                Projects Submenu Navigation Tests
            </h1>
            <p><strong>Test Suite:</strong> Projects Submenu Navigation Tests</p>
            <p><strong>Executed:</strong> ${new Date(projectsData.executedAt).toLocaleString()}</p>
            <p><strong>Total Tests:</strong> ${projectsData.totalTests}</p>

            <div class="stats-grid">
                <div class="stat-card passed">
                    <div class="label">✅ Passed</div>
                    <div class="number">${projectsData.passed}</div>
                </div>
                <div class="stat-card failed">
                    <div class="label">❌ Failed</div>
                    <div class="number">${projectsData.failed}</div>
                </div>
                <div class="stat-card">
                    <div class="label">📈 Pass Rate</div>
                    <div class="number">${projectsData.passRate}%</div>
                </div>
                <div class="stat-card">
                    <div class="label">⏱️ Total Time</div>
                    <div class="number">${(projectsData.executionTime / 1000).toFixed(1)}s</div>
                </div>
            </div>
        </div>

        <div class="summary-table">
            <table>
                <thead>
                    <tr>
                        <th>Test ID</th>
                        <th>Test Name</th>
                        <th>Category</th>
                        <th>Status</th>
                        <th>Execution Time</th>
                    </tr>
                </thead>
                <tbody>
                    ${projectsData.tests.map(test => `
                    <tr>
                        <td><strong>${test.id}</strong></td>
                        <td>${test.name}</td>
                        <td>${test.category}</td>
                        <td><span class="status-badge ${test.status.toLowerCase()}">${test.status}</span></td>
                        <td>${test.executionTime}ms</td>
                    </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>

        <div class="filters">
            <button class="filter-btn active" onclick="filterTests('all')">All Tests (${projectsData.totalTests})</button>
            <button class="filter-btn" onclick="filterTests('passed')">✅ Passed (${projectsData.passed})</button>
            <button class="filter-btn" onclick="filterTests('failed')">❌ Failed (${projectsData.failed})</button>
        </div>

        <div class="tests-container">
            ${projectsData.tests.map(test => `
            <div class="test-card ${test.status.toLowerCase()}" data-status="${test.status.toLowerCase()}">
                <div class="test-id">${test.id}</div>
                <div class="test-name">${test.name}</div>
                <div class="test-category">${test.category}</div>
                <div class="test-status ${test.status.toLowerCase()}">
                    ${test.status === 'PASSED' ? '✅ PASSED' : '❌ FAILED'}
                </div>
                <div class="test-details">
                    ${test.description}
                </div>
                ${test.url ? `<div class="test-url">URL: ${test.url}</div>` : ''}
                <div class="test-time">⏱️ ${test.executionTime}ms</div>
            </div>
            `).join('')}
        </div>

        <footer>
            <p>Generated on ${new Date().toLocaleString()}</p>
        </footer>
    </div>

    <script>
        function filterTests(status) {
            const cards = document.querySelectorAll('.test-card');
            const buttons = document.querySelectorAll('.filter-btn');

            // Update active button
            buttons.forEach(btn => btn.classList.remove('active'));
            event.target.classList.add('active');

            // Filter cards
            cards.forEach(card => {
                if (status === 'all') {
                    card.classList.remove('hidden');
                } else {
                    if (card.dataset.status === status) {
                        card.classList.remove('hidden');
                    } else {
                        card.classList.add('hidden');
                    }
                }
            });
        }
    </script>
</body>
</html>
    `;

    // Save HTML report
    const reportFile = path.join(__dirname, 'test-reports/projects-submenu-report.html');
    fs.writeFileSync(reportFile, htmlContent);
    
    console.log('\n✅ Projects Submenu Report Generated Successfully!');
    console.log(`📊 Report saved to: test-reports/projects-submenu-report.html`);
    console.log('\n');

  } catch (error) {
    console.error('❌ Error generating report:', error);
    process.exit(1);
  }
}

generateProjectsReport();
