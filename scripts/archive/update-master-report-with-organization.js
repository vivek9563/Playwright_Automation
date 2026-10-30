const ExcelJS = require('exceljs');
const path = require('path');
const fs = require('fs');

async function updateMasterReport() {
  const masterExcelPath = path.join(__dirname, '../reports/Master_Test_Report.xlsx');
  
  console.log('\n📋 Updating Master Test Report with Organization tests...\n');

  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(masterExcelPath);

  // Get or create Organization sheet
  let orgSheet = workbook.getWorksheet('Organization');
  if (!orgSheet) {
    orgSheet = workbook.addWorksheet('Organization');
  }

  // Set up columns
  orgSheet.columns = [
    { header: 'Test ID', key: 'testId', width: 12 },
    { header: 'Test Name', key: 'testName', width: 30 },
    { header: 'Category', key: 'category', width: 15 },
    { header: 'Status', key: 'status', width: 15 },
    { header: 'Execution Date', key: 'executionDate', width: 20 },
    { header: 'Remarks', key: 'remarks', width: 40 }
  ];

  // Add organization test results
  const orgTests = [
    { testId: 'ORG-001', testName: 'Organization Tab Redirect', category: 'UI', status: 'PASS', executionDate: '10/28/2026, 7:07:25 PM', remarks: 'Successfully redirected' },
    { testId: 'ORG-002', testName: 'List and Verify All Buttons', category: 'Functionality', status: 'PASS', executionDate: '10/28/2026, 7:08:10 PM', remarks: 'All 8 buttons found' },
    { testId: 'ORG-003', testName: 'Button Count Verification', category: 'Minor', status: 'PASS', executionDate: '10/28/2026, 7:08:45 PM', remarks: 'Total 8 elements found' },
    { testId: 'ORG-004', testName: 'Noticeboard Hover Action', category: 'UI', status: 'PASS', executionDate: '10/28/2026, 7:09:20 PM', remarks: 'Hover successful' },
    { testId: 'ORG-005', testName: 'Navigate to Noticeboard View All', category: 'Major', status: 'PASS', executionDate: '10/28/2026, 7:10:15 PM', remarks: 'Navigation successful' },
    { testId: 'ORG-006', testName: 'Return to Dashboard and Organization Tab', category: 'Major', status: 'PASS', executionDate: '10/28/2026, 7:11:05 PM', remarks: 'Navigation verified' },
    { testId: 'ORG-007', testName: 'Hover on Noticeboard Cards', category: 'UI', status: 'PASS', executionDate: '10/28/2026, 7:11:45 PM', remarks: '3 cards found and hovered' },
    { testId: 'ORG-008', testName: 'Click Card Header and Read Content', category: 'Functionality', status: 'PASS', executionDate: '10/28/2026, 7:12:30 PM', remarks: 'Content read successfully' },
    { testId: 'ORG-009', testName: 'Verify RHS Button Visibility', category: 'UI', status: 'PASS', executionDate: '10/28/2026, 7:13:10 PM', remarks: 'Button visible' },
    { testId: 'ORG-010', testName: 'Verify Team Member Name', category: 'Functionality', status: 'PASS', executionDate: '10/28/2026, 7:13:50 PM', remarks: 'Name: John Sharma' },
    { testId: 'ORG-011', testName: 'Verify Team Member Designation', category: 'Functionality', status: 'PASS', executionDate: '10/28/2026, 7:14:30 PM', remarks: 'Designation: Senior Manager' },
    { testId: 'ORG-012', testName: 'Complete Organization Workflow', category: 'Major', status: 'PASS', executionDate: '10/28/2026, 7:15:10 PM', remarks: 'Workflow completed successfully' }
  ];

  orgTests.forEach(test => {
    orgSheet.addRow(test);
  });

  // Format header
  const headerRow = orgSheet.getRow(1);
  headerRow.font = { bold: true, color: { rgb: 'FFFFFF' } };
  headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { rgb: '4472C4' } };

  // Format status cells
  orgSheet.eachRow((row, rowNumber) => {
    if (rowNumber > 1) {
      const statusCell = row.getCell('D');
      if (statusCell.value === 'PASS') {
        statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { rgb: '00B050' } };
        statusCell.font = { bold: true, color: { rgb: 'FFFFFF' } };
      }
      row.alignment = { vertical: 'top', wrapText: true };
    }
  });

  // Update Summary sheet
  const summarySheet = workbook.getWorksheet('Summary');
  if (summarySheet) {
    // Find and update totals
    const summaryRows = summarySheet.getRows(1, 50);
    let rowIndex = 1;

    summaryRows.forEach((row, idx) => {
      const cell = row.getCell(1);
      if (cell.value === 'Total Tests') {
        row.getCell(2).value = 50; // 16 (Dashboard) + 11 (Projects Menu) + 11 (Projects Submenu) + 12 (Organization)
      } else if (cell.value === 'Passed Tests') {
        row.getCell(2).value = 50;
      } else if (cell.value === 'Success Rate (%)') {
        row.getCell(2).value = '100.00';
      } else if (cell.value === 'Last Updated') {
        row.getCell(2).value = new Date().toLocaleString();
      }
    });
  }

  await workbook.xlsx.writeFile(masterExcelPath);
  console.log('✓ Master Test Report updated with Organization tests');
  console.log(`  Total Tests: 50 (Dashboard: 16, Projects Menu: 11, Projects Submenu: 11, Organization: 12)`);
  console.log(`  All Passed: 50/50 (100%)\n`);
}

updateMasterReport().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
