const ExcelJS = require('exceljs');
const path = require('path');
const fs = require('fs');

const EXCEL_FILE = path.join(__dirname, 'Vedak_CRM_Dashboard_Major_TestCases.xlsx');

const testCases = [
  // UI Tests
  {
    category: 'UI Tests',
    testID: 'UI-DB-001',
    testName: 'Dashboard Page Layout Verification',
    description: 'Verify that dashboard page loads with all major sections visible',
    preconditions: 'User must be logged in and on dashboard',
    steps: [
      '1. Navigate to http://localhost:5173/app/dashboard',
      '2. Verify page title displays "Dashboard"',
      '3. Verify sidebar navigation is visible',
      '4. Verify main content area is loaded'
    ],
    expectedResult: 'Dashboard page displays all sections correctly',
    testData: 'N/A',
    severity: 'Critical',
    priority: 'High'
  },
  {
    category: 'UI Tests',
    testID: 'UI-DB-002',
    testName: 'Work Tab Visibility',
    description: 'Verify Work tab is visible and accessible on dashboard',
    preconditions: 'User logged in on dashboard',
    steps: [
      '1. Locate Work tab in dashboard',
      '2. Verify tab is highlighted/active',
      '3. Verify all sub-sections under Work tab are visible'
    ],
    expectedResult: 'Work tab is visible and active with all sub-sections displayed',
    testData: 'N/A',
    severity: 'Critical',
    priority: 'High'
  },
  {
    category: 'UI Tests',
    testID: 'UI-DB-003',
    testName: 'Daily Training Section Display',
    description: 'Verify Daily Training section displays correctly on left sidebar',
    preconditions: 'User on dashboard with Work tab active',
    steps: [
      '1. Locate "Daily Training" text on left sidebar',
      '2. Verify section is visible',
      '3. Verify section styling is consistent'
    ],
    expectedResult: 'Daily Training section displays with proper styling',
    testData: 'N/A',
    severity: 'Medium',
    priority: 'Medium'
  },
  {
    category: 'UI Tests',
    testID: 'UI-DB-004',
    testName: 'TODOs Section Visibility',
    description: 'Verify TODOs section is visible and contains two tabs (Overdue, Upcoming)',
    preconditions: 'User on dashboard',
    steps: [
      '1. Locate TODOs section',
      '2. Verify "Overdue" tab is visible',
      '3. Verify "Upcoming" tab is visible',
      '4. Verify tab switching works'
    ],
    expectedResult: 'Both Overdue and Upcoming tabs are visible and switchable',
    testData: 'N/A',
    severity: 'High',
    priority: 'High'
  },
  {
    category: 'UI Tests',
    testID: 'UI-DB-005',
    testName: 'Email Observations Section Display',
    description: 'Verify Email Observations section displays with all required columns',
    preconditions: 'User on dashboard',
    steps: [
      '1. Scroll to Email Observations section',
      '2. Verify section header is visible',
      '3. Verify table columns are displayed',
      '4. Verify "View All" link is visible'
    ],
    expectedResult: 'Email Observations section displays with all columns and View All link',
    testData: 'N/A',
    severity: 'Medium',
    priority: 'Medium'
  },

  // Functionality Tests
  {
    category: 'Functionality Tests',
    testID: 'FUNC-DB-001',
    testName: 'User Login and Dashboard Redirect',
    description: 'Verify user is redirected to dashboard after successful login',
    preconditions: 'User is on login page with valid Google account configured',
    steps: [
      '1. Click on "Continue with Google" button',
      '2. Select Google account (vivek.k@vedak.com domain)',
      '3. Approve authentication request',
      '4. Wait for page redirect'
    ],
    expectedResult: 'User is redirected to dashboard page at http://localhost:5173/app/dashboard',
    testData: 'Email: vivek.k@vedak.com, Domain: vedak.com',
    severity: 'Critical',
    priority: 'Critical'
  },
  {
    category: 'Functionality Tests',
    testID: 'FUNC-DB-002',
    testName: 'Work Tab Click and Load',
    description: 'Verify clicking Work tab loads work-related content',
    preconditions: 'User logged in on dashboard',
    steps: [
      '1. Click on Work tab',
      '2. Wait for content to load',
      '3. Verify Daily Training and TODOs sections appear',
      '4. Verify page does not show error messages'
    ],
    expectedResult: 'Work tab content loads successfully without errors',
    testData: 'N/A',
    severity: 'High',
    priority: 'High'
  },
  {
    category: 'Functionality Tests',
    testID: 'FUNC-DB-003',
    testName: 'Hover over Daily Training Section',
    description: 'Verify hover functionality on Daily Training section',
    preconditions: 'User on dashboard with Work tab active',
    steps: [
      '1. Move mouse to Daily Training section',
      '2. Wait for hover effect',
      '3. Verify any additional options appear',
      '4. Move mouse away'
    ],
    expectedResult: 'Hover effect works, additional options appear if any',
    testData: 'N/A',
    severity: 'Low',
    priority: 'Low'
  },
  {
    category: 'Functionality Tests',
    testID: 'FUNC-DB-004',
    testName: 'Hover over TODOs Section',
    description: 'Verify hover functionality on TODOs section',
    preconditions: 'User on dashboard',
    steps: [
      '1. Move mouse to TODOs section header',
      '2. Wait for hover effect',
      '3. Verify section remains accessible',
      '4. Move mouse away'
    ],
    expectedResult: 'Hover effect works on TODOs section',
    testData: 'N/A',
    severity: 'Low',
    priority: 'Low'
  },
  {
    category: 'Functionality Tests',
    testID: 'FUNC-DB-005',
    testName: 'Switch to Overdue TODOs Tab',
    description: 'Verify switching to Overdue tab displays overdue todos',
    preconditions: 'User on dashboard with TODOs section visible',
    steps: [
      '1. Click on "Overdue" tab',
      '2. Wait for content to load',
      '3. Verify list of overdue todos appears (if any exist)',
      '4. Verify todo items are clickable'
    ],
    expectedResult: 'Overdue tab loads and displays overdue todos correctly',
    testData: 'N/A',
    severity: 'High',
    priority: 'High'
  },
  {
    category: 'Functionality Tests',
    testID: 'FUNC-DB-006',
    testName: 'Mark Overdue TODO as Done',
    description: 'Verify clicking radio button marks overdue todo as done',
    preconditions: 'Overdue tab is active and contains at least one todo',
    steps: [
      '1. Click on radio button beside first todo title',
      '2. Wait for action to complete',
      '3. Verify todo disappears from list',
      '4. Verify success message appears (if configured)'
    ],
    expectedResult: 'Todo is marked as done and removed from list',
    testData: 'Test TODO: "Complete test task"',
    severity: 'High',
    priority: 'High'
  },
  {
    category: 'Functionality Tests',
    testID: 'FUNC-DB-007',
    testName: 'Switch to Upcoming TODOs Tab',
    description: 'Verify switching to Upcoming tab displays upcoming todos',
    preconditions: 'User on dashboard with TODOs section visible',
    steps: [
      '1. Click on "Upcoming" tab',
      '2. Wait for content to load',
      '3. Verify list of upcoming todos appears (if any exist)',
      '4. Scroll down to verify more todos load if available'
    ],
    expectedResult: 'Upcoming tab loads and displays upcoming todos correctly',
    testData: 'N/A',
    severity: 'High',
    priority: 'High'
  },
  {
    category: 'Functionality Tests',
    testID: 'FUNC-DB-008',
    testName: 'Scroll Page Down in TODOs Section',
    description: 'Verify page scrolls down within TODOs section',
    preconditions: 'User on dashboard in Upcoming TODOs tab',
    steps: [
      '1. Scroll down within the page',
      '2. Verify page moves down',
      '3. Verify more todos appear if they exist',
      '4. Verify scroll position is maintained'
    ],
    expectedResult: 'Page scrolls down and displays additional content',
    testData: 'N/A',
    severity: 'Medium',
    priority: 'Medium'
  },
  {
    category: 'Functionality Tests',
    testID: 'FUNC-DB-009',
    testName: 'Email Observations Hover',
    description: 'Verify hovering over Email Observations section works',
    preconditions: 'User on dashboard, Email Observations section visible',
    steps: [
      '1. Move mouse to Email Observations header',
      '2. Wait for hover effect',
      '3. Verify section content remains visible',
      '4. Move mouse away'
    ],
    expectedResult: 'Hover effect works on Email Observations section',
    testData: 'N/A',
    severity: 'Low',
    priority: 'Low'
  },
  {
    category: 'Functionality Tests',
    testID: 'FUNC-DB-010',
    testName: 'Email Observations Scroll Horizontally',
    description: 'Verify table columns are scrollable horizontally',
    preconditions: 'Email Observations section visible with multiple columns',
    steps: [
      '1. Position mouse on Email Observations table',
      '2. Scroll horizontally',
      '3. Verify additional columns appear',
      '4. Verify data is readable'
    ],
    expectedResult: 'Table scrolls horizontally showing all columns',
    testData: 'N/A',
    severity: 'Medium',
    priority: 'Medium'
  },

  // Major Tests
  {
    category: 'Major Tests',
    testID: 'MAJOR-DB-001',
    testName: 'Complete Dashboard Navigation Flow',
    description: 'Verify user can navigate through all major dashboard sections',
    preconditions: 'User logged in on dashboard',
    steps: [
      '1. Verify on dashboard page',
      '2. Click Work tab',
      '3. Hover over and interact with Daily Training',
      '4. Access Overdue and Upcoming TODOs',
      '5. Mark one todo as done',
      '6. View Email Observations section',
      '7. Scroll entire page up and down',
      '8. Return to dashboard'
    ],
    expectedResult: 'All sections load and interact correctly without errors',
    testData: 'Email: vivek.k@vedak.com',
    severity: 'Critical',
    priority: 'Critical'
  },
  {
    category: 'Major Tests',
    testID: 'MAJOR-DB-002',
    testName: 'TODOs Management Major Flow',
    description: 'Verify complete TODO management workflow',
    preconditions: 'User on dashboard with available TODOs',
    steps: [
      '1. Open Overdue TODOs tab',
      '2. Count overdue items',
      '3. Mark one as done',
      '4. Verify count decreased',
      '5. Switch to Upcoming tab',
      '6. Count upcoming items',
      '7. Verify both tabs work independently'
    ],
    expectedResult: 'TODO management works correctly with proper state management',
    testData: 'Use existing TODOs in system',
    severity: 'Critical',
    priority: 'Critical'
  },
  {
    category: 'Major Tests',
    testID: 'MAJOR-DB-003',
    testName: 'Dashboard Sections Navigation',
    description: 'Verify user can navigate to linked sections from dashboard',
    preconditions: 'User on dashboard',
    steps: [
      '1. Hover over Recent Projects section',
      '2. Click "View All" link',
      '3. Verify redirect to Projects page',
      '4. Navigate back to dashboard',
      '5. Repeat for Targets and To-Dos sections'
    ],
    expectedResult: 'All "View All" links redirect to correct pages',
    testData: 'URLs: /app/projects, /app/targets, /app/to_do',
    severity: 'High',
    priority: 'High'
  },
  {
    category: 'Major Tests',
    testID: 'MAJOR-DB-004',
    testName: 'Contribution Toggle Major Flow',
    description: 'Verify Contribution section toggle functionality',
    preconditions: 'User on dashboard with Contribution section visible',
    steps: [
      '1. Hover over Contribution section',
      '2. Locate toggle button',
      '3. Click toggle to ON',
      '4. Verify display changes to Monthly',
      '5. Click toggle to OFF',
      '6. Verify display changes to Last 30 Days'
    ],
    expectedResult: 'Toggle switches between Monthly and Last 30 Days views',
    testData: 'N/A',
    severity: 'High',
    priority: 'High'
  },
  {
    category: 'Major Tests',
    testID: 'MAJOR-DB-005',
    testName: 'Notes Entry Major Flow',
    description: 'Verify Your Notes section accepts text entry',
    preconditions: 'User on dashboard with Your Notes section visible',
    steps: [
      '1. Hover over Your Notes section',
      '2. Click on text area',
      '3. Type random test text',
      '4. Wait for auto-save',
      '5. Reload page',
      '6. Verify text is persisted'
    ],
    expectedResult: 'Notes are entered and persisted across page reloads',
    testData: 'Test text: "Automated test note - timestamp"',
    severity: 'High',
    priority: 'High'
  },

  // Minor Tests
  {
    category: 'Minor Tests',
    testID: 'MINOR-DB-001',
    testName: 'Email Observations Column Headers Visibility',
    description: 'Verify all column headers are visible in Email Observations',
    preconditions: 'Email Observations section loaded',
    steps: [
      '1. View Email Observations section',
      '2. List all visible column headers',
      '3. Compare with expected columns',
      '4. Verify header text is readable'
    ],
    expectedResult: 'All expected column headers are visible and readable',
    testData: 'Expected columns: Date, From, Subject, Status',
    severity: 'Low',
    priority: 'Low'
  },
  {
    category: 'Minor Tests',
    testID: 'MINOR-DB-002',
    testName: 'Contribution Graph Display',
    description: 'Verify contribution graph displays pictorial data by month',
    preconditions: 'Contribution section visible',
    steps: [
      '1. Hover over contribution graph',
      '2. Verify data points appear',
      '3. Verify month labels show',
      '4. Move hover to different month'
    ],
    expectedResult: 'Graph displays data sorted by month with hover details',
    testData: 'N/A',
    severity: 'Low',
    priority: 'Low'
  },
  {
    category: 'Minor Tests',
    testID: 'MINOR-DB-003',
    testName: 'Interested Experts Refresh Button',
    description: 'Verify refresh button works on Interested Experts section',
    preconditions: 'Interested Experts section visible',
    steps: [
      '1. Locate refresh button',
      '2. Click refresh button',
      '3. Verify loading indicator appears',
      '4. Verify data refreshes'
    ],
    expectedResult: 'Refresh button loads latest data without errors',
    testData: 'N/A',
    severity: 'Low',
    priority: 'Medium'
  },
  {
    category: 'Minor Tests',
    testID: 'MINOR-DB-004',
    testName: 'Interested Experts Loader Icon',
    description: 'Verify loader icon displays during data refresh',
    preconditions: 'Interested Experts section with refresh action',
    steps: [
      '1. Click refresh button',
      '2. Observe loading indicator',
      '3. Verify loader displays until data loads',
      '4. Verify no error state shows'
    ],
    expectedResult: 'Loader displays and disappears appropriately',
    testData: 'N/A',
    severity: 'Low',
    priority: 'Low'
  },
  {
    category: 'Minor Tests',
    testID: 'MINOR-DB-005',
    testName: 'Recent Projects Column Count',
    description: 'Verify Recent Projects section shows correct number of columns',
    preconditions: 'Recent Projects section visible',
    steps: [
      '1. Count visible columns in Recent Projects',
      '2. Verify column headers are present',
      '3. Verify column alignment is correct',
      '4. Verify data is properly aligned'
    ],
    expectedResult: 'All columns display with proper alignment and data',
    testData: 'Expected columns: Project Name, Status, Team, Date',
    severity: 'Low',
    priority: 'Low'
  },

  // Edge Cases
  {
    category: 'Edge Cases',
    testID: 'EDGE-DB-001',
    testName: 'TODOs with No Overdue Items',
    description: 'Verify system handles when no overdue todos exist',
    preconditions: 'User on dashboard with empty Overdue tab',
    steps: [
      '1. Click on Overdue tab',
      '2. Verify empty state message displays',
      '3. Verify no error messages appear',
      '4. Verify tab remains functional'
    ],
    expectedResult: 'Empty state is handled gracefully with appropriate message',
    testData: 'N/A',
    severity: 'Medium',
    priority: 'Medium'
  },
  {
    category: 'Edge Cases',
    testID: 'EDGE-DB-002',
    testName: 'Email Observations with Large Dataset',
    description: 'Verify system handles large email observation datasets',
    preconditions: 'Email Observations section with many records',
    steps: [
      '1. Load Email Observations with 100+ records',
      '2. Scroll horizontally through columns',
      '3. Verify pagination works if implemented',
      '4. Verify performance is acceptable'
    ],
    expectedResult: 'Large datasets load and display without lag',
    testData: 'Use existing data in system',
    severity: 'Medium',
    priority: 'High'
  },
  {
    category: 'Edge Cases',
    testID: 'EDGE-DB-003',
    testName: 'Contribution Toggle Rapid Clicks',
    description: 'Verify toggle handles rapid consecutive clicks',
    preconditions: 'Contribution section with toggle visible',
    steps: [
      '1. Click toggle ON',
      '2. Immediately click toggle OFF',
      '3. Immediately click toggle ON',
      '4. Wait for final state to stabilize',
      '5. Verify correct state displays'
    ],
    expectedResult: 'Toggle handles rapid clicks without errors or state corruption',
    testData: 'N/A',
    severity: 'Low',
    priority: 'Low'
  },
  {
    category: 'Edge Cases',
    testID: 'EDGE-DB-004',
    testName: 'Notes Text Area Character Limit',
    description: 'Verify notes text area handles large text entries',
    preconditions: 'Your Notes section visible',
    steps: [
      '1. Click on notes text area',
      '2. Enter 5000+ character text',
      '3. Verify all text is accepted',
      '4. Verify text is persisted',
      '5. Reload page and verify text remains'
    ],
    expectedResult: 'Text area accepts large entries without character limit issues',
    testData: 'Large test text with 5000+ characters',
    severity: 'Low',
    priority: 'Low'
  },
  {
    category: 'Edge Cases',
    testID: 'EDGE-DB-005',
    testName: 'Rapid Section Navigation',
    description: 'Verify dashboard handles rapid scrolling between sections',
    preconditions: 'User on dashboard',
    steps: [
      '1. Rapidly scroll down through sections',
      '2. Rapidly scroll up',
      '3. Rapidly switch between tabs',
      '4. Verify no content overlap or errors',
      '5. Verify page remains responsive'
    ],
    expectedResult: 'Rapid navigation does not cause errors or UI glitches',
    testData: 'N/A',
    severity: 'Low',
    priority: 'Low'
  }
];

