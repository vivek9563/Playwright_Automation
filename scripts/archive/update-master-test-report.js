const ExcelJS = require('exceljs');
const fs = require('fs');
const path = require('path');

async function updateMasterTestReport() {
  try {
    console.log('\n╔══════════════════════════════════════════════════════════════╗');
    console.log('║       UPDATING MASTER TEST REPORT WITH ALL MODULES            ║');
    console.log('╚══════════════════════════════════════════════════════════════╝\n');

    // Read all results files
    const dashboardFile = path.join(__dirname, 'test-results/latest-results.json');
    const organizationFile = path.join(__dirname, 'test-results/organization-results.json');
    const sidebarFile = path.join(__dirname, 'test-results/sidebar-results.json');
    const projectsFile = path.join(__dirname, 'test-results/projects-submenu-results.json');

    // Parse Dashboard
    const dashboardData = JSON.parse(fs.readFileSync(dashboardFile, 'utf8'));
    const dashboardTests = [];
    if (dashboardData.modules) {
      Object.keys(dashboardData.modules).forEach(moduleKey => {
        const module = dashboardData.modules[moduleKey];
        if (module.tests) {
          module.tests.forEach(test => {
            dashboardTests.push({
              id: test.id,
              name: test.name,
              category: test.category,
              status: test.status,
              executionTime: test.duration || 0,
              timestamp: test.timestamp
            });
          });
        }
      });
    }

    // Parse Organization (results array)
    const organizationData = JSON.parse(fs.readFileSync(organizationFile, 'utf8'));
    const organizationTests = organizationData.results ? organizationData.results.map(t => ({
      id: t.testId,
      name: t.testName,
      category: t.category,
      status: t.status,
      executionTime: t.executionTime || 0,
      timestamp: t.timestamp
    })) : [];

    // Parse Sidebar (results array)
    const sidebarData = JSON.parse(fs.readFileSync(sidebarFile, 'utf8'));
    const sidebarTests = sidebarData.results ? sidebarData.results.map(t => ({
      id: t.testId,
      name: t.testName,
      category: t.category,
      status: t.status,
      executionTime: t.executionTime || 0,
      timestamp: t.timestamp
    })) : [];

    // Parse Projects
    const projectsData = JSON.parse(fs.readFileSync(projectsFile, 'utf8'));
    const projectsTests = projectsData.tests ? projectsData.tests.map(t => ({
      id: t.id,
      name: t.name,
      category: t.category,
      status: t.status,
      executionTime: t.executionTime || 0,
      timestamp: t.timestamp
    })) : [];

    console.log(`📂 Loaded test results:`);
    console.log(`   ✓ Dashboard: ${dashboardTests.length} tests`);
    console.log(`   ✓ Organization: ${organizationTests.length} tests`);
    console.log(`   ✓ Sidebar Navigation: ${sidebarTests.length} tests`);
    console.log(`   ✓ Projects Submenu: ${projectsTests.length} tests\n`);

    // Load or create workbook
    const masterFileName = 'Master_Test_Report.xlsx';
    const masterFilePath = path.join(__dirname, masterFileName);
    
    let workbook = new ExcelJS.Workbook();
    
    if (fs.existsSync(masterFilePath)) {
      console.log(`📂 Loading existing master file\n`);
      await workbook.xlsx.readFile(masterFilePath);
    }

    // Remove old Master Report sheet and create new
    let worksheet = workbook.getWorksheet('Master Report');
    if (worksheet) {
      workbook.removeWorksheet(worksheet.id);
    }
    worksheet = workbook.addWorksheet('Master Report');
    
    worksheet.columns = [
      { header: 'Module', key: 'module', width: 20 },
      { header: 'Test ID', key: 'testId', width: 18 },
      { header: 'Test Name', key: 'testName', width: 40 },
      { header: 'Category', key: 'category', width: 15 },
      { header: 'Status', key: 'status', width: 12 },
      { header: 'Execution Time (ms)', key: 'executionTime', width: 18 },
      { header: 'Date Executed', key: 'dateExecuted', width: 18 }
    ];

    // Style header
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 12 };
    headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4472C4' } };
    headerRow.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    headerRow.height = 25;

    console.log(`📝 Adding test results to Master Report:\n`);

    // Add all tests
    console.log(`   → Adding ${dashboardTests.length} Dashboard tests`);
    dashboardTests.forEach((test) => {
      addTestRow(worksheet, 'Dashboard', test);
    });

    console.log(`   → Adding ${organizationTests.length} Organization tests`);
    organizationTests.forEach((test) => {
      addTestRow(worksheet, 'Organization', test);
    });

    console.log(`   → Adding ${sidebarTests.length} Sidebar Navigation tests`);
    sidebarTests.forEach((test) => {
      addTestRow(worksheet, 'Sidebar Navigation', test);
    });

    console.log(`   → Adding ${projectsTests.length} Projects Submenu tests`);
    projectsTests.forEach((test) => {
      addTestRow(worksheet, 'Projects Submenu', test);
    });

    // Create Summary sheet
    let summarySheet = workbook.getWorksheet('Summary');
    if (summarySheet) {
      workbook.removeWorksheet(summarySheet.id);
    }
    summarySheet = workbook.addWorksheet('Summary');

    summarySheet.columns = [
      { header: 'Module', key: 'module', width: 25 },
      { header: 'Total Tests', key: 'totalTests', width: 15 },
      { header: 'Passed', key: 'passed', width: 12 },
      { header: 'Failed', key: 'failed', width: 12 },
      { header: 'Pass Rate (%)', key: 'passRate', width: 15 }
    ];

    const summaryHeader = summarySheet.getRow(1);
    summaryHeader.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 12 };
    summaryHeader.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF203864' } };
    summaryHeader.alignment = { horizontal: 'center', vertical: 'middle' };
    summaryHeader.height = 25;

    // Calculate stats
    const modules = [
      { 
        name: 'Dashboard', 
        tests: dashboardTests
      },
      { 
        name: 'Organization', 
        tests: organizationTests
      },
      { 
        name: 'Sidebar Navigation', 
        tests: sidebarTests
      },
      { 
        name: 'Projects Submenu', 
        tests: projectsTests
      }
    ];

    let grandTotal = 0, grandPassed = 0, grandFailed = 0;

    console.log(`\n📊 Summary Statistics:\n`);

    modules.forEach((module) => {
      const total = module.tests.length;
      const passed = module.tests.filter(t => t.status === 'PASSED').length;
      const failed = module.tests.filter(t => t.status === 'FAILED').length;
      const passRate = total > 0 ? ((passed / total) * 100).toFixed(2) : 0;

      const row = summarySheet.addRow({
        module: module.name,
        totalTests: total,
        passed: passed,
        failed: failed,
        passRate: passRate
      });

      grandTotal += total;
      grandPassed += passed;
      grandFailed += failed;

      // Center align and format
      row.getCell('totalTests').alignment = { horizontal: 'center', vertical: 'middle' };
      row.getCell('passed').alignment = { horizontal: 'center', vertical: 'middle' };
      row.getCell('failed').alignment = { horizontal: 'center', vertical: 'middle' };
      row.getCell('passRate').alignment = { horizontal: 'center', vertical: 'middle' };

      if (failed === 0 && total > 0) {
        row.getCell('passRate').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF92D050' } };
        row.getCell('passRate').font = { color: { argb: 'FF006100' }, bold: true };
      }

      row.height = 20;

      console.log(`  ✅ ${module.name.padEnd(25)} - ${passed}/${total} passed (${passRate}%)`);
    });

    // Grand total
    const grandRow = summarySheet.addRow({
      module: 'TOTAL',
      totalTests: grandTotal,
      passed: grandPassed,
      failed: grandFailed,
      passRate: grandTotal > 0 ? ((grandPassed / grandTotal) * 100).toFixed(2) : 0
    });

    grandRow.font = { bold: true, size: 12, color: { argb: 'FFFFFFFF' } };
    grandRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF203864' } };
    grandRow.getCell('totalTests').alignment = { horizontal: 'center', vertical: 'middle' };
    grandRow.getCell('passed').alignment = { horizontal: 'center', vertical: 'middle' };
    grandRow.getCell('failed').alignment = { horizontal: 'center', vertical: 'middle' };
    grandRow.getCell('passRate').alignment = { horizontal: 'center', vertical: 'middle' };
    grandRow.height = 22;

    // Save
    await workbook.xlsx.writeFile(masterFilePath);

    console.log(`\n${'─'.repeat(60)}\n`);
    console.log(`✅ Master Test Report Updated Successfully!\n`);
    console.log(`📊 FILE: ${masterFileName}`);
    console.log(`📁 Location: ~/Downloads/Vedak_Automation/\n`);

    console.log(`📈 FINAL MASTER TEST REPORT SUMMARY:\n`);
    console.log(`   Total Tests: ${grandTotal} ✅`);
    console.log(`   Passed: ${grandPassed} ✅`);
    console.log(`   Failed: ${grandFailed} ❌`);
    console.log(`   Pass Rate: ${grandTotal > 0 ? ((grandPassed / grandTotal) * 100).toFixed(2) : 0}%\n`);

    console.log(`✅ Worksheets:`);
    console.log(`   • Master Report - ${grandTotal} test entries`);
    console.log(`   • Summary - Module breakdown\n`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

function addTestRow(worksheet, moduleName, test) {
  const row = worksheet.addRow({
    module: moduleName,
    testId: test.id || '',
    testName: test.name || '',
    category: test.category || 'Functionality',
    status: test.status || 'UNKNOWN',
    executionTime: test.executionTime || 0,
    dateExecuted: test.timestamp ? new Date(test.timestamp).toLocaleDateString() : ''
  });

  // Center align
  row.getCell('module').alignment = { horizontal: 'center', vertical: 'middle' };
  row.getCell('testId').alignment = { horizontal: 'center', vertical: 'middle' };
  row.getCell('category').alignment = { horizontal: 'center', vertical: 'middle' };
  row.getCell('status').alignment = { horizontal: 'center', vertical: 'middle' };
  row.getCell('executionTime').alignment = { horizontal: 'center', vertical: 'middle' };
  row.getCell('dateExecuted').alignment = { horizontal: 'center', vertical: 'middle' };

  // Color status
  if (test.status === 'PASSED') {
    row.getCell('status').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF92D050' } };
    row.getCell('status').font = { color: { argb: 'FF006100' }, bold: true };
  } else if (test.status === 'FAILED') {
    row.getCell('status').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF0000' } };
    row.getCell('status').font = { color: { argb: 'FFFFFFFF' }, bold: true };
  }

  row.height = 20;
}

updateMasterTestReport();
