/**
 * projects-excel-utils.js
 * Single common Excel utility & test case registry for the Vedak CRM Projects module (04_projects).
 *
 * Consolidates all Excel generation, non-destructive test-case appending, execution result
 * updates, flat-sheet updates, and Recent Projects test-case definitions into one file:
 *   - Section 1: Scroll & Recent Projects Sub-menu (16 test cases)
 *   - Section 2: Filter Columns Drawer (11 test cases)
 *   - Section 3: Project Detail Window (17 test cases)
 *
 * Target Workbook (Recent Projects):
 *   modules/04_projects/Vedak_CRM_Recent_Projects_TestCases.xlsx
 *
 * CLI Usage:
 *   node scripts/excel-utils/projects-excel-utils.js                   # Non-destructively sync all 44 cases (keeps PASS/FAIL)
 *   node scripts/excel-utils/projects-excel-utils.js --init            # Create workbook if missing, then sync all cases
 *   node scripts/excel-utils/projects-excel-utils.js --scope=details   # Sync only Project Detail cases (scroll | filter-columns | details | all)
 *   node scripts/excel-utils/projects-excel-utils.js --stats           # Print live workbook PASS/FAIL/PENDING counts
 */

'use strict';

const ExcelJS = require('exceljs');
const path = require('path');
const fs = require('fs');

// ════════════════════════════════════════════════════════════════════════════
// CONSTANTS & THEME
// ════════════════════════════════════════════════════════════════════════════

const RECENT_PROJECTS_EXCEL_PATH = path.join(
  __dirname,
  '../../modules/04_projects/Vedak_CRM_Recent_Projects_TestCases.xlsx'
);

const DEFAULT_RECENT_PROJECTS_EXCEL_PATHS = [RECENT_PROJECTS_EXCEL_PATH];

const DEFAULT_TAB_NAMES = [
  'UI Tests',
  'Functionality Tests',
  'Major Tests',
  'Minor Tests',
  'Edge Cases',
];

const EXCEL_THEME = {
  HEADER_BG: 'FF1F4E79',      // Corporate deep navy
  HEADER_FONT: 'FFFFFFFF',    // White
  SUMMARY_BG: 'FF2E75B6',     // Blue accent
  SUBHEADER_BG: 'FFEAECEE',   // Subtle table sub-header
  META_LABEL_BG: 'FFF2F2F2',  // Metadata key fill
  TOTAL_ROW_BG: 'FFD9E1F2',   // Grand total highlight
  ZEBRA_BG: 'FFF9FAFB',       // Alternating row striping
  BORDER_COLOR: 'FFD9D9D9',   // Light grey cell border
  PASS_BG: 'FFD9EAD3',        // Soft green
  PASS_FONT: 'FF274E13',
  FAIL_BG: 'FFF4CCCC',        // Soft red
  FAIL_FONT: 'FF990000',
  PENDING_BG: 'FFFFF2CC',     // Soft yellow
  PENDING_FONT: 'FF7F6000',
};

const FLAT_STATUS_COLORS = {
  PASS: '00B050',
  FAIL: 'C00000',
  PENDING: 'FFC000',
  TEXT: 'FFFFFF',
};

const DEFAULT_TEST_CASE_COLUMNS = [
  { header: 'Test Case ID', key: 'id', width: 16 },
  { header: 'Test Scenario / Description', key: 'description', width: 34 },
  { header: 'Pre-conditions', key: 'preconditions', width: 32 },
  { header: 'Test Steps', key: 'steps', width: 44 },
  { header: 'Expected Result', key: 'expected', width: 40 },
  { header: 'Actual Result', key: 'actual', width: 36 },
  { header: 'Priority', key: 'priority', width: 12 },
  { header: 'Status', key: 'status', width: 14 },
  { header: 'Execution Date', key: 'date', width: 22 },
  { header: 'Remarks', key: 'remarks', width: 36 },
];

const DEFAULT_SUMMARY_META = {
  title: 'VEDAK CRM — PROJECTS TEST AUTOMATION EXECUTION REPORT',
  testSuite: 'Projects Module Automated Test Suite',
  module: 'Projects (04_projects)',
  framework: 'Playwright (@playwright/test)',
  qaEngineer: 'Senior QA Automation Engineer',
  environment: 'Localhost (http://localhost:5173) / CRM Staging',
};

const RECENT_PROJECTS_SUMMARY_META = {
  title: 'VEDAK CRM — RECENT PROJECTS TEST AUTOMATION EXECUTION REPORT',
  testSuite: 'Recent Projects Sub-menu, Scroll, Filter Columns & Project Detail Validation',
  module: 'Projects (Recent Projects Sub-menu)',
  framework: 'Playwright (@playwright/test)',
  qaEngineer: 'Senior QA Automation Engineer',
  environment: 'Localhost (http://localhost:5173) / CRM Staging',
};

// ════════════════════════════════════════════════════════════════════════════
// TEST CASE DEFINITIONS — SECTION 1: RECENT PROJECTS NAVIGATION & SCROLL (16)
// ════════════════════════════════════════════════════════════════════════════

