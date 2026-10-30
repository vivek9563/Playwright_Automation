/**
 * create-login-excel.js
 * Creates modules/01_login/Vedak_CRM_Login_TestCases.xlsx
 */

'use strict';

const ExcelJS = require('exceljs');
const path    = require('path');
const fs      = require('fs');

const OUT_FILE = path.join(__dirname, 'Vedak_CRM_Login_TestCases.xlsx');

const BLUE  = { type: 'pattern', pattern: 'solid', fgColor: { rgb: '1E3A5F' } };
const WHITE = { color: { rgb: 'FFFFFF' } };

const testCases = [
  { id: 'LOGIN-01', name: 'Login Page Loads',          category: 'UI',            description: 'Verify the login page loads without errors',                     steps: '1. Navigate to /login\n2. Verify page loads', expected: 'Login page is displayed', severity: 'Critical', priority: 'High' },
  { id: 'LOGIN-02', name: 'OAuth Button Present',       category: 'UI',            description: 'Verify "Continue with Google" OAuth button is visible',          steps: '1. Open login page\n2. Check for Google OAuth button', expected: 'Google OAuth button is present', severity: 'Critical', priority: 'High' },
  { id: 'LOGIN-03', name: 'Login Page Title',           category: 'UI',            description: 'Verify the page has a valid non-empty title',                   steps: '1. Open login page\n2. Read page title', expected: 'Page title is non-empty', severity: 'Medium', priority: 'Medium' },
  { id: 'LOGIN-04', name: 'Protected Route Redirect',   category: 'Functionality', description: 'Accessing protected route without login redirects to login',    steps: '1. Navigate to /app/dashboard without login\n2. Verify redirect', expected: 'User is redirected to login page', severity: 'Critical', priority: 'High' },
  { id: 'LOGIN-05', name: 'Session Cookie Auth',        category: 'Functionality', description: 'Injecting valid session cookies bypasses login',                 steps: '1. Inject saved cookies\n2. Navigate to dashboard\n3. Verify access', expected: 'User lands on dashboard without login prompt', severity: 'High', priority: 'High' },
  { id: 'LOGIN-06', name: 'Login Page UI Elements',     category: 'UI',            description: 'Required UI elements (buttons, logo) exist on login page',     steps: '1. Open login page\n2. Check for buttons and UI elements', expected: 'At least one button and heading visible', severity: 'Medium', priority: 'Medium' },
];

async function createLoginExcel() {
  fs.mkdirSync(path.dirname(OUT_FILE), { recursive: true });

  const wb    = new ExcelJS.Workbook();
  const sheet = wb.addWorksheet('Login Tests');

  sheet.columns = [
    { header: 'Test ID',        key: 'id',          width: 14 },
    { header: 'Test Name',      key: 'name',        width: 32 },
    { header: 'Category',       key: 'category',    width: 16 },
    { header: 'Description',    key: 'description', width: 40 },
    { header: 'Test Steps',     key: 'steps',       width: 50 },
    { header: 'Expected Result',key: 'expected',    width: 40 },
    { header: 'Severity',       key: 'severity',    width: 12 },
    { header: 'Priority',       key: 'priority',    width: 10 },
    { header: 'Status',         key: 'status',      width: 16 },
    { header: 'Execution Date', key: 'date',        width: 22 },
    { header: 'Remarks',        key: 'remarks',     width: 35 },
  ];

  // Header formatting
  const hdr = sheet.getRow(1);
  hdr.font       = { bold: true, color: WHITE };
  hdr.fill       = BLUE;
  hdr.alignment  = { horizontal: 'center', vertical: 'middle', wrapText: true };
  hdr.height     = 24;

  // Data rows
  testCases.forEach(tc => {
    const row = sheet.addRow({ ...tc, status: 'NOT EXECUTED', date: '', remarks: '' });
    row.alignment = { vertical: 'top', wrapText: true };
    row.height    = 60;
  });

  await wb.xlsx.writeFile(OUT_FILE);
  console.log('✅ Login Excel created:', OUT_FILE);
}

createLoginExcel().catch(console.error);
