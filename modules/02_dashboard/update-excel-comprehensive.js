const ExcelJS = require('exceljs');
const path = require('path');
const fs = require('fs');

const EXCEL_FILE = path.join(__dirname, 'Vedak_CRM_Dashboard_Major_TestCases.xlsx');
const RESULTS_FILE = path.join(__dirname, '../../reports/test-results/dashboard-major-results.json');

async function updateExcelComprehensive() {
  try {
    console.log('📊 Updating Dashboard Major Test Cases Excel...\n');
    
    const resultsData = fs.readFileSync(RESULTS_FILE, 'utf8');
    const results = JSON.parse(resultsData);
    
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(EXCEL_FILE);
    
    // Update Summary Sheet
    const summarySheet = workbook.getWorksheet('Summary');
    if (summarySheet) {
      console.log('✓ Updating Summary Sheet...');
      summarySheet.getCell('B2').value = results.totalTests || 0;
      summarySheet.getCell('B3').value = results.passed || 0;
      summarySheet.getCell('B4').value = results.failed || 0;
      summarySheet.getCell('B5').value = results.successRate || '0%';
      summarySheet.getCell('B6').value = new Date().toLocaleString();
      
      // Format cells
      summarySheet.getCell('A2').font = { bold: true };
      summarySheet.getCell('B2').fill = { type: 'pattern', pattern: 'solid', fgColor: { rgb: 'CCFFCC' } };
      summarySheet.getCell('B3').fill = { type: 'pattern', pattern: 'solid', fgColor: { rgb: 'CCFFCC' } };
      summarySheet.getCell('B4').fill = { type: 'pattern', pattern: 'solid', fgColor: { rgb: 'FFFFCC' } };
      summarySheet.getCell('B5').fill = { type: 'pattern', pattern: 'solid', fgColor: { rgb: 'E8F5E9' } };
      
      console.log(`  Total: ${results.totalTests}`);
      console.log(`  Passed: ${results.passed} ✓`);
      console.log(`  Failed: ${results.failed} ✗`);
      console.log(`  Success Rate: ${results.successRate}`);
    }
    
    // Update Test Cases Sheet
    const testSheet = workbook.getWorksheet('Test Cases');
    if (testSheet && results.tests && results.tests.length > 0) {
      console.log('\n✓ Updating Test Cases Sheet...');
      
      results.tests.forEach((test, idx) => {
        const row = testSheet.getRow(idx + 2);
        if (row) {
          // Assuming columns: A=Test ID, B=Test Name, C=Description, ..., I=Status, J=Details
          const cellIndex = 9; // Status column (I)
          const detailIndex = 10; // Details column (J)
          
          row.getCell(1).value = idx + 1;
          row.getCell(2).value = test.name;
          row.getCell(cellIndex).value = test.status;
          row.getCell(detailIndex).value = test.details || '';
          
          // Color code based on status
          if (test.status === 'PASS') {
            row.getCell(cellIndex).fill = { type: 'pattern', pattern: 'solid', fgColor: { rgb: '92D050' } };
            row.getCell(cellIndex).font = { bold: true, color: { rgb: '000000' } };
          } else if (test.status === 'FAIL') {
            row.getCell(cellIndex).fill = { type: 'pattern', pattern: 'solid', fgColor: { rgb: 'FF6B6B' } };
            row.getCell(cellIndex).font = { bold: true, color: { rgb: 'FFFFFF' } };
          }
        }
      });
      
      console.log(`  Updated ${results.tests.length} test cases`);
    }
    
    await workbook.xlsx.writeFile(EXCEL_FILE);
    
    console.log('\n✅ Excel file updated successfully!');
    console.log(`   File: ${EXCEL_FILE}`);
    console.log(`   Summary: ${results.totalTests} Tests | ${results.passed} Passed | ${results.failed} Failed`);
    
    return { success: true, stats: results };
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

updateExcelComprehensive();
module.exports = updateExcelComprehensive;
