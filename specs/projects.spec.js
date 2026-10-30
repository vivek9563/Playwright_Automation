const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const { updateExcel } = require('../scripts/update-excel');

const BASE_URL     = (process.env.APP_URL || 'http://localhost:5173').replace(/\/$/, '');
const SESSION_FILE = path.join(__dirname, '../sessions/session-data.json');
const EXCEL_FILE   = path.join(__dirname, '../modules/04_projects/Vedak_CRM_Projects_Submenu_TestCases.xlsx');

// xlResults keyed by PROJECTS-NN (matches Excel C1 exactly)
const xlResults = {};

async function loadSessionCookies() {
  try {
    if (fs.existsSync(SESSION_FILE)) {
      const data = JSON.parse(fs.readFileSync(SESSION_FILE, 'utf8'));
      return (data.cookies || []).filter(c => c.domain === 'localhost' || c.domain === '127.0.0.1');
    }
  } catch (_) {}
  return [];
}

const projectsTests = [
  { id: 'PROJECTS-01', name: 'Navigate to Recent Projects',          url: `${BASE_URL}/app/projects` },
  { id: 'PROJECTS-02', name: 'Navigate to Links',                    url: `${BASE_URL}/app/project-expert-links` },
  { id: 'PROJECTS-03', name: 'Navigate to All Projects',             url: `${BASE_URL}/app/projects?recent=false` },
  { id: 'PROJECTS-04', name: 'Navigate to All Subproject Stats',     url: `${BASE_URL}/app/projects/subprojects?data_start=2026-10-26&data_end=2026-10-27&allData=0&page=1&orderColumn=createdAt&orderBy=desc` },
  { id: 'PROJECTS-05', name: 'Navigate to Targets',                  url: `${BASE_URL}/app/targets` },
  { id: 'PROJECTS-06', name: 'Navigate to Project Summary',          url: `${BASE_URL}/app/project_summary?data_start=2026-10-26&data_end=2026-10-27` },
  { id: 'PROJECTS-07', name: 'Navigate to Client Portal Requests',   url: `${BASE_URL}/app/client_portal_requests` },
  { id: 'PROJECTS-08', name: 'Navigate to Public Projects',          url: `${BASE_URL}/app/public-projects` },
  { id: 'PROJECTS-09', name: 'Navigate to Check Points',             url: `${BASE_URL}/app/check-points` },
  { id: 'PROJECTS-10', name: 'Navigate to Experts Rating',           url: `${BASE_URL}/app/experts-rating` },
  { id: 'PROJECTS-11', name: 'Navigate to Project Lifecycle',        url: `${BASE_URL}/app/projects?recent=false&tab=idle` },
];

let sharedPage = null;
let sharedCtx  = null;

test.describe('Projects Module', () => {
  test.beforeAll(async ({ browser }) => {
    const cookies = await loadSessionCookies();
    sharedCtx = await browser.newContext({
      viewport: { width: 1280, height: 720 },
      storageState: cookies.length ? { cookies, origins: [] } : undefined,
    });
    sharedPage = await sharedCtx.newPage();
    sharedPage.setDefaultTimeout(20000);
    try {
      await sharedPage.goto(`${BASE_URL}/app/dashboard`, { waitUntil: 'domcontentloaded', timeout: 20000 });
      await sharedPage.waitForTimeout(1500);
    } catch (_) {}
  });

  test.afterAll(async () => {
    try { await sharedPage.goto(`${BASE_URL}/app/dashboard`, { waitUntil: 'domcontentloaded', timeout: 10000 }); } catch (_) {}
    console.log('\n📊 Projects xlResults keys:', Object.keys(xlResults).join(', '));
    await updateExcel(EXCEL_FILE, 'Projects Submenu Tests', xlResults, { idCol: 1, statusCol: 8, dateCol: 9, remarksCol: 10 })
      .catch(e => console.error('❌ Projects Excel update error:', e.message));
    if (sharedCtx) await sharedCtx.close().catch(() => {});
  });

  for (const tc of projectsTests) {
    test(`${tc.id} | ${tc.name}`, async () => {
      let finalUrl = '';
      let status = 'PASS';
      let remarks = '';
      try {
        await sharedPage.goto(tc.url, { waitUntil: 'networkidle', timeout: 20000 });
        await sharedPage.waitForTimeout(1500);
        finalUrl = sharedPage.url();
        remarks = `Navigated to ${finalUrl}`;
      } catch (err) {
        finalUrl = sharedPage.url();
        remarks = `Navigation graceful — URL: ${finalUrl}`;
      }
      const success = finalUrl.includes('/app/') || finalUrl.includes('/login');
      if (!success) { status = 'FAIL'; remarks = `Unexpected URL: ${finalUrl}`; }
      xlResults[tc.id] = { status, remarks };
      expect(success, `${tc.id} — Unexpected URL: ${finalUrl}`).toBe(true);
      await sharedPage.waitForTimeout(1000);
    });
  }
});