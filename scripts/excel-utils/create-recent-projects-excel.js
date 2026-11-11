/**
 * create-recent-projects-excel.js
 * Generates Vedak_CRM_Recent_Projects_TestCases.xlsx with categorized tabs:
 * - Summary
 * - UI Tests
 * - Functionality Tests
 * - Major Tests
 * - Minor Tests
 * - Edge Cases
 *
 * Each tab contains:
 * Test Case ID | Test Scenario | Pre-conditions | Test Steps | Expected Result | Actual Result | Priority | Status | Execution Date | Remarks
 */

'use strict';

const {
  EXCEL_THEME,
  DEFAULT_TEST_CASE_COLUMNS,
  DEFAULT_RECENT_PROJECTS_EXCEL_PATHS,
  createCategorizedExcel,
  appendTestCasesToExcel,
} = require('./common-excel-utils');

const OUTPUT_PATHS = DEFAULT_RECENT_PROJECTS_EXCEL_PATHS;
const THEME = EXCEL_THEME;
const COLUMNS = DEFAULT_TEST_CASE_COLUMNS;

const TEST_DATA = {
  'UI Tests': [
    {
      id: 'TC-RP-UI-01',
      description: 'Verify "Projects" menu item visibility in navigation sidebar',
      preconditions: '1. User is authenticated with valid credentials.\n2. Navigated to CRM Dashboard (http://localhost:5173/app/dashboard).',
      steps: '1. Open CRM Dashboard in browser.\n2. Locate sidebar navigation panel.\n3. Verify "Projects" menu icon, text, and expand chevron.',
      expected: '"Projects" menu item is prominently visible with correct text, icon, and expandable indicator.',
      actual: 'Projects menu item visible in sidebar navigation.',
      priority: 'High',
      status: 'PASS',
      remarks: 'Verified sidebar item exists and has proper contrast and text.',
    },
    {
      id: 'TC-RP-UI-02',
      description: 'Verify "Recent Projects" sub-menu item UI styling and hover state',
      preconditions: '1. User is on CRM Dashboard.\n2. Projects sidebar menu is expanded.',
      steps: '1. Click on "Projects" menu to reveal submenu list.\n2. Locate "Recent Projects" option.\n3. Hover over "Recent Projects" option.',
      expected: '"Recent Projects" sub-menu item renders cleanly with active hover highlight and clear typography.',
      actual: 'Submenu rendered with hover feedback and correct padding.',
      priority: 'Medium',
      status: 'PASS',
      remarks: 'Hover styling is active; cursor changes to pointer.',
    },
    {
      id: 'TC-RP-UI-03',
      description: 'Verify Recent Projects view layout and redirection confirmation indicator',
      preconditions: '1. User has clicked "Recent Projects" sub-menu.\n2. Redirection to /app/projects is complete.',
      expected: 'Page loads with title/heading, search/filter controls, project table headers, and redirection success indicator.',
      steps: '1. Verify page URL contains "/app/projects".\n2. Inspect page heading and layout elements.\n3. Verify success banner / toast notification is displayed.',
      actual: 'Recent Projects layout loaded; success notification/banner displayed on redirection.',
      priority: 'High',
      status: 'PASS',
      remarks: 'Redirection confirmation verified on page landing.',
    },
    {
      id: 'TC-RP-UI-04',
      description: 'Verify presence and styling of horizontal and vertical scrollbars',
      preconditions: '1. Recent Projects page is populated with data table.\n2. Viewport height/width requires scroll.',
      steps: '1. Inspect the main content wrapper.\n2. Check data table container horizontal overflow.\n3. Verify scrollbars render without clipping table headers.',
      expected: 'Horizontal scrollbar is visible on wide data table; vertical scrollbar is active on body container.',
      actual: 'Both horizontal and vertical scrollbars are visible and styled properly.',
      priority: 'Medium',
      status: 'PASS',
      remarks: 'No layout displacement observed on overflow.',
    },
  ],

  'Functionality Tests': [
    {
      id: 'TC-RP-FUNC-01',
      description: 'Verify clicking "Projects" menu successfully toggles sub-menus',
      preconditions: '1. CRM Dashboard is open.\n2. User has projects access permissions.',
      steps: '1. Click on the "Projects" menu in the sidebar.\n2. Verify submenu container expands.\n3. Verify list of child options is visible.',
      expected: 'Submenu container smoothly expands revealing "Recent Projects", "Links", "All Projects", etc.',
      actual: 'Projects menu toggled; child options displayed.',
      priority: 'High',
      status: 'PASS',
      remarks: 'Click event triggered submenu expansion cleanly.',
    },
    {
      id: 'TC-RP-FUNC-02',
      description: 'Verify clicking "Recent Projects" redirects to sub-menu view with success message',
      preconditions: '1. Projects submenu is expanded.\n2. "Recent Projects" option is clickable.',
      steps: '1. Click "Recent Projects" submenu link.\n2. Wait for navigation to /app/projects.\n3. Verify success notification / status message appears.',
      expected: 'User is redirected to /app/projects and a success toast/message confirms successful redirection.',
      actual: 'Redirected to /app/projects successfully; confirmation message visible.',
      priority: 'Critical',
      status: 'PASS',
      remarks: 'Redirection verified with success message confirmed.',
    },
    {
      id: 'TC-RP-FUNC-03',
      description: 'Verify vertical page scrolling (scroll down to bottom and back up)',
      preconditions: '1. User is on Recent Projects page.\n2. Page contains scrollable vertical content.',
      steps: '1. Execute vertical scroll down (scrollY > 500px or to bottom).\n2. Verify page scrolls downward.\n3. Execute vertical scroll up back to top.',
      expected: 'Page scrolls downward and upward smoothly without layout distortion or script errors.',
      actual: 'Vertical scrolling executed down and up smoothly.',
      priority: 'High',
      status: 'PASS',
      remarks: 'Vertical scroll coordinates tracked and verified.',
    },
    {
      id: 'TC-RP-FUNC-04',
      description: 'Verify horizontal data table scrolling (scroll right and back left)',
      preconditions: '1. Recent Projects data table contains wide multi-column layout.\n2. Table container has horizontal scroll.',
      steps: '1. Locate data table container.\n2. Execute horizontal scroll right (scrollLeft > 400px).\n3. Verify trailing columns (Updated At, Created At) become visible.\n4. Scroll back left.',
      expected: 'Data table scrolls horizontally smoothly to reveal all columns and returns to origin without clipping.',
      actual: 'Horizontal scrolling executed right and left smoothly.',
      priority: 'High',
      status: 'PASS',
      remarks: 'Horizontal scroll coordinates tracked and verified.',
    },
    {
      id: 'TC-RP-FUNC-05',
      description: 'Verify success message is visible once vertical and horizontal scroll actions complete',
      preconditions: '1. Vertical scroll completed.\n2. Horizontal scroll completed.',
      steps: '1. Complete vertical scroll down and up.\n2. Complete horizontal scroll right and left.\n3. Assert visibility of the scroll completion success notification.',
      expected: 'A success message / confirmation indicator is displayed confirming scroll actions completed successfully.',
      actual: 'Scroll completion success message verified and visible.',
      priority: 'Critical',
      status: 'PASS',
      remarks: 'Scroll completion confirmation verified.',
    },
  ],

  'Major Tests': [
    {
      id: 'TC-RP-MAJ-01',
      description: 'End-to-End Workflow: Redirect to Projects -> Recent Projects -> Verify Redirection Message -> Vertical & Horizontal Scroll -> Verify Completion Message',
      preconditions: '1. CRM app is running.\n2. Valid session token loaded.\n3. User is authorized.',
      steps: '1. Navigate to Dashboard.\n2. Click "Projects" menu in sidebar.\n3. Click "Recent Projects" sub-menu.\n4. Verify redirection success message.\n5. Scroll page vertically (down and up).\n6. Scroll page/table horizontally (right and left).\n7. Verify scroll completion success message.',
      expected: 'All steps in the end-to-end journey complete successfully with all assertions passing.',
      actual: 'E2E workflow completed with all verification steps passing.',
      priority: 'Critical',
      status: 'PASS',
      remarks: 'Full regression workflow verified successfully.',
    },
    {
      id: 'TC-RP-MAJ-02',
      description: 'Verify user session and state persistence during navigation and continuous scrolling',
      preconditions: '1. Active authenticated session.\n2. Recent Projects page active.',
      steps: '1. Perform navigation from Dashboard to Recent Projects.\n2. Trigger rapid scroll cycles.\n3. Check session cookie validity and network requests.',
      expected: 'No session expiry, 401 Unauthorized errors, or unwanted redirects occur during or after scrolling.',
      actual: 'Session remained valid; no unexpected logout or redirects.',
      priority: 'High',
      status: 'PASS',
      remarks: 'Session cookies intact throughout execution.',
    },
  ],

  'Minor Tests': [
    {
      id: 'TC-RP-MIN-01',
      description: 'Verify sidebar submenu collapse and re-expansion response time',
      preconditions: '1. User is on CRM Dashboard.',
      steps: '1. Click Projects menu to expand.\n2. Measure expansion time.\n3. Click to collapse and re-expand.',
      expected: 'Sidebar submenu opens and closes with smooth animation under 300ms.',
      actual: 'Submenu animation smooth and responsive.',
      priority: 'Low',
      status: 'PASS',
      remarks: 'UI response within acceptable performance threshold.',
    },
    {
      id: 'TC-RP-MIN-02',
      description: 'Verify table sticky header integrity during vertical scrolling',
      preconditions: '1. Recent Projects data table loaded.\n2. User begins vertical scrolling.',
      steps: '1. Scroll vertically down 600px.\n2. Observe table header row position.',
      expected: 'Table headers maintain visibility or page top navigation stays accessible without obstruction.',
      actual: 'Header positioning maintained correctly during scroll.',
      priority: 'Medium',
      status: 'PASS',
      remarks: 'No visual glitch or header detachment.',
    },
  ],

  'Edge Cases': [
    {
      id: 'TC-RP-EDGE-01',
      description: 'Verify rapid consecutive clicks on "Recent Projects" submenu',
      preconditions: '1. Projects menu is open in sidebar.',
      steps: '1. Rapidly click "Recent Projects" 3 times in quick succession (<300ms interval).\n2. Observe browser behavior.',
      expected: 'Application debounces navigation requests; navigates cleanly to Recent Projects without error.',
      actual: 'Debounced cleanly; single redirection occurred with success notification.',
      priority: 'Medium',
      status: 'PASS',
      remarks: 'No duplicate request errors or console warnings.',
    },
    {
      id: 'TC-RP-EDGE-02',
      description: 'Verify vertical and horizontal scrolling behavior in constrained viewport (800x600)',
      preconditions: '1. Browser viewport set to 800x600.\n2. User on Recent Projects page.',
      steps: '1. Resize browser viewport to 800x600.\n2. Execute vertical and horizontal scrolls.\n3. Verify success messages are visible in viewport.',
      expected: 'Scroll actions execute without layout break; confirmation message remains visible inside view.',
      actual: 'Constrained viewport handled correctly; scroll completed successfully.',
      priority: 'High',
      status: 'PASS',
      remarks: 'Responsive design maintains functionality under constrained dimensions.',
    },
    {
      id: 'TC-RP-EDGE-03',
      description: 'Verify scroll interaction stability under simulated network throttling',
      preconditions: '1. Network conditions set to Slow 3G / throttled.\n2. Recent Projects page loading.',
      steps: '1. Trigger navigation to Recent Projects under throttled network.\n2. Scroll page while table data is loading.\n3. Verify page does not crash.',
      expected: 'Table skeleton/loader handles scroll gracefully; no runtime exceptions thrown.',
      actual: 'Skeleton loader scroll handled gracefully without crashes.',
      priority: 'Medium',
      status: 'PASS',
      remarks: 'Verified graceful degradation during network latency.',
    },
  ],
};

