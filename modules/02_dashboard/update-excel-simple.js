const ExcelJS = require('exceljs');
const path = require('path');
const fs = require('fs');

const EXCEL_FILE = path.join(__dirname, 'Vedak_CRM_Dashboard_Major_TestCases.xlsx');
const RESULTS_FILE = path.join(__dirname, '../../reports/test-results/dashboard-major-results.json');

async function updateExcel() {
  try {
    const resultsData = fs.readFileSync(RESULTS_FILE, 'utf8');
    const results = JSON.parse(resultsData);
    
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(EXCEL_FILE);
    
    const summarySheet = workbook.getWorksheet('Summary');
    const testSheet = workbook.getWorksheet('Test Cases');
    
    if (summarySheet) {
      summarySheet.getCell('B2').value = results.totalTests || 0;
      summarySheet.getCell('B3').value = results.passed || 0;
      summarySheet.getCell('B4').value = results.failed || 0;
      summarySheet.getCell('B5').value = results.successRate || '0%';
      summarySheet.getCell('B6').value = new Date().toISOString();
    }
    
    if (testSheet && results.tests && results.tests.length > 0) {
      results.tests.forEach((test, idx) => {
        const row = testSheet.getRow(idx + 2);
        if (row) {
          row.getCell(1).value = test.name;
          row.getCell(9).value = test.status;
          row.getCell(10).value = test.details || '';
        }
      });
    }
    
    await workbook.xlsx.writeFile(EXCEL_FILE);
    
    console.log('✓ Excel file updated successfully');
    console.log(`  Total: ${results.totalTests}, Passed: ${results.passed}, Failed: ${results.failed}`);
    console.log(`  Success Rate: ${results.successRate}`);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

updateExcel();
