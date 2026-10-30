const fs = require('fs');
const path = require('path');
const ExcelJS = require('exceljs');

async function updateExcelFiles(testResults) {
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║   📊 UPDATING EXCEL FILES WITH TEST RESULTS              ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  // Update Login Test Cases
  await updateLoginExcel(testResults.modules.login);
  
  // Update Dashboard Test Cases
  await updateDashboardExcel(testResults.modules.dashboard);
  
  // Create Master Summary Sheet
  await createMasterSummary(testResults);
  
  console.log('\n✅ Excel files updated successfully!');
}

async function updateLoginExcel(loginModule) {
  const excelPath = path.join(__dirname, 'Vedak_CRM_Login_TestCases.xlsx');
  
  try {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(excelPath);
    const worksheet = workbook.getWorksheet('Test Cases') || workbook.addWorksheet('Test Cases');

    // Clear existing content (keep headers)
    let row = 2;
    loginModule.tests.forEach((test, index) => {
      const testRow = worksheet.getRow(row + index);
      testRow.values = [
        test.id,
        test.name,
        test.category,
        test.status,
        test.duration + 'ms',
        'PASS' // Execution Status
      ];
      
      // Color code based on status
      const statusCell = testRow.getCell(4);
      if (test.status === 'PASSED') {
        statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF92D050' } };
        statusCell.font = { color: { argb: 'FF00B050' }, bold: true };
      } else if (test.status === 'FAILED') {
        statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF0000' } };
        statusCell.font = { color: { argb: 'FFFFFFFF' }, bold: true };
      }
    });

    // Add summary
    const summaryRow = worksheet.getRow(loginModule.tests.length + 3);
    summaryRow.values = ['SUMMARY', '', '', `${loginModule.summary.passed}/${loginModule.summary.total} PASSED`];
    summaryRow.font = { bold: true };

    await workbook.xlsx.writeFile(excelPath);
    console.log(`✅ Updated: Vedak_CRM_Login_TestCases.xlsx (${loginModule.summary.passed}/${loginModule.summary.total} passed)`);
  } catch (error) {
    console.error('⚠️  Error updating Login Excel:', error.message);
  }
}

async function updateDashboardExcel(dashboardModule) {
  const excelPath = path.join(__dirname, 'Vedak_CRM_Dashboard_TestCases.xlsx');
  
  try {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(excelPath);
    const worksheet = workbook.getWorksheet('Test Results') || workbook.addWorksheet('Test Results');

    // Clear and update
    let row = 2;
    dashboardModule.tests.forEach((test, index) => {
      const testRow = worksheet.getRow(row + index);
      testRow.values = [
        test.id,
        test.name,
        test.category,
        test.status,
        test.duration + 'ms',
        'PASS'
      ];
      
      const statusCell = testRow.getCell(4);
      if (test.status === 'PASSED') {
        statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF92D050' } };
        statusCell.font = { color: { argb: 'FF00B050' }, bold: true };
      } else if (test.status === 'FAILED') {
        statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF0000' } };
        statusCell.font = { color: { argb: 'FFFFFFFF' }, bold: true };
      }
    });

    const summaryRow = worksheet.getRow(dashboardModule.tests.length + 3);
    summaryRow.values = ['SUMMARY', '', '', `${dashboardModule.summary.passed}/${dashboardModule.summary.total} PASSED`];
    summaryRow.font = { bold: true };

    // Update Summary sheet if exists
    const summarySheet = workbook.getWorksheet('Summary');
    if (summarySheet) {
      summarySheet.getCell('B2').value = dashboardModule.summary.passed;
      summarySheet.getCell('B3').value = dashboardModule.summary.total - dashboardModule.summary.passed;
      summarySheet.getCell('B4').value = dashboardModule.summary.total;
      summarySheet.getCell('B5').value = ((dashboardModule.summary.passed / dashboardModule.summary.total) * 100).toFixed(2) + '%';
    }

    await workbook.xlsx.writeFile(excelPath);
    console.log(`✅ Updated: Vedak_CRM_Dashboard_TestCases.xlsx (${dashboardModule.summary.passed}/${dashboardModule.summary.total} passed)`);
  } catch (error) {
    console.error('⚠️  Error updating Dashboard Excel:', error.message);
  }
}

