# Vedak CRM Automated Test Suite

Complete automated test suite for Vedak CRM Login Module using Playwright.

## 📋 Project Structure

```
Vedak_Automation/
├── ui-tests/                      # UI/Visual tests
├── functionality-tests/           # Login flow and functionality tests
├── major-tests/                   # Security and critical tests
├── minor-tests/                   # Performance and compatibility tests
├── edge-case-tests/               # Network, error handling, edge cases
├── test-data/                     # Test data files and fixtures
├── utils/                         # Utility functions and helpers
├── reports/                       # HTML test reports
├── screenshots/                   # Screenshots and videos
├── logs/                          # Test execution logs
├── package.json                   # Project dependencies
├── .env.example                   # Environment variables template
└── README.md                      # This file
```

## 🚀 Quick Start

### 1. Prerequisites
- Node.js v18+ and npm
- Playwright installed (automated via npm)
- Gmail account with vivek.k@vedak.com

### 2. Installation

```bash
cd ~/Downloads/Vedak_Automation
npm install
npm run install-browsers
```

### 3. Setup Environment

Create a `.env` file in the root directory:

```bash
# Vedak CRM Application
APP_URL=http://localhost:5173

# Gmail Credentials (for OAuth testing)
GMAIL_EMAIL=vivek.k@vedak.com
GMAIL_PASSWORD=your_gmail_password_or_app_password

# Test Settings
HEADLESS=false
SLOW_MO=100
SCREENSHOT_PATH=./screenshots
REPORT_PATH=./reports
```

**⚠️ IMPORTANT:** 
- For Gmail app password: https://myaccount.google.com/apppasswords
- Add `.env` to `.gitignore` to avoid committing credentials
- Never commit credentials to version control

### 4. Run Tests

#### Run UI Tests
```bash
npm run test:ui
```

#### Run Functionality Tests
```bash
npm run test:functionality
```

#### Run Major/Security Tests
```bash
npm run test:major
```

#### Run Minor/Compatibility Tests
```bash
npm run test:minor
```

#### Run Edge Case Tests
```bash
npm run test:edge
```

#### Run All Tests
```bash
npm run test:all
```

#### Debug Mode (with Playwright Inspector)
```bash
npm run test:debug -- ui-tests/run-ui-tests.js
```

## 📊 Test Categories

### UI Tests (3 tests)
- Page loading verification
- Welcome text content validation
- Button appearance and functionality

**Run:** `npm run test:ui`

### Functionality Tests (5 tests)
- Valid vedak.com email login
- Invalid domain rejection
- Multiple email selection
- Cancel login operation
- OAuth integration

**Run:** `npm run test:functionality`

### Major Tests (3 tests)
- Session creation and persistence
- Domain validation enforcement
- OAuth integration verification

**Run:** `npm run test:major`

### Minor Tests (3 tests)
- Page load performance
- Chrome browser compatibility
- Firefox browser compatibility

**Run:** `npm run test:minor`

### Edge Case Tests (5 tests)
- Slow network conditions
- Network timeout handling
- Rapid repeated attempts
- Cookies disabled
- Session expiry

**Run:** `npm run test:edge`

## 📈 Reports

After running tests, view the HTML report:

```bash
open reports/test-report.html
```

The report includes:
- ✓ Passed tests (green)
- ✗ Failed tests (red)
- ⏱ Test duration
- 📸 Screenshots for each step
- 📋 Detailed test logs

## 🛠 Utilities

### Common Functions (utils/common.js)
- Browser initialization
- Authentication setup
- Page navigation
- Element interaction helpers
- Screenshot/video capture

### Test Data (test-data/)
- Valid and invalid email addresses
- Network condition configurations
- Browser compatibility matrix
- Device resolution settings

## 📸 Screenshots & Videos

- Screenshots: `screenshots/` (taken after each step)
- Videos: `screenshots/` (recorded during tests)
- Organized by test type and date

## 📝 Logs

Test execution logs saved to: `logs/test-execution.log`

Includes:
- Timestamp
- Test name
- Status (PASS/FAIL)
- Duration
- Error messages

## 🔍 Debugging

### Enable Debug Mode
```bash
PWDEBUG=1 npm run test:ui
```