const RECENT_PROJECTS_SCROLL_CASES = {
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
      steps: '1. Verify page URL contains "/app/projects".\n2. Inspect page heading and layout elements.\n3. Verify success banner / toast notification is displayed.',
      expected: 'Page loads with title/heading, search/filter controls, project table headers, and redirection success indicator.',
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

// ════════════════════════════════════════════════════════════════════════════
// TEST CASE DEFINITIONS — SECTION 2: FILTER COLUMNS DRAWER (11)
// ════════════════════════════════════════════════════════════════════════════

const FILTER_COLUMNS_TEST_CASES = {
  'UI Tests': [
    {
      id: 'TC-RP-UI-05',
      description: 'Verify "Filter Columns" button icon and tooltip visibility on Recent Projects page',
      preconditions: '1. User is authenticated with valid session.\n2. Navigated to Projects -> Recent Projects (/app/projects).',
      steps: '1. Locate the Filter Columns (Columns3 icon) button in the top-right action bar.\n2. Hover over the Filter Columns button.\n3. Verify tooltip "Filter Columns" is displayed.',
      expected: '"Filter Columns" icon button is visible, clickable, and displays the "Filter Columns" tooltip on hover.',
      actual: 'Filter Columns icon button visible in top-right toolbar with "Filter Columns" tooltip.',
      priority: 'High',
      status: 'PASS',
      remarks: 'Verified Columns3 trigger button and Radix tooltip "Filter Columns".',
    },
    {
      id: 'TC-RP-UI-06',
      description: 'Verify clicking "Filter Columns" opens drawer view displaying "Table Columns" heading, checkboxes, and column labels',
      preconditions: '1. User is on Recent Projects page.\n2. Filter Columns button is visible.',
      steps: '1. Click on the Filter Columns button.\n2. Observe the dropdown/drawer view.\n3. Verify "Table Columns" header and list of column checkboxes + labels render cleanly.',
      expected: 'Drawer view opens displaying "Table Columns" heading, scrollable list of 27 table column items, and clear disabled/enabled checkbox styling.',
      actual: 'Table Columns drawer opened with heading, checkboxes, and all column labels.',
      priority: 'High',
      status: 'PASS',
      remarks: 'Drawer renders w-[250px] scrollable container with Table Columns header and 27 column options.',
    },
  ],

  'Functionality Tests': [
    {
      id: 'TC-RP-FUNC-06',
      description: 'Verify Filter Columns drawer displays Table Columns, shows success message, and lists all visible table column names',
      preconditions: '1. User is on Recent Projects page (/app/projects).\n2. Projects table is loaded.',
      steps: '1. Click upon Filter Columns button.\n2. Verify drawer view with "Table Columns" list is visible.\n3. Verify success message is visible confirming Table Columns list.\n4. Extract and list all visible table column names from the table header and drawer.',
      expected: 'Table Columns drawer becomes visible, success confirmation message is shown, and all currently visible column names are listed accurately.',
      actual: 'Table Columns drawer visible, success toast shown, and visible column names extracted.',
      priority: 'Critical',
      status: 'PASS',
      remarks: 'Listed visible columns: ID, Title, Region, Country, Email -> S.P., Quality, Status, Client, Owner, PC, Calls, Experts, E1, E2, E3, E4, E5, Flags, Start, Project Age, Created, Updated, Last Active, #, Move.',
    },
    {
      id: 'TC-RP-FUNC-07',
      description: 'Identify and list Table Column names categorized by checkbox Disabled vs Enabled state',
      preconditions: '1. Filter Columns ("Table Columns") drawer is open on Recent Projects page.',
      steps: '1. Iterate through all column items in the "Table Columns" drawer.\n2. Check disabled/data-disabled attribute on each checkbox.\n3. Separate and log Disabled checkbox column names and Enabled checkbox column names.',
      expected: 'Accurately lists disabled columns (ID, Title, Client, Owner) and enabled toggleable columns (Industry, Function, Region, Country, Email -> S.P., Quality, Status, PC, Calls, Experts, E1-E5, Flags, Start, Project Age, Created, Updated, Last Active, #, Move).',
      actual: 'Categorized 4 disabled columns (ID, Title, Client, Owner) and 23 enabled columns.',
      priority: 'High',
      status: 'PASS',
      remarks: 'Disabled (4): ID, Title, Client, Owner | Enabled (23): Industry, Function, Region, Country, Email -> S.P., Quality, Status, PC, Calls, Experts, E1, E2, E3, E4, E5, Flags, Start, Project Age, Created, Updated, Last Active, #, Move.',
    },
    {
      id: 'TC-RP-FUNC-08',
      description: 'Click a random enabled checked checkbox in Filter Columns and verify the respective column is no longer visible in the table',
      preconditions: '1. Filter Columns drawer is open.\n2. Multiple enabled checkboxes are currently checked and visible in the table.',
      steps: '1. Select a random enabled & checked checkbox (e.g., Region / Country / Quality / PC / Flags).\n2. Click the checkbox to unselect it.\n3. Inspect the Recent Projects table headers (`table thead th`).',
      expected: 'The unselected column header is removed from the table and is no longer visible.',
      actual: 'Random enabled checkbox clicked; respective column header disappeared from table.',
      priority: 'Critical',
      status: 'PASS',
      remarks: 'Randomly unselected enabled column and confirmed column header is hidden from table.',
    },
    {
      id: 'TC-RP-FUNC-09',
      description: 'Click Filter Columns button again and verify the previously unselected checkbox remains in unselected state',
      preconditions: '1. A random enabled column was unselected in TC-RP-FUNC-08.\n2. Column is hidden from the table.',
      steps: '1. Click again upon the Filter Columns button.\n2. Wait for the "Table Columns" drawer to open.\n3. Locate the column unchecked in TC-RP-FUNC-08 and inspect its checked state.',
      expected: 'The respective checkbox is confirmed to be in the unselected (`aria-checked="false"` / `unchecked`) state.',
      actual: 'Re-opened Filter Columns drawer; respective checkbox verified in unselected state.',
      priority: 'Critical',
      status: 'PASS',
      remarks: 'Checkbox state persisted as unselected upon reopening Filter Columns drawer.',
    },
    {
      id: 'TC-RP-FUNC-10',
      description: 'Click Filter Columns button, select a random unselected checkbox, and verify the respective column becomes visible in the table',
      preconditions: '1. At least one enabled checkbox in Filter Columns is in unselected state.',
      steps: '1. Click upon the Filter Columns button to open "Table Columns" drawer.\n2. Pick a random unselected enabled checkbox and click it to select it.\n3. Inspect the Recent Projects table headers (`table thead th`).',
      expected: 'The checkbox toggles to selected state and the respective column header becomes visible in the table.',
      actual: 'Random unselected checkbox selected; respective column became visible in table.',
      priority: 'Critical',
      status: 'PASS',
      remarks: 'Re-selected enabled checkbox and confirmed column header rendered in table.',
    },
  ],

  'Major Tests': [
    {
      id: 'TC-RP-MAJ-03',
      description: 'End-to-End Filter Columns Workflow: Open Drawer -> Success Msg -> List Visible/Disabled/Enabled -> Uncheck Random -> Verify Hidden -> Re-open Verify Unselected -> Re-select Random -> Verify Visible',
      preconditions: '1. Valid authenticated session.\n2. User on Recent Projects page (/app/projects).',
      steps: '1. Click Filter Columns button and confirm "Table Columns" drawer + success message.\n2. List visible columns, disabled checkboxes, and enabled checkboxes.\n3. Click a random enabled checked checkbox and verify column hides.\n4. Click Filter Columns again and verify checkbox is unselected.\n5. Click Filter Columns / select a random unselected checkbox and verify column reappears.',
      expected: 'Complete hide/persist/show Filter Columns workflow executes cleanly with accurate DOM and checkbox state synchronization.',
      actual: 'Full E2E Filter Columns toggle lifecycle verified with all assertions passing.',
      priority: 'Critical',
      status: 'PASS',
      remarks: 'End-to-end Filter Columns toggle, state check, and table visibility workflow passed.',
    },
  ],

  'Minor Tests': [
    {
      id: 'TC-RP-MIN-03',
      description: 'Verify Filter Columns drawer internal scrolling and Escape / outside-click close behavior',
      preconditions: '1. "Table Columns" drawer is open on Recent Projects page.',
      steps: '1. Scroll inside the "Table Columns" drawer container to view bottom options (#, Move).\n2. Press Escape key to dismiss the drawer.',
      expected: 'Drawer scrolls smoothly through all 27 column items and closes cleanly on Escape without unintended column changes.',
      actual: 'Drawer scrolled to bottom items and closed cleanly on Escape.',
      priority: 'Low',
      status: 'PASS',
      remarks: 'Internal overflow-y-auto scroll and Escape dismissal verified.',
    },
  ],

  'Edge Cases': [
    {
      id: 'TC-RP-EDGE-04',
      description: 'Verify disabled checkboxes (ID, Title, Client, Owner) cannot be unchecked and core columns stay visible',
      preconditions: '1. "Table Columns" drawer is open.',
      steps: '1. Locate checkboxes for ID, Title, Client, and Owner.\n2. Assert each has `disabled` / `data-disabled` attribute.\n3. Verify clicking does not toggle state and columns remain visible in table.',
      expected: 'Disabled checkboxes remain locked/checked and core columns remain visible in table.',
      actual: 'All 4 disabled checkboxes (ID, Title, Client, Owner) remained locked and visible.',
      priority: 'High',
      status: 'PASS',
      remarks: 'Verified disabled lock enforcement on ID, Title, Client, and Owner.',
    },
    {
      id: 'TC-RP-EDGE-05',
      description: 'Verify Filter Columns preference persistence after toggling and page reload',
      preconditions: '1. User has permission to save column preferences (`saveTableColumn` API active).',
      steps: '1. Uncheck a random enabled column via Filter Columns.\n2. Wait for preference save request to complete.\n3. Reload page and reopen Filter Columns to inspect persisted state (then restore).',
      expected: 'Toggled column visibility persists across page reloads via saved table columns state.',
      actual: 'Saved column visibility verified across reload and restored.',
      priority: 'Medium',
      status: 'PASS',
      remarks: 'Verified preference persistence via store/backend sync and restored column state.',
    },
  ],
};

// ════════════════════════════════════════════════════════════════════════════
// TEST CASE DEFINITIONS — SECTION 3: PROJECT DETAIL WINDOW (17)
// ════════════════════════════════════════════════════════════════════════════

const PROJECT_DETAIL_TEST_CASES = {
  'UI Tests': [
    {
      id: 'TC-RP-UI-07',
      description: 'Verify Project Detail page header, reference ID link navigation, info chips, and all 11 workspace tabs UI visibility',
      preconditions: '1. User is authenticated with valid session.\n2. User has clicked a project link from Recent Projects (/app/projects) and redirected to /app/projects/project/<reference_id>.',
      steps: '1. Open Recent Projects list and click any editable active project link.\n2. Inspect project title header, Go Back button, and top info chip bar (Vedak Members, Onboarding, Awaiting feedback, Scheduling, Status, Quality Status).\n3. Verify all workspace tabs render cleanly: Overview, Targets, Interested, Potential, Email Outreach, Response, Client Requests, Activities, Performance, Chat, and Agenda Risk Analyser.',
      expected: 'Project detail layout renders project title, all header action/toggle chips, and all 11 workspace tabs cleanly without clipping or overlap.',
      actual: 'Pending execution against http://localhost:5173.',
      priority: 'High',
      status: 'PENDING',
      remarks: 'Awaiting live execution.',
    },
    {
      id: 'TC-RP-UI-08',
      description: 'Verify Vedak Members ("Project Members") popup modal UI layout, role column, count label, cross icon, and Close button',
      preconditions: '1. User is on a Project Detail page (/app/projects/project/<reference_id>).\n2. Vedak Members chip is visible in the top info bar.',
      steps: '1. Click on the Vedak Members chip/avatars.\n2. Inspect the opened "Project Members" dialog.\n3. Verify header columns ("Member", "Project Role", "Action"), top-right cross (X) button, bottom-left "<N> project members" counter, and bottom-right "Close" button.',
      expected: '"Project Members" popup dialog renders with clean column headers, member avatar rows, role badges/dropdowns, top-RHS close icon, member counter, and footer "Close" button.',
      actual: 'Pending execution against http://localhost:5173.',
      priority: 'Medium',
      status: 'PENDING',
      remarks: 'Awaiting live execution.',
    },
  ],

  'Functionality Tests': [
    {
      id: 'TC-RP-FUNC-11',
      description: 'Click project link from Recent Projects list, print Project Title, verify redirection URL with Reference ID, and display success message',
      preconditions: '1. User is authenticated.\n2. Redirected to Recent Projects page (/app/projects) and project list table is visible.',
      steps: '1. Verify project list rows are visible on Recent Projects page.\n2. Click on any project link (`a[href*="/app/projects/project/"]`).\n3. Capture and print the opened project title.\n4. Verify URL redirects to `/app/projects/project/<reference_id>`, extract and print the reference ID from the URL, and confirm redirection success message is visible.',
      expected: 'Clicking the project link redirects user to `/app/projects/project/<reference_id>`, prints both Project Title and URL Reference ID accurately, and displays visible success confirmation.',
      actual: 'Pending execution against http://localhost:5173.',
      priority: 'Critical',
      status: 'PENDING',
      remarks: 'Awaiting live execution.',
    },
    {
      id: 'TC-RP-FUNC-12',
      description: 'Individually click Overview, Targets, Interested, Potential, Email Outreach, Response, Client Requests, Activities, Performance, Chat, and Agenda Risk Analyser tabs with success message on each',
      preconditions: '1. User is redirected to an active subproject detail page (`/app/projects/project/<reference_id>`).\n2. Project tabs and Agenda Risk Analyser button are enabled.',
      steps: '1. Click Overview, Targets, Interested, Potential, Email Outreach, Response, Client Requests, Activities, Performance, Chat tabs one by one.\n2. Verify each tab activates its respective view and URL route.\n3. Verify success message toast appears after opening each tab.\n4. Click the Agenda Risk Analyser button, verify the Agenda Risk Analyser sheet opens with success message, then close it cleanly.',
      expected: 'All 11 tabs/windows open their respective views cleanly without errors and display a visible success confirmation message upon opening each tab.',
      actual: 'Pending execution against http://localhost:5173.',
      priority: 'Critical',
      status: 'PENDING',
      remarks: 'Awaiting live execution.',
    },
    {
      id: 'TC-RP-FUNC-13',
      description: 'Click Vedak Members button, read and list all project members visible in popup along with their respective project roles',
      preconditions: '1. User is on a Project Detail page (`/app/projects/project/<reference_id>`).',
      steps: '1. Click upon the Vedak Members chip/avatars.\n2. Wait for the "Project Members" popup list to load.\n3. Extract every member name, optional Owner badge, and respective Project Role (`AO`, `PC`, `AO & PC`, `RC`).\n4. Print and record the full member-role mapping.',
      expected: 'All project members assigned to the project are visible inside the popup and accurately listed with their respective project roles (`AO`, `PC`, `AO & PC`, `RC`).',
      actual: 'Pending execution against http://localhost:5173.',
      priority: 'High',
      status: 'PENDING',
      remarks: 'Awaiting live execution.',
    },
    {
      id: 'TC-RP-FUNC-14',
      description: 'Verify Vedak Members popup close via top-RHS cross button, validate visible member count match, and close via Close button',
      preconditions: '1. User is on a Project Detail page with Vedak Members popup available.',
      steps: '1. Open Vedak Members popup and note number of visible member rows.\n2. Click the top-RHS cross mark (`X`) close button and verify popup closes.\n3. Re-click Vedak Members, verify footer count ("<N> project members") matches the visible members in the popup.\n4. Click the footer "Close" button and verify popup closes cleanly.',
      expected: 'Top-RHS cross button closes popup, footer count strictly matches visible member count inside popup, and clicking "Close" button closes the popup.',
      actual: 'Pending execution against http://localhost:5173.',
      priority: 'High',
      status: 'PENDING',
      remarks: 'Awaiting live execution.',
    },
    {
      id: 'TC-RP-FUNC-15',
      description: 'Toggle Onboarding switch ON/OFF, verify success message, navigate to Activities tab, refresh immediately, and verify recent activity log',
      preconditions: '1. User has edit/member permissions on an active "In Progress" subproject.\n2. Onboarding toggle switch is enabled.',
      steps: '1. Note initial state of Onboarding switch and click to turn it OFF/ON.\n2. Verify "Project status updated successfully" toast/message is visible.\n3. Click on the Activities tab and immediately refresh the page (`page.reload()`).\n4. Verify recent activity logs are displayed in the Activities table (and restore switch state cleanly).',
      expected: 'Onboarding switch toggles cleanly, displays success confirmation toast, and immediately persisted activity log entry appears in Activities after page refresh.',
      actual: 'Pending execution against http://localhost:5173.',
      priority: 'Critical',
      status: 'PENDING',
      remarks: 'Awaiting live execution.',
    },
    {
      id: 'TC-RP-FUNC-16',
      description: 'Toggle Awaiting Feedback switch ON/OFF, verify success message, navigate to Activities tab, refresh immediately, and verify recent activity log',
      preconditions: '1. User has edit/member permissions on an active "In Progress" subproject.\n2. Awaiting feedback toggle switch is enabled.',
      steps: '1. Note initial state of Awaiting feedback switch and click to turn it ON/OFF.\n2. Verify "Project status updated successfully" toast/message is visible.\n3. Click on the Activities tab and immediately refresh the page (`page.reload()`).\n4. Verify recent activity logs are displayed in the Activities table (and restore switch state cleanly).',
      expected: 'Awaiting Feedback switch toggles cleanly, displays success confirmation toast, and immediately persisted activity log entry appears in Activities after page refresh.',
      actual: 'Pending execution against http://localhost:5173.',
      priority: 'Critical',
      status: 'PENDING',
      remarks: 'Awaiting live execution.',
    },
    {
      id: 'TC-RP-FUNC-17',
      description: 'Toggle Scheduling switch ON/OFF, verify success message, navigate to Activities tab, refresh immediately, and verify recent activity log',
      preconditions: '1. User has edit/member permissions on an active "In Progress" subproject.\n2. Scheduling toggle switch is enabled.',
      steps: '1. Note initial state of Scheduling switch and click to turn it ON/OFF.\n2. Verify "Project status updated successfully" toast/message is visible.\n3. Click on the Activities tab and immediately refresh the page (`page.reload()`).\n4. Verify recent activity logs are displayed in the Activities table (and restore switch state cleanly).',
      expected: 'Scheduling switch toggles cleanly, displays success confirmation toast, and immediately persisted activity log entry appears in Activities after page refresh.',
      actual: 'Pending execution against http://localhost:5173.',
      priority: 'Critical',
      status: 'PENDING',
      remarks: 'Awaiting live execution.',
    },
    {
      id: 'TC-RP-FUNC-18',
      description: 'Select random status from Status dropdown, verify success message, navigate to Activities tab, refresh immediately, and verify recent activity log',
      preconditions: '1. User has permission to update project Status on an editable non-archived subproject.',
      steps: '1. Click the Status dropdown combobox and record current status.\n2. Select a random different status from the dropdown list (e.g., Open, On Hold, Completed, Cancelled, In Progress).\n3. Verify "Project status updated successfully" toast/message is visible.\n4. Click Activities tab, refresh page immediately, verify recent activity log is visible, then restore original Status.',
      expected: 'Selected random status updates project status cleanly, shows success message, and persists an activity log entry visible in Activities after immediate reload.',
      actual: 'Pending execution against http://localhost:5173.',
      priority: 'Critical',
      status: 'PENDING',
      remarks: 'Awaiting live execution.',
    },
  ],

  'Major Tests': [
    {
      id: 'TC-RP-MAJ-04',
      description: 'End-to-End Project Detail Journey: Open Recent Project -> Print Title & Ref ID -> Cycle All 11 Tabs -> Verify Vedak Members, Roles, Count & X/Close Dismissal',
      preconditions: '1. Authenticated user on Recent Projects (/app/projects) with active project rows.',
      steps: '1. Click any active project row link and verify URL reference ID + title + success message.\n2. Navigate through all 11 tabs including Agenda Risk Analyser confirming each opens with success message.\n3. Open Vedak Members, capture members with roles, verify count matches rows, and verify dismissal via both top-RHS X and footer Close button.',
      expected: 'Complete end-to-end project navigation, tab switching, and member inspection flow executes smoothly without console or UI failures.',
      actual: 'Pending execution against http://localhost:5173.',
      priority: 'Critical',
      status: 'PENDING',
      remarks: 'Awaiting live execution.',
    },
    {
      id: 'TC-RP-MAJ-05',
      description: 'End-to-End Switches & Status Audit Trail: Toggle Onboarding, Awaiting Feedback, Scheduling, and Status -> Verify Toasts & Persisted Activities After Immediate Reload',
      preconditions: '1. User is on an active "In Progress" subproject with edit access.',
      steps: '1. Toggle Onboarding, Awaiting feedback, and Scheduling sequentially verifying success toast on each.\n2. Select a random status from Status dropdown and verify success toast.\n3. Open Activities tab, immediately refresh page, confirm recent activity logs reflect updates, and restore original project state.',
      expected: 'All status flags and phase switches persist to backend, display success toasts, and leave visible activity logs in Activities after immediate reload.',
      actual: 'Pending execution against http://localhost:5173.',
      priority: 'Critical',
      status: 'PENDING',
      remarks: 'Awaiting live execution.',
    },
  ],

  'Minor Tests': [
    {
      id: 'TC-RP-MIN-04',
      description: 'Verify Agenda Risk Analyser tooltip, slide-over sheet header, and clean Escape dismissal',
      preconditions: '1. User is on a Project Detail page with Agenda Risk Analyser icon visible.',
      steps: '1. Hover over the Agenda Risk Analyser button to verify tooltip text.\n2. Click to open Agenda Risk Analyser sheet and verify heading renders.\n3. Press Escape and confirm sheet closes cleanly.',
      expected: 'Tooltip displays "Agenda Risk Analyser", sheet renders cleanly, and Escape key closes the sheet without blocking UI.',
      actual: 'Pending execution against http://localhost:5173.',
      priority: 'Low',
      status: 'PENDING',
      remarks: 'Awaiting live execution.',
    },
    {
      id: 'TC-RP-MIN-05',
      description: 'Verify Overview Parent Project (PP) link visibility and Go Back button navigation on subproject detail page',
      preconditions: '1. User is on a subproject detail page (/app/projects/project/<reference_id>).',
      steps: '1. Verify Parent Project (PP) link/copy icon renders under Overview tab bar.\n2. Verify left-arrow Go Back button is clickable in the top title header.',
      expected: 'Overview bar displays Parent Project metadata cleanly and Go Back navigation control functions properly.',
      actual: 'Pending execution against http://localhost:5173.',
      priority: 'Low',
      status: 'PENDING',
      remarks: 'Awaiting live execution.',
    },
  ],

  'Edge Cases': [
    {
      id: 'TC-RP-EDGE-06',
      description: 'Verify Onboarding, Awaiting Feedback, and Scheduling switches are disabled when Status is not "In Progress" and re-enabled when restored to "In Progress"',
      preconditions: '1. User is on an editable "In Progress" subproject detail page.',
      steps: '1. Confirm Onboarding, Awaiting feedback, and Scheduling switches are enabled while Status is "In Progress".\n2. Change Status dropdown to "Open" or "On Hold".\n3. Verify all three phase switches become disabled.\n4. Restore Status to "In Progress" and confirm switches re-enable.',
      expected: 'UI enforces business rule disabling Onboarding, Awaiting feedback, and Scheduling toggles unless Status is "In Progress".',
      actual: 'Pending execution against http://localhost:5173.',
      priority: 'High',
      status: 'PENDING',
      remarks: 'Awaiting live execution.',
    },
    {
      id: 'TC-RP-EDGE-07',
      description: 'Verify rapid consecutive switching across project tabs without uncaught client errors or blank tab views',
      preconditions: '1. User is on an active subproject detail page.',
      steps: '1. Rapidly click Overview -> Targets -> Interested -> Potential -> Activities -> Chat.\n2. Monitor console/pageerror listeners and confirm final selected panel renders properly.',
      expected: 'App handles rapid tab switches gracefully with no uncaught runtime exceptions and renders active panel accurately.',
      actual: 'Pending execution against http://localhost:5173.',
      priority: 'Medium',
      status: 'PENDING',
      remarks: 'Awaiting live execution.',
    },
    {
      id: 'TC-RP-EDGE-08',
      description: 'Verify invalid project reference ID in URL (/app/projects/project/zzzz) displays graceful "Project Not Found" 404 fallback',
      preconditions: '1. User is authenticated with valid session.',
      steps: '1. Navigate directly to `/app/projects/project/zzzz` (invalid reference ID).\n2. Inspect rendered page state.',
      expected: 'Application gracefully renders "Project Not Found" and "Error 404: Project Unavailable" recovery options ("Go to All Projects", "Try Again") without crashing.',
      actual: 'Pending execution against http://localhost:5173.',
      priority: 'Medium',
      status: 'PENDING',
      remarks: 'Awaiting live execution.',
    },
  ],
};

function mergeTestCaseSets(...sets) {
  const merged = {};
  for (const set of sets) {
    if (!set || typeof set !== 'object') continue;
    for (const [tabName, cases] of Object.entries(set)) {
      if (!merged[tabName]) merged[tabName] = [];
      merged[tabName].push(...(cases || []));
    }
  }
  return merged;
}

const ALL_RECENT_PROJECTS_CASES = mergeTestCaseSets(
  RECENT_PROJECTS_SCROLL_CASES,
  FILTER_COLUMNS_TEST_CASES,
  PROJECT_DETAIL_TEST_CASES
);

// ════════════════════════════════════════════════════════════════════════════
// LOW-LEVEL EXCELJS HELPERS
// ════════════════════════════════════════════════════════════════════════════

function getISTExecutionDate(date = new Date()) {
  return date.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
}

function cellText(cell) {
  const val = cell ? cell.value : '';
  if (val === null || val === undefined) return '';
  if (typeof val === 'object') {
    if (Array.isArray(val.richText)) {
      return val.richText.map((part) => part.text || '').join('').trim();
    }
    if (val.text !== undefined) return String(val.text).trim();
    if (val.result !== undefined) return String(val.result).trim();
  }
  return String(val).trim();
}

function normalizeFilePaths(filePaths, fallbackPaths = DEFAULT_RECENT_PROJECTS_EXCEL_PATHS) {
  const raw = filePaths
    ? (Array.isArray(filePaths) ? filePaths : [filePaths])
    : fallbackPaths;

  const seen = new Set();
  const normalized = [];
  for (const p of raw) {
    if (!p || typeof p !== 'string') continue;
    const resolved = path.resolve(p);
    if (!seen.has(resolved)) {
      seen.add(resolved);
      normalized.push(resolved);
    }
  }
  return normalized;
}

function applyStatusCellStyle(statusCell, statusValue, theme = EXCEL_THEME) {
  const status = String(statusValue || 'PENDING').toUpperCase();
  statusCell.alignment = { horizontal: 'center', vertical: 'middle' };

  if (status.includes('PASS')) {
    statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: theme.PASS_BG } };
    statusCell.font = { bold: true, color: { argb: theme.PASS_FONT } };
  } else if (status.includes('FAIL')) {
    statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: theme.FAIL_BG } };
    statusCell.font = { bold: true, color: { argb: theme.FAIL_FONT } };
  } else {
    statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: theme.PENDING_BG } };
    statusCell.font = { bold: true, color: { argb: theme.PENDING_FONT } };
  }
}

