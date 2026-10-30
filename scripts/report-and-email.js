/**
 * ============================================================
 *  report-and-email.js  — Vedak CRM Automation Suite
 * ============================================================
 *  Single file that does everything:
 *    1. Loads all test results from modules/test-results/
 *    2. Generates Master Excel  → reports/Master_Test_Report.xlsx
 *    3. Generates Master HTML   → reports/Master_Test_Report.html
 *    4. Sends email with both files attached
 *
 *  Usage (standalone):
 *    node scripts/report-and-email.js
 *
 *  Usage (as module inside run-all-tests-and-report.js):
 *    const reporter = require('./scripts/report-and-email');
 *    await reporter.generateAndSend(allSummaries);
 * ============================================================
 */

'use strict';

const fs        = require('fs');
const path      = require('path');
const ExcelJS   = require('exceljs');
const nodemailer = require('nodemailer');
const dotenv    = require('dotenv');

dotenv.config({ path: path.join(__dirname, '../.env') });

// ── Paths ────────────────────────────────────────────────────────────────────
const BASE         = path.join(__dirname, '..');
const RESULTS_DIR  = path.join(BASE, 'modules/test-results');
const REPORTS_DIR  = path.join(BASE, 'reports');
const MASTER_EXCEL = path.join(REPORTS_DIR, 'Master_Test_Report.xlsx');
const MASTER_HTML  = path.join(REPORTS_DIR, 'Master_Test_Report.html');

// ── Env ───────────────────────────────────────────────────────────────────────
const GMAIL_EMAIL    = process.env.GMAIL_EMAIL;
const GMAIL_PASSWORD = process.env.GMAIL_APP_PASSWORD;
const RECIPIENT      = process.env.RECIPIENT_EMAIL || GMAIL_EMAIL;

// ── Helpers ───────────────────────────────────────────────────────────────────
const ok   = (m) => console.log(`\x1b[32m✅ ${m}\x1b[0m`);
const fail = (m) => console.log(`\x1b[31m❌ ${m}\x1b[0m`);
const info = (m) => console.log(`\x1b[36mℹ️  ${m}\x1b[0m`);

