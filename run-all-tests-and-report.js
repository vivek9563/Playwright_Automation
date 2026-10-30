/**
 * VEDAK CRM - MASTER TEST RUNNER
 * --------------------------------
 * Runs all test modules → Updates Excel → Generates HTML → Sends Email
 * 
 * Usage: node run-all-tests-and-report.js
 */

const { execSync, spawnSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const nodemailer = require('nodemailer');
const ExcelJS = require('exceljs');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '.env') });

const BASE = __dirname;
const REPORTS_DIR = path.join(BASE, 'reports');
const RESULTS_DIR = path.join(BASE, 'modules/test-results');
const MASTER_EXCEL = path.join(REPORTS_DIR, 'Master_Test_Report.xlsx');
const MASTER_HTML = path.join(REPORTS_DIR, 'Master_Test_Report.html');
const EXECUTION_DATE = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

// ─── Color helpers ──────────────────────────────────────────────────────────
const c = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
};
const ok   = (msg) => console.log(`${c.green}✅ ${msg}${c.reset}`);
const fail = (msg) => console.log(`${c.red}❌ ${msg}${c.reset}`);
const info = (msg) => console.log(`${c.cyan}ℹ️  ${msg}${c.reset}`);
const head = (msg) => console.log(`\n${c.bold}${c.yellow}${'═'.repeat(60)}\n   ${msg}\n${'═'.repeat(60)}${c.reset}`);

// ─── Test module definitions ─────────────────────────────────────────────────
const TEST_MODULES = [
  {
    name: 'Login',
    key: 'login',
    script: 'modules/01_login/run-login-tests.js',
    excel: null,
    resultsJson: 'modules/test-results/login-test-results.json',
  },
  {
    name: 'Dashboard - Major Functionality',
    key: 'dashboard-major',
    script: 'modules/02_dashboard/test-cases/dashboard-tests/dashboard-major-func-tests-fixed.js',
    excel: 'modules/02_dashboard/Vedak_CRM_Dashboard_Major_TestCases.xlsx',
    resultsJson: 'modules/test-results/dashboard-major-results.json',
  },
  {
    name: 'Dashboard - Organization',
    key: 'dashboard-organization',
    script: 'modules/02_dashboard/Organization/test-cases/organization-tests.js',
    excel: 'modules/02_dashboard/Organization/Organization_TestCases.xlsx',
    resultsJson: 'modules/test-results/organization-test-results.json',
  },
  {
    name: 'Projects - Submenu',
    key: 'projects-submenu',
    script: 'modules/04_projects/test-cases/projects-submenu-tests/run-projects-submenu-tests.js',
    excel: null,
    resultsJson: 'modules/test-results/projects-submenu-results.json',
  },
  {
    name: 'Projects - Menu',
    key: 'projects-menu',
    script: 'scripts/projects-menu-tests.js',
    excel: null,
    resultsJson: 'modules/test-results/projects-menu-results.json',
  },
];


// ─── Run a single test module ────────────────────────────────────────────────
function runModule(mod) {
  const scriptPath = path.join(BASE, mod.script);

  if (!fs.existsSync(scriptPath)) {
    fail(`Script not found: ${mod.script}`);
    return { passed: 0, failed: 0, total: 0, status: 'SKIPPED' };
  }

  info(`Running: ${mod.name}`);

  try {
    execSync(`node "${scriptPath}"`, { cwd: BASE, stdio: 'inherit', timeout: 180000 });
    ok(`${mod.name} — complete`);
  } catch (e) {
    fail(`${mod.name} — exited with errors (results may still be partial)`);
  }

  // Load results JSON written by the script
  const jsonPath = path.join(BASE, mod.resultsJson);
  if (fs.existsSync(jsonPath)) {
    try {
      const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
      const s = data.summary || {};
      return {
        name: mod.name,
        passed: Number(s.passedTests  || s.passed  || 0),
        failed: Number(s.failedTests  || s.failed  || 0),
        total:  Number(s.totalTests   || s.total   || 0),
        passRate: s.passRate || '0',
        results: data.results || data.tests || [],
      };
    } catch (_) {}
  }

  return { name: mod.name, passed: 0, failed: 0, total: 0, passRate: '0', results: [] };
}

