const fs = require('fs');
const path = require('path');
const ExcelJS = require('exceljs');

const RESULTS_DIR = path.join(__dirname, '../reports/test-results');
const MASTER_EXCEL = path.join(__dirname, '../reports/Master_Test_Report.xlsx');
const MASTER_JSON = path.join(__dirname, '../reports/test-results/master-results.json');
const MASTER_HTML = path.join(__dirname, '../reports/Master_Test_Report.html');

async function loadAllTestResults() {
  console.log('📂 Loading all test results...\n');
  
  const allResults = {};
  const files = fs.readdirSync(RESULTS_DIR).filter(f => f.endsWith('.json') && f !== 'master-results.json');
  
  for (const file of files) {
    try {
      const filePath = path.join(RESULTS_DIR, file);
      const data = fs.readFileSync(filePath, 'utf8');
      const parsed = JSON.parse(data);
      
      const moduleName = file.replace('-results.json', '');
      
      if (parsed.tests && Array.isArray(parsed.tests)) {
        allResults[moduleName] = {
          totalTests: parsed.totalTests || parsed.tests.length,
          passed: parsed.passed || parsed.tests.filter(t => t.status === 'PASS').length,
          failed: parsed.failed || parsed.tests.filter(t => t.status === 'FAIL').length,
          successRate: parsed.successRate || '0%',
          tests: parsed.tests,
          timestamp: parsed.timestamp || new Date().toISOString()
        };
        
        console.log(`✓ ${moduleName.toUpperCase()}`);
        console.log(`  Tests: ${allResults[moduleName].totalTests} | Passed: ${allResults[moduleName].passed} | Failed: ${allResults[moduleName].failed}`);
      }
    } catch (error) {
      console.warn(`⚠️  Could not load ${file}: ${error.message}`);
    }
  }
  
  return allResults;
}