### Slow Motion
Increase `SLOW_MO` in `.env` to see tests run slower (value in ms)

### Headed Mode
Set `HEADLESS=false` in `.env` to see browser window

### Inspector
Press `Ctrl+Shift+X` in Playwright Inspector to pause tests

## 🐛 Troubleshooting

### OAuth Login Fails
- Verify Gmail credentials in `.env`
- Check if Gmail 2FA is enabled
- Use Gmail App Password if 2FA is on

### Tests Timeout
- Increase `TIMEOUT` value in test files
- Check application URL is correct
- Verify internet connection

### Screenshots/Videos Not Saved
- Check folder permissions
- Verify `SCREENSHOT_PATH` exists
- Check disk space

## 📚 File Structure Details

### ui-tests/
- `ui-test-01-page-loading.js` - Page load verification
- `ui-test-02-welcome-text.js` - Text content validation
- `ui-test-03-button-verification.js` - Button functionality
- `run-ui-tests.js` - Test runner

### functionality-tests/
- `func-test-01-valid-login.js` - Valid email login
- `func-test-02-invalid-email.js` - Invalid domain rejection
- `func-test-03-corporate-email.js` - Corporate email rejection
- `func-test-04-multiple-emails.js` - Multiple vedak.com emails
- `func-test-05-cancel-operation.js` - Cancel login
- `run-functionality-tests.js` - Test runner

### major-tests/
- `major-test-01-session-creation.js` - Session management
- `major-test-02-domain-validation.js` - Domain enforcement
- `major-test-03-oauth-integration.js` - OAuth verification
- `run-major-tests.js` - Test runner

### minor-tests/
- `minor-test-01-performance.js` - Page load performance
- `minor-test-02-chrome-compatibility.js` - Chrome browser
- `minor-test-03-firefox-compatibility.js` - Firefox browser
- `run-minor-tests.js` - Test runner

### edge-case-tests/
- `edge-test-01-slow-network.js` - 2G network simulation
- `edge-test-02-network-timeout.js` - Connection timeout
- `edge-test-03-rapid-attempts.js` - Rapid login attempts
- `edge-test-04-cookies-disabled.js` - Cookies disabled
- `edge-test-05-session-expiry.js` - Session expiration
- `run-edge-case-tests.js` - Test runner

### test-data/
- `valid-accounts.json` - Valid vedak.com email accounts
- `invalid-accounts.json` - Invalid test email accounts
- `network-conditions.json` - Network scenarios
- `browsers.json` - Browser compatibility matrix
- `devices.json` - Device resolutions

### utils/
- `common.js` - Common functions
- `logger.js` - Logging utilities
- `auth-helper.js` - Authentication helpers
- `report-generator.js` - Report creation

## 📋 Test Execution Log

Example log output:
```
[2026-10-27 15:30:45] ✓ UI_TEST_001 - Page Loading (2.5s) PASS
[2026-10-27 15:30:48] ✓ UI_TEST_002 - Welcome Text (3.2s) PASS
[2026-10-27 15:30:51] ✗ FUNC_TEST_002 - Invalid Email (5.1s) FAIL
  Error: Expected error message not found
  Expected: "Access Denied..."
  Got: "Login failed"
[2026-10-27 15:30:55] Summary: 2/3 tests passed (66.7%)
```

## 🔐 Security Notes

- Never commit `.env` file
- Use GitHub Secrets for CI/CD
- Rotate Gmail App Passwords regularly
- Store credentials securely
- Review logs for sensitive data

## 💡 Tips

- Start with UI tests to verify page structure
- Run Functionality tests to verify core features
- Use Major tests for security validation
- Check Minor tests for compatibility
- Edge case tests for production readiness

## 📞 Support

For issues or questions:
1. Check logs in `logs/` folder
2. Review screenshots in `screenshots/` folder
3. Check test output in `reports/` folder
4. Review common issues in Troubleshooting section

## 📦 Dependencies

- **@playwright/test**: ^1.40.0 (Browser automation)
- **dotenv**: ^16.3.1 (Environment variables)

## 📄 License

MIT

---

**Version**: 1.0  
**Last Updated**: 2026-10-27  
**Status**: Production Ready
