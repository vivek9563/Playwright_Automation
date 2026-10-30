const ExcelJS = require('exceljs');
const path = require('path');

async function createProjectsExcel() {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Projects Menu Tests');

  // Define columns
  worksheet.columns = [
    { header: 'Test ID', key: 'testId', width: 12, style: { font: { bold: true } } },
    { header: 'Test Name', key: 'testName', width: 25, style: { font: { bold: true } } },
    { header: 'Category', key: 'category', width: 15, style: { font: { bold: true } } },
    { header: 'Module', key: 'module', width: 15, style: { font: { bold: true } } },
    { header: 'Steps', key: 'steps', width: 50, style: { font: { bold: true } } },
    { header: 'Expected Result', key: 'expectedResult', width: 40, style: { font: { bold: true } } },
    { header: 'Priority', key: 'priority', width: 12, style: { font: { bold: true } } },
    { header: 'Status', key: 'status', width: 12, style: { font: { bold: true } } }
  ];

  // Test data for Projects Menu
  const testCases = [
    {
      testId: 'PROJ-01',
      testName: 'Navigate to Recent Projects',
      category: 'Functionality',
      module: 'Projects Menu',
      steps: '1. Login to Dashboard\n2. Click on Projects menu\n3. Click on "Recent Projects" option\n4. Wait for page to load\n5. Return to Dashboard',
      expectedResult: 'Recent Projects page should load successfully with project list',
      priority: 'High',
      status: 'Pending'
    },
    {
      testId: 'PROJ-02',
      testName: 'Navigate to Links',
      category: 'Functionality',
      module: 'Projects Menu',
      steps: '1. Login to Dashboard\n2. Click on Projects menu\n3. Click on "Links" option\n4. Wait for page to load\n5. Return to Dashboard',
      expectedResult: 'Links page should load successfully',
      priority: 'High',
      status: 'Pending'
    },
    {
      testId: 'PROJ-03',
      testName: 'Navigate to All Projects',
      category: 'Functionality',
      module: 'Projects Menu',
      steps: '1. Login to Dashboard\n2. Click on Projects menu\n3. Click on "All Projects" option\n4. Wait for page to load\n5. Return to Dashboard',
      expectedResult: 'All Projects page should load showing complete project list',
      priority: 'High',
      status: 'Pending'
    },
    {
      testId: 'PROJ-04',
      testName: 'Navigate to Subproject Stats',
      category: 'Functionality',
      module: 'Projects Menu',
      steps: '1. Login to Dashboard\n2. Click on Projects menu\n3. Click on "Subproject Stats" option\n4. Wait for page to load\n5. Return to Dashboard',
      expectedResult: 'Subproject Stats page should load with statistics displayed',
      priority: 'Medium',
      status: 'Pending'
    },
    {
      testId: 'PROJ-05',
      testName: 'Navigate to Targets',
      category: 'Functionality',
      module: 'Projects Menu',
      steps: '1. Login to Dashboard\n2. Click on Projects menu\n3. Click on "Targets" option\n4. Wait for page to load\n5. Return to Dashboard',
      expectedResult: 'Targets page should load with target information',
      priority: 'Medium',
      status: 'Pending'
    },
    {
      testId: 'PROJ-06',
      testName: 'Navigate to Project Summary',
      category: 'Functionality',
      module: 'Projects Menu',
      steps: '1. Login to Dashboard\n2. Click on Projects menu\n3. Click on "Project Summary" option\n4. Wait for page to load\n5. Return to Dashboard',
      expectedResult: 'Project Summary page should load with summary details',
      priority: 'High',
      status: 'Pending'
    },
    {
      testId: 'PROJ-07',
      testName: 'Navigate to Client Portal Requests',
      category: 'Functionality',
      module: 'Projects Menu',
      steps: '1. Login to Dashboard\n2. Click on Projects menu\n3. Click on "Client Portal Requests" option\n4. Wait for page to load\n5. Return to Dashboard',
      expectedResult: 'Client Portal Requests page should load with requests list',
      priority: 'High',
      status: 'Pending'
    },
    {
      testId: 'PROJ-08',
      testName: 'Navigate to Public Projects',
      category: 'Functionality',
      module: 'Projects Menu',
      steps: '1. Login to Dashboard\n2. Click on Projects menu\n3. Click on "Public Projects" option\n4. Wait for page to load\n5. Return to Dashboard',
      expectedResult: 'Public Projects page should load showing public projects',
      priority: 'Medium',
      status: 'Pending'
    },
    {
      testId: 'PROJ-09',
      testName: 'Navigate to Check Points',
      category: 'Functionality',
      module: 'Projects Menu',
      steps: '1. Login to Dashboard\n2. Click on Projects menu\n3. Click on "Check Points" option\n4. Wait for page to load\n5. Return to Dashboard',
      expectedResult: 'Check Points page should load with checkpoint information',
      priority: 'Medium',
      status: 'Pending'
    },
    {
      testId: 'PROJ-10',
      testName: 'Navigate to Experts Rating',
      category: 'Functionality',
      module: 'Projects Menu',
      steps: '1. Login to Dashboard\n2. Click on Projects menu\n3. Click on "Experts Rating" option\n4. Wait for page to load\n5. Return to Dashboard',
      expectedResult: 'Experts Rating page should load with ratings displayed',
      priority: 'Low',
      status: 'Pending'
    },
    {
      testId: 'PROJ-11',
      testName: 'Navigate to Project Lifecycle',
      category: 'Functionality',
      module: 'Projects Menu',
      steps: '1. Login to Dashboard\n2. Click on Projects menu\n3. Click on "Project Lifecycle" option\n4. Wait for page to load\n5. Return to Dashboard',
      expectedResult: 'Project Lifecycle page should load showing lifecycle stages',
      priority: 'Medium',
      status: 'Pending'
    }
  ];

  // Add test cases to worksheet
  testCases.forEach((testCase, index) => {
    const row = worksheet.addRow(testCase);
    const rowNum = index + 2; // +2 because row 1 is headers

    // Style header row
    if (index === 0) {
      for (let col = 1; col <= 8; col++) {
        const headerCell = worksheet.getCell(1, col);
        headerCell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF4472C4' }
        };
        headerCell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        headerCell.alignment = { horizontal: 'center', vertical: 'center', wrapText: true };
      }
    }

    // Style status column based on status
    const statusCell = row.getCell('status');
    if (testCase.status === 'Pending') {
      statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFF00' } };
      statusCell.font = { bold: true, color: { argb: 'FF000000' } };
    }

    // Center align all cells
    row.eachCell({ includeEmpty: true }, (cell) => {
      cell.alignment = { horizontal: 'left', vertical: 'top', wrapText: true };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FF000000' } },
        left: { style: 'thin', color: { argb: 'FF000000' } },
        bottom: { style: 'thin', color: { argb: 'FF000000' } },
        right: { style: 'thin', color: { argb: 'FF000000' } }
      };
    });
  });

  // Adjust row heights
  worksheet.eachRow((row, rowNum) => {
    if (rowNum === 1) {
      row.height = 25;
    } else {
      row.height = 60;
    }
  });

  // Save the workbook
  const filePath = path.join(__dirname, 'Vedak_CRM_Projects_Menu_TestCases.xlsx');
  await workbook.xlsx.writeFile(filePath);
  console.log(`✅ Projects Menu Excel file created: ${filePath}`);
}

createProjectsExcel().catch(error => {
  console.error(`❌ Error creating Excel: ${error.message}`);
  process.exit(1);
});
