const ExcelJS = require('exceljs');
const path = require('path');
const fs = require('fs');

const EXCEL_FILE = path.join(__dirname, 'Vedak_CRM_Dashboard_Major_TestCases.xlsx');
const RESULTS_FILE = path.join(__dirname, '../../reports/test-results/dashboard-major-results.json');

async function updateTestCasesExcel() {
  try {
    // Read results
    const resultsData = fs.readFileSync(RESULTS_FILE, 'utf8');
    const results = JSON.parse(resultsData);
    
    // Read workbook
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(EXCEL_FILE);
    
    // Update Summary sheet
    const summarySheet = workbook.getWorksheet('Summary');
    const testSheet = workbook.getWorksheet('Test Cases');
    
    // Update test cases with results
    testSheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return; // Skip header
      
      const testName = row.getCell('testName').value;
      const matchedTest = results.tests.find(t => t.name && t.name.includes(testName.substring(0, 20)));
      
      if (matchedTest) {
        row.getCell('status').value = matchedTest.status;
        row.getCell('executionDate').value = new Date().toLocaleDateString();
        row.getCell('remarks').value = matchedTest.details || '';
        
        // Color code the status
        const statusCell = row.getCell('status');
        if (matchedTest.status === 'PASS') {
          statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC6EFCE' } };
          statusCell.font = { color: { argb: 'FF006100' } };
        } else {
          statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFC7CE' } };
          statusCell.font = { color: { argb: 'FF9C0006' } };
        }
      }
    });
    
    // Update Summary with totals
    const summaryData = {
      'UI Tests': 0,
      'Functionality Tests': 0,
      'Major Tests': 0,
      'Minor Tests': 0,
      'Edge Cases': 0
    };
    
    const categoryCounts = {
      'UI Tests': { passed: 0, total: 0 },
      'Functionality Tests': { passed: 0, total: 0 },
      'Major Tests': { passed: 0, total: 0 },
      'Minor Tests': { passed: 0, total: 0 },
      'Edge Cases': { passed: 0, total: 0 }
    };
    
    // Count from test sheet
    testSheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return;
      const category = row.getCell('category').value;
      const status = row.getCell('status').value;
      
      if (category && categoryCounts[category]) {
        categoryCounts[category].total++;
        if (status === 'PASS') {
          categoryCounts[category].passed++;
        }
      }
    });
    
    // Update summary rows
    let summaryRowNum = 2;
    Object.keys(categoryCounts).forEach(category => {
      const row = summarySheet.getRow(summaryRowNum);
      const total = categoryCounts[category].total;
      const passed = categoryCounts[category].passed;
      const status = passed === total ? 'ALL PASSED' : `${passed}/${total} PASSED`;
      
      row.getCell('status').value = status;
      row.getCell('status').fill = { type: 'pattern', pattern: 'solid', 
        fgColor: { argb: passed === total ? 'FFC6EFCE' : 'FFFFEB9C' } };
      
      summaryRowNum++;
    });
    
    // Update total row
    const totalRow = summarySheet.getRow(7);
    const totalTests = results.totalTests;
    const totalPassed = results.passed;
    totalRow.getCell('status').value = `${totalPassed}/${totalTests} PASSED (${results.successRate})`;
    totalRow.getCell('status').fill = { type: 'pattern', pattern: 'solid', 
      fgColor: { argb: totalPassed === totalTests ? 'FFC6EFCE' : 'FFFFEB9C' } };
    
    // Save workbook
    await workbook.xlsx.writeFile(EXCEL_FILE);
    console.log(`\n✓ Excel file updated: ${EXCEL_FILE}`);
    console.log(`  Total tests executed: ${totalTests}`);
    console.log(`  Passed: ${totalPassed}`);
    console.log(`  Failed: ${results.failed}`);
    console.log(`  Success Rate: ${results.successRate}`);
    
  } catch (error) {
    console.error(`Error updating Excel file: ${error.message}`);
    throw error;
  }
}

updateTestCasesExcel();
