const ExcelJS = require('exceljs');
const path = require('path');
const fs = require('fs');

// Test cases data
const testCases = [
  {
    id: 'ORG-001',
    name: 'Organization Tab Redirect',
    description: 'User should be redirected to Organization tab when clicked',
    preconditions: 'User must be logged in and on the Dashboard page (http://localhost:5173/app/dashboard)',
    steps: '1. Click on the Organization button/tab\n2. Verify redirection to Organization section\n3. Verify page loads successfully',
    expectedResult: 'User is successfully redirected to Organization tab and section is visible',
    testData: 'Dashboard page loaded',
    severity: 'High',
    priority: 'P0',
    category: 'UI',
    status: 'Not Executed',
    executionDate: '',
    remarks: ''
  },
  {
    id: 'ORG-002',
    name: 'List and Verify All Buttons',
    description: 'All 8 buttons should be visible on the Organization page',
    preconditions: 'User must be on Organization tab',
    steps: '1. Navigate to Organization tab\n2. Verify all buttons are present: Apply Leave, Calendar, Notice Board, Organization, Support, Vedak Policies, HR Playbook, Refill Credits\n3. Count all buttons\n4. Log button names',
    expectedResult: 'All 8 buttons are visible and accessible',
    testData: 'Button names: Apply Leave, Calendar, Notice Board, Organization, Support, Vedak Policies, HR Playbook, Refill Credits',
    severity: 'High',
    priority: 'P0',
    category: 'Functionality',
    status: 'Not Executed',
    executionDate: '',
    remarks: ''
  },
  {
    id: 'ORG-003',
    name: 'Button Count Verification',
    description: 'Count and verify total number of interactive buttons',
    preconditions: 'User is on Organization tab',
    steps: '1. Navigate to Organization tab\n2. Count all interactive elements (buttons, clickable items)\n3. Verify count is correct',
    expectedResult: 'Total button count is displayed and verified',
    testData: 'Dashboard Organization section',
    severity: 'Low',
    priority: 'P2',
    category: 'Minor',
    status: 'Not Executed',
    executionDate: '',
    remarks: ''
  },
  {
    id: 'ORG-004',
    name: 'Noticeboard Hover Action',
    description: 'User should be able to hover over Noticeboard button',
    preconditions: 'User is on Organization tab and Noticeboard button is visible',
    steps: '1. Navigate to Organization tab\n2. Locate Noticeboard button\n3. Hover over it\n4. Verify hover effect is triggered',
    expectedResult: 'Hover effect is successfully triggered and success message is shown',
    testData: 'Notice Board button element',
    severity: 'Medium',
    priority: 'P1',
    category: 'UI',
    status: 'Not Executed',
    executionDate: '',
    remarks: ''
  },
  {
    id: 'ORG-005',
    name: 'Navigate to Noticeboard View All',
    description: 'User should navigate to noticeboard when clicking View All link',
    preconditions: 'User is on Organization tab and View All link is visible in Noticeboard section',
    steps: '1. On Organization tab locate View All link in Noticeboard section\n2. Click on View All link\n3. Verify navigation to http://localhost:5173/app/noticeboard\n4. Verify page loads successfully',
    expectedResult: 'User is successfully navigated to noticeboard page',
    testData: 'Noticeboard URL: http://localhost:5173/app/noticeboard',
    severity: 'High',
    priority: 'P0',
    category: 'Major',
    status: 'Not Executed',
    executionDate: '',
    remarks: ''
  },
  {
    id: 'ORG-006',
    name: 'Return to Dashboard and Organization Tab',
    description: 'User should be able to return to Dashboard and click Organization tab again',
    preconditions: 'User has navigated to noticeboard from Organization tab',
    steps: '1. From noticeboard page navigate back to Dashboard\n2. Verify Dashboard URL is loaded (http://localhost:5173/app/dashboard)\n3. Click Organization button again\n4. Verify Organization tab loads',
    expectedResult: 'User successfully returns to Dashboard and Organization tab is accessible',
    testData: 'Dashboard URL: http://localhost:5173/app/dashboard',
    severity: 'High',
    priority: 'P0',
    category: 'Major',
    status: 'Not Executed',
    executionDate: '',
    remarks: ''
  },
  {
    id: 'ORG-007',
    name: 'Hover on Noticeboard Cards',
    description: 'User should be able to hover over noticeboard cards',
    preconditions: 'User is on Organization tab and noticeboard cards are visible',
    steps: '1. On Organization tab locate noticeboard cards\n2. Hover over first card\n3. Verify hover effect is triggered\n4. Check for visual changes (highlight, shadow, etc.)',
    expectedResult: 'Cards are successfully hovered and hover effects are visible',
    testData: 'Card elements in noticeboard section',
    severity: 'Medium',
    priority: 'P1',
    category: 'UI',
    status: 'Not Executed',
    executionDate: '',
    remarks: ''
  },
  {
    id: 'ORG-008',
    name: 'Click Card Header and Read Content',
    description: 'User should be able to click card header and read card content',
    preconditions: 'User is on Organization tab and cards with headers are visible',
    steps: '1. Locate card in noticeboard section\n2. Click on card header\n3. Read card content\n4. Print/log card content\n5. Verify RHS button is visible',
    expectedResult: 'Card header is clicked, content is readable, and success message is shown',
    testData: 'Noticeboard card elements with header and content',
    severity: 'High',
    priority: 'P0',
    category: 'Functionality',
    status: 'Not Executed',
    executionDate: '',
    remarks: ''
  },
  {
    id: 'ORG-009',
    name: 'Verify RHS Button Visibility',
    description: 'Right hand side button on card should be visible when card is hovered or clicked',
    preconditions: 'User is on Organization tab and card is visible',
    steps: '1. Hover over or click card in noticeboard section\n2. Verify RHS button is visible\n3. Check button visibility state\n4. Log button properties',
    expectedResult: 'RHS button is visible and accessible',
    testData: 'Card RHS button element',
    severity: 'Medium',
    priority: 'P1',
    category: 'UI',
    status: 'Not Executed',
    executionDate: '',
    remarks: ''
  },
  {
    id: 'ORG-010',
    name: 'Verify Team Member Name',
    description: 'Team member name should be visible in card or member section',
    preconditions: 'User is on Organization tab and team member information is displayed',
    steps: '1. On Organization tab locate team member information\n2. Verify team member name is visible\n3. Read and log member name\n4. Verify name is not empty',
    expectedResult: 'Team member name is successfully found and displayed',
    testData: 'Team member information from organization section',
    severity: 'High',
    priority: 'P0',
    category: 'Functionality',
    status: 'Not Executed',
    executionDate: '',
    remarks: ''
  },
  {
    id: 'ORG-011',
    name: 'Verify Team Member Designation',
    description: 'Team member designation/role should be visible',
    preconditions: 'User is on Organization tab and team member details are visible',
    steps: '1. On Organization tab locate team member information\n2. Verify team member designation is visible\n3. Read and log member designation\n4. Verify designation is not empty',
    expectedResult: 'Team member designation is successfully found and displayed',
    testData: 'Team member designation from organization section',
    severity: 'High',
    priority: 'P0',
    category: 'Functionality',
    status: 'Not Executed',
    executionDate: '',
    remarks: ''
  },
  {
    id: 'ORG-012',
    name: 'Complete Organization Workflow',
    description: 'Complete workflow from Dashboard to Organization and back',
    preconditions: 'User is logged in and on Dashboard page',
    steps: '1. Navigate to Dashboard\n2. Click Organization tab\n3. Verify tab loads\n4. Interact with elements (hover, click)\n5. Navigate back to Dashboard\n6. Click Organization tab again',
    expectedResult: 'Complete workflow is executed successfully without errors',
    testData: 'Dashboard and Organization pages',
    severity: 'High',
    priority: 'P0',
    category: 'Major',
    status: 'Not Executed',
    executionDate: '',
    remarks: ''
  }
];