function styleHeaderRow(headerRow, options = {}) {
  const theme = options.theme || EXCEL_THEME;
  headerRow.height = options.height || 30;

  headerRow.eachCell((cell) => {
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: theme.HEADER_BG },
    };
    cell.font = {
      name: 'Calibri',
      size: 11,
      bold: true,
      color: { argb: theme.HEADER_FONT },
    };
    cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    cell.border = {
      top: { style: 'thin', color: { argb: theme.BORDER_COLOR } },
      bottom: { style: 'medium', color: { argb: 'FF000000' } },
      left: { style: 'thin', color: { argb: theme.BORDER_COLOR } },
      right: { style: 'thin', color: { argb: theme.BORDER_COLOR } },
    };
  });
}

function styleDataRow(row, rowIdx, statusValue, options = {}) {
  const theme = options.theme || EXCEL_THEME;
  const statusCol = options.statusCol || 8;
  const centerCols = options.centerCols || [1, 7, 8, 9];
  const rowHeight = options.rowHeight || 60;

  row.height = rowHeight;
  const isEven = rowIdx % 2 === 0;

  row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
    cell.font = { name: 'Calibri', size: 10 };
    cell.border = {
      top: { style: 'thin', color: { argb: theme.BORDER_COLOR } },
      bottom: { style: 'thin', color: { argb: theme.BORDER_COLOR } },
      left: { style: 'thin', color: { argb: theme.BORDER_COLOR } },
      right: { style: 'thin', color: { argb: theme.BORDER_COLOR } },
    };

    if (isEven) {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: theme.ZEBRA_BG },
      };
    } else if (cell.fill && colNumber !== statusCol) {
      cell.fill = undefined;
    }

    if (centerCols.includes(colNumber)) {
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
    } else {
      cell.alignment = { horizontal: 'left', vertical: 'middle', wrapText: true };
    }

    if (colNumber === statusCol) {
      applyStatusCellStyle(cell, statusValue, theme);
    }
  });
}

