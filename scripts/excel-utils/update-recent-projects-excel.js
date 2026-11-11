/**
 * update-recent-projects-excel.js
 * Non-destructively updates test case results (Pre-conditions, Actual Result, Status,
 * Execution Date, Remarks) and appends new test cases into their respective categorized tabs
 * (UI Tests, Functionality Tests, Major Tests, Minor Tests, Edge Cases)
 * in Vedak_CRM_Recent_Projects_TestCases.xlsx without deleting existing rows.
 */

'use strict';

const ExcelJS = require('exceljs');
const path = require('path');
const fs = require('fs');

const EXCEL_PATHS = [
  path.join(__dirname, '../../modules/04_projects/Vedak_CRM_Recent_Projects_TestCases.xlsx'),
  path.join(__dirname, '../../Vedak_CRM_Recent_Projects_TestCases.xlsx'),
];

const THEME = {
  ZEBRA_BG: 'FFF9FAFB',
  BORDER_COLOR: 'FFD9D9D9',
  PASS_BG: 'FFD9EAD3',
  PASS_FONT: 'FF274E13',
  FAIL_BG: 'FFF4CCCC',
  FAIL_FONT: 'FF990000',
  PENDING_BG: 'FFFFF2CC',
  PENDING_FONT: 'FF7F6000',
};

const TAB_NAMES = ['UI Tests', 'Functionality Tests', 'Major Tests', 'Minor Tests', 'Edge Cases'];

function styleDataRow(row, rowIdx, statusValue) {
  row.height = 60;
  const isEven = rowIdx % 2 === 0;
  const status = (statusValue || 'PASS').toUpperCase();

  row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
    cell.font = { name: 'Calibri', size: 10 };
    cell.border = {
      top: { style: 'thin', color: { argb: THEME.BORDER_COLOR } },
      bottom: { style: 'thin', color: { argb: THEME.BORDER_COLOR } },
      left: { style: 'thin', color: { argb: THEME.BORDER_COLOR } },
      right: { style: 'thin', color: { argb: THEME.BORDER_COLOR } },
    };

    if (isEven) {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: THEME.ZEBRA_BG },
      };
    }

    if ([1, 7, 8, 9].includes(colNumber)) {
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
    } else {
      cell.alignment = { horizontal: 'left', vertical: 'middle', wrapText: true };
    }

    if (colNumber === 8) {
      if (status.includes('PASS')) {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: THEME.PASS_BG } };
        cell.font = { bold: true, color: { argb: THEME.PASS_FONT } };
      } else if (status.includes('FAIL')) {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: THEME.FAIL_BG } };
        cell.font = { bold: true, color: { argb: THEME.FAIL_FONT } };
      } else {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: THEME.PENDING_BG } };
        cell.font = { bold: true, color: { argb: THEME.PENDING_FONT } };
      }
    }
  });
}

function recalculateSummary(wb, executionDate) {
  const catStats = {};

  for (const tabName of TAB_NAMES) {
    const sheet = wb.getWorksheet(tabName);
    if (!sheet) continue;

    let sheetTotal = 0;
    let sheetPass = 0;

    sheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return;
      const testId = (row.getCell(1).value || '').toString().trim();
      if (!testId) return;

      sheetTotal++;
      const status = (row.getCell(8).value || '').toString().toUpperCase();
      if (status.includes('PASS')) sheetPass++;
    });

    catStats[tabName] = { total: sheetTotal, passed: sheetPass };
  }

  const summarySheet = wb.getWorksheet('Summary');
  if (summarySheet) {
    summarySheet.getCell('C8').value = executionDate;

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

    summarySheet.getCell(`C${catRow}`).value = grandTotal;
    summarySheet.getCell(`D${catRow}`).value = grandPass;
    summarySheet.getCell(`E${catRow}`).value = grandTotal > 0 ? `${Math.round((grandPass / grandTotal) * 100)}%` : '0%';
  }
}

