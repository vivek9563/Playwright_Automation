/**
 * append-recent-projects-detail-cases.js
 * Non-destructively appends the Recent Projects -> Project Detail Window test cases
 * (Project Link Redirect + Ref ID, 11 Tabs + Success Messages, Vedak Members Role Listing &
 * Cross/Close Popup Count, Onboarding/Awaiting Feedback/Scheduling Toggles + Status Dropdown
 * with Immediate Refresh & Activities Audit Logs) into the existing tabs of
 * Vedak_CRM_Recent_Projects_TestCases.xlsx without deleting any existing rows.
 */

'use strict';

const { appendTestCasesToExcel } = require('./update-recent-projects-excel');

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

async function run(options = {}) {
  await appendTestCasesToExcel(PROJECT_DETAIL_TEST_CASES, {
    preserveExistingStatus: true,
    ...options,
  });
}

if (require.main === module) {
  run().catch((err) => {
    console.error('❌ Failed to append Project Detail test cases:', err);
    process.exit(1);
  });
}

module.exports = { PROJECT_DETAIL_TEST_CASES };

