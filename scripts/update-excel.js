/**
 * update-excel.js — Shared Excel result updater
 *
 * Usage:
 *   const { updateExcel } = require('../scripts/update-excel');
 *   await updateExcel(filePath, sheetName, results, { idCol, statusCol, dateCol, remarksCol });
 *
 * results: { 'TEST-ID': { status: 'PASS'|'FAIL', remarks: '...' }, ... }
 */

'use strict';

const fs     = require('fs');
const ExcelJS = require('exceljs');
const path   = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '../.env') });

const GREEN  = '00B050';
const RED    = 'C00000';
const YELLOW = 'FFC000';
const WHITE  = 'FFFFFF';

/**
 * @param {string} filePath  - absolute path to .xlsx
 * @param {string} sheetName - worksheet name
 * @param {Object} results   - { 'TEST-ID': { status, remarks } }
 * @param {Object} cols      - { idCol, statusCol, dateCol, remarksCol } (1-based)
 */
async function updateExcel(filePath, sheetName, results, cols) {
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  Excel not found: ${filePath}`);
    return;
  }

  const { idCol = 2, statusCol = 11, dateCol = 12, remarksCol = 13 } = cols || {};
  const executionDate = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile(filePath);

  const sheet = wb.getWorksheet(sheetName);
  if (!sheet) {
    console.log(`⚠️  Sheet "${sheetName}" not found in ${path.basename(filePath)}`);
    return;
  }

  let updatedCount = 0;

  sheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return; // skip header

    const testId = (row.getCell(idCol).value || '').toString().trim();
    if (!testId) return;

    const result = results[testId];
    if (!result) return;

    const status   = result.status || 'PASS';
    const remarks  = result.remarks || status;
    const isPass   = status.toUpperCase().includes('PASS');
    const isFail   = status.toUpperCase().includes('FAIL');
    const color    = isPass ? GREEN : isFail ? RED : YELLOW;

    // Status cell
    const sc = row.getCell(statusCol);
    sc.value = status;
    sc.fill  = { type: 'pattern', pattern: 'solid', fgColor: { rgb: color } };
    sc.font  = { bold: true, color: { rgb: WHITE } };
    sc.alignment = { horizontal: 'center', vertical: 'middle' };

    // Date cell
    row.getCell(dateCol).value = executionDate;

    // Remarks cell
    const rc = row.getCell(remarksCol);
    if (!rc.value || rc.value === '' || rc.value === 'NOT EXECUTED' || rc.value === '-') {
      rc.value = remarks;
    }

    row.alignment = { vertical: 'top', wrapText: true };
    updatedCount++;
  });

  // Update Summary sheet if it exists
  const summarySheet = wb.getWorksheet('Summary');
  if (summarySheet) {
    summarySheet.eachRow((row) => {
      const label = (row.getCell(1).value || '').toString();
      if (/last.updated|execution.date/i.test(label)) {
        row.getCell(2).value = executionDate;
      }
      if (/status/i.test(label) && row.rowNumber > 1) {
        const passCount = Object.values(results).filter(r => r.status.includes('PASS')).length;
        const total = Object.keys(results).length;
        if (passCount === total) row.getCell(row.cellCount >= 3 ? 3 : 2).value = 'PASS';
      }
    });
  }

  await wb.xlsx.writeFile(filePath);
  console.log(`✅ Excel updated (${updatedCount} rows): ${path.basename(filePath)}`);
}

module.exports = { updateExcel };
