/**
 * update-recent-projects-excel.js
 * Backward-compatible Recent Projects Excel updater & appender backed by common-excel-utils.js.
 *
 * Non-destructively updates test case results (Pre-conditions, Actual Result, Status,
 * Execution Date, Remarks) and appends new test cases into their respective categorized tabs
 * (UI Tests, Functionality Tests, Major Tests, Minor Tests, Edge Cases)
 * in Vedak_CRM_Recent_Projects_TestCases.xlsx without deleting existing rows.
 */

'use strict';

const {
  EXCEL_THEME,
  DEFAULT_TAB_NAMES,
  DEFAULT_RECENT_PROJECTS_EXCEL_PATHS,
  styleDataRow,
  recalculateSummary,
  appendTestCasesToExcel: appendCategorizedTestCases,
  updateCategorizedResults,
} = require('./common-excel-utils');

const EXCEL_PATHS = DEFAULT_RECENT_PROJECTS_EXCEL_PATHS;
const TAB_NAMES = DEFAULT_TAB_NAMES;
const THEME = EXCEL_THEME;

/**
 * Updates existing test cases in-place and appends any missing test cases
 * without deleting existing rows.
 *
 * @param {Object} testCasesByTab - { 'UI Tests': [{ id, description, preconditions, steps, expected, actual, priority, status, remarks }], ... }
 * @param {Object} [options]
 */
async function appendTestCasesToExcel(testCasesByTab, options = {}) {
  return appendCategorizedTestCases(testCasesByTab, {
    filePaths: EXCEL_PATHS,
    tabNames: TAB_NAMES,
    ...options,
  });
}

/**
 * Updates execution results for existing test cases in-place (preserving all rows).
 * @param {Object} results - { 'TC-RP-FUNC-06': { status: 'PASS'|'FAIL', remarks: '...', preconditions?: '...', actual?: '...' }, ... }
 * @param {Object} [options]
 */
async function updateRecentProjectsExcel(results, options = {}) {
  return updateCategorizedResults(results, {
    filePaths: EXCEL_PATHS,
    tabNames: TAB_NAMES,
    ...options,
  });
}

module.exports = {
  updateRecentProjectsExcel,
  appendTestCasesToExcel,
  styleDataRow,
  recalculateSummary,
  EXCEL_PATHS,
  TAB_NAMES,
  THEME,
};
