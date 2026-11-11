/**
 * run-recent-projects-tests.js
 * Executes the unified Recent Projects Playwright Test Suite
 * (Navigation & Scroll, Filter Columns, and Project Detail Window: Link Redirect/Ref ID,
 *  11 Tabs + Success Messages, Vedak Members Roles & Cross/Close Popup Count,
 *  Onboarding / Awaiting Feedback / Scheduling Switches & Status Dropdown + Immediate Activities Refresh)
 * and updates modules/04_projects/Vedak_CRM_Recent_Projects_TestCases.xlsx
 * non-destructively (preserving existing test cases and appending/updating results).
 *
 * Optional suite filter flags (can be combined with any Playwright flag such as --headed, --list, -g):
 *   --details          Run only Project Detail Window test cases (17 tests)
 *   --filter-columns   Run only Filter Columns test cases (11 tests)
 *   --scroll           Run only Navigation & Scroll test cases (16 tests)
 */

'use strict';

const { spawnSync } = require('child_process');
const path = require('path');

const repoRoot = path.resolve(__dirname, '../../../..');

const SCOPE_PATTERNS = {
  '--details': 'TC-RP-(UI-0[78]|FUNC-1[1-8]|MAJ-0[45]|MIN-0[45]|EDGE-0[6-8])',
  '--detail': 'TC-RP-(UI-0[78]|FUNC-1[1-8]|MAJ-0[45]|MIN-0[45]|EDGE-0[6-8])',
  '--filter-columns': 'TC-RP-(UI-0[56]|FUNC-(0[6-9]|10)|MAJ-03|MIN-03|EDGE-0[45])',
  '--scroll': 'TC-RP-(UI-0[1-4]|FUNC-0[1-5]|MAJ-0[12]|MIN-0[12]|EDGE-0[1-3])',
};

function runRecentProjectsTests() {
  const rawArgs = process.argv.slice(2);
  const grepScopes = [];
  const playwrightArgs = [];

  for (const arg of rawArgs) {
    if (SCOPE_PATTERNS[arg]) {
      grepScopes.push(SCOPE_PATTERNS[arg]);
    } else {
      playwrightArgs.push(arg);
    }
  }

  const scopeLabel =
    grepScopes.length > 0
      ? rawArgs.filter((a) => SCOPE_PATTERNS[a]).join(', ')
      : 'All Recent Projects Scenarios (Scroll + Filter Columns + Project Details)';

  console.log(`\n🚀 Running Recent Projects Playwright Suite [${scopeLabel}]...\n`);

  const args = ['playwright', 'test', '--project=recent-projects'];
  if (grepScopes.length > 0) {
    args.push('-g', grepScopes.join('|'));
  }
  args.push(...playwrightArgs);

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