function recalculateSummary(wb, executionDate, options = {}) {
  const tabNames = options.tabNames || DEFAULT_TAB_NAMES;
  const idCol = options.idCol || 1;
  const statusCol = options.statusCol || 8;
  const summaryStartRow = options.summaryStartRow || 14;
  const summarySheetName = options.summarySheetName || 'Summary';
  const theme = options.theme || EXCEL_THEME;

  const catStats = {};

  for (const tabName of tabNames) {
    const sheet = wb.getWorksheet(tabName);
    if (!sheet) continue;

    let sheetTotal = 0;
    let sheetPass = 0;
    let sheetFail = 0;
    let sheetPending = 0;

    sheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return;
      const testId = cellText(row.getCell(idCol));
      if (!testId) return;

      sheetTotal++;
      const status = cellText(row.getCell(statusCol)).toUpperCase();
      if (status.includes('PASS')) sheetPass++;
      else if (status.includes('FAIL')) sheetFail++;
      else sheetPending++;
    });

    catStats[tabName] = {
      total: sheetTotal,
      passed: sheetPass,
      failed: sheetFail,
      pending: sheetPending,
    };
  }

  const summarySheet = wb.getWorksheet(summarySheetName);
  let grandTotal = 0;
  let grandPass = 0;
  let grandFail = 0;
  let grandPending = 0;

  if (summarySheet) {
    if (executionDate) {
      summarySheet.getCell('C8').value = executionDate;
    }

    let catRow = summaryStartRow;

    for (const tabName of tabNames) {
      const stats = catStats[tabName] || { total: 0, passed: 0, failed: 0, pending: 0 };
      grandTotal += stats.total;
      grandPass += stats.passed;
      grandFail += stats.failed;
      grandPending += stats.pending;

      summarySheet.getCell(`B${catRow}`).value = tabName;
      summarySheet.getCell(`C${catRow}`).value = stats.total;
      summarySheet.getCell(`D${catRow}`).value = stats.passed;
      summarySheet.getCell(`E${catRow}`).value =
        stats.total > 0 ? `${Math.round((stats.passed / stats.total) * 100)}%` : '0%';
      summarySheet.getCell(`C${catRow}`).alignment = { horizontal: 'center' };
      summarySheet.getCell(`D${catRow}`).alignment = { horizontal: 'center' };
      summarySheet.getCell(`E${catRow}`).alignment = { horizontal: 'center' };
      catRow++;
    }

    summarySheet.getCell(`B${catRow}`).value = 'GRAND TOTAL';
    summarySheet.getCell(`B${catRow}`).font = { bold: true };
    summarySheet.getCell(`C${catRow}`).value = grandTotal;
    summarySheet.getCell(`C${catRow}`).font = { bold: true };
    summarySheet.getCell(`C${catRow}`).alignment = { horizontal: 'center' };
    summarySheet.getCell(`D${catRow}`).value = grandPass;
    summarySheet.getCell(`D${catRow}`).font = { bold: true };
    summarySheet.getCell(`D${catRow}`).alignment = { horizontal: 'center' };
    summarySheet.getCell(`E${catRow}`).value =
      grandTotal > 0 ? `${Math.round((grandPass / grandTotal) * 100)}%` : '0%';
    summarySheet.getCell(`E${catRow}`).font = { bold: true };
    summarySheet.getCell(`E${catRow}`).alignment = { horizontal: 'center' };

    ['B', 'C', 'D', 'E'].forEach((col) => {
      summarySheet.getCell(`${col}${catRow}`).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: theme.TOTAL_ROW_BG },
      };
    });
  } else {
    for (const stats of Object.values(catStats)) {
      grandTotal += stats.total;
      grandPass += stats.passed;
      grandFail += stats.failed;
      grandPending += stats.pending;
    }
  }

  return {
    categories: catStats,
    total: grandTotal,
    passed: grandPass,
    failed: grandFail,
    pending: grandPending,
    passRate: grandTotal > 0 ? `${Math.round((grandPass / grandTotal) * 100)}%` : '0%',
  };
}

