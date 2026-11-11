/**
 * common-excel-utils.js
 * Shared, non-destructive Excel workbook creation, test-case appending, and execution
 * result-updating utilities for the Vedak CRM Projects module (04_projects) and other suites.
 *
 * Supports:
 * 1. Categorized multi-tab workbooks (Summary + UI Tests / Functionality Tests / Major Tests / Minor Tests / Edge Cases)
 *    e.g. Vedak_CRM_Recent_Projects_TestCases.xlsx
 * 2. Flat single-sheet workbooks (compatible with scripts/update-excel.js / Projects Submenu Tests)
 *    e.g. Vedak_CRM_Projects_Submenu_TestCases.xlsx
 * 3. Declarative reporter factory (`createProjectsExcelReporter`) for future Projects sub-features.
 */

'use strict';

const ExcelJS = require('exceljs');
const path = require('path');
const fs = require('fs');

const DEFAULT_RECENT_PROJECTS_EXCEL_PATHS = [
  path.join(__dirname, '../../modules/04_projects/Vedak_CRM_Recent_Projects_TestCases.xlsx'),
  path.join(__dirname, '../../Vedak_CRM_Recent_Projects_TestCases.xlsx'),
];

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

/**
 * Builds an in-memory categorized ExcelJS Workbook with a Summary tab + category tabs.
 */
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

  // Metadata rows (Rows 4..9; C8 is always Execution Date & Time)
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

/**
 * Generates categorized Excel file(s) if missing (or when overwriteExisting=true).
 * Optionally non-destructively syncs initial test cases when files already exist.
 */
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
 * Non-destructively updates existing test cases in-place (preserving row positions) and
 * appends any missing test cases to the bottom of each category tab without deleting rows.
 *
 * @param {Object} testCasesByTab - { 'UI Tests': [{ id, description, preconditions, steps, expected, actual, priority, status, remarks }], ... }
 * @param {Object} [options]
 * @param {string|string[]} [options.filePaths] - Target .xlsx file(s)
 * @param {string[]} [options.tabNames] - Ordered tab names for Summary recalculation
 * @param {boolean} [options.preserveExistingStatus=false] - If true, keep existing Status/Actual/Date/Remarks when ID already exists
 * @param {boolean} [options.createMissingSheets=false] - If true, initialize missing category tabs with standard header
 * @param {boolean} [options.autoCreateFile=false] - If true, create workbook first if filePath is missing
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
 *
 * @param {Object} results - { 'TC-ID': { status: 'PASS'|'FAIL'|'PENDING', remarks?, actual?, preconditions? } }
 * @param {Object} [options]
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
 * Updates a flat single-sheet Projects Excel file (compatible with scripts/update-excel.js
 * and specs/projects.spec.js). Preserves existing non-empty remarks unless overwriteRemarks=true.
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
async function readWorkbookStats(filePath, options = {}) {
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
 * Convenience factory to bind Excel configuration once for any Projects suite/spec.
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

module.exports = {
  // Constants & Theme
  EXCEL_THEME,
  FLAT_STATUS_COLORS,
  DEFAULT_TAB_NAMES,
  DEFAULT_TEST_CASE_COLUMNS,
  DEFAULT_RECENT_PROJECTS_EXCEL_PATHS,
  DEFAULT_SUMMARY_META,

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
  appendTestCasesToExcel,
  updateCategorizedResults,
  updateFlatSheetResults,
  readWorkbookStats,
  createProjectsExcelReporter,
};
