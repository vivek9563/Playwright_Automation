/**
 * run-recent-projects-tests.js
 * Executes the Recent Projects Playwright Test Suite (Scroll + Filter Columns)
 * and updates modules/04_projects/Vedak_CRM_Recent_Projects_TestCases.xlsx
 * non-destructively (preserving existing test cases and appending/updating results).
 */

'use strict';

const { spawnSync } = require('child_process');
const path = require('path');

const repoRoot = path.resolve(__dirname, '../../../..');

function runRecentProjectsTests() {
  console.log('\n🚀 Running Recent Projects (Scroll & Filter Columns) Playwright Suite...\n');

  const extraArgs = process.argv.slice(2);
  const args = ['playwright', 'test', '--project=recent-projects', ...extraArgs];

  const result = spawnSync('npx', args, {
    cwd: repoRoot,
    stdio: 'inherit',
    shell: process.platform === 'win32',
  });

  if (result.error) {
    console.error('❌ Failed to run Playwright:', result.error.message);
    process.exit(1);
  }

  process.exit(result.status ?? 0);
}

if (require.main === module) {
  runRecentProjectsTests();
}

module.exports = { runRecentProjectsTests };