// ════════════════════════════════════════════════════════════════════════════
// WORKBOOK CREATION, NON-DESTRUCTIVE APPENDING & RESULT UPDATES
// ════════════════════════════════════════════════════════════════════════════

function createCategoryWorksheet(wb, tabName, cases = [], options = {}) {
  const columns = options.columns || DEFAULT_TEST_CASE_COLUMNS;
  const executionDate = options.executionDate || getISTExecutionDate();
  const rowHeight = options.rowHeight || 54;
  const theme = options.theme || EXCEL_THEME;

  const existing = wb.getWorksheet(tabName);
  const ws = existing || wb.addWorksheet(tabName, { views: [{ showGridLines: true }] });

  if (!existing) {
    ws.columns = columns;
    styleHeaderRow(ws.getRow(1), { theme, height: options.headerHeight || 30 });
  }

  cases.forEach((tc, idx) => {
    const status = String(tc.status || 'PENDING').toUpperCase();
    const row = ws.addRow({
      id: tc.id,
      description: tc.description || tc.name || '',
      preconditions: tc.preconditions || '',
      steps: tc.steps || '',
      expected: tc.expected || '',
      actual: tc.actual || '',
      priority: tc.priority || 'Medium',
      status,
      date: tc.date || executionDate,
      remarks: tc.remarks || '',
    });
    styleDataRow(row, idx, status, { theme, rowHeight });
  });

  return ws;
}