async function createTestCasesExcel() {
  try {
    const workbook = new ExcelJS.Workbook();
    
    // Create Summary sheet
    const summarySheet = workbook.addWorksheet('Summary');
    summarySheet.columns = [
      { header: 'Test Category', key: 'category', width: 20 },
      { header: 'Total Tests', key: 'total', width: 15 },
      { header: 'Status', key: 'status', width: 15 }
    ];
    
    const categories = ['UI Tests', 'Functionality Tests', 'Major Tests', 'Minor Tests', 'Edge Cases'];
    categories.forEach(cat => {
      const count = testCases.filter(t => t.category === cat).length;
      summarySheet.addRow({
        category: cat,
        total: count,
        status: 'NOT EXECUTED'
      });
    });
    
    summarySheet.addRow({
      category: 'TOTAL',
      total: testCases.length,
      status: 'NOT EXECUTED'
    });
    
    // Create detailed test cases sheet
    const detailedSheet = workbook.addWorksheet('Test Cases');
    detailedSheet.columns = [
      { header: 'Category', key: 'category', width: 18 },
      { header: 'Test ID', key: 'testID', width: 15 },
      { header: 'Test Name', key: 'testName', width: 35 },
      { header: 'Description', key: 'description', width: 40 },
      { header: 'Pre-conditions', key: 'preconditions', width: 30 },
      { header: 'Steps', key: 'steps', width: 50 },
      { header: 'Expected Result', key: 'expectedResult', width: 40 },
      { header: 'Test Data', key: 'testData', width: 25 },
      { header: 'Severity', key: 'severity', width: 12 },
      { header: 'Priority', key: 'priority', width: 12 },
      { header: 'Status', key: 'status', width: 12 },
      { header: 'Execution Date', key: 'executionDate', width: 15 },
      { header: 'Remarks', key: 'remarks', width: 30 }
    ];
    
    testCases.forEach(test => {
      detailedSheet.addRow({
        category: test.category,
        testID: test.testID,
        testName: test.testName,
        description: test.description,
        preconditions: test.preconditions,
        steps: test.steps.join('\n'),
        expectedResult: test.expectedResult,
        testData: test.testData,
        severity: test.severity,
        priority: test.priority,
        status: 'NOT EXECUTED',
        executionDate: '',
        remarks: ''
      });
    });
    
    // Format header rows
    [summarySheet, detailedSheet].forEach(sheet => {
      const headerRow = sheet.getRow(1);
      headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1F4E78' } };
      headerRow.alignment = { horizontal: 'center', vertical: 'center', wrapText: true };
    });
    
    // Wrap text in all cells
    detailedSheet.eachRow((row) => {
      row.eachCell((cell) => {
        cell.alignment = { wrapText: true, vertical: 'top' };
      });
    });
    
    // Save workbook
    await workbook.xlsx.writeFile(EXCEL_FILE);
    console.log(`\n✓ Excel file created: ${EXCEL_FILE}`);
    console.log(`  Total test cases: ${testCases.length}`);
    console.log(`  Categories: UI Tests (${testCases.filter(t => t.category === 'UI Tests').length}), ` +
                `Functionality Tests (${testCases.filter(t => t.category === 'Functionality Tests').length}), ` +
                `Major Tests (${testCases.filter(t => t.category === 'Major Tests').length}), ` +
                `Minor Tests (${testCases.filter(t => t.category === 'Minor Tests').length}), ` +
                `Edge Cases (${testCases.filter(t => t.category === 'Edge Cases').length})`);
    
  } catch (error) {
    console.error(`Error creating Excel file: ${error.message}`);
    throw error;
  }
}

createTestCasesExcel();
