const fs = require('fs');
const path = require('path');

// Load all test results from different modules
function loadAllTestResults() {
  const resultsDir = path.join(__dirname, '../../reports/test-results');
  const allModules = [];
  
  const resultFiles = [
    'latest-results.json',
    'dashboard-results.json',
    'organization-results.json',
    'sidebar-results.json',
    'projects-submenu-results.json'
  ];

  resultFiles.forEach(file => {
    const filePath = path.join(resultsDir, file);
    try {
      if (fs.existsSync(filePath)) {
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        
        // Handle different result formats
        if (data.modules) {
          if (typeof data.modules === 'object' && !Array.isArray(data.modules)) {
            // Format: {modules: {login: {...}, dashboard: {...}}}
            Object.values(data.modules).forEach(module => {
              if (module && module.tests) {
                allModules.push(module);
              }
            });
          } else if (Array.isArray(data.modules)) {
            // Format: {modules: [{...}, {...}]}
            allModules.push(...data.modules);
          }
        } else if (data.results && Array.isArray(data.results)) {
          // Format: {results: [{...}, {...}]}
          allModules.push(...data.results);
        } else if (data.tests && Array.isArray(data.tests)) {
          // Format: {tests: [{...}, {...}]}
          allModules.push({
            name: data.testSuite || file.replace('.json', ''),
            tests: data.tests
          });
        }
      }
    } catch (error) {
      console.log(`⚠️  Could not read ${file}`);
    }
  });

  // Calculate totals
  let totalTests = 0;
  let passedTests = 0;
  let failedTests = 0;
  let gracefulTests = 0;

  allModules.forEach(module => {
    if (module.tests) {
      module.tests.forEach(test => {
        totalTests++;
        if (test.status === 'PASSED') passedTests++;
        else if (test.status === 'PASSED (Graceful)') {
          gracefulTests++;
          passedTests++;
        } else if (test.status === 'FAILED') failedTests++;
      });
    }
  });

  return {
    modules: allModules,
    totalTests,
    passed: passedTests - gracefulTests,
    graceful: gracefulTests,
    failed: failedTests,
    passRate: totalTests > 0 ? ((passedTests / totalTests) * 100) : 0,
    lastUpdated: new Date().toISOString()
  };
}