async function createMasterSummary(testResults) {
  const excelPath = path.join(__dirname, 'Master_Test_Report.xlsx');
  
  try {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Executive Summary');
    
    // Header
    worksheet.mergeCells('A1:D1');
    const header = worksheet.getCell('A1');
    header.value = 'VEDAK CRM - MASTER TEST REPORT';
    header.font = { bold: true, size: 14, color: { argb: 'FFFFFFFF' } };
    header.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF667EEA' } };
    header.alignment = { horizontal: 'center', vertical: 'center' };
    worksheet.getRow(1).height = 25;

    // Timestamp
    worksheet.mergeCells('A2:D2');
    worksheet.getCell('A2').value = `Generated: ${new Date().toLocaleString()}`;
    worksheet.getCell('A2').font = { italic: true, size: 10 };

    // Summary data
    worksheet.getCell('A4').value = 'Module';
    worksheet.getCell('B4').value = 'Total Tests';
    worksheet.getCell('C4').value = 'Passed';
    worksheet.getCell('D4').value = 'Failed';
    
    ['A4', 'B4', 'C4', 'D4'].forEach(cell => {
      worksheet.getCell(cell).font = { bold: true, color: { argb: 'FFFFFFFF' } };
      worksheet.getCell(cell).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF764BA2' } };
    });

    let row = 5;
    
    // Login Module
    worksheet.getCell(`A${row}`).value = 'Login Module';
    worksheet.getCell(`B${row}`).value = testResults.modules.login.summary.total;
    worksheet.getCell(`C${row}`).value = testResults.modules.login.summary.passed;
    worksheet.getCell(`D${row}`).value = testResults.modules.login.summary.total - testResults.modules.login.summary.passed;
    row++;

    // Dashboard Module
    worksheet.getCell(`A${row}`).value = 'Dashboard Module';
    worksheet.getCell(`B${row}`).value = testResults.modules.dashboard.summary.total;
    worksheet.getCell(`C${row}`).value = testResults.modules.dashboard.summary.passed;
    worksheet.getCell(`D${row}`).value = testResults.modules.dashboard.summary.total - testResults.modules.dashboard.summary.passed;
    row++;

    // Total
    worksheet.getCell(`A${row}`).value = 'TOTAL';
    worksheet.getCell(`B${row}`).value = testResults.summary.totalTests;
    worksheet.getCell(`C${row}`).value = testResults.summary.passed;
    worksheet.getCell(`D${row}`).value = testResults.summary.failed;
    
    ['A' + row, 'B' + row, 'C' + row, 'D' + row].forEach(cell => {
      worksheet.getCell(cell).font = { bold: true };
      worksheet.getCell(cell).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFCCCCCC' } };
    });

    row += 2;

    // Pass Rate
    worksheet.getCell(`A${row}`).value = 'Pass Rate:';
    worksheet.getCell(`B${row}`).value = ((testResults.summary.passed / testResults.summary.totalTests) * 100).toFixed(2) + '%';
    worksheet.getCell(`B${row}`).font = { bold: true, size: 12, color: { argb: 'FF28A745' } };

    // Set column widths
    worksheet.columns = [
      { width: 20 },
      { width: 15 },
      { width: 15 },
      { width: 15 }
    ];

    await workbook.xlsx.writeFile(excelPath);
    console.log(`✅ Created: Master_Test_Report.xlsx`);
  } catch (error) {
    console.error('⚠️  Error creating Master Summary:', error.message);
  }
}

function main() {
  const resultsFile = path.join(__dirname, 'test-results', 'latest-results.json');
  
  if (!fs.existsSync(resultsFile)) {
    console.error('❌ No test results found. Run tests first.');
    process.exit(1);
  }

  const testResults = JSON.parse(fs.readFileSync(resultsFile, 'utf8'));
  
  try {
    updateExcelFiles(testResults).then(() => {
      process.exit(0);
    });
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { updateExcelFiles };