async function createMasterExcel(allResults) {
  console.log('\n📊 Creating Master Excel Report...\n');
  
  const workbook = new ExcelJS.Workbook();
  
  // Create Summary Sheet
  const summarySheet = workbook.addWorksheet('Summary', { views: [{ state: 'frozen', xSplit: 0, ySplit: 1 }] });
  
  summarySheet.columns = [
    { header: 'Module', key: 'module', width: 20, style: { font: { bold: true } } },
    { header: 'Total Tests', key: 'total', width: 15, style: { font: { bold: true } } },
    { header: 'Passed', key: 'passed', width: 15, style: { font: { bold: true } } },
    { header: 'Failed', key: 'failed', width: 15, style: { font: { bold: true } } },
    { header: 'Success Rate', key: 'successRate', width: 15, style: { font: { bold: true } } },
    { header: 'Status', key: 'status', width: 15, style: { font: { bold: true } } }
  ];
  
  let totalTests = 0, totalPassed = 0, totalFailed = 0;
  
  for (const [module, data] of Object.entries(allResults)) {
    const moduleTotal = data.totalTests;
    const modulePassed = data.passed;
    const moduleFailed = data.failed;
    const successRate = ((modulePassed / moduleTotal) * 100).toFixed(2);
    
    totalTests += moduleTotal;
    totalPassed += modulePassed;
    totalFailed += moduleFailed;
    
    const row = summarySheet.addRow({
      module: module.toUpperCase(),
      total: moduleTotal,
      passed: modulePassed,
      failed: moduleFailed,
      successRate: successRate + '%',
      status: moduleFailed === 0 ? '✓ PASS' : '✗ FAIL'
    });
    
    // Color code
    if (moduleFailed === 0) {
      row.getCell('status').fill = { type: 'pattern', pattern: 'solid', fgColor: { rgb: '92D050' } };
    } else {
      row.getCell('status').fill = { type: 'pattern', pattern: 'solid', fgColor: { rgb: 'FF6B6B' } };
    }
  }
  
  // Add totals row
  const totalRow = summarySheet.addRow({
    module: 'TOTAL',
    total: totalTests,
    passed: totalPassed,
    failed: totalFailed,
    successRate: ((totalPassed / totalTests) * 100).toFixed(2) + '%',
    status: totalFailed === 0 ? '✓ ALL PASS' : '✗ SOME FAILED'
  });
  
  // Format total row
  totalRow.font = { bold: true, size: 12 };
  totalRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { rgb: 'D3D3D3' } };
  totalRow.getCell('status').fill = { type: 'pattern', pattern: 'solid', fgColor: { rgb: '92D050' } };
  
  // Create detailed sheets for each module
  for (const [module, data] of Object.entries(allResults)) {
    const sheet = workbook.addWorksheet(module.toUpperCase(), { views: [{ state: 'frozen', xSplit: 0, ySplit: 1 }] });
    
    sheet.columns = [
      { header: 'Test #', key: 'id', width: 8 },
      { header: 'Test Name', key: 'name', width: 40 },
      { header: 'Status', key: 'status', width: 12 },
      { header: 'Details', key: 'details', width: 50 },
      { header: 'Timestamp', key: 'timestamp', width: 25 }
    ];
    
    data.tests.forEach((test, idx) => {
      const testRow = sheet.addRow({
        id: idx + 1,
        name: test.name,
        status: test.status,
        details: test.details || '-',
        timestamp: test.timestamp ? new Date(test.timestamp).toLocaleString() : '-'
      });
      
      // Color code status
      if (test.status === 'PASS') {
        testRow.getCell('status').fill = { type: 'pattern', pattern: 'solid', fgColor: { rgb: '92D050' } };
        testRow.getCell('status').font = { bold: true, color: { rgb: '000000' } };
      } else if (test.status === 'FAIL') {
        testRow.getCell('status').fill = { type: 'pattern', pattern: 'solid', fgColor: { rgb: 'FF6B6B' } };
        testRow.getCell('status').font = { bold: true, color: { rgb: 'FFFFFF' } };
      }
    });
  }
  
  await workbook.xlsx.writeFile(MASTER_EXCEL);
  
  console.log(`✅ Master Excel Report Created`);
  console.log(`   File: ${MASTER_EXCEL}`);
  console.log(`   Total Tests: ${totalTests}`);
  console.log(`   Total Passed: ${totalPassed}`);
  console.log(`   Total Failed: ${totalFailed}`);
  
  return { totalTests, totalPassed, totalFailed };
}

function createMasterJSON(allResults, stats) {
  console.log('\n📄 Creating Master JSON Report...\n');
  
  const masterData = {
    summary: {
      totalTests: stats.totalTests,
      passedTests: stats.totalPassed,
      failedTests: stats.totalFailed,
      passRate: ((stats.totalPassed / stats.totalTests) * 100).toFixed(2),
      executedAt: new Date().toISOString()
    },
    modules: {}
  };
  
  for (const [module, data] of Object.entries(allResults)) {
    masterData.modules[module] = {
      totalTests: data.totalTests,
      passed: data.passed,
      failed: data.failed,
      successRate: data.successRate,
      tests: data.tests
    };
  }
  
  fs.writeFileSync(MASTER_JSON, JSON.stringify(masterData, null, 2));
  
  console.log(`✅ Master JSON Report Created`);
  console.log(`   File: ${MASTER_JSON}`);
}