function buildCategorizedWorkbook(options = {}) {
  const theme = options.theme || EXCEL_THEME;
  const columns = options.columns || DEFAULT_TEST_CASE_COLUMNS;
  const testCasesByTab = options.testCasesByTab || {};
  const effectiveTabs = Array.isArray(options.tabNames) && options.tabNames.length > 0
    ? options.tabNames
    : [...new Set([...DEFAULT_TAB_NAMES, ...Object.keys(testCasesByTab)])];
  const executionDate = options.executionDate || getISTExecutionDate();
  const meta = { ...DEFAULT_SUMMARY_META, ...(options.summaryMeta || {}) };

  const wb = new ExcelJS.Workbook();
  wb.creator = options.creator || 'Vedak QA Automation Engineer';
  wb.lastModifiedBy = options.lastModifiedBy || 'Vedak QA Automation Engineer';
  wb.created = new Date();
  wb.modified = new Date();

  const summarySheet = wb.addWorksheet('Summary', {
    views: [{ showGridLines: true }],
  });

  summarySheet.columns = [
    { header: '', key: 'col1', width: 6 },
    { header: '', key: 'col2', width: 32 },
    { header: '', key: 'col3', width: 22 },
    { header: '', key: 'col4', width: 18 },
    { header: '', key: 'col5', width: 20 },
  ];

  // Title Block
  summarySheet.mergeCells('B2:E2');
  const titleCell = summarySheet.getCell('B2');
  titleCell.value = meta.title;
  titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: theme.HEADER_BG } };
  titleCell.font = { name: 'Calibri', size: 14, bold: true, color: { argb: theme.HEADER_FONT } };
  titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
  summarySheet.getRow(2).height = 36;

  // Metadata rows (Rows 4..9; C8 is Execution Date & Time)
  const metaRows = [
    ['Test Suite', meta.testSuite],
    ['Module', meta.module],
    ['Automation Framework', meta.framework],
    ['QA Engineer', meta.qaEngineer],
    ['Execution Date & Time', executionDate],
    ['Environment', meta.environment],
  ];

  metaRows.forEach((r, idx) => {
    const rowNum = 4 + idx;
    summarySheet.getCell(`B${rowNum}`).value = r[0];
    summarySheet.getCell(`B${rowNum}`).font = { bold: true };
    summarySheet.getCell(`B${rowNum}`).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: theme.META_LABEL_BG },
    };
    summarySheet.mergeCells(`C${rowNum}:E${rowNum}`);
    summarySheet.getCell(`C${rowNum}`).value = r[1];
  });

  // Summary Table Header
  const startCatRow = 12;
  summarySheet.mergeCells(`B${startCatRow}:E${startCatRow}`);
  const catHeader = summarySheet.getCell(`B${startCatRow}`);
  catHeader.value = 'TEST EXECUTION SUMMARY BY CATEGORY';
  catHeader.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: theme.SUMMARY_BG } };
  catHeader.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  catHeader.alignment = { horizontal: 'center', vertical: 'middle' };
  summarySheet.getRow(startCatRow).height = 24;

  const tableHeaderRow = startCatRow + 1;
  summarySheet.getCell(`B${tableHeaderRow}`).value = 'Test Category / Tab';
  summarySheet.getCell(`C${tableHeaderRow}`).value = 'Total Tests';
  summarySheet.getCell(`D${tableHeaderRow}`).value = 'Passed';
  summarySheet.getCell(`E${tableHeaderRow}`).value = 'Pass Rate (%)';

  ['B', 'C', 'D', 'E'].forEach((col) => {
    const cell = summarySheet.getCell(`${col}${tableHeaderRow}`);
    cell.font = { bold: true };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: theme.SUBHEADER_BG } };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
  });

  for (const tabName of effectiveTabs) {
    createCategoryWorksheet(wb, tabName, testCasesByTab[tabName] || [], {
      columns,
      executionDate,
      theme,
      rowHeight: options.rowHeight || 54,
    });
  }

  recalculateSummary(wb, executionDate, { tabNames: effectiveTabs, theme });
  return wb;
}

async function createCategorizedExcel(options = {}) {
  const filePaths = normalizeFilePaths(options.filePaths || options.outputPaths);
  const overwriteExisting = Boolean(options.overwriteExisting);
  const executionDate = options.executionDate || getISTExecutionDate();
  const createdFiles = [];
  const preservedFiles = [];

  for (const outPath of filePaths) {
    if (!fs.existsSync(outPath) || overwriteExisting) {
      fs.mkdirSync(path.dirname(outPath), { recursive: true });
      const wb = buildCategorizedWorkbook({ ...options, executionDate });
      await wb.xlsx.writeFile(outPath);
      createdFiles.push(outPath);
      console.log(`✅ Generated Excel file: ${outPath}`);
    } else {
      preservedFiles.push(outPath);
      console.log(`ℹ️ Preserving existing Excel file (non-destructive): ${outPath}`);
    }
  }

  return { createdFiles, preservedFiles, filePaths };
}

/**
 * Non-destructively updates existing test cases in-place and appends missing cases
 * without deleting existing rows, then recalculates the Summary tab.
 */
async function appendTestCasesToExcel(testCasesByTab, options = {}) {
  const filePaths = normalizeFilePaths(options.filePaths);
  const tabNames = options.tabNames || DEFAULT_TAB_NAMES;
  const columns = options.columns || DEFAULT_TEST_CASE_COLUMNS;
  const preserveExistingStatus = Boolean(options.preserveExistingStatus);
  const createMissingSheets = Boolean(options.createMissingSheets);
  const autoCreateFile = Boolean(options.autoCreateFile);
  const executionDate = options.executionDate || getISTExecutionDate();
  const rowHeight = options.rowHeight || 60;
  const theme = options.theme || EXCEL_THEME;

  const fileReports = [];

  for (const filePath of filePaths) {
    if (!fs.existsSync(filePath)) {
      if (autoCreateFile) {
        await createCategorizedExcel({
          ...options,
          filePaths: [filePath],
          testCasesByTab: {},
          executionDate,
        });
      } else {
        console.warn(`⚠️ Excel file not found at ${filePath}`);
        continue;
      }
    }

    const wb = new ExcelJS.Workbook();
    await wb.xlsx.readFile(filePath);

    let appendedCount = 0;
    let updatedCount = 0;

    for (const [tabName, cases] of Object.entries(testCasesByTab || {})) {
      let sheet = wb.getWorksheet(tabName);
      if (!sheet) {
        if (createMissingSheets) {
          sheet = createCategoryWorksheet(wb, tabName, [], { columns, executionDate, theme });
        } else {
          console.warn(`⚠️ Sheet "${tabName}" not found in ${path.basename(filePath)}`);
          continue;
        }
      }

      const existingRowsById = {};
      sheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return;
        const id = cellText(row.getCell(1));
        if (id) existingRowsById[id] = rowNumber;
      });

      for (const tc of cases) {
        const incomingStatus = String(tc.status || 'PASS').toUpperCase();
        if (existingRowsById[tc.id]) {
          const rowNum = existingRowsById[tc.id];
          const row = sheet.getRow(rowNum);
          const existingStatus = cellText(row.getCell(8)).toUpperCase();
          const shouldKeepResult =
            preserveExistingStatus &&
            existingStatus &&
            !existingStatus.includes('PENDING') &&
            !existingStatus.includes('NOT EXECUTED');

          row.getCell(2).value = tc.description;
          row.getCell(3).value = tc.preconditions;
          row.getCell(4).value = tc.steps;
          row.getCell(5).value = tc.expected;
          row.getCell(7).value = tc.priority;

          let finalStatus = incomingStatus;
          if (shouldKeepResult) {
            finalStatus = existingStatus;
          } else {
            row.getCell(6).value = tc.actual;
            row.getCell(8).value = incomingStatus;
            row.getCell(9).value = tc.date || executionDate;
            row.getCell(10).value = tc.remarks;
          }

          styleDataRow(row, rowNum - 2, finalStatus, { theme, rowHeight });
          updatedCount++;
        } else {
          const nextIdx = Math.max(0, sheet.rowCount - 1);
          const row = sheet.addRow([
            tc.id,
            tc.description,
            tc.preconditions,
            tc.steps,
            tc.expected,
            tc.actual,
            tc.priority,
            incomingStatus,
            tc.date || executionDate,
            tc.remarks,
          ]);
          styleDataRow(row, nextIdx, incomingStatus, { theme, rowHeight });
          appendedCount++;
        }
      }
    }

    const summary = recalculateSummary(wb, executionDate, { tabNames, theme });
    await wb.xlsx.writeFile(filePath);
    console.log(
      `✅ Excel synced (${appendedCount} appended, ${updatedCount} updated, existing rows preserved): ${filePath}`
    );

    fileReports.push({ filePath, appendedCount, updatedCount, summary });
  }

  return fileReports;
}

