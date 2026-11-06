/**
 * update-recent-projects-excel.js
 * Updates test case results (Status, Remarks, Execution Date, Pre-conditions)
 * across the categorized tabs (UI Tests, Functionality Tests, Major Tests, Minor Tests, Edge Cases)
 * in Vedak_CRM_Recent_Projects_TestCases.xlsx.
 */

'use strict';

const ExcelJS = require('exceljs');
const path = require('path');
const fs = require('fs');

const EXCEL_PATHS = [
  path.join(__dirname, '../../Vedak_CRM_Recent_Projects_TestCases.xlsx'),
  path.join(__dirname, '../../modules/04_projects/Vedak_CRM_Recent_Projects_TestCases.xlsx'),
];

const THEME = {
  PASS_BG: 'FFD9EAD3',
  PASS_FONT: 'FF274E13',
  FAIL_BG: 'FFF4CCCC',
  FAIL_FONT: 'FF990000',
  PENDING_BG: 'FFFFF2CC',
  PENDING_FONT: 'FF7F6000',
};

const TAB_NAMES = ['UI Tests', 'Functionality Tests', 'Major Tests', 'Minor Tests', 'Edge Cases'];

/**
 * @param {Object} results - { 'TC-RP-FUNC-01': { status: 'PASS'|'FAIL', remarks: '...', preconditions?: '...' }, ... }
 */
async function updateRecentProjectsExcel(results) {
  const executionDate = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

  for (const filePath of EXCEL_PATHS) {
    if (!fs.existsSync(filePath)) {
      console.warn(`⚠️ Excel file not found at ${filePath}`);
      continue;
    }

    const wb = new ExcelJS.Workbook();
    await wb.xlsx.readFile(filePath);

    let totalUpdated = 0;
    const catStats = {};

    for (const tabName of TAB_NAMES) {
      const sheet = wb.getWorksheet(tabName);
      if (!sheet) continue;

      let sheetTotal = 0;
      let sheetPass = 0;

      sheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return; // Skip headers

        const testId = (row.getCell(1).value || '').toString().trim();
        if (!testId) return;

        sheetTotal++;

        const res = results[testId];
        if (res) {
          const status = (res.status || 'PASS').toUpperCase();
          const remarks = res.remarks || status;

          if (res.preconditions) {
            row.getCell(3).value = res.preconditions;
          }

          // Status column (col 8)
          const statusCell = row.getCell(8);
          statusCell.value = status;
          if (status.includes('PASS')) {
            statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: THEME.PASS_BG } };
            statusCell.font = { bold: true, color: { argb: THEME.PASS_FONT } };
            sheetPass++;
          } else if (status.includes('FAIL')) {
            statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: THEME.FAIL_BG } };
            statusCell.font = { bold: true, color: { argb: THEME.FAIL_FONT } };
          } else {
            statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: THEME.PENDING_BG } };
            statusCell.font = { bold: true, color: { argb: THEME.PENDING_FONT } };
          }

          // Date column (col 9)
          row.getCell(9).value = executionDate;

          // Remarks column (col 10)
          row.getCell(10).value = remarks;

          totalUpdated++;
        } else {
          const currentStatus = (row.getCell(8).value || '').toString().toUpperCase();
          if (currentStatus.includes('PASS')) sheetPass++;
        }
      });

      catStats[tabName] = { total: sheetTotal, passed: sheetPass };
    }

    // Update Summary sheet
    const summarySheet = wb.getWorksheet('Summary');
    if (summarySheet) {
      // Update execution date at B8:E8
      summarySheet.getCell('C8').value = executionDate;

      // Update category table starting at row 14
      let catRow = 14;
      let grandTotal = 0;
      let grandPass = 0;

      for (const tabName of TAB_NAMES) {
        const stats = catStats[tabName] || { total: 0, passed: 0 };
        grandTotal += stats.total;
        grandPass += stats.passed;
        summarySheet.getCell(`C${catRow}`).value = stats.total;
        summarySheet.getCell(`D${catRow}`).value = stats.passed;
        summarySheet.getCell(`E${catRow}`).value = stats.total > 0 ? `${Math.round((stats.passed / stats.total) * 100)}%` : '0%';
        catRow++;
      }

      // Grand total row
      summarySheet.getCell(`C${catRow}`).value = grandTotal;
      summarySheet.getCell(`D${catRow}`).value = grandPass;
      summarySheet.getCell(`E${catRow}`).value = grandTotal > 0 ? `${Math.round((grandPass / grandTotal) * 100)}%` : '0%';
    }

    await wb.xlsx.writeFile(filePath);
    console.log(`✅ Successfully updated ${totalUpdated} test cases in ${path.basename(filePath)}`);
  }
}

module.exports = { updateRecentProjectsExcel };

