/**
 * append-recent-projects-filter-columns.js
 * Non-destructively appends the Filter Columns test cases into the existing tabs
 * (UI Tests, Functionality Tests, Major Tests, Minor Tests, Edge Cases)
 * of Vedak_CRM_Recent_Projects_TestCases.xlsx without deleting existing rows.
 */

'use strict';

const { appendTestCasesToExcel } = require('./update-recent-projects-excel');

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

async function run(options = {}) {
  await appendTestCasesToExcel(FILTER_COLUMNS_TEST_CASES, {
    preserveExistingStatus: true,
    ...options,
  });
}

if (require.main === module) {
  run().catch((err) => {
    console.error('❌ Failed to append Filter Columns test cases:', err);
    process.exit(1);
  });
}

module.exports = { FILTER_COLUMNS_TEST_CASES };

