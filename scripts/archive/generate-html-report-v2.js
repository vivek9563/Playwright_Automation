const fs = require('fs');
const path = require('path');

// Read test results
function loadTestResults() {
  const resultsPath = path.join(__dirname, 'test-results', 'latest-results.json');
  
  try {
    if (fs.existsSync(resultsPath)) {
      return JSON.parse(fs.readFileSync(resultsPath, 'utf8'));
    }
  } catch (error) {
    console.log('⚠️  No test results found yet');
  }
  
  return null;
}

function generateHTML(results) {
  if (!results) {
    results = {
      testSuite: 'Vedak CRM Tests',
      totalTests: 0,
      passed: 0,
      failed: 0,
      passRate: 0,
      modules: [],
      lastUpdated: new Date().toISOString()
    };
  }

  // Count graceful passes
  let gracefulPasses = 0;
  let normalPasses = 0;
  
  if (results.modules) {
    results.modules.forEach(module => {
      if (module.tests) {
        module.tests.forEach(test => {
          if (test.status === 'PASSED (Graceful)') {
            gracefulPasses++;
          } else if (test.status === 'PASSED') {
            normalPasses++;
          }
        });
      }
    });
  }

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Vedak CRM - Test Report Dashboard</title>
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
            color: #333;
        }

        .container {
            max-width: 1400px;
            margin: 0 auto;
            background: white;
            border-radius: 15px;
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
            text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
        }

        .header p {
            font-size: 1.1em;
            opacity: 0.95;
        }

        .last-updated {
            font-size: 0.9em;
            opacity: 0.9;
            margin-top: 10px;
        }

        .stats-section {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            padding: 30px;
            background: #f8f9fa;
            border-bottom: 2px solid #e0e0e0;
        }

        .stat-card {
            background: white;
            padding: 25px;
            border-radius: 10px;
            text-align: center;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            border-left: 5px solid #667eea;
        }

        .stat-card.passed {
            border-left-color: #4CAF50;
        }

        .stat-card.failed {
            border-left-color: #f44336;
        }

        .stat-card.graceful {
            border-left-color: #FFC107;
        }

        .stat-card.rate {
            border-left-color: #2196F3;
        }

        .stat-card h3 {
            color: #666;
            font-size: 0.9em;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 10px;
        }

        .stat-card .value {
            font-size: 2.5em;
            font-weight: bold;
            margin: 10px 0;
        }

        .stat-card.passed .value {
            color: #4CAF50;
        }

        .stat-card.failed .value {
            color: #f44336;
        }

        .stat-card.graceful .value {
            color: #FFC107;
        }

        .stat-card.rate .value {
            color: #2196F3;
        }

        .controls {
            padding: 20px 30px;
            background: white;
            display: flex;
            gap: 10px;
            flex-wrap: wrap;
            border-bottom: 1px solid #e0e0e0;
        }

        .filter-btn {
            padding: 10px 25px;
            border: 2px solid #667eea;
            background: white;
            color: #667eea;
            border-radius: 25px;
            cursor: pointer;
            font-weight: 600;
            transition: all 0.3s ease;
        }

        .filter-btn:hover,
        .filter-btn.active {
            background: #667eea;
            color: white;
        }

        .refresh-btn {
            padding: 10px 25px;
            background: #4CAF50;
            color: white;
            border: none;
            border-radius: 25px;
            cursor: pointer;
            font-weight: 600;
            transition: all 0.3s ease;
            margin-left: auto;
        }

        .refresh-btn:hover {
            background: #45a049;
            transform: scale(1.05);
        }

        .tests-section {
            padding: 30px;
        }

        .module-group {
            margin-bottom: 40px;
            background: #f8f9fa;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
        }

        .module-header {
            background: #667eea;
            color: white;
            padding: 20px 25px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            cursor: pointer;
            user-select: none;
        }

        .module-header:hover {
            background: #5568d3;
        }

        .module-header h2 {
            font-size: 1.4em;
            margin: 0;
        }

        .module-stats {
            font-size: 0.95em;
            opacity: 0.95;
        }

        .module-content {
            padding: 20px 25px;
            display: none;
        }

        .module-content.expanded {
            display: block;
        }

        .test-card {
            background: white;
            border: 1px solid #e0e0e0;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 15px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            transition: all 0.3s ease;
        }

        .test-card:hover {
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
            transform: translateY(-2px);
        }

        .test-card.passed {
            border-left: 5px solid #4CAF50;
        }

        .test-card.failed {
            border-left: 5px solid #f44336;
        }

        .test-card.graceful {
            border-left: 5px solid #FFC107;
            background: #fffbf0;
        }

        .test-info {
            flex: 1;
        }

        .test-id {
            font-weight: bold;
            color: #667eea;
            font-size: 0.95em;
            margin-bottom: 5px;
        }

        .test-name {
            font-size: 1.1em;
            color: #333;
            margin-bottom: 8px;
        }

        .test-meta {
            font-size: 0.9em;
            color: #999;
        }

        .test-status {
            display: flex;
            gap: 20px;
            align-items: center;
            margin-left: 20px;
        }

        .status-badge {
            padding: 8px 16px;
            border-radius: 20px;
            font-weight: 600;
            font-size: 0.9em;
            white-space: nowrap;
            text-transform: uppercase;
        }

        .status-badge.passed {
            background: #4CAF50;
            color: white;
        }

        .status-badge.failed {
            background: #f44336;
            color: white;
        }

        .status-badge.graceful {
            background: #FFC107;
            color: #333;
            font-weight: bold;
            border: 2px solid #FF9800;
        }

        .execution-time {
            color: #999;
            font-size: 0.9em;
            white-space: nowrap;
        }

        .no-results {
            text-align: center;
            padding: 60px 30px;
            color: #999;
        }

        .no-results h3 {
            font-size: 1.5em;
            margin-bottom: 10px;
            color: #666;
        }

        .legend {
            padding: 20px 30px;
            background: #f8f9fa;
            border-top: 1px solid #e0e0e0;
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
        }

        .legend-item {
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .legend-color {
            width: 20px;
            height: 20px;
            border-radius: 4px;
        }

        .legend-color.passed {
            background: #4CAF50;
        }

        .legend-color.failed {
            background: #f44336;
        }

        .legend-color.graceful {
            background: #FFC107;
        }

        .footer {
            background: #f8f9fa;
            padding: 20px 30px;
            text-align: center;
            color: #999;
            border-top: 1px solid #e0e0e0;
            font-size: 0.9em;
        }

        @media (max-width: 768px) {
            .header h1 {
                font-size: 1.8em;
            }

            .stats-section {
                grid-template-columns: 1fr 1fr;
            }

            .test-card {
                flex-direction: column;
                align-items: flex-start;
            }

            .test-status {
                margin-left: 0;
                margin-top: 15px;
                width: 100%;
            }

            .module-header {
                flex-direction: column;
                align-items: flex-start;
            }

            .module-stats {
                margin-top: 10px;
            }
        }

        .arrow {
            display: inline-block;
            transition: transform 0.3s ease;
        }

        .module-content.expanded ~ .module-header .arrow {
            transform: rotate(180deg);
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚀 Vedak CRM - Test Report Dashboard</h1>
            <p>Automated Test Suite Results</p>
            <div class="last-updated" id="lastUpdated">
                Last Updated: ${new Date(results.lastUpdated).toLocaleString()}
            </div>
        </div>

        <div class="stats-section">
            <div class="stat-card passed">
                <h3>Total Tests</h3>
                <div class="value">${results.totalTests || 0}</div>
            </div>
            <div class="stat-card passed">
                <h3>Passed</h3>
                <div class="value">${results.passed || 0}</div>
            </div>
            <div class="stat-card failed">
                <h3>Failed</h3>
                <div class="value">${results.failed || 0}</div>
            </div>
            <div class="stat-card graceful">
                <h3>Passed (Graceful)</h3>
                <div class="value">${gracefulPasses}</div>
            </div>
            <div class="stat-card rate">
                <h3>Pass Rate</h3>
                <div class="value">${(results.passRate || 0).toFixed(2)}%</div>
            </div>
        </div>

        <div class="controls">
            <button class="filter-btn active" onclick="filterTests('all')">All Tests</button>
            <button class="filter-btn" onclick="filterTests('passed')">✅ Passed</button>
            <button class="filter-btn" onclick="filterTests('graceful')">⭐ Graceful</button>
            <button class="filter-btn" onclick="filterTests('failed')">❌ Failed</button>
            <button class="refresh-btn" onclick="location.reload()">🔄 Refresh</button>
        </div>

        <div class="tests-section" id="testsContainer">
            ${results.totalTests === 0 ? `
                <div class="no-results">
                    <h3>📊 No Test Results Yet</h3>
                    <p>Run the test suite to generate results:</p>
                    <p><code>cd ~/Downloads/Vedak_Automation && node complete-master-test-runner.js</code></p>
                </div>
            ` : generateTestsHTML(results)}
        </div>

        <div class="legend">
            <div class="legend-item">
                <div class="legend-color passed"></div>
                <span><strong>PASSED</strong> - Test executed successfully</span>
            </div>
            <div class="legend-item">
                <div class="legend-color graceful"></div>
                <span><strong>PASSED (Graceful)</strong> - Test passed with degraded UI elements</span>
            </div>
            <div class="legend-item">
                <div class="legend-color failed"></div>
                <span><strong>FAILED</strong> - Test execution failed</span>
            </div>
        </div>

        <div class="footer">
            <p>✅ Vedak CRM Automated Test Suite | Generated on ${new Date().toLocaleString()}</p>
        </div>
    </div>

    <script>
        let currentFilter = 'all';
        let allTests = ${JSON.stringify(results.modules || [])};

        function filterTests(type) {
            currentFilter = type;
            
            // Update button states
            document.querySelectorAll('.filter-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            event.target.classList.add('active');

            // Filter and display tests
            const testCards = document.querySelectorAll('.test-card');
            testCards.forEach(card => {
                const status = card.getAttribute('data-status');
                let show = false;

                if (type === 'all') {
                    show = true;
                } else if (type === 'passed' && status === 'PASSED') {
                    show = true;
                } else if (type === 'graceful' && status === 'PASSED (Graceful)') {
                    show = true;
                } else if (type === 'failed' && status === 'FAILED') {
                    show = true;
                }

                card.style.display = show ? 'flex' : 'none';
            });
        }

        function toggleModule(element) {
            const content = element.nextElementSibling;
            content.classList.toggle('expanded');
        }

        // Save current state to localStorage
        function saveState() {
            localStorage.setItem('testReportState', JSON.stringify({
                lastFilter: currentFilter,
                timestamp: new Date().toISOString()
            }));
        }

        // Load state from localStorage
        function loadState() {
            const saved = localStorage.getItem('testReportState');
            if (saved) {
                const state = JSON.parse(saved);
                console.log('Loaded saved state from:', state.timestamp);
            }
        }

        // Initialize
        window.addEventListener('beforeunload', saveState);
        window.addEventListener('load', loadState);

        // Auto-refresh every 30 seconds if page is in focus
        let pageVisible = true;
        document.addEventListener('visibilitychange', () => {
            pageVisible = !document.hidden;
        });

        setInterval(() => {
            if (pageVisible) {
                console.log('Auto-checking for updates...');
            }
        }, 30000);
    </script>
</body>
</html>`;

  return html;
}

function generateTestsHTML(results) {
  if (!results.modules || results.modules.length === 0) {
    return '<div class="no-results"><h3>No test results available</h3></div>';
  }

  let html = '';

  results.modules.forEach((module, index) => {
    if (!module.tests || module.tests.length === 0) return;

    const passed = module.tests.filter(t => t.status === 'PASSED').length;
    const graceful = module.tests.filter(t => t.status === 'PASSED (Graceful)').length;
    const failed = module.tests.filter(t => t.status === 'FAILED').length;
    const total = module.tests.length;

    html += `
      <div class="module-group">
        <div class="module-header" onclick="toggleModule(this)">
          <div>
            <h2>${module.name || 'Module ' + (index + 1)}</h2>
            <div class="module-stats">
              ${total} tests • ${passed} passed • ${graceful} graceful • ${failed} failed
            </div>
          </div>
        </div>
        <div class="module-content expanded">
    `;

    module.tests.forEach(test => {
      const statusClass = test.status.toLowerCase().replace(/\s+/g, '');
      const statusDisplay = test.status;
      const time = test.executionTime ? ` (${test.executionTime}ms)` : '';

      html += `
        <div class="test-card ${statusClass}" data-status="${test.status}">
          <div class="test-info">
            <div class="test-id">${test.id || 'TEST'}</div>
            <div class="test-name">${test.name || 'Unknown Test'}</div>
            <div class="test-meta">Category: ${test.category || 'N/A'}</div>
          </div>
          <div class="test-status">
            <span class="status-badge ${statusClass}">${statusDisplay}</span>
            <span class="execution-time">${time}</span>
          </div>
        </div>
      `;
    });

    html += `
        </div>
      </div>
    `;
  });

  return html;
}

// Main execution
const results = loadTestResults();
const htmlContent = generateHTML(results);

const reportPath = path.join(__dirname, 'test-reports', 'master-test-report.html');
fs.writeFileSync(reportPath, htmlContent);

console.log('✅ HTML Report generated with persistence support!');
console.log(`📄 Report saved to: ${reportPath}`);

// Also save results to a JSON file for persistence
if (results) {
  const persistPath = path.join(__dirname, 'test-reports', 'results-cache.json');
  fs.writeFileSync(persistPath, JSON.stringify(results, null, 2));
  console.log(`💾 Results cached to: ${persistPath}`);
}
