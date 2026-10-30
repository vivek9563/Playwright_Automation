const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

function parseCounts(output) {
  const text = output || '';
  const totalMatch = text.match(/Total Tests:\s*(\d+)/i) || text.match(/TOTAL:\s*(\d+)/i);
  const passedMatch =
    text.match(/Passed(?: Tests)?:\s*(\d+)/i) ||
    text.match(/✅\s*Passed:\s*(\d+)/i) ||
    text.match(/✓\s*(\d+)/);
  const failedMatch =
    text.match(/Failed(?: Tests)?:\s*(\d+)/i) ||
    text.match(/❌\s*Failed:\s*(\d+)/i) ||
    text.match(/✗\s*(\d+)/);

  const total = totalMatch ? parseInt(totalMatch[1], 10) : 0;
  const passed = passedMatch ? parseInt(passedMatch[1], 10) : 0;
  const failed = failedMatch ? parseInt(failedMatch[1], 10) : 0;

  if (!total && (passed || failed)) {
    return { total: passed + failed, passed, failed };
  }
  return { total, passed, failed };
}

function runNodeScript({ repoRoot, scriptPath, suiteName }) {
  return new Promise((resolve) => {
    const absoluteScript = path.join(repoRoot, scriptPath);
    if (!fs.existsSync(absoluteScript)) {
      resolve({
        suiteName,
        scriptPath,
        total: 0,
        passed: 0,
        failed: 0,
        success: false,
        error: `Script not found: ${scriptPath}`,
      });
      return;
    }

    const child = spawn('node', [absoluteScript], {
      cwd: repoRoot,
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (data) => {
      const chunk = data.toString();
      stdout += chunk;
      process.stdout.write(chunk);
    });

    child.stderr.on('data', (data) => {
      const chunk = data.toString();
      stderr += chunk;
      process.stderr.write(chunk);
    });

    child.on('close', (code) => {
      const counts = parseCounts(stdout);
      resolve({
        suiteName,
        scriptPath,
        ...counts,
        success: code === 0,
        exitCode: code,
        stderr,
      });
    });
  });
}

async function runModuleSuites({ repoRoot, moduleName, suites }) {
  console.log(`\n${'='.repeat(62)}`);
  console.log(`  VEDAK CRM - ${moduleName.toUpperCase()} MODULE TEST SUITE`);
  console.log(`${'='.repeat(62)}\n`);

  const results = {};
  let totalPassed = 0;
  let totalFailed = 0;
  let totalTests = 0;

  for (const suite of suites) {
    console.log(`\n📋 Running ${suite.name}...`);
    console.log('-'.repeat(62));
    const result = await runNodeScript({
      repoRoot,
      scriptPath: suite.script,
      suiteName: suite.name,
    });

    results[suite.name] = result;
    totalPassed += result.passed;
    totalFailed += result.failed;
    totalTests += result.total;

    if (!result.success && !result.passed && !result.failed) {
      console.log(`❌ ${suite.name}: ${result.error || 'Execution failed'}`);
    } else {
      console.log(`✓ ${suite.name}: ${result.passed} passed, ${result.failed} failed`);
    }
  }

  console.log(`\n${'='.repeat(62)}`);
  console.log('  TEST SUMMARY');
  console.log(`${'='.repeat(62)}`);
  Object.entries(results).forEach(([name, r]) => {
    const status = r.failed === 0 ? '✓' : '✗';
    console.log(`${status} ${name}: ${r.passed} passed, ${r.failed} failed`);
  });
  console.log('-'.repeat(62));
  console.log(`TOTAL: ${totalPassed} passed, ${totalFailed} failed`);
  console.log(`${'='.repeat(62)}\n`);

  return {
    module: moduleName,
    passed: totalPassed,
    failed: totalFailed,
    total: totalTests || totalPassed + totalFailed,
    results,
  };
}

module.exports = { runModuleSuites };