function createMasterHTML(allResults, stats) {
  console.log('\n🌐 Creating Master HTML Report...\n');
  
  const modules = Object.entries(allResults).map(([name, data]) => ({
    name: name.toUpperCase(),
    totalTests: data.totalTests,
    passed: data.passed,
    failed: data.failed,
    successRate: ((data.passed / data.totalTests) * 100).toFixed(2),
    tests: data.tests
  }));
  
  const overallRate = ((stats.totalPassed / stats.totalTests) * 100).toFixed(2);
  
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Master Test Report - Vedak CRM</title>
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
        }
        
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 40px;
            border-radius: 10px;
            margin-bottom: 30px;
            text-align: center;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        }
        
        .header h1 {
            font-size: 2.5em;
            margin-bottom: 10px;
        }
        
        .header p {
            font-size: 1.1em;
            opacity: 0.9;
            margin-bottom: 20px;
        }
        
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
            margin-bottom: 30px;
        }
        
        .stat-card {
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            text-align: center;
        }
        
        .stat-card h3 {
            color: #666;
            font-size: 0.9em;
            margin-bottom: 10px;
        }
        
        .stat-card .value {
            font-size: 2.5em;
            font-weight: bold;
            color: #667eea;
        }
        
        .stat-card.passed .value {
            color: #28a745;
        }
        
        .stat-card.failed .value {
            color: #dc3545;
        }
        
        .stat-card.rate .value {
            color: #667eea;
        }
        
        .filters {
            display: flex;
            gap: 10px;
            margin-bottom: 30px;
            flex-wrap: wrap;
        }
        
        .filter-btn {
            padding: 10px 20px;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-weight: bold;
            transition: all 0.3s ease;
            background: white;
            color: #667eea;
            border: 2px solid #667eea;
        }
        
        .filter-btn.active {
            background: #667eea;
            color: white;
        }
        
        .filter-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }
        
        .modules-container {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        
        .module-card {
            background: white;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
            transition: transform 0.3s ease;
        }
        
        .module-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 6px 20px rgba(0,0,0,0.15);
        }
        
        .module-header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .module-header h3 {
            font-size: 1.3em;
        }
        
        .module-stats {
            padding: 15px;
        }
        
        .module-stat-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid #eee;
        }
        
        .module-stat-row:last-child {
            border-bottom: none;
        }
        
        .module-stat-label {
            font-weight: 600;
            color: #333;
        }
        
        .module-stat-value {
            font-weight: bold;
            color: #667eea;
        }
        
        .module-stat-value.pass {
            color: #28a745;
        }
        
        .module-stat-value.fail {
            color: #dc3545;
        }
        
        .test-list {
            max-height: 400px;
            overflow-y: auto;
            padding: 15px;
            background: #f9f9f9;
        }
        
        .test-item {
            padding: 10px;
            margin-bottom: 8px;
            border-radius: 5px;
            background: white;
            border-left: 4px solid #667eea;
            display: flex;
            justify-content: space-between;
            font-size: 0.9em;
        }
        
        .test-item.pass {
            border-left-color: #28a745;
            background: #f0f9f7;
        }
        
        .test-item.fail {
            border-left-color: #dc3545;
            background: #fdf0f0;
        }
        
        .test-name {
            flex: 1;
        }
        
        .test-status {
            font-weight: bold;
            padding: 3px 8px;
            border-radius: 3px;
            font-size: 0.8em;
        }
        
        .test-status.pass {
            background: #28a745;
            color: white;
        }
        
        .test-status.fail {
            background: #dc3545;
            color: white;
        }
        
        .progress-container {
            margin-top: 15px;
        }
        
        .progress-bar {
            width: 100%;
            height: 8px;
            background: #e0e0e0;
            border-radius: 4px;
            overflow: hidden;
        }
        
        .progress-fill {
            height: 100%;
            background: linear-gradient(90deg, #28a745, #20c997);
            transition: width 0.3s ease;
        }
        
        .footer {
            text-align: center;
            color: white;
            padding: 20px;
            margin-top: 30px;
        }
        
        .timestamp {
            font-size: 0.9em;
            color: rgba(255,255,255,0.8);
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🧪 Master Test Report</h1>
            <p>Vedak CRM - Comprehensive Testing Dashboard</p>
            <p class="timestamp">Generated: ${new Date().toLocaleString()}</p>
        </div>
        
        <div class="stats-grid">
            <div class="stat-card">
                <h3>Total Tests</h3>
                <div class="value">${stats.totalTests}</div>
            </div>
            <div class="stat-card passed">
                <h3>Passed</h3>
                <div class="value">${stats.totalPassed}</div>
            </div>
            <div class="stat-card failed">
                <h3>Failed</h3>
                <div class="value">${stats.totalFailed}</div>
            </div>
            <div class="stat-card rate">
                <h3>Success Rate</h3>
                <div class="value">${overallRate}%</div>
            </div>
        </div>
        
        <div class="filters">
            <button class="filter-btn active" onclick="filterModules('all')">All Modules</button>
            <button class="filter-btn" onclick="filterModules('passed')">Passed Tests</button>
            <button class="filter-btn" onclick="filterModules('failed')">Failed Tests</button>
        </div>
        
        <div class="modules-container" id="modulesContainer">
            ${modules.map(module => `
                <div class="module-card" data-filter="module">
                    <div class="module-header">
                        <h3>${module.name}</h3>
                        <span>${module.passed}/${module.totalTests}</span>
                    </div>
                    <div class="module-stats">
                        <div class="module-stat-row">
                            <span class="module-stat-label">Total Tests:</span>
                            <span class="module-stat-value">${module.totalTests}</span>
                        </div>
                        <div class="module-stat-row">
                            <span class="module-stat-label">Passed:</span>
                            <span class="module-stat-value pass">${module.passed}</span>
                        </div>
                        <div class="module-stat-row">
                            <span class="module-stat-label">Failed:</span>
                            <span class="module-stat-value fail">${module.failed}</span>
                        </div>
                        <div class="module-stat-row">
                            <span class="module-stat-label">Success Rate:</span>
                            <span class="module-stat-value">${module.successRate}%</span>
                        </div>
                        <div class="progress-container">
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${module.successRate}%"></div>
                            </div>
                        </div>
                    </div>
                    <div class="test-list">
                        ${module.tests.map(test => `
                            <div class="test-item ${test.status === 'PASS' ? 'pass' : 'fail'}">
                                <span class="test-name">${test.name}</span>
                                <span class="test-status ${test.status === 'PASS' ? 'pass' : 'fail'}">${test.status}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `).join('')}
        </div>
        
        <div class="footer">
            <p>Vedak CRM Automated Testing Suite</p>
            <p class="timestamp">Report Generated: ${new Date().toLocaleString()}</p>
        </div>
    </div>
    
    <script>
        function filterModules(type) {
            const containers = document.querySelectorAll('.modules-container')[0];
            const cards = containers.querySelectorAll('.module-card');
            
            cards.forEach(card => {
                const testItems = card.querySelectorAll('.test-item');
                if (type === 'all') {
                    card.style.display = 'block';
                } else if (type === 'passed') {
                    const hasPass = Array.from(testItems).some(item => item.classList.contains('pass'));
                    card.style.display = hasPass ? 'block' : 'none';
                } else if (type === 'failed') {
                    const hasFail = Array.from(testItems).some(item => item.classList.contains('fail'));
                    card.style.display = hasFail ? 'block' : 'none';
                }
            });
            
            // Update button states
            document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
            event.target.classList.add('active');
        }
    </script>
</body>
</html>`;
  
  fs.writeFileSync(MASTER_HTML, html);
  
  console.log(`✅ Master HTML Report Created`);
  console.log(`   File: ${MASTER_HTML}`);
}

async function main() {
  try {
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║         GENERATING COMPREHENSIVE MASTER TEST REPORT        ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');
    
    const allResults = await loadAllTestResults();
    const stats = await createMasterExcel(allResults);
    createMasterJSON(allResults, stats);
    createMasterHTML(allResults, stats);
    
    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║              ✅ ALL REPORTS GENERATED SUCCESSFULLY         ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');
    
    console.log('📊 Summary:');
    console.log(`   Total Tests: ${stats.totalTests}`);
    console.log(`   Total Passed: ${stats.totalPassed} ✓`);
    console.log(`   Total Failed: ${stats.totalFailed} ✗`);
    console.log(`   Overall Success Rate: ${((stats.totalPassed / stats.totalTests) * 100).toFixed(2)}%\n`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();
