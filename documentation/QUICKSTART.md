# Vedak CRM Test Suite - Quick Start Guide

Welcome to the Vedak CRM automated test suite! This guide will help you get started in 5 minutes.

## ✅ Prerequisites
- Node.js v18+ (check with `node --version`)
- npm v8+ (check with `npm --version`)
- Your Vedak CRM login email: **vivek.k@vedak.com**
- Gmail app password (generated from Google Account security settings)

## 🚀 Step 1: Setup (2 minutes)

### 1.1 Navigate to project
```bash
cd ~/Downloads/Vedak_Automation
```

### 1.2 Create .env file
```bash
cp .env.example .env
```

### 1.3 Edit .env file
Open `.env` in your editor and fill in:
```
APP_URL=http://localhost:5173/
GMAIL_EMAIL=vivek.k@vedak.com
GMAIL_PASSWORD=your_gmail_app_password_here
HEADLESS=false
SLOW_MO=500
```

**How to get Gmail app password:**
1. Go to https://myaccount.google.com/security
2. Enable 2-Factor Authentication if not already enabled
3. Go to "App passwords" section
4. Select Mail and Windows Computer
5. Copy the generated 16-character password

### 1.4 Verify setup
```bash
npm list
```
You should see:
- @playwright/test@^1.40.0 ✓
- dotenv@^16.3.1 ✓

## 📝 Step 2: Understand Test Structure (2 minutes)

```
Vedak_Automation/
├── ui-tests/              # 3 tests - UI/Layout verification
│   ├── ui-test-01-page-loading.js
│   ├── ui-test-02-welcome-text.js
│   ├── ui-test-03-button-verification.js
│   └── run-ui-tests.js
│
├── functionality-tests/   # 5 tests - Login flow functionality
│   ├── func-test-01-valid-login.js
│   ├── func-test-02-invalid-domain.js
│   ├── func-test-03-oauth-popup.js
│   ├── func-test-04-session-persistence.js
│   ├── func-test-05-login-cancel.js
│   └── run-functionality-tests.js
│
├── major-tests/          # 3 tests - Core business logic
│   ├── major-test-01-session-creation.js
│   ├── major-test-02-domain-validation.js
│   ├── major-test-03-oauth-integration.js
│   └── run-major-tests.js
│
├── minor-tests/          # 3 tests - Browser compatibility
│   ├── minor-test-01-performance.js
│   ├── minor-test-02-chrome-compatibility.js
│   ├── minor-test-03-firefox-compatibility.js
│   └── run-minor-tests.js
│
├── edge-case-tests/      # 5 tests - Edge cases & stress
│   ├── edge-test-01-slow-network.js
│   ├── edge-test-02-mobile-simulation.js
│   ├── edge-test-03-rapid-clicks.js
│   ├── edge-test-04-session-timeout.js
│   ├── edge-test-05-back-button.js
│   └── run-edge-case-tests.js
│
├── utils/                # Shared utilities
│   ├── logger.js         # Structured logging with colors
│   ├── auth-helper.js    # OAuth automation
│   ├── common.js         # Browser setup & helpers
│   └── report-generator.js # HTML report generation
│
├── screenshots/          # Auto-generated screenshots (one per step)
├── logs/                 # Auto-generated execution logs
├── reports/              # Auto-generated HTML reports
│
├── test-data/            # Test data (emails, network conditions, etc.)
├── package.json          # npm configuration
├── .env.example          # Environment template
├── .gitignore            # Git ignore rules
└── run-all-tests.js      # Master test runner
```

## 🎯 Step 3: Run Tests (1 minute)

### Option 1: Run ALL tests at once
```bash
npm run test:all
```

### Option 2: Run specific category
```bash
npm run test:ui           # UI tests only
npm run test:functionality  # Functionality tests only
npm run test:major        # Major tests only
npm run test:minor        # Minor tests only (Chrome, Firefox)
npm run test:edge         # Edge case tests only
```

### Option 3: Run individual test
```bash
node ui-tests/ui-test-01-page-loading.js
```

## 📊 Step 4: View Results

### Browser window
- Tests run in **visible browser window** (non-headless mode)
- You can watch test execution in real-time
- Browser automatically closes after each test

### Screenshots
- Location: `./screenshots/[test-category]/`
- One screenshot per test step
- Helps debug failures

### Logs
- Location: `./logs/test-execution.log`
- View with: `tail -f ./logs/test-execution.log`

### HTML Report
- Location: `./reports/test-report.html`
- Beautiful visual report with pass/fail statistics
- Open in browser: `open ./reports/test-report.html`