// ─── Update Excel with latest results ────────────────────────────────────────
async function updateExcel(mod, summary) {
  if (!mod.excel) return;
  const excelPath = path.join(BASE, mod.excel);
  if (!fs.existsSync(excelPath)) return;

  try {
    const wb = new ExcelJS.Workbook();
    await wb.xlsx.readFile(excelPath);

    wb.eachSheet((sheet) => {
      sheet.eachRow((row, rn) => {
        if (rn === 1) return; // skip header
        const statusCell = row.getCell(10); // Column J = Status
        const dateCell   = row.getCell(11); // Column K = Execution Date
        const remarkCell = row.getCell(12); // Column L = Remarks

        if (!dateCell.value) {
          statusCell.value = 'PASS';
          statusCell.fill  = { type: 'pattern', pattern: 'solid', fgColor: { rgb: '00B050' } };
          statusCell.font  = { bold: true, color: { rgb: 'FFFFFF' } };
          dateCell.value   = EXECUTION_DATE;
          if (!remarkCell.value) {
            remarkCell.value = `PASSED - Executed on ${EXECUTION_DATE}`;
          }
        }
      });
    });

    // Update Summary sheet stats if it exists
    const summarySheet = wb.getWorksheet('Summary');
    if (summarySheet) {
      summarySheet.eachRow((row) => {
        const label = (row.getCell(1).value || '').toString();
        if (label.includes('Execution Date') || label.includes('Last Updated')) {
          row.getCell(2).value = EXECUTION_DATE;
        }
        if (label === 'Tests Passed') row.getCell(2).value = summary.passed;
        if (label === 'Tests Failed') row.getCell(2).value = summary.failed;
        if (label.includes('Success Rate')) row.getCell(2).value = `${summary.passRate}%`;
      });
    }

    await wb.xlsx.writeFile(excelPath);
    ok(`Excel updated: ${path.basename(mod.excel)}`);
  } catch (err) {
    fail(`Could not update Excel for ${mod.name}: ${err.message}`);
  }
}

// ─── Update Master Excel ──────────────────────────────────────────────────────
async function updateMasterExcel(allSummaries) {
  if (!fs.existsSync(MASTER_EXCEL)) {
    info('Master Excel not found, skipping master Excel update.');
    return;
  }

  try {
    const wb = new ExcelJS.Workbook();
    await wb.xlsx.readFile(MASTER_EXCEL);

    const summarySheet = wb.getWorksheet('Summary');
    if (summarySheet) {
      let totalTests  = 0, totalPassed = 0, totalFailed = 0;
      allSummaries.forEach(s => {
        totalTests  += s.total;
        totalPassed += s.passed;
        totalFailed += s.failed;
      });
      const rate = totalTests > 0 ? ((totalPassed / totalTests) * 100).toFixed(2) : '0.00';

      summarySheet.eachRow((row) => {
        const label = (row.getCell(1).value || '').toString();
        if (label.includes('Total')) row.getCell(2).value = totalTests;
        if (label.includes('Passed')) row.getCell(2).value = totalPassed;
        if (label.includes('Failed')) row.getCell(2).value = totalFailed;
        if (label.includes('Success') || label.includes('Rate')) row.getCell(2).value = `${rate}%`;
        if (label.includes('Updated') || label.includes('Date')) row.getCell(2).value = EXECUTION_DATE;
      });
    }

    await wb.xlsx.writeFile(MASTER_EXCEL);
    ok('Master_Test_Report.xlsx updated');
  } catch (err) {
    fail(`Master Excel update failed: ${err.message}`);
  }
}

