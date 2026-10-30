const fs = require('fs');
const path = require('path');

function generateHTMLReport(testResults) {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Vedak CRM Test Report</title>
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
            padding: 20px;
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
        
        .timestamp {
            background: rgba(255, 255, 255, 0.1);
            padding: 10px 20px;
            border-radius: 5px;
            margin-top: 15px;
            display: inline-block;
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
            padding: 25px;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            text-align: center;
            border-top: 4px solid #667eea;
        }
        
        .summary-card.passed {
            border-top-color: #28a745;
        }
        
        .summary-card.failed {
            border-top-color: #dc3545;
        }
        
        .summary-card.pending {
            border-top-color: #ffc107;
        }
        
        .summary-value {
            font-size: 2.5em;
            font-weight: bold;
            color: #333;
            margin: 10px 0;
        }
        
        .summary-label {
            color: #666;
            font-size: 0.95em;
        }
        
        .pass-rate {
            font-size: 1.2em;
            font-weight: bold;
        }
        
        .content {
            padding: 40px;
        }
        
        .module-section {
            margin-bottom: 40px;
        }
        
        .module-header {
            background: #f8f9fa;
            padding: 20px;
            border-left: 4px solid #667eea;
            margin-bottom: 20px;
            border-radius: 6px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .module-title {
            font-size: 1.5em;
            font-weight: bold;
            color: #333;
        }
        
        .module-stats {
            display: flex;
            gap: 20px;
            font-size: 0.95em;
        }
        
        .stat {
            display: flex;
            align-items: center;
            gap: 5px;
        }
        
        .filter-buttons {
            display: flex;
            gap: 10px;
            margin-bottom: 20px;
            flex-wrap: wrap;
        }
        
        .filter-btn {
            padding: 8px 16px;
            border: 2px solid #ddd;
            background: white;
            border-radius: 6px;
            cursor: pointer;
            font-size: 0.95em;
            font-weight: 600;
            transition: all 0.3s ease;
        }
        
        .filter-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }
        
        .filter-btn.active {
            background: #667eea;
            color: white;
            border-color: #667eea;
        }
        
        .filter-btn.all { border-color: #667eea; }
        .filter-btn.all.active { background: #667eea; }
        
        .filter-btn.passed { border-color: #28a745; }
        .filter-btn.passed.active { background: #28a745; }
        
        .filter-btn.failed { border-color: #dc3545; }
        .filter-btn.failed.active { background: #dc3545; }
        
        .filter-btn.pending { border-color: #ffc107; }
        .filter-btn.pending.active { background: #ffc107; color: #333; }
        
        .test-list {
            display: grid;
            gap: 12px;
        }
        
        .test-item {
            display: flex;
            align-items: center;
            padding: 16px;
            background: #f8f9fa;
            border-left: 4px solid #ddd;
            border-radius: 6px;
            transition: all 0.3s ease;
        }
        
        .test-item:hover {
            background: #e9ecef;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        
        .test-item.passed {
            border-left-color: #28a745;
        }
        
        .test-item.failed {
            border-left-color: #dc3545;
        }
        
        .test-item.pending {
            border-left-color: #ffc107;
        }
        
        .test-status {
            width: 30px;
            height: 30px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            margin-right: 16px;
            flex-shrink: 0;
        }
        
        .test-status.passed {
            background: #28a745;
        }
        
        .test-status.failed {
            background: #dc3545;
        }
        
        .test-status.pending {
            background: #ffc107;
        }
        
        .test-info {
            flex: 1;
        }
        
        .test-id {
            font-weight: bold;
            color: #333;
            font-size: 0.95em;
        }
        
        .test-name {
            color: #666;
            margin-top: 4px;
            font-size: 0.9em;
        }
        
        .test-category {
            background: #e9ecef;
            padding: 2px 8px;
            border-radius: 4px;
            font-size: 0.8em;
            color: #666;
            margin-left: 8px;
        }
        
        .test-duration {
            color: #999;
            font-size: 0.9em;
            margin-right: 16px;
        }
        
        .hidden {
            display: none !important;
        }
        
        .footer {
            background: #f8f9fa;
            padding: 20px;
            text-align: center;
            color: #666;
            font-size: 0.9em;
            border-top: 1px solid #e9ecef;
        }
        
        @media (max-width: 768px) {
            .summary {
                grid-template-columns: repeat(2, 1fr);
            }
            
            .module-header {
                flex-direction: column;
                align-items: flex-start;
            }
            
            .module-stats {
                margin-top: 10px;
            }
            
            .test-item {
                flex-wrap: wrap;
            }
            
            .test-duration {
                margin-top: 8px;
                margin-right: 0;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🧪 Vedak CRM Test Report</h1>
            <p>Automated Test Execution Dashboard</p>
            <div class="timestamp">
                Generated: ${new Date(testResults.timestamp).toLocaleString()}
            </div>
        </div>
        
        <div class="summary">
            <div class="summary-card">
                <div class="summary-label">Total Tests</div>
                <div class="summary-value">${testResults.summary.totalTests}</div>
            </div>
            <div class="summary-card passed">
                <div class="summary-label">Passed Tests</div>
                <div class="summary-value">${testResults.summary.passed}</div>
            </div>
            <div class="summary-card failed">
                <div class="summary-label">Failed Tests</div>
                <div class="summary-value">${testResults.summary.failed}</div>
            </div>
            <div class="summary-card pending">
                <div class="summary-label">Not Executed</div>
                <div class="summary-value">${testResults.summary.notExecuted}</div>
            </div>
            <div class="summary-card">
                <div class="summary-label">Pass Rate</div>
                <div class="summary-value pass-rate">${((testResults.summary.passed / testResults.summary.totalTests) * 100).toFixed(1)}%</div>
            </div>
        </div>
        
        <div class="content">
            ${generateModuleSection(testResults.modules.login, 'login')}
            ${generateModuleSection(testResults.modules.dashboard, 'dashboard')}
        </div>
        
        <div class="footer">
            <p>Vedak CRM Automated Testing Suite | Last Updated: ${new Date().toLocaleString()}</p>
        </div>
    </div>
    
    <script>
        function filterTests(module, status) {
            const items = document.querySelectorAll(\`[data-module="\${module}"][data-test-item]\`);
            
            // Update button states
            const buttons = document.querySelectorAll(\`[data-module="\${module}"] .filter-btn\`);
            buttons.forEach(btn => btn.classList.remove('active'));
            event.target.classList.add('active');
            
            // Filter items
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
        
        // Initialize with 'all' filter active
        document.addEventListener('DOMContentLoaded', function() {
            document.querySelectorAll('.filter-btn.all').forEach(btn => {
                btn.classList.add('active');
            });
        });
    </script>
</body>
</html>`;

  return html;
}

function generateModuleSection(module, moduleId) {
  if (!module.tests || module.tests.length === 0) {
    return '';
  }

  const passedCount = module.summary.passed;
  const failedCount = module.summary.total - module.summary.passed;

  let html = `
    <div class="module-section" data-module="${moduleId}">
        <div class="module-header">
            <div class="module-title">${module.name}</div>
            <div class="module-stats">
                <div class="stat">
                    <span>Total: <strong>${module.summary.total}</strong></span>
                </div>
                <div class="stat" style="color: #28a745;">
                    <span>✓ Passed: <strong>${passedCount}</strong></span>
                </div>
                <div class="stat" style="color: #dc3545;">
                    <span>✗ Failed: <strong>${failedCount}</strong></span>
                </div>
            </div>
        </div>
        
        <div class="filter-buttons">
            <button class="filter-btn all" onclick="filterTests('${moduleId}', 'all')">All (${module.summary.total})</button>
            <button class="filter-btn passed" onclick="filterTests('${moduleId}', 'PASSED')">✓ Passed (${passedCount})</button>
            <button class="filter-btn failed" onclick="filterTests('${moduleId}', 'FAILED')">✗ Failed (${failedCount})</button>
        </div>
        
        <div class="test-list">
  `;

  module.tests.forEach(test => {
    const statusClass = test.status.toLowerCase();
    const statusSymbol = test.status === 'PASSED' ? '✓' : test.status === 'FAILED' ? '✗' : '⏸';
    
    html += `
      <div class="test-item ${statusClass}" data-module="${moduleId}" data-test-item data-status="${test.status}">
          <div class="test-status ${statusClass}">${statusSymbol}</div>
          <div class="test-info">
              <div class="test-id">${test.id} <span class="test-category">${test.category}</span></div>
              <div class="test-name">${test.name}</div>
          </div>
          <div class="test-duration">${test.duration}ms</div>
      </div>
    `;
  });

  html += `
        </div>
    </div>
  `;

  return html;
}

function main() {
  const resultsFile = path.join(__dirname, 'test-results', 'latest-results.json');
  
  if (!fs.existsSync(resultsFile)) {
    console.error('❌ No test results found. Run tests first.');
    process.exit(1);
  }

  const testResults = JSON.parse(fs.readFileSync(resultsFile, 'utf8'));
  const htmlContent = generateHTMLReport(testResults);
  
  const reportDir = path.join(__dirname, 'test-reports');
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }

  const reportFile = path.join(reportDir, 'test-report.html');
  fs.writeFileSync(reportFile, htmlContent);
  
  console.log('\n✅ HTML Report generated successfully!');
  console.log(`📄 Report saved to: ${reportFile}`);
  console.log(`🌐 Open in browser: file://${reportFile}`);
}

if (require.main === module) {
  main();
}

module.exports = { generateHTMLReport };