/**
 * Updates execution results in-place by Test Case ID across categorized sheets
 * without deleting or reordering any rows, then recalculates the Summary tab.
 */
async function updateCategorizedResults(results, options = {}) {
  const filePaths = normalizeFilePaths(options.filePaths);
  const tabNames = options.tabNames || DEFAULT_TAB_NAMES;
  const idCol = options.idCol || 1;
  const preconditionsCol = options.preconditionsCol || 3;
  const actualCol = options.actualCol || 6;
  const statusCol = options.statusCol || 8;
  const dateCol = options.dateCol || 9;
  const remarksCol = options.remarksCol || 10;
  const theme = options.theme || EXCEL_THEME;
  const executionDate = options.executionDate || getISTExecutionDate();

  const reports = [];

  for (const filePath of filePaths) {
    if (!fs.existsSync(filePath)) {
      console.warn(`⚠️ Excel file not found at ${filePath}`);
      continue;
    }

    const wb = new ExcelJS.Workbook();
    await wb.xlsx.readFile(filePath);

    let totalUpdated = 0;

    for (const tabName of tabNames) {
      const sheet = wb.getWorksheet(tabName);
      if (!sheet) continue;

      sheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return;

        const testId = cellText(row.getCell(idCol));
        if (!testId) return;

        const res = results && results[testId];
        if (!res) return;

        const status = String(res.status || 'PASS').toUpperCase();
        const remarks = res.remarks || status;

        if (res.preconditions) {
          row.getCell(preconditionsCol).value = res.preconditions;
        }
        if (res.actual) {
          row.getCell(actualCol).value = res.actual;
        }

        const statusCell = row.getCell(statusCol);
        statusCell.value = status;
        applyStatusCellStyle(statusCell, status, theme);

        row.getCell(dateCol).value = executionDate;
        row.getCell(remarksCol).value = remarks;

        totalUpdated++;
      });
    }

    const summary = recalculateSummary(wb, executionDate, {
      tabNames,
      idCol,
      statusCol,
      theme,
    });
    await wb.xlsx.writeFile(filePath);
    console.log(`✅ Successfully updated ${totalUpdated} test cases in ${filePath}`);

    reports.push({ filePath, totalUpdated, summary });
  }

  return reports;
}

/**
 * Updates execution results for Vedak_CRM_Recent_Projects_TestCases.xlsx in modules/04_projects/.
 */
async function updateRecentProjectsExcel(results, options = {}) {
  return updateCategorizedResults(results, {
    filePaths: DEFAULT_RECENT_PROJECTS_EXCEL_PATHS,
    tabNames: DEFAULT_TAB_NAMES,
    ...options,
  });
}

/**
 * Builds/initializes and non-destructively syncs all Recent Projects test cases.
 */
async function buildWorkbook(options = {}) {
  const filePaths = normalizeFilePaths(options.filePaths || DEFAULT_RECENT_PROJECTS_EXCEL_PATHS);
  const preserveExistingStatus = options.preserveExistingStatus !== false;

  await createCategorizedExcel({
    filePaths,
    columns: DEFAULT_TEST_CASE_COLUMNS,
    testCasesByTab: RECENT_PROJECTS_SCROLL_CASES,
    overwriteExisting: Boolean(options.overwriteExisting),
    summaryMeta: RECENT_PROJECTS_SUMMARY_META,
  });

  return appendTestCasesToExcel(ALL_RECENT_PROJECTS_CASES, {
    filePaths,
    preserveExistingStatus,
    summaryMeta: RECENT_PROJECTS_SUMMARY_META,
  });
}

/**
 * Syncs a chosen scope ('scroll' | 'filter-columns' | 'details' | 'all') non-destructively.
 */
async function syncRecentProjectsExcel(options = {}) {
  const scope = (options.scope || 'all').toLowerCase();
  const scopeMap = {
    scroll: RECENT_PROJECTS_SCROLL_CASES,
    'filter-columns': FILTER_COLUMNS_TEST_CASES,
    details: PROJECT_DETAIL_TEST_CASES,
    detail: PROJECT_DETAIL_TEST_CASES,
    all: ALL_RECENT_PROJECTS_CASES,
  };

  const cases = scopeMap[scope];
  if (!cases) {
    throw new Error(`Unknown scope "${scope}". Expected one of: scroll, filter-columns, details, all.`);
  }

  const filePaths = normalizeFilePaths(options.filePaths || DEFAULT_RECENT_PROJECTS_EXCEL_PATHS);
  const preserveExistingStatus = options.preserveExistingStatus !== false;

  if (options.init) {
    await createCategorizedExcel({
      filePaths,
      columns: DEFAULT_TEST_CASE_COLUMNS,
      testCasesByTab: RECENT_PROJECTS_SCROLL_CASES,
      overwriteExisting: Boolean(options.overwriteExisting),
      summaryMeta: RECENT_PROJECTS_SUMMARY_META,
    });
  }

  return appendTestCasesToExcel(cases, {
    filePaths,
    preserveExistingStatus,
    autoCreateFile: Boolean(options.init || options.autoCreateFile),
    summaryMeta: RECENT_PROJECTS_SUMMARY_META,
  });
}

/**
 * Updates a flat single-sheet Projects Excel file (compatible with scripts/update-excel.js
 * and specs/projects.spec.js).
 */
