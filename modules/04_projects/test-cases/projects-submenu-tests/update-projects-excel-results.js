const ExcelJS = require('exceljs');
const fs = require('fs');
const path = require('path');

async function updateProjectsExcelResults() {
  try {
    // Read test results
    const resultsFile = path.join(__dirname, '../test-results/projects-submenu-results.json');
    const testResults = JSON.parse(fs.readFileSync(resultsFile, 'utf8'));

    // Load workbook
    const workbook = new ExcelJS.Workbook();
    const filePath = path.join(__dirname, '../Vedak_CRM_Projects_Submenu_TestCases.xlsx');
    await workbook.xlsx.readFile(filePath);

    const worksheet = workbook.getWorksheet('Projects Submenu Tests');

    // Update status column with results
    testResults.tests.forEach((result, index) => {
      const rowNumber = index + 2; // +2 because row 1 is header, and rows are 1-indexed
      const statusCell = worksheet.getCell(`H${rowNumber}`);
      
      statusCell.value = result.status;
      
      if (result.status === 'PASSED') {
        statusCell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF92D050' } // Green
        };
        statusCell.font = { color: { argb: 'FF006100' }, bold: true };
      } else if (result.status === 'FAILED') {
        statusCell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFFF0000' } // Red
        };
        statusCell.font = { color: { argb: 'FFFFFFFF' }, bold: true };
      }
      
      statusCell.alignment = { horizontal: 'center', vertical: 'middle' };
    });

    // Save updated workbook
    await workbook.xlsx.writeFile(filePath);
    
    console.log('\n✅ Excel file updated with test results!');
    console.log(`📊 File: Vedak_CRM_Projects_Submenu_TestCases.xlsx`);
    console.log(`   ✓ ${testResults.passed} tests marked as PASSED (Green)`);
    console.log(`   ✓ ${testResults.failed} tests marked as FAILED (Red)`);
    console.log('\n');

  } catch (error) {
    console.error('❌ Error updating Excel:', error);
    process.exit(1);
  }
}

updateProjectsExcelResults();
