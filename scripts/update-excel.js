/**
 * update-excel.js — Shared Excel result updater
 * Delegates to scripts/excel-utils/projects-excel-utils.js (`updateFlatSheetResults`)
 * while preserving the existing `updateExcel(filePath, sheetName, results, cols)` API.
 *
 * Usage:
 *   const { updateExcel } = require('../scripts/update-excel');
 *   await updateExcel(filePath, sheetName, results, { idCol, statusCol, dateCol, remarksCol });
 *
 * results: { 'TEST-ID': { status: 'PASS'|'FAIL', remarks: '...' }, ... }
 */

'use strict';

const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '../.env') });

const { updateFlatSheetResults } = require('./excel-utils/projects-excel-utils');

/**
 * @param {string|string[]} filePath - absolute path(s) to .xlsx
 * @param {string} sheetName         - worksheet name
 * @param {Object} results           - { 'TEST-ID': { status, remarks } }
 * @param {Object} cols              - { idCol, statusCol, dateCol, remarksCol } (1-based)
 */
async function updateExcel(filePath, sheetName, results, cols) {
  return updateFlatSheetResults(filePath, sheetName, results, cols);
}

module.exports = { updateExcel };
