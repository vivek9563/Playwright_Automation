const ExcelJS = require('exceljs');
const path = require('path');

const workbook = new ExcelJS.Workbook();
const worksheet = workbook.addWorksheet('Organization Tests');

// Set column widths
worksheet.columns = [
  { header: 'Test ID', key: 'testId', width: 15 },
  { header: 'Test Name', key: 'testName', width: 40 },
  { header: 'Category', key: 'category', width: 15 },
  { header: 'Test Description', key: 'description', width: 50 },
  { header: 'Pre-requisites', key: 'prerequisites', width: 30 },
  { header: 'Test Steps', key: 'testSteps', width: 60 },
  { header: 'Expected Result', key: 'expectedResult', width: 50 },
  { header: 'Test Data', key: 'testData', width: 30 },
  { header: 'Status', key: 'status', width: 12 },
  { header: 'Execution Time (ms)', key: 'executionTime', width: 18 },
];

// Style header row
const headerRow = worksheet.getRow(1);
headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4472C4' } };
headerRow.alignment = { horizontal: 'center', vertical: 'center', wrapText: true };

const testCases = [
  // UI Tests
  {
    testId: 'ORG-UI-01',
    testName: 'Organization Button Visible',
    category: 'UI',
    description: 'Verify Organization button is visible on Work/Organization page',
    prerequisites: 'User logged in, on Dashboard page',
    testSteps: '1. Click on Work/Organization button\n2. Verify page loads\n3. Check Organization button visibility',
    expectedResult: 'Organization button should be visible and clickable',
    testData: 'N/A'
  },
  {
    testId: 'ORG-UI-02',
    testName: 'Organization Page Title',
    category: 'UI',
    description: 'Verify confirmation message on Organization page',
    prerequisites: 'User logged in, clicked Organization button',
    testSteps: '1. Click Organization button\n2. Wait for page load\n3. Verify page title/heading',
    expectedResult: 'Page should display "You are on organization page" message',
    testData: 'N/A'
  },
  {
    testId: 'ORG-UI-03',
    testName: 'Navigation Menu Items Visible',
    category: 'UI',
    description: 'Verify all navigation menu items are visible on organization page',
    prerequisites: 'User on Organization page',
    testSteps: '1. Scroll and check all menu items\n2. Verify visibility of each button',
    expectedResult: 'All 8 buttons should be visible: Apply Leave, Calendar, Noticeboard, Organization, Support, Vedak Policies, HR Playbook, Refill Credits',
    testData: 'N/A'
  },
  {
    testId: 'ORG-UI-04',
    testName: 'Noticeboard Widget Display',
    category: 'UI',
    description: 'Verify Noticeboard widget displays on organization page',
    prerequisites: 'User on Organization page',
    testSteps: '1. Locate Noticeboard widget\n2. Verify it is displayed',
    expectedResult: 'Noticeboard widget should be visible with View All button',
    testData: 'N/A'
  },
  {
    testId: 'ORG-UI-05',
    testName: 'Holidays Widget Display',
    category: 'UI',
    description: 'Verify Holidays widget displays on organization page',
    prerequisites: 'User on Organization page',
    testSteps: '1. Locate Holidays widget\n2. Verify it is displayed',
    expectedResult: 'Holidays widget should be visible with View All button',
    testData: 'N/A'
  },
  
  // Functionality Tests
  {
    testId: 'ORG-FUNC-01',
    testName: 'Apply Leave Button Navigation',
    category: 'Functionality',
    description: 'Click Apply Leave button and verify redirect to dashboard',
    prerequisites: 'User on Organization page',
    testSteps: '1. Click Apply Leave button\n2. Wait for page load/redirect\n3. Verify redirect to dashboard',
    expectedResult: 'Should redirect to dashboard page (http://localhost:5173/app/dashboard)',
    testData: 'N/A'
  },
  {
    testId: 'ORG-FUNC-02',
    testName: 'Calendar Button Navigation',
    category: 'Functionality',
    description: 'Click Calendar button and verify redirect to dashboard',
    prerequisites: 'User on Organization page',
    testSteps: '1. Click Calendar button\n2. Wait for page load/redirect\n3. Verify redirect to dashboard',
    expectedResult: 'Should redirect to dashboard page',
    testData: 'N/A'
  },
  {
    testId: 'ORG-FUNC-03',
    testName: 'Noticeboard Button Navigation',
    category: 'Functionality',
    description: 'Click Noticeboard button and verify redirect to dashboard',
    prerequisites: 'User on Organization page',
    testSteps: '1. Click Noticeboard button\n2. Wait for page load/redirect\n3. Verify redirect to dashboard',
    expectedResult: 'Should redirect to dashboard page',
    testData: 'N/A'
  },
  {
    testId: 'ORG-FUNC-04',
    testName: 'Organization Button Navigation',
    category: 'Functionality',
    description: 'Click Organization button and verify it stays on organization page',
    prerequisites: 'User on Organization page',
    testSteps: '1. Click Organization button\n2. Wait for page load\n3. Verify on organization page',
    expectedResult: 'Should remain on organization page or redirect to it',
    testData: 'N/A'
  },
  {
    testId: 'ORG-FUNC-05',
    testName: 'Support Button Navigation',
    category: 'Functionality',
    description: 'Click Support button and verify redirect to dashboard',
    prerequisites: 'User on Organization page',
    testSteps: '1. Click Support button\n2. Wait for page load/redirect\n3. Verify redirect to dashboard',
    expectedResult: 'Should redirect to dashboard page',
    testData: 'N/A'
  },
  {
    testId: 'ORG-FUNC-06',
    testName: 'Vedak Policies Button Navigation',
    category: 'Functionality',
    description: 'Click Vedak Policies button and verify redirect to dashboard',
    prerequisites: 'User on Organization page',
    testSteps: '1. Click Vedak Policies button\n2. Wait for page load/redirect\n3. Verify redirect to dashboard',
    expectedResult: 'Should redirect to dashboard page',
    testData: 'N/A'
  },
  {
    testId: 'ORG-FUNC-07',
    testName: 'HR Playbook Button Navigation',
    category: 'Functionality',
    description: 'Click HR Playbook button and verify redirect to dashboard',
    prerequisites: 'User on Organization page',
    testSteps: '1. Click HR Playbook button\n2. Wait for page load/redirect\n3. Verify redirect to dashboard',
    expectedResult: 'Should redirect to dashboard page',
    testData: 'N/A'
  },
  {
    testId: 'ORG-FUNC-08',
    testName: 'Refill Credits Button Navigation',
    category: 'Functionality',
    description: 'Click Refill Credits button and verify redirect to dashboard',
    prerequisites: 'User on Organization page',
    testSteps: '1. Click Refill Credits button\n2. Wait for page load/redirect\n3. Verify redirect to dashboard',
    expectedResult: 'Should redirect to dashboard page',
    testData: 'N/A'
  },
  
  // Major Tests
  {
    testId: 'ORG-MAJ-01',
    testName: 'Organization Page Load',
    category: 'Major',
    description: 'Verify organization page loads successfully with all elements',
    prerequisites: 'User logged in, on Dashboard',
    testSteps: '1. Click Work/Organization button\n2. Wait for page load\n3. Verify page title and all widgets load',
    expectedResult: 'Page should load completely within 5 seconds with confirmation message',
    testData: 'N/A'
  },
  {
    testId: 'ORG-MAJ-02',
    testName: 'View All - Noticeboard Widget',
    category: 'Major',
    description: 'Hover over Noticeboard widget and click View All',
    prerequisites: 'User on Organization page',
    testSteps: '1. Hover over Noticeboard widget\n2. Click View All button\n3. Verify action completes',
    expectedResult: 'View All action should execute successfully',
    testData: 'N/A'
  },
  {
    testId: 'ORG-MAJ-03',
    testName: 'View All - Holidays Widget',
    category: 'Major',
    description: 'Hover over Holidays widget and click View All',
    prerequisites: 'User on Organization page',
    testSteps: '1. Hover over Holidays widget\n2. Click View All button\n3. Verify action completes',
    expectedResult: 'View All action should execute successfully',
    testData: 'N/A'
  },
  
  // Minor Tests
  {
    testId: 'ORG-MIN-01',
    testName: 'Hover - Team Members on Leave Today',
    category: 'Minor',
    description: 'Hover over Team Members on Leave Today widget',
    prerequisites: 'User on Organization page',
    testSteps: '1. Hover over Team Members on Leave Today widget\n2. Wait for tooltip/content to appear',
    expectedResult: 'Widget should respond to hover action',
    testData: 'N/A'
  },
  {
    testId: 'ORG-MIN-02',
    testName: 'Hover - Work Anniversary',
    category: 'Minor',
    description: 'Hover over Work Anniversary widget',
    prerequisites: 'User on Organization page',
    testSteps: '1. Hover over Work Anniversary widget\n2. Wait for content to appear',
    expectedResult: 'Widget should respond to hover action',
    testData: 'N/A'
  },
  {
    testId: 'ORG-MIN-03',
    testName: 'Hover - Wedding Anniversary',
    category: 'Minor',
    description: 'Hover over Wedding Anniversary widget',
    prerequisites: 'User on Organization page',
    testSteps: '1. Hover over Wedding Anniversary widget\n2. Wait for content to appear',
    expectedResult: 'Widget should respond to hover action',
    testData: 'N/A'
  },
  {
    testId: 'ORG-MIN-04',
    testName: 'Hover - Birthday',
    category: 'Minor',
    description: 'Hover over Birthday widget',
    prerequisites: 'User on Organization page',
    testSteps: '1. Hover over Birthday widget\n2. Wait for content to appear',
    expectedResult: 'Widget should respond to hover action',
    testData: 'N/A'
  },
  
  // Edge Cases
  {
    testId: 'ORG-EDGE-01',
    testName: 'Page Scroll Down',
    category: 'Edge',
    description: 'Scroll down the organization page to see all content',
    prerequisites: 'User on Organization page',
    testSteps: '1. Scroll down the page\n2. Verify all widgets are accessible\n3. Check no content is cut off',
    expectedResult: 'Page should scroll smoothly, all content should be visible',
    testData: 'N/A'
  },
  {
    testId: 'ORG-EDGE-02',
    testName: 'Page Scroll Up',
    category: 'Edge',
    description: 'Scroll up the organization page after scrolling down',
    prerequisites: 'User on Organization page, page has been scrolled',
    testSteps: '1. Scroll up the page\n2. Verify page returns to top\n3. Check all top widgets are visible',
    expectedResult: 'Page should scroll to top successfully',
    testData: 'N/A'
  },
  {
    testId: 'ORG-EDGE-03',
    testName: 'Page Scroll Functionality',
    category: 'Edge',
    description: 'Verify page scroll up and down works correctly',
    prerequisites: 'User on Organization page',
    testSteps: '1. Scroll down using PageDown key\n2. Scroll up using PageUp key\n3. Scroll to end using End key\n4. Scroll to home using Home key',
    expectedResult: 'All scroll commands should work properly',
    testData: 'N/A'
  },
];