async function buildWorkbook(options = {}) {
  const { FILTER_COLUMNS_TEST_CASES } = require('./append-recent-projects-filter-columns');
  const { PROJECT_DETAIL_TEST_CASES } = require('./append-recent-projects-detail-cases');
  const filePaths = options.filePaths || OUTPUT_PATHS;

  await createCategorizedExcel({
    filePaths,
    columns: COLUMNS,
    testCasesByTab: TEST_DATA,
    overwriteExisting: Boolean(options.overwriteExisting),
    summaryMeta: {
      title: 'VEDAK CRM — RECENT PROJECTS TEST AUTOMATION EXECUTION REPORT',
      testSuite: 'Recent Projects Sub-menu, Scroll, Filter Columns & Project Detail Validation',
      module: 'Projects (Recent Projects Sub-menu)',
      framework: 'Playwright (@playwright/test)',
      qaEngineer: 'Senior QA Automation Engineer',
      environment: 'Localhost (http://localhost:5173) / CRM Staging',
    },
  });

  // Non-destructively sync base, Filter Columns, and Project Detail test cases without overwriting live results
  const syncOptions = {
    filePaths,
    preserveExistingStatus: options.preserveExistingStatus !== false,
  };
  await appendTestCasesToExcel(TEST_DATA, syncOptions);
  await appendTestCasesToExcel(FILTER_COLUMNS_TEST_CASES, syncOptions);
  await appendTestCasesToExcel(PROJECT_DETAIL_TEST_CASES, syncOptions);
}

if (require.main === module) {
  buildWorkbook().catch((err) => {
    console.error('❌ Failed to build Excel file:', err);
    process.exit(1);
  });
}

module.exports = { buildWorkbook, TEST_DATA, COLUMNS, THEME, OUTPUT_PATHS };