## 🔍 Test Execution Flow

Each test follows this pattern:
```
1. Launch browser (Chromium or Firefox)
2. Navigate to app URL
3. Perform test actions
4. Take screenshots after each step
5. Log results with timestamps
6. Close browser
7. Return pass/fail status
```

Example output:
```
================================================================================
[2024-01-15T10:30:45.123Z] INFO: START: UI-TEST-01: Page Loading and Initial Content Display
================================================================================
[2024-01-15T10:30:45.234Z] INFO: Browser initialized with viewport 1920x1080
[2024-01-15T10:30:46.567Z] INFO: Navigated to http://localhost:5173/
[2024-01-15T10:30:46.789Z] INFO: Page title: Vedak CRM Login
[2024-01-15T10:30:46.901Z] INFO: Main heading: Welcome to Vedak CRM
[2024-01-15T10:30:46.999Z] ✓ PASS: UI-TEST-01 (1876ms)
```

## 🛠️ Troubleshooting

### Test won't start
**Error:** `GMAIL_PASSWORD not set in .env file`
**Solution:** Make sure .env file exists and has valid Gmail app password

### App not loading
**Error:** `Navigation timeout after 30000ms`
**Solution:** 
- Check if app is running: `curl http://localhost:5173/`
- Start your CRM app first before running tests
- Check network connectivity

### Gmail login fails
**Error:** OAuth popup doesn't open
**Solution:**
- Use Gmail app password, not regular password
- 2FA must be enabled on Google account
- Check if Google is blocking automation (may need to approve)

### Browser crashes
**Error:** `Firefox/Chrome process exited unexpectedly`
**Solution:**
- Run only one test category at a time
- Reduce SLOW_MO value in .env (default 500ms)
- Check available disk space for screenshots

### Port already in use
**Error:** `EADDRINUSE: address already in use`
**Solution:**
- Your CRM app URL is blocked
- Update APP_URL in .env to correct port
- Kill process: `lsof -ti:5173 | xargs kill -9`

## 💡 Tips & Tricks

### Run tests with custom configuration
```bash
# Run with faster execution (less delay)
SLOW_MO=100 npm run test:ui

# Run in headless mode (hidden browser)
HEADLESS=true npm run test:functionality

# Increase timeout for slow network
TIMEOUT=60000 npm run test:edge
```

### Watch test execution logs
```bash
# In one terminal, run tests
npm run test:all

# In another terminal, watch logs
tail -f ./logs/test-execution.log
```

### Generate report without running tests
```bash
# Just check the latest report
open ./reports/test-report.html
```

### Clean up old reports/screenshots
```bash
# Remove all old artifacts
rm -rf screenshots/* logs/* reports/*

# Then run tests again for fresh results
npm run test:all
```

## 📚 Test Categories Explained

### UI Tests (3 tests)
- Verify page loads correctly
- Check welcome messages and branding
- Validate buttons and interactive elements
- **Run when:** UI design changes, layout updates

### Functionality Tests (5 tests)
- Valid login with vedak.com email
- Invalid domain rejection
- OAuth popup interaction
- Session persistence
- Login cancellation
- **Run when:** Login flow changes, OAuth updates

### Major Tests (3 tests)
- Session creation and management
- Domain validation rules
- OAuth integration verification
- **Run when:** Core business logic changes

### Minor Tests (3 tests)
- Performance and load times
- Chrome browser compatibility
- Firefox browser compatibility
- **Run when:** Performance optimization, browser support changes

### Edge Case Tests (5 tests)
- Slow network simulation (3G)
- Mobile device viewport testing
- Rapid button clicks
- Session timeout handling
- Browser back button behavior
- **Run when:** Stress testing, edge case handling, resilience check

## ✨ Next Steps

1. **Customize test data:** Edit `test-data/valid-accounts.json` with your test accounts
2. **Add more tests:** Copy existing test file and modify for your needs
3. **Integrate with CI/CD:** Add `npm run test:all` to your GitHub Actions/Jenkins pipeline
4. **Schedule tests:** Use cron jobs or GitHub Actions to run tests daily

## 📞 Support

For issues or questions:
1. Check logs: `cat ./logs/test-execution.log`
2. Review error screenshot: `./screenshots/[test-name]/step-error.png`
3. Verify .env configuration: `cat .env`
4. Check app is running: `curl -v http://localhost:5173/`

## 🎉 You're Ready!

```bash
# Start testing!
npm run test:all
```

Happy testing! 🚀