async function updateFlatSheetResults(filePathsInput, sheetName, results, cols = {}) {
  const filePaths = normalizeFilePaths(filePathsInput, []);
  const {
    idCol = 2,
    statusCol = 11,
    dateCol = 12,
    remarksCol = 13,
    actualCol = null,
    overwriteRemarks = false,
  } = cols || {};

  const executionDate = getISTExecutionDate();
  const reports = [];

  for (const filePath of filePaths) {
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  Excel not found: ${filePath}`);
      continue;
    }

    const wb = new ExcelJS.Workbook();
    await wb.xlsx.readFile(filePath);

    const sheet = wb.getWorksheet(sheetName);
    if (!sheet) {
      console.log(`⚠️  Sheet "${sheetName}" not found in ${path.basename(filePath)}`);
      continue;
    }

    let updatedCount = 0;

    sheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return;

      const testId = cellText(row.getCell(idCol));
      if (!testId) return;

      const result = results && results[testId];
      if (!result) return;

      const status = result.status || 'PASS';
      const remarks = result.remarks || status;
      const upper = String(status).toUpperCase();
      const color = upper.includes('PASS')
        ? FLAT_STATUS_COLORS.PASS
        : upper.includes('FAIL')
          ? FLAT_STATUS_COLORS.FAIL
          : FLAT_STATUS_COLORS.PENDING;

      const sc = row.getCell(statusCol);
      sc.value = status;
      sc.fill = { type: 'pattern', pattern: 'solid', fgColor: { rgb: color } };
      sc.font = { bold: true, color: { rgb: FLAT_STATUS_COLORS.TEXT } };
      sc.alignment = { horizontal: 'center', vertical: 'middle' };

      row.getCell(dateCol).value = executionDate;

      if (actualCol && result.actual) {
        row.getCell(actualCol).value = result.actual;
      }

      const rc = row.getCell(remarksCol);
      const existingRemark = cellText(rc);
      if (overwriteRemarks || !existingRemark || existingRemark === 'NOT EXECUTED' || existingRemark === '-') {
        rc.value = remarks;
      }

      row.alignment = { vertical: 'top', wrapText: true };
      updatedCount++;
    });

    const summarySheet = wb.getWorksheet('Summary');
    if (summarySheet && results) {
      summarySheet.eachRow((row) => {
        const label = cellText(row.getCell(1));
        if (/last.updated|execution.date/i.test(label)) {
          row.getCell(2).value = executionDate;
        }
        if (/status/i.test(label) && row.rowNumber > 1) {
          const vals = Object.values(results);
          const passCount = vals.filter((r) => String(r.status || '').toUpperCase().includes('PASS')).length;
          if (vals.length > 0 && passCount === vals.length) {
            row.getCell(row.cellCount >= 3 ? 3 : 2).value = 'PASS';
          }
        }
      });
    }

    await wb.xlsx.writeFile(filePath);
    console.log(`✅ Excel updated (${updatedCount} rows): ${path.basename(filePath)}`);
    reports.push({ filePath, updatedCount });
  }

  return reports;
}

/**
 * Inspects execution status counts of an Excel workbook without mutating it.
 */
async function readWorkbookStats(filePath = RECENT_PROJECTS_EXCEL_PATH, options = {}) {
  if (!fs.existsSync(filePath)) return null;
  const tabNames = options.tabNames || DEFAULT_TAB_NAMES;
  const idCol = options.idCol || 1;
  const statusCol = options.statusCol || 8;

  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile(filePath);

  const tabs = {};
  let total = 0;
  let passed = 0;
  let failed = 0;
  let pending = 0;

  wb.eachSheet((sheet) => {
    if (sheet.name === 'Summary') return;
    if (options.onlyTabs && !tabNames.includes(sheet.name)) return;

    const counts = { total: 0, passed: 0, failed: 0, pending: 0, ids: [] };
    sheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return;
      const id = cellText(row.getCell(idCol));
      if (!id) return;
      const st = cellText(row.getCell(statusCol)).toUpperCase();
      counts.total++;
      counts.ids.push(id);
      if (st.includes('PASS')) counts.passed++;
      else if (st.includes('FAIL')) counts.failed++;
      else counts.pending++;
    });

    tabs[sheet.name] = counts;
    total += counts.total;
    passed += counts.passed;
    failed += counts.failed;
    pending += counts.pending;
  });

  return { filePath, total, passed, failed, pending, tabs };
}

/**
 * Convenience factory to bind Excel configuration once for any future Projects suite/spec.
 */
function createProjectsExcelReporter(config = {}) {
  const filePaths = normalizeFilePaths(config.filePaths);
  const tabNames = config.tabNames || DEFAULT_TAB_NAMES;
  const columns = config.columns || DEFAULT_TEST_CASE_COLUMNS;
  const summaryMeta = config.summaryMeta || DEFAULT_SUMMARY_META;

  return {
    filePaths,
    tabNames,
    ensureWorkbook: (initialCasesByTab = {}, opts = {}) =>
      createCategorizedExcel({
        filePaths,
        tabNames,
        columns,
        summaryMeta,
        testCasesByTab: initialCasesByTab,
        ...opts,
      }),
    appendTestCases: (testCasesByTab, opts = {}) =>
      appendTestCasesToExcel(testCasesByTab, {
        filePaths,
        tabNames,
        columns,
        summaryMeta,
        ...opts,
      }),
    updateResults: (results, opts = {}) =>
      updateCategorizedResults(results, {
        filePaths,
        tabNames,
        ...opts,
      }),
    updateFlatResults: (results, sheetName = config.sheetName, cols = config.cols) =>
      updateFlatSheetResults(filePaths, sheetName, results, cols),
    getStats: (index = 0, opts = {}) => readWorkbookStats(filePaths[index], { tabNames, ...opts }),
  };
}

// ════════════════════════════════════════════════════════════════════════════
// CLI ENTRYPOINT
// ════════════════════════════════════════════════════════════════════════════

async function runCli(argv = process.argv.slice(2)) {
  if (argv.includes('--stats')) {
    const stats = await readWorkbookStats(RECENT_PROJECTS_EXCEL_PATH);
    if (!stats) {
      console.log(`⚠️ Excel workbook not found: ${RECENT_PROJECTS_EXCEL_PATH}`);
      return;
    }
    console.log(`\n📊 ${path.relative(path.join(__dirname, '../..'), stats.filePath)}`);
    console.log(`   Total: ${stats.total} | PASS: ${stats.passed} | FAIL: ${stats.failed} | PENDING: ${stats.pending}`);
    for (const [tab, c] of Object.entries(stats.tabs)) {
      console.log(`   - ${tab}: ${c.passed}/${c.total} passed (fail: ${c.failed}, pending: ${c.pending})`);
    }
    return;
  }

  const init = argv.includes('--init');
  const forceStatus = argv.includes('--force-status');
  const scopeArg = argv.find((a) => a.startsWith('--scope='));
  const scope = scopeArg ? scopeArg.split('=')[1] : 'all';

  await syncRecentProjectsExcel({
    init,
    scope,
    preserveExistingStatus: !forceStatus,
  });
}

if (require.main === module) {
  runCli().catch((err) => {
    console.error('❌ Projects Excel operation failed:', err);
    process.exit(1);
  });
}

module.exports = {
  // Constants & Theme
  EXCEL_THEME,
  THEME: EXCEL_THEME,
  FLAT_STATUS_COLORS,
  DEFAULT_TAB_NAMES,
  TAB_NAMES: DEFAULT_TAB_NAMES,
  DEFAULT_TEST_CASE_COLUMNS,
  COLUMNS: DEFAULT_TEST_CASE_COLUMNS,
  RECENT_PROJECTS_EXCEL_PATH,
  DEFAULT_RECENT_PROJECTS_EXCEL_PATHS,
  EXCEL_PATHS: DEFAULT_RECENT_PROJECTS_EXCEL_PATHS,
  OUTPUT_PATHS: DEFAULT_RECENT_PROJECTS_EXCEL_PATHS,
  DEFAULT_SUMMARY_META,
  RECENT_PROJECTS_SUMMARY_META,

  // Consolidated Test Case Datasets
  RECENT_PROJECTS_SCROLL_CASES,
  TEST_DATA: RECENT_PROJECTS_SCROLL_CASES,
  FILTER_COLUMNS_TEST_CASES,
  PROJECT_DETAIL_TEST_CASES,
  ALL_RECENT_PROJECTS_CASES,
  mergeTestCaseSets,

  // Low-level Helpers
  getISTExecutionDate,
  cellText,
  normalizeFilePaths,
  applyStatusCellStyle,
  styleHeaderRow,
  styleDataRow,
  recalculateSummary,

  // High-level Workbook Operations
  createCategoryWorksheet,
  buildCategorizedWorkbook,
  createCategorizedExcel,
  buildWorkbook,
  syncRecentProjectsExcel,
  appendTestCasesToExcel,
  updateCategorizedResults,
  updateRecentProjectsExcel,
  updateFlatSheetResults,
  readWorkbookStats,
  createProjectsExcelReporter,
};
