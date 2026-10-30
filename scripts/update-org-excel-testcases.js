const ExcelJS = require('exceljs');
const path = require('path');

const EXCEL_FILE = path.join(__dirname, '../modules/03_organization/Vedak_CRM_Organization_TestCases.xlsx');
const BLUE  = { type: 'pattern', pattern: 'solid', fgColor: { rgb: '1E3A5F' } };
const WHITE = { color: { rgb: 'FFFFFF' } };

// Updated test cases reflecting: Dashboard → click "Organization" tab → 8 cards appear
const UPDATED_CASES = {
  'ORG-UI-01': {
    name: 'Organization Tab Visible on Dashboard',
    description: 'Verify the "Organization" tab button is visible at the top of the Dashboard page alongside the "Work" tab',
    steps: '1. Navigate to http://localhost:5173/app/dashboard\n2. Verify two tab buttons "Work" and "Organization" are visible at the top\n3. Verify Organization tab is clickable',
    expected: 'Organization tab button is visible on Dashboard',
    preconditions: 'User must be logged in and on Dashboard page'
  },
  'ORG-UI-02': {
    name: 'Organization Tab Content Loads',
    description: 'Click the Organization tab and verify 8 cards appear (Apply Leave, Calendar, Notice Board, Organization, Support, Vedak Policies, HR Playbook, Refill Credits)',
    steps: '1. Navigate to Dashboard\n2. Click "Organization" tab button\n3. Verify 8 cards are displayed\n4. Verify each card has title and subtitle',
    expected: '8 organization cards are visible with correct titles',
    preconditions: 'User on Dashboard page with Work tab currently active'
  },
  'ORG-UI-03': {
    name: 'All 8 Organization Cards Visible',
    description: 'Verify all 8 organization cards are visible after clicking the Organization tab',
    steps: '1. Click Organization tab on Dashboard\n2. Verify Apply Leave card visible\n3. Verify Calendar card visible\n4. Verify Notice Board card visible\n5. Verify Organization card visible\n6. Verify Support card visible\n7. Verify Vedak Policies card visible\n8. Verify HR Playbook card visible\n9. Verify Refill Credits card visible',
    expected: 'All 8 cards visible with titles and subtitles',
    preconditions: 'User on Dashboard, Organization tab active'
  },
  'ORG-UI-04': {
    name: 'Noticeboard Section Visible in Organization Tab',
    description: 'After clicking Organization tab, verify Noticeboard section with cards is visible below the 8 buttons',
    steps: '1. Click Organization tab on Dashboard\n2. Scroll down to Noticeboard section\n3. Verify Noticeboard section heading visible\n4. Verify "View All" link visible\n5. Verify noticeboard cards/posts visible',
    expected: 'Noticeboard section visible with posts and View All link',
    preconditions: 'Organization tab active on Dashboard'
  },
  'ORG-UI-05': {
    name: 'Holidays Section Visible in Organization Tab',
    description: 'Verify Holidays section is visible in the Organization tab view',
    steps: '1. Click Organization tab on Dashboard\n2. Scroll to Holidays section on RHS\n3. Verify Holidays section heading visible\n4. Verify holiday list visible',
    expected: 'Holidays section visible with upcoming holidays listed',
    preconditions: 'Organization tab active on Dashboard'
  },
  'ORG-FUNC-01': {
    name: 'Apply Leave Card Accessible',
    description: 'Click the Organization tab, then verify Apply Leave card is visible and accessible',
    steps: '1. Navigate to Dashboard\n2. Click "Organization" tab button at top\n3. Verify Organization tab content is displayed\n4. Locate "Apply Leave" card\n5. Verify card shows subtitle "Submit leave request"\n6. Hover over card',
    expected: 'Apply Leave card is visible with subtitle and accessible after clicking Organization tab',
    preconditions: 'User on Dashboard, clicks Organization tab first'
  },
  'ORG-FUNC-02': {
    name: 'Calendar Card Accessible',
    description: 'Click the Organization tab, then verify Calendar card is visible and accessible',
    steps: '1. Navigate to Dashboard\n2. Click "Organization" tab button at top\n3. Locate "Calendar" card\n4. Verify card shows subtitle "Upcoming holidays"\n5. Hover over card',
    expected: 'Calendar card is visible with subtitle and accessible',
    preconditions: 'User on Dashboard, Organization tab active'
  },
  'ORG-FUNC-03': {
    name: 'Notice Board Card Accessible',
    description: 'Click the Organization tab, then verify Notice Board card is visible and accessible',
    steps: '1. Navigate to Dashboard\n2. Click "Organization" tab button at top\n3. Locate "Notice Board" card\n4. Verify card shows subtitle "Latest announcements"\n5. Hover over card',
    expected: 'Notice Board card is visible with subtitle and accessible',
    preconditions: 'User on Dashboard, Organization tab active'
  },
  'ORG-FUNC-04': {
    name: 'Organization Card Accessible',
    description: 'Click the Organization tab, then verify Organization card is visible and accessible',
    steps: '1. Navigate to Dashboard\n2. Click "Organization" tab button at top\n3. Locate "Organization" card\n4. Verify card shows subtitle "Manage structure"\n5. Hover over card',
    expected: 'Organization card is visible with subtitle and accessible',
    preconditions: 'User on Dashboard, Organization tab active'
  },
  'ORG-FUNC-05': {
    name: 'Support Card Accessible',
    description: 'Click the Organization tab, then verify Support card is visible and accessible',
    steps: '1. Navigate to Dashboard\n2. Click "Organization" tab button at top\n3. Locate "Support" card\n4. Verify card shows subtitle "Raise a ticket"\n5. Hover over card',
    expected: 'Support card is visible with subtitle and accessible',
    preconditions: 'User on Dashboard, Organization tab active'
  },
  'ORG-FUNC-06': {
    name: 'Vedak Policies Card Accessible',
    description: 'Click the Organization tab, then verify Vedak Policies card is visible and accessible',
    steps: '1. Navigate to Dashboard\n2. Click "Organization" tab button at top\n3. Locate "Vedak Policies" card\n4. Verify card shows subtitle "Company policies"\n5. Hover over card',
    expected: 'Vedak Policies card is visible with subtitle and accessible',
    preconditions: 'User on Dashboard, Organization tab active'
  },
  'ORG-FUNC-07': {
    name: 'HR Playbook Card Accessible',
    description: 'Click the Organization tab, then verify HR Playbook card is visible and accessible',
    steps: '1. Navigate to Dashboard\n2. Click "Organization" tab button at top\n3. Locate "HR Playbook" card\n4. Verify card shows subtitle "Roles & escalation"\n5. Hover over card',
    expected: 'HR Playbook card is visible with subtitle and accessible',
    preconditions: 'User on Dashboard, Organization tab active'
  },
  'ORG-FUNC-08': {
    name: 'Refill Credits Card Accessible',
    description: 'Click the Organization tab, then verify Refill Credits card is visible and accessible',
    steps: '1. Navigate to Dashboard\n2. Click "Organization" tab button at top\n3. Locate "Refill Credits" card\n4. Verify card shows subtitle "Top-up credits"\n5. Hover over card',
    expected: 'Refill Credits card is visible with subtitle and accessible',
    preconditions: 'User on Dashboard, Organization tab active'
  },
};

async function updateExcelTestCases() {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile(EXCEL_FILE);
  const sheet = wb.getWorksheet('Organization Tests');

  sheet.eachRow((row, rn) => {
    if (rn === 1) return;
    const id = (row.getCell(1).value || '').toString().trim();
    const update = UPDATED_CASES[id];
    if (!update) return;

    row.getCell(2).value = update.name;
    row.getCell(4).value = update.description;
    row.getCell(5).value = update.preconditions;
    row.getCell(6).value = update.steps;
    row.getCell(7).value = update.expected;
    row.alignment = { vertical: 'top', wrapText: true };
    row.height = 80;
    console.log(`  ✓ Updated: ${id}`);
  });

  await wb.xlsx.writeFile(EXCEL_FILE);
  console.log(`\n✅ Organization Excel test cases updated: ${EXCEL_FILE}`);
}

updateExcelTestCases().catch(console.error);