/**
 * Updates existing test cases in-place and appends any missing test cases
 * without deleting existing rows.
 *
 * @param {Object} testCasesByTab - { 'UI Tests': [{ id, description, preconditions, steps, expected, actual, priority, status, remarks }], ... }
 */
async function appendTestCasesToExcel(testCasesByTab) {
  const executionDate = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

  for (const filePath of EXCEL_PATHS) {
    if (!fs.existsSync(filePath)) {
      console.warn(`⚠️ Excel file not found at ${filePath}`);
      continue;
    }

    const wb = new ExcelJS.Workbook();
    await wb.xlsx.readFile(filePath);

    let appendedCount = 0;
    let updatedCount = 0;

    for (const [tabName, cases] of Object.entries(testCasesByTab)) {
      const sheet = wb.getWorksheet(tabName);
      if (!sheet) {
        console.warn(`⚠️ Sheet "${tabName}" not found in ${path.basename(filePath)}`);
        continue;
      }

      // Map existing Test Case IDs -> row numbers (preserve existing rows!)
      const existingRowsById = {};
      sheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return;
        const id = (row.getCell(1).value || '').toString().trim();
        if (id) existingRowsById[id] = rowNumber;
      });

      for (const tc of cases) {
        const status = (tc.status || 'PASS').toUpperCase();
        if (existingRowsById[tc.id]) {
          // Update existing row in-place without deleting
          const row = sheet.getRow(existingRowsById[tc.id]);
          row.getCell(2).value = tc.description;
          row.getCell(3).value = tc.preconditions;
          row.getCell(4).value = tc.steps;
          row.getCell(5).value = tc.expected;
          row.getCell(6).value = tc.actual;
          row.getCell(7).value = tc.priority;
          row.getCell(8).value = status;
          row.getCell(9).value = executionDate;
          row.getCell(10).value = tc.remarks;
          styleDataRow(row, existingRowsById[tc.id] - 2, status);
          updatedCount++;
        } else {
          // Append new row at bottom of existing sheet
          const nextIdx = Math.max(0, sheet.rowCount - 1);
          const row = sheet.addRow([
            tc.id,
            tc.description,
            tc.preconditions,
            tc.steps,
            tc.expected,
            tc.actual,
            tc.priority,
            status,
            executionDate,
            tc.remarks,
          ]);
          styleDataRow(row, nextIdx, status);
          appendedCount++;
        }
      }
    }

    recalculateSummary(wb, executionDate);
    await wb.xlsx.writeFile(filePath);
    console.log(
      `✅ Excel synced (${appendedCount} appended, ${updatedCount} updated, existing rows preserved): ${filePath}`
    );
  }
}

/**
 * Updates execution results for existing test cases in-place (preserving all rows).
 * @param {Object} results - { 'TC-RP-FUNC-06': { status: 'PASS'|'FAIL', remarks: '...', preconditions?: '...', actual?: '...' }, ... }
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

    for (const tabName of TAB_NAMES) {
      const sheet = wb.getWorksheet(tabName);
      if (!sheet) continue;

      sheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return; // Skip headers

        const testId = (row.getCell(1).value || '').toString().trim();
        if (!testId) return;

        const res = results[testId];
        if (res) {
          const status = (res.status || 'PASS').toUpperCase();
          const remarks = res.remarks || status;

          if (res.preconditions) {
            row.getCell(3).value = res.preconditions;
          }
          if (res.actual) {
            row.getCell(6).value = res.actual;
          }

          const statusCell = row.getCell(8);
          statusCell.value = status;
          if (status.includes('PASS')) {
            statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: THEME.PASS_BG } };
            statusCell.font = { bold: true, color: { argb: THEME.PASS_FONT } };
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
        }
      });
    }

    recalculateSummary(wb, executionDate);
    await wb.xlsx.writeFile(filePath);
    console.log(`✅ Successfully updated ${totalUpdated} test cases in ${filePath}`);
  }
}

module.exports = { updateRecentProjectsExcel, appendTestCasesToExcel };