// Group test cases by category
const categorizeTests = (tests) => {
  const categories = {
    'UI': [],
    'Functionality': [],
    'Major': [],
    'Minor': [],
    'Edge Cases': []
  };

  tests.forEach(test => {
    if (categories[test.category]) {
      categories[test.category].push(test);
    }
  });

  return categories;
};

// Create Excel workbook
async function createOrganizationExcel() {
  const workbook = new ExcelJS.Workbook();
  
  // Summary sheet
  const summarySheet = workbook.addWorksheet('Summary');
  summarySheet.columns = [
    { header: 'Metric', key: 'metric', width: 30 },
    { header: 'Value', key: 'value', width: 20 }
  ];

  const categories = categorizeTests(testCases);
  const totalTests = testCases.length;
  const uiTests = categories['UI'].length;
  const functionalityTests = categories['Functionality'].length;
  const majorTests = categories['Major'].length;
  const minorTests = categories['Minor'].length;
  const edgeCaseTests = categories['Edge Cases'].length;

  summarySheet.addRows([
    { metric: 'Total Test Cases', value: totalTests },
    { metric: 'UI Tests', value: uiTests },
    { metric: 'Functionality Tests', value: functionalityTests },
    { metric: 'Major Tests', value: majorTests },
    { metric: 'Minor Tests', value: minorTests },
    { metric: 'Edge Cases', value: edgeCaseTests },
    { metric: 'Tests Passed', value: 0 },
    { metric: 'Tests Failed', value: 0 },
    { metric: 'Success Rate (%)', value: '0.00' },
    { metric: 'Execution Date', value: '' },
    { metric: 'Last Updated', value: '' }
  ]);

  // Format summary sheet header
  summarySheet.getRow(1).font = { bold: true, color: { rgb: 'FFFFFF' } };
  summarySheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { rgb: '4472C4' } };

  // Create sheets for each category
  const categorySheets = {};

  Object.entries(categories).forEach(([categoryName, tests]) => {
    const sheet = workbook.addWorksheet(categoryName);
    
    sheet.columns = [
      { header: 'Test ID', key: 'id', width: 12 },
      { header: 'Test Name', key: 'name', width: 30 },
      { header: 'Description', key: 'description', width: 35 },
      { header: 'Pre-conditions', key: 'preconditions', width: 40 },
      { header: 'Test Steps', key: 'steps', width: 50 },
      { header: 'Expected Result', key: 'expectedResult', width: 40 },
      { header: 'Test Data', key: 'testData', width: 25 },
      { header: 'Severity', key: 'severity', width: 12 },
      { header: 'Priority', key: 'priority', width: 10 },
      { header: 'Status', key: 'status', width: 15 },
      { header: 'Execution Date', key: 'executionDate', width: 20 },
      { header: 'Remarks', key: 'remarks', width: 35 }
    ];

    // Add data rows
    tests.forEach(test => {
      sheet.addRow({
        id: test.id,
        name: test.name,
        description: test.description,
        preconditions: test.preconditions,
        steps: test.steps,
        expectedResult: test.expectedResult,
        testData: test.testData,
        severity: test.severity,
        priority: test.priority,
        status: test.status,
        executionDate: test.executionDate,
        remarks: test.remarks
      });
    });

    // Format header row
    const headerRow = sheet.getRow(1);
    headerRow.font = { bold: true, color: { rgb: 'FFFFFF' } };
    headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { rgb: '4472C4' } };
    headerRow.alignment = { horizontal: 'center', vertical: 'center', wrapText: true };

    // Wrap text for all rows
    sheet.eachRow((row, rowNumber) => {
      if (rowNumber > 1) {
        row.alignment = { vertical: 'top', wrapText: true };
        row.height = 60;
      }
    });

    categorySheets[categoryName] = sheet;
  });

  // Save workbook
  const filePath = path.join(
    process.env.HOME,
    'Downloads/Vedak_Automation/modules/dashboard/Organization',
    'Organization_TestCases.xlsx'
  );

  await workbook.xlsx.writeFile(filePath);
  console.log(`✓ Excel file created: ${filePath}`);
  
  return filePath;
}

// Run the script
createOrganizationExcel()
  .then(filePath => {
    console.log('\n✓ Organization test cases Excel file created successfully!');
    console.log(`\nFile Details:`);
    console.log(`  Location: ${filePath}`);
    console.log(`  Total Test Cases: ${testCases.length}`);
    console.log(`  Categories: UI (${testCases.filter(t => t.category === 'UI').length}), Functionality (${testCases.filter(t => t.category === 'Functionality').length}), Major (${testCases.filter(t => t.category === 'Major').length}), Minor (${testCases.filter(t => t.category === 'Minor').length}), Edge Cases (${testCases.filter(t => t.category === 'Edge Cases').length})`);
    console.log(`\n✓ All test cases ready for execution!`);
  })
  .catch(error => {
    console.error('✗ Error creating Excel file:', error.message);
    process.exit(1);
  });
