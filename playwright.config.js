// @ts-check
const { defineConfig } = require('@playwright/test');
require('dotenv').config();

/**
 * VEDAK CRM — Playwright Test Configuration
 * Wraps existing custom test scripts into Playwright Test projects.
 *
 * Usage:
 *   npx playwright test                         ← Run ALL modules
 *   npx playwright test --project=login         ← Run Login only
 *   npx playwright test --project=dashboard     ← Run Dashboard only
 *   npx playwright test --project=organization  ← Run Organization only
 *   npx playwright test --project=projects      ← Run Projects only
 *   npx playwright test --reporter=html         ← Generate Playwright HTML report
 */

module.exports = defineConfig({
  // Directory where spec files live
  testDir: './specs',

  // Give each test generous time (existing tests can be slow)
  timeout: 120_000,

  // Allow 1 retry on flaky failures
  retries: 1,

  // Run tests serially (existing scripts launch their own browsers)
  workers: 1,
  fullyParallel: false,

  // Reporters
  reporter: [
    ['list'],                                        // Live terminal output
    ['html', { outputFolder: 'reports/playwright-html', open: 'never' }],
    ['json', { outputFile: 'reports/playwright-results.json' }],
  ],

  // Global test settings
  use: {
    baseURL: (process.env.APP_URL || 'http://localhost:5173').replace(/\/$/, ''),
    headless: process.env.HEADLESS === 'true',
    screenshot: 'only-on-failure',
    video: 'off',
    trace: 'off',
  },

  // ── Projects (one per module) ────────────────────────────────────────────
  projects: [
    {
      name: 'login',
      testMatch: '**/specs/login.spec.js',
    },
    {
      name: 'dashboard',
      testMatch: '**/specs/dashboard.spec.js',
    },
    {
      name: 'organization',
      testMatch: '**/specs/organization.spec.js',
    },
    {
      name: 'projects',
      testMatch: '**/specs/projects.spec.js',
    },
  ],
});
