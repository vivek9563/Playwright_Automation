/**
 * Logger Utility for Vedak CRM Tests
 */

const fs = require('fs');
const path = require('path');
require('dotenv').config();

const logLevels = {
  ERROR: 'ERROR',
  WARN: 'WARN',
  INFO: 'INFO',
  DEBUG: 'DEBUG'
};

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

class Logger {
  constructor() {
    this.logLevel = process.env.LOG_LEVEL || 'info';
    this.logFile = process.env.LOG_FILE || './logs/test-execution.log';
    this.initializeLogFile();
  }

  initializeLogFile() {
    const logDir = path.dirname(this.logFile);
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
  }

  getTimestamp() {
    return new Date().toISOString();
  }

  log(level, message) {
    const timestamp = this.getTimestamp();
    const logEntry = `[${timestamp}] ${level}: ${message}`;

    // Console output
    switch (level) {
      case logLevels.ERROR:
        console.error(`${colors.red}${logEntry}${colors.reset}`);
        break;
      case logLevels.WARN:
        console.warn(`${colors.yellow}${logEntry}${colors.reset}`);
        break;
      case logLevels.INFO:
        console.log(`${colors.green}${logEntry}${colors.reset}`);
        break;
      case logLevels.DEBUG:
        console.log(`${colors.blue}${logEntry}${colors.reset}`);
        break;
    }

    // File output
    try {
      fs.appendFileSync(this.logFile, logEntry + '\n');
    } catch (error) {
      console.error('Failed to write to log file:', error);
    }
  }

  error(message) {
    this.log(logLevels.ERROR, message);
  }

  warn(message) {
    this.log(logLevels.WARN, message);
  }

  info(message) {
    this.log(logLevels.INFO, message);
  }

  debug(message) {
    if (this.logLevel === 'debug') {
      this.log(logLevels.DEBUG, message);
    }
  }

  separator() {
    const line = '='.repeat(80);
    console.log(`${colors.cyan}${line}${colors.reset}`);
  }

  testStart(testName) {
    this.separator();
    this.info(`START: ${testName}`);
  }

  testPass(testName, duration) {
    this.info(`✓ PASS: ${testName} (${duration}ms)`);
  }

  testFail(testName, duration, error) {
    this.error(`✗ FAIL: ${testName} (${duration}ms)`);
    this.error(`  Error: ${error}`);
  }

  testSkip(testName) {
    this.warn(`⊘ SKIP: ${testName}`);
  }

  summary(total, passed, failed, skipped) {
    this.separator();
    const passPercentage = total > 0 ? ((passed / total) * 100).toFixed(2) : 0;
    this.info(`Test Summary:`);
    this.info(`  Total: ${total}`);
    this.info(`  Passed: ${passed} (${colors.green}${passPercentage}%${colors.reset})`);
    this.info(`  Failed: ${failed}`);
    this.info(`  Skipped: ${skipped}`);
    this.separator();
  }
}

module.exports = new Logger();