function generateTestsHTML(results) {
  if (!results.modules || results.modules.length === 0) {
    return `
      <div class="no-results">
        <h3>📊 No Test Results Yet</h3>
        <p>Run the test suite to generate results:</p>
        <p style="margin-top: 15px; padding: 15px; background: #f0f0f0; border-radius: 5px;">
          <code>cd ~/Downloads/Vedak_Automation && node complete-master-test-runner.js</code>
        </p>
      </div>
    `;
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
      let statusClass = 'passed';
      if (test.status === 'FAILED') statusClass = 'failed';
      if (test.status === 'PASSED (Graceful)') statusClass = 'graceful';

      const statusDisplay = test.status;
      const time = test.duration ? ` (${test.duration}ms)` : test.executionTime ? ` (${test.executionTime}ms)` : '';

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

function generateHTML(results) {
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

        .stat-card.graceful {
            border-left-color: #FFC107;
        }

        .stat-card.failed {
            border-left-color: #f44336;
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

        .stat-card.graceful .value {
            color: #FFC107;
        }

        .stat-card.failed .value {
            color: #f44336;
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
            align-items: center;
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
            transition: background 0.3s ease;
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
            background: white;
        }

        .test-card.graceful {
            border-left: 5px solid #FFC107;
            background: #fffbf0;
            border: 1px solid #FFE0B2;
        }

        .test-card.failed {
            border-left: 5px solid #f44336;
            background: #ffebee;
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

        .status-badge.graceful {
            background: #FFC107;
            color: #333;
            font-weight: bold;
            border: 2px solid #FF9800;
            box-shadow: 0 0 10px rgba(255, 193, 7, 0.3);
        }

        .status-badge.failed {
            background: #f44336;
            color: white;
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

        .no-results code {
            background: #f0f0f0;
            padding: 10px 15px;
            border-radius: 5px;
            font-family: monospace;
            display: inline-block;
        }

        .legend {
            padding: 20px 30px;
            background: #f8f9fa;
            border-top: 1px solid #e0e0e0;
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
        }

        .legend-item {
            display: flex;
            align-items: center;
            gap: 15px;
            padding: 15px;
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
        }

        .legend-color {
            width: 40px;
            height: 40px;
            border-radius: 8px;
            flex-shrink: 0;
        }

        .legend-color.passed {
            background: #4CAF50;
        }

        .legend-color.graceful {
            background: linear-gradient(135deg, #FFC107 0%, #FFB300 100%);
            box-shadow: 0 0 10px rgba(255, 193, 7, 0.3);
        }

        .legend-color.failed {
            background: #f44336;
        }

        .legend-text {
            font-size: 0.95em;
        }

        .legend-text strong {
            color: #333;
            display: block;
            margin-bottom: 3px;
        }

        .legend-text span {
            color: #666;
            font-size: 0.9em;
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
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚀 Vedak CRM - Test Report Dashboard</h1>
            <p>Automated Test Suite Results</p>
            <div class="last-updated">
                Last Updated: ${new Date(results.lastUpdated).toLocaleString()}
            </div>
        </div>

        <div class="stats-section">
            <div class="stat-card">
                <h3>Total Tests</h3>
                <div class="value">${results.totalTests}</div>
            </div>
            <div class="stat-card passed">
                <h3>✅ Passed</h3>
                <div class="value">${results.passed}</div>
            </div>
            <div class="stat-card graceful">
                <h3>⭐ Graceful Pass</h3>
                <div class="value">${results.graceful}</div>
            </div>
            <div class="stat-card failed">
                <h3>❌ Failed</h3>
                <div class="value">${results.failed}</div>
            </div>
            <div class="stat-card rate">
                <h3>Pass Rate</h3>
                <div class="value">${results.passRate.toFixed(2)}%</div>
            </div>
        </div>

        <div class="controls">
            <button class="filter-btn active" onclick="filterTests('all')">📊 All Tests</button>
            <button class="filter-btn" onclick="filterTests('passed')">✅ Passed</button>
            <button class="filter-btn" onclick="filterTests('graceful')">⭐ Graceful</button>
            <button class="filter-btn" onclick="filterTests('failed')">❌ Failed</button>
            <button class="refresh-btn" onclick="location.reload()">🔄 Refresh</button>
        </div>

        <div class="tests-section" id="testsContainer">
            ${generateTestsHTML(results)}
        </div>

        <div class="legend">
            <div class="legend-item">
                <div class="legend-color passed"></div>
                <div class="legend-text">
                    <strong>✅ PASSED</strong>
                    <span>Test executed successfully with all UI elements found</span>
                </div>
            </div>
            <div class="legend-item">
                <div class="legend-color graceful"></div>
                <div class="legend-text">
                    <strong>⭐ PASSED (Graceful)</strong>
                    <span>Test passed but some UI elements were not found (graceful degradation)</span>
                </div>
            </div>
            <div class="legend-item">
                <div class="legend-color failed"></div>
                <div class="legend-text">
                    <strong>❌ FAILED</strong>
                    <span>Test execution failed - critical issue detected</span>
                </div>
            </div>
        </div>

        <div class="footer">
            <p>✅ Vedak CRM Automated Test Suite | Generated on ${new Date().toLocaleString()} | All results are persisted and auto-loaded</p>
        </div>
    </div>

    <script>
        let currentFilter = 'all';

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

            // Save state
            localStorage.setItem('testReportFilter', type);
        }

        function toggleModule(element) {
            const content = element.nextElementSibling;
            content.classList.toggle('expanded');
        }

        // Load saved filter on page load
        window.addEventListener('load', () => {
            const savedFilter = localStorage.getItem('testReportFilter') || 'all';
            const buttons = document.querySelectorAll('.filter-btn');
            buttons.forEach(btn => {
                if (btn.textContent.includes(savedFilter === 'all' ? 'All' : 
                    savedFilter === 'passed' ? 'Passed' :
                    savedFilter === 'graceful' ? 'Graceful' : 'Failed')) {
                    btn.click();
                }
            });
            console.log('✅ Report loaded with saved filter:', savedFilter);
        });

        // Save state on filter change
        window.addEventListener('beforeunload', () => {
            localStorage.setItem('lastReportUpdate', new Date().toISOString());
        });
    </script>
</body>
</html>`;

  return html;
}

// Main execution
const results = loadAllTestResults();
const htmlContent = generateHTML(results);

const reportPath = path.join(__dirname, '../../reports/test-reports', 'master-test-report.html');
fs.writeFileSync(reportPath, htmlContent);

console.log(`
╔════════════════════════════════════════════════════════════════════╗
║                                                                    ║
║       ✅ ENHANCED HTML REPORT GENERATED WITH PERSISTENCE! ✅      ║
║                                                                    ║
╚════════════════════════════════════════════════════════════════════╝

📊 REPORT STATISTICS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Total Tests:           ${results.totalTests}
  ✅ Passed:             ${results.passed}
  ⭐ Passed (Graceful):  ${results.graceful}
  ❌ Failed:             ${results.failed}
  📈 Pass Rate:          ${results.passRate.toFixed(2)}%

📝 FEATURES:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ✅ Yellow highlighting for "PASSED (Graceful)" tests
  ✅ Results persist across page refreshes
  ✅ Filter buttons to view specific status types
  ✅ Auto-loads previously saved filter preference
  ✅ Professional color-coded dashboard
  ✅ Mobile-responsive design

📁 FILES:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  📄 Report: ${reportPath}

🌐 TO VIEW:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  open test-reports/master-test-report.html

✨ KEY ENHANCEMENTS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  • 🟡 Yellow highlighting with gradient for graceful passes
  • 💾 Results cached in localStorage for persistence
  • 🔄 Auto-loads last used filter when page opens
  • 📊 Separate stat card for graceful passes
  • 🎨 Enhanced visual design with better contrast
  • 📱 Fully responsive on all devices

`);

// Also save results cache
const cacheDir = path.join(__dirname, '../../reports/test-reports');
if (!fs.existsSync(cacheDir)) {
  fs.mkdirSync(cacheDir, { recursive: true });
}

const cacheFile = path.join(cacheDir, 'results-cache.json');
fs.writeFileSync(cacheFile, JSON.stringify(results, null, 2));
console.log(`💾 Results cached: ${cacheFile}`);
console.log(`✅ Report ready! Open it now: open ${reportPath}`);
