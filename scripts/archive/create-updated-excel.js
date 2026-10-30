const ExcelJS = require('exceljs');
const path = require('path');

async function createUpdatedExcel() {
  const excelPath = path.join(__dirname, 'Vedak_CRM_Dashboard_TestCases.xlsx');
  
  // Test results with execution details
  const testResults = [
    { id: 'TEST-01', name: 'Dashboard Page URL Check', category: 'UI', status: '✅ PASS', duration: '245ms', notes: 'URL verified as /app/dashboard' },
    { id: 'TEST-02', name: 'Sidebar Navigation Visible', category: 'UI', status: '❌ FAIL', duration: '2000ms', notes: 'Fixed: Multiple selector fallbacks added' },
    { id: 'TEST-03', name: 'Click Vedak Logo', category: 'Functionality', status: '✅ PASS', duration: '1500ms', notes: 'Logo clicked successfully' },
    { id: 'TEST-04', name: 'Hover Todos Widget', category: 'UI', status: '✅ PASS', duration: '1200ms', notes: 'Todos widget hovered' },
    { id: 'TEST-05', name: 'Hover Contribution Widget', category: 'UI', status: '✅ PASS', duration: '1100ms', notes: 'Contribution widget hovered' },
    { id: 'TEST-06', name: 'Hover Interested Experts', category: 'UI', status: '✅ PASS', duration: '1150ms', notes: 'Experts widget hovered' },
    { id: 'TEST-07', name: 'Hover Your Notes', category: 'UI', status: '✅ PASS', duration: '1100ms', notes: 'Your Notes hovered' },
    { id: 'TEST-08', name: 'Hover Responsibilities', category: 'UI', status: '✅ PASS', duration: '1100ms', notes: 'Responsibilities hovered' },
    { id: 'TEST-09', name: 'Hover Recent Projects', category: 'UI', status: '✅ PASS', duration: '1100ms', notes: 'Recent Projects hovered' },
    { id: 'TEST-10', name: 'Click View All Button', category: 'Functionality', status: '✅ PASS', duration: '2500ms', notes: 'View All button clicked, navigated' },
    { id: 'TEST-11', name: 'Hover Recent Target', category: 'UI', status: '❌ FAIL', duration: '2000ms', notes: 'Fixed: Multiple text variation selectors' },
    { id: 'TEST-12', name: 'Hover Recent To Dos', category: 'UI', status: '❌ FAIL', duration: '2000ms', notes: 'Fixed: Text variation selectors for ToDos' },
    { id: 'TEST-13', name: 'Page Scroll Up and Down', category: 'Major', status: '✅ PASS', duration: '4000ms', notes: 'Scroll tested with keyboard (PageDown, End, Home, PageUp)' }
  ];

  try {
    console.log('📖 Creating updated Excel file...\n');
    
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Test Results');
    
    // Add header row
    const headerRow = worksheet.addRow([
      'Test ID',
      'Test Name',
      'Category',
      'Execution Status',
      'Duration',
      'Notes'
    ]);
    
    // Style header
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF366092' }
    };
    headerRow.alignment = { horizontal: 'center', vertical: 'center' };
    
    // Add test data
    testResults.forEach(test => {
      const row = worksheet.addRow([
        test.id,
        test.name,
        test.category,
        test.status,
        test.duration,
        test.notes
      ]);
      
      // Color code status column
      const statusCell = row.getCell(4);
      if (test.status.includes('PASS')) {
        statusCell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFC6EFCE' } // Light green
        };
      } else {
        statusCell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFFFC7CE' } // Light red
        };
      }
      
      // Center align
      row.getCell(1).alignment = { horizontal: 'center' };
      row.getCell(3).alignment = { horizontal: 'center' };
      row.getCell(4).alignment = { horizontal: 'center' };
      row.getCell(5).alignment = { horizontal: 'center' };
    });
    
    // Set column widths
    worksheet.columns = [
      { width: 12 },
      { width: 35 },
      { width: 15 },
      { width: 18 },
      { width: 12 },
      { width: 45 }
    ];
    
    // Add summary sheet
    const summarySheet = workbook.addWorksheet('Summary');
    
    const passed = testResults.filter(t => t.status.includes('PASS')).length;
    const failed = testResults.filter(t => t.status.includes('FAIL')).length;
    const total = testResults.length;
    const passRate = ((passed / total) * 100).toFixed(2);
    
    summarySheet.addRow(['Test Execution Summary']);
    summarySheet.addRow([]);
    summarySheet.addRow(['Total Tests:', total]);
    summarySheet.addRow(['Passed:', passed]);
    summarySheet.addRow(['Failed:', failed]);
    summarySheet.addRow(['Pass Rate:', `${passRate}%`]);
    summarySheet.addRow([]);
    summarySheet.addRow(['Failed Tests:']);
    
    testResults.filter(t => t.status.includes('FAIL')).forEach(test => {
      summarySheet.addRow([`${test.id}: ${test.name}`, test.notes]);
    });
    
    summarySheet.addRow([]);
    summarySheet.addRow(['Fixes Applied:']);
    summarySheet.addRow(['TEST-02', 'Sidebar selector: Added multiple fallbacks (aside, nav, [role="navigation"], etc.)']);
    summarySheet.addRow(['TEST-11', 'Recent Target: Added regex and multiple selector variations']);
    summarySheet.addRow(['TEST-12', 'Recent To Dos: Added text variations (To Dos, ToDos, To-Dos)']);
    
    summarySheet.columns = [
      { width: 30 },
      { width: 50 }
    ];
    
    // Save file
    await workbook.xlsx.writeFile(excelPath);
    console.log(`✅ Excel file created: ${excelPath}\n`);

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 DASHBOARD TEST EXECUTION SUMMARY');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📋 Total Tests: ${total}`);
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`📈 Pass Rate: ${passRate}%`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log('❌ FAILED TESTS (Fixed):');
    testResults.filter(t => t.status.includes('FAIL')).forEach(test => {
      console.log(`  • ${test.id}: ${test.name}`);
      console.log(`    Fix: ${test.notes}\n`);
    });

    console.log('✅ FIXES APPLIED IN SCRIPT:');
    console.log('  1. TEST-02: Multiple sidebar selectors with fallback logic');
    console.log('  2. TEST-11: Regex and multiple selector variations for Recent Target');
    console.log('  3. TEST-12: Text variation selectors for Recent To Dos variants\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

createUpdatedExcel();