// Add test cases to worksheet
testCases.forEach((testCase, index) => {
  const row = worksheet.addRow({
    testId: testCase.testId,
    testName: testCase.testName,
    category: testCase.category,
    description: testCase.description,
    prerequisites: testCase.prerequisites,
    testSteps: testCase.testSteps,
    expectedResult: testCase.expectedResult,
    testData: testCase.testData,
    status: 'Not Executed',
    executionTime: '-'
  });

  // Set cell alignment and wrapping
  row.eachCell((cell) => {
    cell.alignment = { wrapText: true, vertical: 'top' };
  });

  // Color code by category
  const categoryCell = row.getCell('category');
  if (testCase.category === 'UI') {
    categoryCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF4B084' } };
  } else if (testCase.category === 'Functionality') {
    categoryCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF92D050' } };
  } else if (testCase.category === 'Major') {
    categoryCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF00B0F0' } };
  } else if (testCase.category === 'Minor') {
    categoryCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFF99' } };
  } else if (testCase.category === 'Edge') {
    categoryCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF9999' } };
  }
  categoryCell.font = { bold: true };
});

// Set row height for header
worksheet.getRow(1).height = 30;

// Save workbook
const filePath = path.join(process.env.HOME, 'Downloads/Vedak_Automation/Vedak_CRM_Organization_TestCases.xlsx');
workbook.xlsx.writeFile(filePath)
  .then(() => {
    console.log('✅ Excel file created:', filePath);
  })
  .catch(err => {
    console.error('Error creating Excel file:', err);
  });
