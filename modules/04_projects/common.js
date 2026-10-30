const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

function parseCounts(output = '') {
  const totalMatch =
    output.match(/Total Tests:\s*(\d+)/i) ||
    output.match(/TOTAL:\s*(\d+)/i);
  const passedMatch =
    output.match(/Passed(?: Tests)?:\s*(\d+)/i) ||
    output.match(/✅\s*Passed:\s*(\d+)/i);
  const failedMatch =
    output.match(/Failed(?: Tests)?:\s*(\d+)/i) ||
    output.match(/❌\s*Failed:\s*(\d+)/i);

  const passed = passedMatch ? parseInt(passedMatch[1], 10) : 0;
  const failed = failedMatch ? parseInt(failedMatch[1], 10) : 0;
  const total = totalMatch ? parseInt(totalMatch[1], 10) : passed + failed;
  return { total, passed, failed };
}

function runNodeScript({ repoRoot, scriptPath, suiteName }) {
  return new Promise((resolve) => {
    const fullPath = path.join(repoRoot, scriptPath);
    if (!fs.existsSync(fullPath)) {
      resolve({ suiteName, scriptPath, total: 0, passed: 0, failed: 0, success: false, error: `Script not found: ${scriptPath}` });
      return;
    }

    const child = spawn('node', [fullPath], { cwd: repoRoot, stdio: ['ignore', 'pipe', 'pipe'] });
    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (d) => {
      const t = d.toString();
      stdout += t;
      process.stdout.write(t);
    });

    child.stderr.on('data', (d) => {
      const t = d.toString();
      stderr += t;
      process.stderr.write(t);
    });

    child.on('close', (code) => {
      resolve({
        suiteName,
        scriptPath,
        ...parseCounts(stdout),
        success: code === 0,
        exitCode: code,
        stderr,
      });
    });
  });
}

async function runModuleSuites({ moduleName, suites, moduleDir }) {
  const repoRoot = path.join(moduleDir, '..', '..');
  const results = {};
  let passed = 0;
  let failed = 0;
  let total = 0;

  console.log(`\n${'='.repeat(60)}`);
  console.log(`  VEDAK CRM - ${moduleName.toUpperCase()} MODULE TEST SUITE`);
  console.log(`${'='.repeat(60)}\n`);

  for (const suite of suites) {
    console.log(`\n📋 Running ${suite.name}...`);
    console.log('-'.repeat(60));
    const r = await runNodeScript({ repoRoot, scriptPath: suite.script, suiteName: suite.name });
    results[suite.name] = r;
    passed += r.passed;
    failed += r.failed;
    total += r.total;
    console.log(`✓ ${suite.name}: ${r.passed} passed, ${r.failed} failed`);
  }

  console.log(`\n${'='.repeat(60)}`);
  console.log(`TOTAL: ${passed} passed, ${failed} failed`);
  console.log(`${'='.repeat(60)}\n`);

  return { module: moduleName, passed, failed, total: total || passed + failed, results };
}

module.exports = { runModuleSuites };
