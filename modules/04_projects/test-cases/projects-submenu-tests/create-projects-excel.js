const ExcelJS = require('exceljs');
const path = require('path');
const fs = require('fs');

async function createProjectsTestCasesExcel() {
  try {
    const workbook = new ExcelJS.Workbook();
    
    // Add worksheet
    const worksheet = workbook.addWorksheet('Projects Submenu Tests', { 
      pageSetup: { paperSize: 9, orientation: 'landscape' }
    });

    // Set column widths
    worksheet.columns = [
      { header: 'Test ID', key: 'testId', width: 15 },
      { header: 'Test Name', key: 'testName', width: 35 },
      { header: 'Category', key: 'category', width: 15 },
      { header: 'Description', key: 'description', width: 40 },
      { header: 'URL', key: 'url', width: 60 },
      { header: 'Steps', key: 'steps', width: 50 },
      { header: 'Expected Result', key: 'expectedResult', width: 40 },
      { header: 'Status', key: 'status', width: 12 }
    ];

    // Define test data
    const testCases = [
      {
        testId: 'PROJECTS-01',
        testName: 'Navigate to Recent Projects',
        category: 'Functionality',
        description: 'User should be able to navigate to Recent Projects page from Projects menu',
        url: 'http://localhost:5173/app/projects',
        steps: '1. Click on Projects menu\n2. Select Recent Projects\n3. Verify page loads',
        expectedResult: 'Recent Projects page should load successfully with projects list displayed',
        status: 'PENDING'
      },
      {
        testId: 'PROJECTS-02',
        testName: 'Navigate to Links',
        category: 'Functionality',
        description: 'User should be able to navigate to Project Expert Links page',
        url: 'http://localhost:5173/app/project-expert-links',
        steps: '1. Click on Projects menu\n2. Select Links\n3. Verify page loads',
        expectedResult: 'Project Expert Links page should load successfully',
        status: 'PENDING'
      },
      {
        testId: 'PROJECTS-03',
        testName: 'Navigate to All Projects',
        category: 'Functionality',
        description: 'User should be able to view all available projects',
        url: 'http://localhost:5173/app/projects?recent=false',
        steps: '1. Click on Projects menu\n2. Select All Projects\n3. Verify all projects are displayed',
        expectedResult: 'All Projects page should load with complete project list',
        status: 'PENDING'
      },
      {
        testId: 'PROJECTS-04',
        testName: 'Navigate to All Subproject Stats',
        category: 'Functionality',
        description: 'User should be able to view subproject statistics with date filters',
        url: 'http://localhost:5173/app/projects/subprojects?data_start=2026-10-26&data_end=2026-10-27&allData=0&page=1&orderColumn=createdAt&orderBy=desc',
        steps: '1. Click on Projects menu\n2. Select Subproject Stats\n3. Verify stats are displayed',
        expectedResult: 'Subproject Stats page should load with data filtered by date range',
        status: 'PENDING'
      },
      {
        testId: 'PROJECTS-05',
        testName: 'Navigate to Targets',
        category: 'Functionality',
        description: 'User should be able to navigate to Targets management page',
        url: 'http://localhost:5173/app/targets',
        steps: '1. Click on Projects menu\n2. Select Targets\n3. Verify Targets page loads',
        expectedResult: 'Targets page should load with list of all targets',
        status: 'PENDING'
      },
      {
        testId: 'PROJECTS-06',
        testName: 'Navigate to Project Summary',
        category: 'Functionality',
        description: 'User should be able to view project summary with date filters',
        url: 'http://localhost:5173/app/project_summary?data_start=2026-10-26&data_end=2026-10-27',
        steps: '1. Click on Projects menu\n2. Select Project Summary\n3. View summary data',
        expectedResult: 'Project Summary page should display summary statistics for selected date range',
        status: 'PENDING'
      },
      {
        testId: 'PROJECTS-07',
        testName: 'Navigate to Client Portal Requests',
        category: 'Functionality',
        description: 'User should be able to manage client portal requests',
        url: 'http://localhost:5173/app/client_portal_requests',
        steps: '1. Click on Projects menu\n2. Select Client Portal Requests\n3. View all requests',
        expectedResult: 'Client Portal Requests page should load with list of requests',
        status: 'PENDING'
      },
      {
        testId: 'PROJECTS-08',
        testName: 'Navigate to Public Projects',
        category: 'Functionality',
        description: 'User should be able to view public projects',
        url: 'http://localhost:5173/app/public-projects',
        steps: '1. Click on Projects menu\n2. Select Public Projects\n3. View public projects',
        expectedResult: 'Public Projects page should load with publicly available projects',
        status: 'PENDING'
      },
      {
        testId: 'PROJECTS-09',
        testName: 'Navigate to Check Points',
        category: 'Functionality',
        description: 'User should be able to navigate to project check points',
        url: 'http://localhost:5173/app/check-points',
        steps: '1. Click on Projects menu\n2. Select Check Points\n3. View checkpoints',
        expectedResult: 'Check Points page should load with milestone checkpoints',
        status: 'PENDING'
      },
      {
        testId: 'PROJECTS-10',
        testName: 'Navigate to Experts Rating',
        category: 'Functionality',
        description: 'User should be able to view expert ratings for projects',
        url: 'http://localhost:5173/app/experts-rating',
        steps: '1. Click on Projects menu\n2. Select Experts Rating\n3. View ratings',
        expectedResult: 'Experts Rating page should load with expert ratings',
        status: 'PENDING'
      },
      {
        testId: 'PROJECTS-11',
        testName: 'Navigate to Project Lifecycle',
        category: 'Functionality',
        description: 'User should be able to view projects in different lifecycle stages',
        url: 'http://localhost:5173/app/projects?recent=false&tab=idle',
        steps: '1. Click on Projects menu\n2. Select Project Lifecycle\n3. View lifecycle stages',
        expectedResult: 'Project Lifecycle tab should display projects grouped by lifecycle stage',
        status: 'PENDING'
      }
    ];

    // Style header row
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 12 };
    headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4472C4' } };
    headerRow.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    headerRow.height = 25;

    // Add test cases
    testCases.forEach((testCase, index) => {
      const row = worksheet.addRow(testCase);
      row.height = 40;
      
      // Apply alternating row colors
      if (index % 2 === 0) {
        row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF2F2F2' } };
      }
      
      // Center align status and test ID
      row.getCell('testId').alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
      row.getCell('status').alignment = { horizontal: 'center', vertical: 'middle' };
      row.getCell('category').alignment = { horizontal: 'center', vertical: 'middle' };
      
      // Wrap text for description, steps, expected result
      row.getCell('description').alignment = { horizontal: 'left', vertical: 'top', wrapText: true };
      row.getCell('steps').alignment = { horizontal: 'left', vertical: 'top', wrapText: true };
      row.getCell('expectedResult').alignment = { horizontal: 'left', vertical: 'top', wrapText: true };
      row.getCell('url').alignment = { horizontal: 'left', vertical: 'top', wrapText: true };
      
      // Apply font styling
      row.font = { size: 11 };
    });

    // Freeze header row
    worksheet.views = [{ state: 'frozen', ySplit: 1 }];

    // Save file
    const fileName = 'Vedak_CRM_Projects_Submenu_TestCases.xlsx';
    const filePath = path.join(__dirname, `../${fileName}`);
    
    await workbook.xlsx.writeFile(filePath);
    
    console.log('\n✅ Excel test cases file created successfully!');
    console.log(`📁 File saved: ${fileName}`);
    console.log(`📊 Total test cases: ${testCases.length}`);
    console.log(`\n`);

  } catch (error) {
    console.error('❌ Error creating Excel file:', error);
    process.exit(1);
  }
}

createProjectsTestCasesExcel();