// ─────────────────────────────────────────────────────────────────────────────
// 1. LOAD ALL TEST RESULTS
// ─────────────────────────────────────────────────────────────────────────────
function loadAllResults() {
  info('Loading test results from modules/test-results/...');
  fs.mkdirSync(RESULTS_DIR, { recursive: true });

  const summaries = [];
  const files = fs.existsSync(RESULTS_DIR)
    ? fs.readdirSync(RESULTS_DIR).filter(f => f.endsWith('.json'))
    : [];

  if (files.length === 0) {
    info('No result JSON files found — using empty summaries.');
    return summaries;
  }

  for (const file of files) {
    try {
      const raw  = fs.readFileSync(path.join(RESULTS_DIR, file), 'utf8');
      const data = JSON.parse(raw);
      const s    = data.summary || {};

      summaries.push({
        name:     data.module || file.replace(/-results?\.json$/, '').replace(/-/g, ' '),
        key:      data.module || file.replace(/-results?\.json$/, ''),
        total:    Number(s.totalTests  || s.total   || (data.results || []).length || 0),
        passed:   Number(s.passedTests || s.passed  || 0),
        failed:   Number(s.failedTests || s.failed  || 0),
        passRate: String(s.passRate    || '0'),
        date:     data.executionDate   || new Date().toLocaleString(),
        results:  data.results         || data.tests || [],
      });
    } catch (e) {
      fail(`Could not parse ${file}: ${e.message}`);
    }
  }

  info(`Loaded ${summaries.length} module(s): ${summaries.map(s => s.name).join(', ')}`);
  return summaries;
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. GENERATE MASTER EXCEL
// ─────────────────────────────────────────────────────────────────────────────
async function generateExcel(summaries) {
  info('Generating Master_Test_Report.xlsx...');
  fs.mkdirSync(REPORTS_DIR, { recursive: true });

  const totalTests  = summaries.reduce((a, s) => a + s.total,  0);
  const totalPassed = summaries.reduce((a, s) => a + s.passed, 0);
  const totalFailed = summaries.reduce((a, s) => a + s.failed, 0);
  const rate        = totalTests > 0 ? ((totalPassed / totalTests) * 100).toFixed(2) : '0.00';
  const now         = new Date().toLocaleString();

  const wb = new ExcelJS.Workbook();

  // ── Summary sheet ───────────────────────────────────────────────────────
  const sumSheet = wb.addWorksheet('Summary');
  sumSheet.columns = [
    { header: 'Metric', key: 'metric', width: 30 },
    { header: 'Value',  key: 'value',  width: 20 },
  ];

  const BLUE  = { type: 'pattern', pattern: 'solid', fgColor: { rgb: '1E3A5F' } };
  const WHITE = { color: { rgb: 'FFFFFF' } };

  // Header row
  const hdr = sumSheet.getRow(1);
  hdr.font = { bold: true, color: WHITE };
  hdr.fill = BLUE;

  const summaryRows = [
    { metric: 'Total Test Cases',  value: totalTests  },
    { metric: 'Tests Passed',      value: totalPassed },
    { metric: 'Tests Failed',      value: totalFailed },
    { metric: 'Success Rate (%)',  value: `${rate}%`  },
    { metric: 'Execution Date',    value: now         },
    { metric: 'Last Updated',      value: now         },
  ];
  summaries.forEach(s => {
    summaryRows.push({ metric: `  Module: ${s.name}`, value: `${s.passed}/${s.total} PASS` });
  });

  summaryRows.forEach(r => sumSheet.addRow(r));
  sumSheet.getColumn('metric').font = { bold: false };

  // ── Per-module detail sheets ─────────────────────────────────────────────
  for (const s of summaries) {
    const sheetName = s.name.substring(0, 31); // Excel 31-char limit
    const sheet     = wb.addWorksheet(sheetName);

    sheet.columns = [
      { header: 'Test ID',        key: 'testId',        width: 14 },
      { header: 'Test Name',      key: 'testName',      width: 32 },
      { header: 'Category',       key: 'category',      width: 16 },
      { header: 'Status',         key: 'status',        width: 16 },
      { header: 'Execution Date', key: 'executionDate', width: 22 },
      { header: 'Remarks',        key: 'remarks',       width: 40 },
    ];

    const shdrRow = sheet.getRow(1);
    shdrRow.font = { bold: true, color: WHITE };
    shdrRow.fill = BLUE;

    for (const r of (s.results || [])) {
      const row = sheet.addRow({
        testId:        r.testId  || r.id   || '',
        testName:      r.testName || r.name || '',
        category:      r.category || '',
        status:        r.status   || '',
        executionDate: r.executionDate || s.date,
        remarks:       r.remarks  || '',
      });

      const statusCell = row.getCell('status');
      const isPass = (r.status || '').toUpperCase().includes('PASS');
      statusCell.fill  = { type: 'pattern', pattern: 'solid',
                            fgColor: { rgb: isPass ? '00B050' : 'C00000' } };
      statusCell.font  = { bold: true, color: WHITE };
      row.alignment    = { vertical: 'top', wrapText: true };
    }
  }

  await wb.xlsx.writeFile(MASTER_EXCEL);
  ok(`Master_Test_Report.xlsx saved → ${MASTER_EXCEL}`);
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. GENERATE MASTER HTML
// ─────────────────────────────────────────────────────────────────────────────
function generateHTML(summaries) {
  info('Generating Master_Test_Report.html...');
  fs.mkdirSync(REPORTS_DIR, { recursive: true });

  const totalTests  = summaries.reduce((a, s) => a + s.total,  0);
  const totalPassed = summaries.reduce((a, s) => a + s.passed, 0);
  const totalFailed = summaries.reduce((a, s) => a + s.failed, 0);
  const rate        = totalTests > 0 ? ((totalPassed / totalTests) * 100).toFixed(2) : '0.00';
  const now         = new Date().toLocaleString();

  // Module cards
  const moduleCards = summaries.map(s => {
    const rows = (s.results || []).map(r => {
      const isPass = (r.status || '').toUpperCase().includes('PASS');
      return `
        <tr class="test-row" data-status="${isPass ? 'pass' : 'fail'}">
          <td>${r.testId  || r.id   || ''}</td>
          <td>${r.testName || r.name || ''}</td>
          <td><span class="badge badge-cat">${r.category || ''}</span></td>
          <td><span class="badge ${isPass ? 'badge-pass' : 'badge-fail'}">${r.status || ''}</span></td>
          <td>${r.executionDate || s.date}</td>
        </tr>`;
    }).join('');

    return `
    <div class="module-card">
      <div class="module-header">
        <h3>📋 ${s.name}</h3>
        <div class="module-pills">
          <span class="pill pill-total">Total: ${s.total}</span>
          <span class="pill pill-pass">Passed: ${s.passed}</span>
          <span class="pill pill-fail">Failed: ${s.failed}</span>
          <span class="pill pill-rate">${s.passRate}%</span>
        </div>
      </div>
      <table class="test-table">
        <thead><tr>
          <th>Test ID</th><th>Test Name</th><th>Category</th>
          <th>Status</th><th>Execution Date</th>
        </tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>`;
  }).join('');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Vedak CRM — Master Test Report</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body   { font-family: 'Segoe UI', sans-serif; background: #f0f2f5; color: #333; }
    header { background: linear-gradient(135deg,#1e3a5f,#2d6a9f); color:#fff; padding:30px 40px; }
    header h1 { font-size:24px; }
    header p  { margin-top:6px; opacity:.85; font-size:14px; }
    .container { max-width:1150px; margin:28px auto; padding:0 20px; }

    /* Summary cards */
    .summary-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:16px; margin-bottom:28px; }
    .summary-card { background:#fff; border-radius:10px; padding:20px; text-align:center;
                    box-shadow:0 2px 8px rgba(0,0,0,.08); }
    .summary-card .val  { font-size:34px; font-weight:700; margin-bottom:4px; }
    .summary-card .lbl  { font-size:12px; color:#666; text-transform:uppercase; letter-spacing:.5px; }
    .card-total  .val { color:#1e3a5f; }
    .card-passed .val { color:#00b050; }
    .card-failed .val { color:#c00000; }
    .card-rate   .val { color:#d97706; }

    /* Filter bar */
    .filter-bar { display:flex; gap:10px; margin-bottom:20px; flex-wrap:wrap; }
    .filter-btn { padding:7px 18px; border:2px solid #1e3a5f; background:#fff; color:#1e3a5f;
                  border-radius:20px; cursor:pointer; font-weight:600; font-size:13px;
                  transition:all .2s; }
    .filter-btn:hover, .filter-btn.active { background:#1e3a5f; color:#fff; }

    /* Module card */
    .module-card { background:#fff; border-radius:10px; padding:22px;
                   margin-bottom:22px; box-shadow:0 2px 8px rgba(0,0,0,.08); }
    .module-header { display:flex; justify-content:space-between; align-items:center;
                     flex-wrap:wrap; gap:10px; margin-bottom:14px; }
    .module-header h3 { font-size:16px; color:#1e3a5f; }
    .module-pills { display:flex; gap:8px; flex-wrap:wrap; }
    .pill { padding:4px 12px; border-radius:20px; font-size:12px; font-weight:600; }
    .pill-total { background:#e8f0fe; color:#1e3a5f; }
    .pill-pass  { background:#d4edda; color:#155724; }
    .pill-fail  { background:#f8d7da; color:#721c24; }
    .pill-rate  { background:#fff3cd; color:#856404; }

    /* Table */
    .test-table { width:100%; border-collapse:collapse; font-size:13px; }
    .test-table thead tr { background:#1e3a5f; color:#fff; }
    .test-table th { padding:9px 12px; text-align:left; font-weight:600; }
    .test-table td { padding:8px 12px; border-bottom:1px solid #eee; vertical-align:top; }
    .test-table tr:hover td { background:#f9fbff; }
    .test-row.hidden { display:none; }

    /* Badges */
    .badge { display:inline-block; padding:3px 10px; border-radius:12px; font-size:12px; font-weight:600; }
    .badge-pass { background:#d4edda; color:#155724; }
    .badge-fail { background:#f8d7da; color:#721c24; }
    .badge-cat  { background:#e8f0fe; color:#1e3a5f; }

    /* Grace badge */
    .badge[class*="Graceful"] { background:#fff3cd; color:#856404; }

    footer { text-align:center; color:#888; font-size:12px; margin:28px 0 40px; }
    @media(max-width:700px){ .summary-grid{grid-template-columns:repeat(2,1fr);} }
  </style>
</head>
<body>
<header>
  <h1>🎯 Vedak CRM — Master Test Report</h1>
  <p>Last executed: ${now} &nbsp;|&nbsp; All modules combined</p>
</header>

<div class="container">
  <!-- Summary -->
  <div class="summary-grid">
    <div class="summary-card card-total">
      <div class="val">${totalTests}</div>
      <div class="lbl">Total Tests</div>
    </div>
    <div class="summary-card card-passed">
      <div class="val">${totalPassed}</div>
      <div class="lbl">Passed</div>
    </div>
    <div class="summary-card card-failed">
      <div class="val">${totalFailed}</div>
      <div class="lbl">Failed</div>
    </div>
    <div class="summary-card card-rate">
      <div class="val">${rate}%</div>
      <div class="lbl">Success Rate</div>
    </div>
  </div>

  <!-- Filter -->
  <div class="filter-bar">
    <button class="filter-btn active" onclick="applyFilter('all',this)">All Tests</button>
    <button class="filter-btn" onclick="applyFilter('pass',this)">✅ Passed Only</button>
    <button class="filter-btn" onclick="applyFilter('fail',this)">❌ Failed Only</button>
  </div>

  <!-- Modules -->
  ${moduleCards}

  <footer>
    Generated by Vedak CRM Automation Suite &nbsp;|&nbsp; ${now}
  </footer>
</div>

<script>
  // Filter tests
  function applyFilter(status, btn) {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    document.querySelectorAll('.test-row').forEach(row => {
      if (status === 'all') row.classList.remove('hidden');
      else row.classList.toggle('hidden', row.dataset.status !== status);
    });
    localStorage.setItem('vedak_filter', status);
  }

  // Persist last run data
  const _data = ${JSON.stringify({ totalTests, totalPassed, totalFailed, rate, executionDate: now })};
  localStorage.setItem('vedak_last_run', JSON.stringify(_data));

  // Restore filter on reload
  const _saved = localStorage.getItem('vedak_filter');
  if (_saved && _saved !== 'all') {
    const btn = document.querySelector(\`.filter-btn[onclick*="'\${_saved}'"]\`);
    if (btn) applyFilter(_saved, btn);
  }
</script>
</body>
</html>`;

  fs.writeFileSync(MASTER_HTML, html);
  ok(`Master_Test_Report.html saved → ${MASTER_HTML}`);
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. SEND EMAIL
// ─────────────────────────────────────────────────────────────────────────────
async function sendEmail(summaries) {
  if (!GMAIL_EMAIL || !GMAIL_PASSWORD) {
    fail('GMAIL_EMAIL or GMAIL_APP_PASSWORD missing in .env — skipping email');
    return;
  }

  info(`Sending email report to ${RECIPIENT}...`);

  const totalTests  = summaries.reduce((a, s) => a + s.total,  0);
  const totalPassed = summaries.reduce((a, s) => a + s.passed, 0);
  const totalFailed = summaries.reduce((a, s) => a + s.failed, 0);
  const rate        = totalTests > 0 ? ((totalPassed / totalTests) * 100).toFixed(2) : '0.00';
  const now         = new Date().toLocaleString();

  const moduleRows = summaries.map(s => `
    <tr>
      <td style="padding:10px 14px;border-bottom:1px solid #eee;">${s.name}</td>
      <td style="padding:10px 14px;border-bottom:1px solid #eee;text-align:center;">${s.total}</td>
      <td style="padding:10px 14px;border-bottom:1px solid #eee;text-align:center;color:#155724;font-weight:700;">${s.passed}</td>
      <td style="padding:10px 14px;border-bottom:1px solid #eee;text-align:center;color:${s.failed > 0 ? '#721c24' : '#155724'};font-weight:700;">${s.failed}</td>
      <td style="padding:10px 14px;border-bottom:1px solid #eee;text-align:center;">
        <span style="background:${s.failed > 0 ? '#f8d7da' : '#d4edda'};
                     color:${s.failed > 0 ? '#721c24' : '#155724'};
                     padding:3px 10px;border-radius:12px;font-weight:700;">${s.passRate}%</span>
      </td>
    </tr>`).join('');

  const emailHTML = `
<div style="font-family:'Segoe UI',sans-serif;max-width:680px;margin:0 auto;color:#333;">
  <div style="background:linear-gradient(135deg,#1e3a5f,#2d6a9f);color:#fff;padding:28px 32px;border-radius:10px 10px 0 0;">
    <h1 style="margin:0;font-size:22px;">🎯 Vedak CRM — Test Execution Report</h1>
    <p style="margin:8px 0 0;opacity:.85;font-size:14px;">Execution Date: ${now}</p>
  </div>
  <div style="background:#fff;padding:24px 32px;border:1px solid #ddd;border-top:none;border-radius:0 0 10px 10px;">

    <!-- Stats row -->
    <div style="display:flex;gap:12px;margin-bottom:24px;flex-wrap:wrap;">
      <div style="flex:1;min-width:110px;background:#e8f0fe;padding:16px;border-radius:8px;text-align:center;">
        <div style="font-size:30px;font-weight:700;color:#1e3a5f;">${totalTests}</div>
        <div style="font-size:11px;color:#555;text-transform:uppercase;letter-spacing:.5px;">Total Tests</div>
      </div>
      <div style="flex:1;min-width:110px;background:#d4edda;padding:16px;border-radius:8px;text-align:center;">
        <div style="font-size:30px;font-weight:700;color:#155724;">${totalPassed}</div>
        <div style="font-size:11px;color:#555;text-transform:uppercase;letter-spacing:.5px;">Passed</div>
      </div>
      <div style="flex:1;min-width:110px;background:#f8d7da;padding:16px;border-radius:8px;text-align:center;">
        <div style="font-size:30px;font-weight:700;color:#721c24;">${totalFailed}</div>
        <div style="font-size:11px;color:#555;text-transform:uppercase;letter-spacing:.5px;">Failed</div>
      </div>
      <div style="flex:1;min-width:110px;background:#fff3cd;padding:16px;border-radius:8px;text-align:center;">
        <div style="font-size:30px;font-weight:700;color:#856404;">${rate}%</div>
        <div style="font-size:11px;color:#555;text-transform:uppercase;letter-spacing:.5px;">Success Rate</div>
      </div>
    </div>

    <!-- Module breakdown -->
    <h2 style="color:#1e3a5f;border-bottom:2px solid #1e3a5f;padding-bottom:8px;margin-bottom:16px;font-size:16px;">
      📋 Module Breakdown
    </h2>
    <table style="width:100%;border-collapse:collapse;font-size:13px;">
      <thead>
        <tr style="background:#1e3a5f;color:#fff;">
          <th style="padding:10px 14px;text-align:left;">Module</th>
          <th style="padding:10px 14px;text-align:center;">Total</th>
          <th style="padding:10px 14px;text-align:center;">Passed</th>
          <th style="padding:10px 14px;text-align:center;">Failed</th>
          <th style="padding:10px 14px;text-align:center;">Pass Rate</th>
        </tr>
      </thead>
      <tbody>${moduleRows}</tbody>
    </table>

    <p style="margin-top:24px;font-size:13px;color:#666;border-top:1px solid #eee;padding-top:16px;">
      📎 <strong>Attachments:</strong> Master_Test_Report.xlsx &amp; Master_Test_Report.html (interactive)
    </p>
    <p style="margin-top:8px;font-size:12px;color:#999;">
      This is an automated report from Vedak CRM Automation Suite.
    </p>
  </div>
</div>`;

  const attachments = [];
  if (fs.existsSync(MASTER_EXCEL)) attachments.push({ filename: 'Master_Test_Report.xlsx', path: MASTER_EXCEL });
  if (fs.existsSync(MASTER_HTML))  attachments.push({ filename: 'Master_Test_Report.html',  path: MASTER_HTML  });

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: GMAIL_EMAIL, pass: GMAIL_PASSWORD },
  });

  const info_mail = await transporter.sendMail({
    from:        GMAIL_EMAIL,
    to:          RECIPIENT,
    subject:     `📊 Vedak CRM Test Report — ${totalPassed}/${totalTests} Passed (${rate}%) | ${now}`,
    html:        emailHTML,
    attachments,
  });

  ok(`Email sent to ${RECIPIENT}  |  Message-ID: ${info_mail.messageId}`);
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. MAIN EXPORTED FUNCTION
// ─────────────────────────────────────────────────────────────────────────────

/**
 * generateAndSend(summaries?)
 *
 * @param {Array} [summaries] - optional pre-built summaries array from
 *   run-all-tests-and-report.js.  If omitted, loads from modules/test-results/.
 */
async function generateAndSend(summaries) {
  const data = summaries && summaries.length > 0 ? summaries : loadAllResults();

  await generateExcel(data);
  generateHTML(data);
  await sendEmail(data);
}

// ─────────────────────────────────────────────────────────────────────────────
// Run standalone  →  node scripts/report-and-email.js
// ─────────────────────────────────────────────────────────────────────────────
if (require.main === module) {
  (async () => {
    console.log('\n\x1b[1m\x1b[33m══════════════════════════════════════════\x1b[0m');
    console.log('\x1b[1m\x1b[33m  Vedak CRM — Report & Email Generator\x1b[0m');
    console.log('\x1b[1m\x1b[33m══════════════════════════════════════════\x1b[0m\n');

    try {
      await generateAndSend();
      console.log('\n\x1b[32m\x1b[1m✅ Done — Reports generated and email sent.\x1b[0m\n');
    } catch (err) {
      fail(`Fatal: ${err.message}`);
      process.exit(1);
    }
  })();
}

module.exports = { generateAndSend, loadAllResults, generateExcel, generateHTML, sendEmail };