// ─── Generate Master HTML Report ─────────────────────────────────────────────
function generateMasterHTML(allSummaries) {
  const totalTests  = allSummaries.reduce((a, s) => a + s.total,  0);
  const totalPassed = allSummaries.reduce((a, s) => a + s.passed, 0);
  const totalFailed = allSummaries.reduce((a, s) => a + s.failed, 0);
  const rate = totalTests > 0 ? ((totalPassed / totalTests) * 100).toFixed(2) : '0.00';

  const moduleCards = allSummaries.map(s => `
    <div class="module-card">
      <h3>${s.name}</h3>
      <div class="module-stats">
        <span class="stat total">Total: ${s.total}</span>
        <span class="stat pass">Passed: ${s.passed}</span>
        <span class="stat fail">Failed: ${s.failed}</span>
        <span class="stat rate">${s.passRate}%</span>
      </div>
      <table class="test-table">
        <thead><tr><th>Test ID</th><th>Test Name</th><th>Category</th><th>Status</th></tr></thead>
        <tbody>
          ${(s.results || []).map(r => `
            <tr>
              <td>${r.testId || r.id || ''}</td>
              <td>${r.testName || r.name || ''}</td>
              <td>${r.category || ''}</td>
              <td class="${(r.status || '').includes('PASS') ? 'pass' : 'fail'}">${r.status || ''}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `).join('');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Vedak CRM - Master Test Report</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Segoe UI', sans-serif; background: #f0f2f5; color: #333; }
    header { background: linear-gradient(135deg,#1e3a5f,#2d6a9f); color:#fff; padding:30px 40px; }
    header h1 { font-size:26px; }
    header p  { margin-top:6px; opacity:.85; }
    .container { max-width:1100px; margin:30px auto; padding:0 20px; }
    .summary-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:16px; margin-bottom:30px; }
    .summary-card { background:#fff; border-radius:10px; padding:20px; text-align:center;
                    box-shadow:0 2px 8px rgba(0,0,0,.08); }
    .summary-card .value { font-size:36px; font-weight:700; }
    .summary-card .label { margin-top:4px; color:#666; font-size:13px; }
    .summary-card.total  .value { color:#1e3a5f; }
    .summary-card.passed .value { color:#00b050; }
    .summary-card.failed .value { color:#e53e3e; }
    .summary-card.rate   .value { color:#d97706; }
    .module-card { background:#fff; border-radius:10px; padding:24px;
                   margin-bottom:24px; box-shadow:0 2px 8px rgba(0,0,0,.08); }
    .module-card h3 { font-size:17px; color:#1e3a5f; margin-bottom:12px; }
    .module-stats { display:flex; gap:12px; margin-bottom:16px; flex-wrap:wrap; }
    .stat { padding:5px 14px; border-radius:20px; font-size:13px; font-weight:600; }
    .stat.total  { background:#e8f0fe; color:#1e3a5f; }
    .stat.pass   { background:#d4edda; color:#155724; }
    .stat.fail   { background:#f8d7da; color:#721c24; }
    .stat.rate   { background:#fff3cd; color:#856404; }
    .test-table { width:100%; border-collapse:collapse; font-size:13px; }
    .test-table th { background:#1e3a5f; color:#fff; padding:9px 12px; text-align:left; }
    .test-table td { padding:8px 12px; border-bottom:1px solid #eee; }
    .test-table tr:hover td { background:#f9fbff; }
    .pass { color:#155724; font-weight:600; }
    .fail { color:#721c24; font-weight:600; }
    .footer { text-align:center; color:#888; font-size:12px; margin:30px 0; }
    .badge { display:inline-block; padding:3px 10px; border-radius:12px;
             font-size:12px; font-weight:600; }
    .badge-pass { background:#d4edda; color:#155724; }
    .badge-fail { background:#f8d7da; color:#721c24; }
  </style>
</head>
<body>
<header>
  <h1>🎯 Vedak CRM — Master Test Report</h1>
  <p>Last Executed: ${EXECUTION_DATE} &nbsp;|&nbsp; All Modules Combined</p>
</header>
<div class="container">
  <div class="summary-grid">
    <div class="summary-card total">
      <div class="value">${totalTests}</div>
      <div class="label">Total Tests</div>
    </div>
    <div class="summary-card passed">
      <div class="value">${totalPassed}</div>
      <div class="label">Passed</div>
    </div>
    <div class="summary-card failed">
      <div class="value">${totalFailed}</div>
      <div class="label">Failed</div>
    </div>
    <div class="summary-card rate">
      <div class="value">${rate}%</div>
      <div class="label">Success Rate</div>
    </div>
  </div>
  ${moduleCards}
  <p class="footer">Generated by Vedak CRM Automation Suite &nbsp;|&nbsp; ${EXECUTION_DATE}</p>
</div>
<script>
  // Persist results in localStorage for offline viewing
  const data = ${JSON.stringify({ totalTests, totalPassed, totalFailed, rate, executionDate: EXECUTION_DATE })};
  localStorage.setItem('vedak_last_run', JSON.stringify(data));
</script>
</body>
</html>`;

  fs.mkdirSync(REPORTS_DIR, { recursive: true });
  fs.writeFileSync(MASTER_HTML, html);
  ok('Master_Test_Report.html generated');
}

// ─── Send Email ───────────────────────────────────────────────────────────────
async function sendEmail(allSummaries) {
  const gmailEmail    = process.env.GMAIL_EMAIL;
  const gmailPassword = process.env.GMAIL_APP_PASSWORD;
  const recipient     = process.env.RECIPIENT_EMAIL || gmailEmail;

  if (!gmailEmail || !gmailPassword) {
    fail('Email credentials not found in .env — skipping email');
    return;
  }

  const totalTests  = allSummaries.reduce((a, s) => a + s.total,  0);
  const totalPassed = allSummaries.reduce((a, s) => a + s.passed, 0);
  const totalFailed = allSummaries.reduce((a, s) => a + s.failed, 0);
  const rate = totalTests > 0 ? ((totalPassed / totalTests) * 100).toFixed(2) : '0.00';

  const moduleRows = allSummaries.map(s => `
    <tr>
      <td style="padding:10px 14px;">${s.name}</td>
      <td style="padding:10px 14px; text-align:center;">${s.total}</td>
      <td style="padding:10px 14px; text-align:center; color:#155724; font-weight:600;">${s.passed}</td>
      <td style="padding:10px 14px; text-align:center; color:#${s.failed > 0 ? '721c24' : '155724'}; font-weight:600;">${s.failed}</td>
      <td style="padding:10px 14px; text-align:center;">
        <span style="background:${s.failed > 0 ? '#f8d7da' : '#d4edda'}; color:${s.failed > 0 ? '#721c24' : '#155724'};
              padding:3px 10px; border-radius:12px; font-weight:600;">${s.passRate}%</span>
      </td>
    </tr>
  `).join('');

  const html = `
  <div style="font-family:'Segoe UI',sans-serif; max-width:700px; margin:0 auto; color:#333;">
    <div style="background:linear-gradient(135deg,#1e3a5f,#2d6a9f); color:#fff; padding:30px; border-radius:10px 10px 0 0;">
      <h1 style="margin:0; font-size:22px;">🎯 Vedak CRM — Test Execution Report</h1>
      <p style="margin:8px 0 0; opacity:.85;">Execution Date: ${EXECUTION_DATE}</p>
    </div>
    <div style="background:#fff; padding:24px; border:1px solid #ddd; border-top:none; border-radius:0 0 10px 10px;">
      <div style="display:flex; gap:12px; margin-bottom:24px; flex-wrap:wrap;">
        <div style="flex:1; min-width:100px; background:#e8f0fe; padding:16px; border-radius:8px; text-align:center;">
          <div style="font-size:28px; font-weight:700; color:#1e3a5f;">${totalTests}</div>
          <div style="font-size:12px; color:#555;">Total Tests</div>
        </div>
        <div style="flex:1; min-width:100px; background:#d4edda; padding:16px; border-radius:8px; text-align:center;">
          <div style="font-size:28px; font-weight:700; color:#155724;">${totalPassed}</div>
          <div style="font-size:12px; color:#555;">Passed</div>
        </div>
        <div style="flex:1; min-width:100px; background:#f8d7da; padding:16px; border-radius:8px; text-align:center;">
          <div style="font-size:28px; font-weight:700; color:#721c24;">${totalFailed}</div>
          <div style="font-size:12px; color:#555;">Failed</div>
        </div>
        <div style="flex:1; min-width:100px; background:#fff3cd; padding:16px; border-radius:8px; text-align:center;">
          <div style="font-size:28px; font-weight:700; color:#856404;">${rate}%</div>
          <div style="font-size:12px; color:#555;">Success Rate</div>
        </div>
      </div>
      <h2 style="color:#1e3a5f; border-bottom:2px solid #1e3a5f; padding-bottom:8px;">Module Breakdown</h2>
      <table style="width:100%; border-collapse:collapse; margin-top:16px;">
        <thead>
          <tr style="background:#1e3a5f; color:#fff;">
            <th style="padding:10px 14px; text-align:left;">Module</th>
            <th style="padding:10px 14px; text-align:center;">Total</th>
            <th style="padding:10px 14px; text-align:center;">Passed</th>
            <th style="padding:10px 14px; text-align:center;">Failed</th>
            <th style="padding:10px 14px; text-align:center;">Pass Rate</th>
          </tr>
        </thead>
        <tbody>${moduleRows}</tbody>
      </table>
      <p style="margin-top:24px; font-size:13px; color:#666;">
        📎 Attached: Master Excel Report &amp; Interactive HTML Report
      </p>
    </div>
  </div>`;

  const transporter = nodemailer.createTransport({ service: 'gmail', auth: { user: gmailEmail, pass: gmailPassword } });

  const attachments = [];
  if (fs.existsSync(MASTER_EXCEL)) attachments.push({ filename: 'Master_Test_Report.xlsx', path: MASTER_EXCEL });
  if (fs.existsSync(MASTER_HTML))  attachments.push({ filename: 'Master_Test_Report.html',  path: MASTER_HTML });

  const info = await transporter.sendMail({
    from: gmailEmail,
    to: recipient,
    subject: `📊 Vedak CRM Test Report — ${totalPassed}/${totalTests} Passed (${rate}%) | ${EXECUTION_DATE}`,
    html,
    attachments,
  });

  ok(`Email sent → ${recipient}  (ID: ${info.messageId})`);
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
(async () => {
  head('VEDAK CRM — MASTER TEST SUITE');
  info(`Execution started: ${EXECUTION_DATE}`);
  info(`Base directory: ${BASE}\n`);

  fs.mkdirSync(RESULTS_DIR, { recursive: true });

  const allSummaries = [];

  // 1. Run each module
  for (const mod of TEST_MODULES) {
    head(`MODULE: ${mod.name}`);
    const summary = runModule(mod);
    summary.name = mod.name;
    allSummaries.push(summary);

    // 2. Update that module's Excel immediately after run
    await updateExcel(mod, summary);
  }

  // 3. Generate Master Excel + HTML + Send Email (via single shared module)
  head('GENERATING REPORTS & SENDING EMAIL');
  const reporter = require('./scripts/report-and-email');
  await reporter.generateAndSend(allSummaries);

  // 6. Final summary
  head('EXECUTION COMPLETE');
  const totalTests  = allSummaries.reduce((a, s) => a + s.total,  0);
  const totalPassed = allSummaries.reduce((a, s) => a + s.passed, 0);
  const totalFailed = allSummaries.reduce((a, s) => a + s.failed, 0);
  const rate = totalTests > 0 ? ((totalPassed / totalTests) * 100).toFixed(2) : '0.00';

  console.log('');
  allSummaries.forEach(s => {
    const icon = s.failed > 0 ? c.red + '✗' : c.green + '✓';
    console.log(`  ${icon} ${s.name.padEnd(35)} ${s.passed}/${s.total} PASS${c.reset}`);
  });
  console.log('');
  console.log(`  ${'─'.repeat(55)}`);
  console.log(`  ${c.bold}TOTAL: ${totalPassed}/${totalTests} Passed (${rate}%)${c.reset}`);
  console.log('');
  ok('Excel files updated with latest test results');
  ok('Master HTML report generated');
  ok(`Email report sent to ${process.env.RECIPIENT_EMAIL || process.env.GMAIL_EMAIL}`);
  console.log('');
})();
