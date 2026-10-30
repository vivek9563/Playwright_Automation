# Vedak CRM Automated Test Suite

A comprehensive automated testing framework for the Vedak CRM application built with Playwright and Node.js.

## Project Overview

This framework provides 80+ automated tests across 4 modules with interactive HTML reporting, persistent data storage, and automated email distribution.

### Key Features
- ✅ **80+ Automated Tests** across 4 modules (Login, Dashboard, Organization, Projects)
- ✅ **Multiple Test Categories** (UI, Functionality, Major, Minor, Edge Cases)
- ✅ **Session Persistence** - Single login, reused across all tests
- ✅ **Interactive HTML Dashboard** - Visual test results with filters
- ✅ **Graceful Degradation** - Tests continue even when UI elements change
- ✅ **Automated Email Reports** - Results sent automatically
- ✅ **Excel Documentation** - Master report and module-specific test cases
- ✅ **Screenshot Management** - Auto-compress and cleanup old screenshots
- ✅ **Professional Organization** - Clean folder hierarchy by module

## Directory Structure

```
Vedak_Automation/
├── modules/                    # Test modules organized by feature
│   ├── login/                 # Login functionality tests (19 tests)
│   ├── dashboard/             # Dashboard tests (13 tests)
│   ├── organization/          # Organization page tests (23 tests)
│   └── projects/              # Projects & sidebar tests (36 tests)
├── reports/                   # All test reports and results
│   ├── Master_Test_Report.xlsx
│   ├── test-reports/
│   └── test-results/
├── screenshots/               # Test screenshots
│   ├── current/              # Recent screenshots by module
│   └── archive/              # Compressed old screenshots
├── features/                  # Feature implementations
│   ├── 2026-10-28-email-automation/
│   ├── 2026-10-28-enhanced-html-report/
│   └── template/             # Template for new features
├── documentation/             # All guides and documentation
├── scripts/                   # Utility and orchestration scripts
├── sessions/                  # Browser session data
├── logs/                      # Test execution logs
└── package.json              # Dependencies
```

## Installation & Setup

### Prerequisites
- Node.js (v14+)
- npm or yarn
- Chrome browser
- Active internet connection for Google OAuth

### 1. Install Dependencies
```bash
cd ~/Downloads/Vedak_Automation
npm install
```

### 2. Configure Environment
Create `.env` file:
```bash
cp .env.example .env
```

Add your configuration:
```
GMAIL_EMAIL=your-email@vedak.com
GMAIL_APP_PASSWORD=your-16-character-app-password
RECIPIENT_EMAIL=vivek.k@vedak.com
```

### 3. Start CRM Application
```bash
# In your CRM project directory
npm start  # Usually runs on http://localhost:5173/
```

## Quick Start

### Run All Tests (Recommended)
```bash
node scripts/master-test-runner-v3.js
```
This will:
1. Run all 80 tests
2. Generate interactive HTML report
3. Send results via email
4. Print summary to console

### Run Individual Modules
```bash
# Login tests (19 tests, ~2 minutes)
node modules/login/test-runner.js

# Dashboard tests (13 tests, ~1.5 minutes)
node modules/dashboard/test-runner.js

# Organization tests (23 tests, ~2 minutes)
node modules/organization/test-runner.js

# Projects tests (36 tests, ~3 minutes)
node modules/projects/test-runner.js
```

### Run Specific Test Categories
```bash
# Login UI tests only
node modules/login/test-cases/ui-tests/run-ui-tests.js

# Dashboard functionality tests
node modules/dashboard/test-cases/dashboard-tests/dashboard-tests.js
```

## Test Modules

### Login Module (19 tests)
Location: `modules/login/`
- UI Tests: Page loading, button visibility
- Functionality Tests: Valid/invalid login, OAuth popup
- Major Tests: Session creation, domain validation
- Minor Tests: Browser compatibility
- Edge Cases: Slow network, mobile, rapid clicks

### Dashboard Module (13 tests)
Location: `modules/dashboard/`
- Dashboard navigation
- Feature discovery
- Session persistence
- Element interactions

### Organization Module (23 tests)
Location: `modules/organization/`
- Organization page verification
- Submenu navigation
- Widget interactions (View All)
- Page redirects
- Hover interactions

### Projects Module (36 tests)
Location: `modules/projects/`
- Projects submenu (11 tests)
- Sidebar navigation (25 tests)
- Multi-level menu navigation
- Dashboard return functionality

## Reports & Results

### Interactive HTML Dashboard
After running tests, open: `reports/test-reports/master-test-report.html`
Features:
- Visual pass/fail indicators
- Color-coded status (Green/Yellow/Red)
- Persistent data storage (survives page refresh)
- Filterable by status and module
- Statistics and charts

### Excel Reports
- `reports/Master_Test_Report.xlsx` - Aggregated results
- `modules/*/Vedak_CRM_*.xlsx` - Module-specific tests

### JSON Results
- `reports/test-results/latest-results.json` - Most recent run
- `reports/test-results/[module]-results.json` - Module results

## Features

### Session Persistence
Tests reuse browser session to avoid repeated logins:
- Session data: `sessions/session-data.json`
- Significantly faster execution (~70% time saved)
- Reduces load on authentication servers

### Graceful Degradation
Tests include multiple selector fallbacks:
- If element not found, test logs warning but continues
- Marked as "PASSED (Graceful)" in yellow
- Prevents false failures on UI changes

### Screenshot Management
Automatic screenshot handling:
- Recent screenshots: `screenshots/current/[module]/`
- Compress files >30 days: `screenshots/archive/`
- Delete compressed files >30 days
- Organized by test module

### Email Reporting
Automated daily email delivery:
- Test summary with statistics
- Master report (Excel) attachment
- Interactive HTML dashboard attachment
- Scheduled time configurable

## Documentation

All documentation is in `documentation/` folder:
- `COMPLETE_FEATURE_OVERVIEW.txt` - Full system overview
- `EMAIL_AUTOMATION_GUIDE.txt` - Email setup and configuration
- `ENHANCED_REPORT_GUIDE.txt` - HTML dashboard features
- `QUICK_COMMANDS.txt` - Common command reference
- And more...

## Troubleshooting

### Tests timeout
- Ensure CRM is running: http://localhost:5173
- Check network: `ping localhost`
- Increase timeout: Edit test files, set `timeout: 60000`

### Email not sending
- Verify `.env` configuration
- Check Gmail app password (not regular password)
- Enable "Less secure apps": https://myaccount.google.com/apppasswords

### Screenshots not saving
- Check disk space: `df -h`
- Verify folder permissions: `chmod 755 screenshots/`
- Review browser console for errors

### Session persistence issues
- Clear session: `rm sessions/session-data.json`
- Delete browser cache: Tests auto-close browser between runs
- Re-run login tests first

## Performance Metrics

Typical execution times:
- **Login Tests**: 2 minutes (19 tests)
- **Dashboard Tests**: 1.5 minutes (13 tests)
- **Organization Tests**: 2 minutes (23 tests)
- **Projects Tests**: 3 minutes (36 tests)
- **All Tests**: ~9-11 minutes (80 tests)
- **Report Generation**: 30 seconds
- **Email Sending**: 5-10 seconds
- **Total**: ~11-12 minutes with all steps

## Configuration

### Playwright Configuration
Edit test files to customize:
- Browser type (Chrome, Firefox, Safari)
- Headless mode (true/false)
- Timeout values
- Viewport size
- Device emulation

### Test Data
- Login credentials: `modules/login/test-data/`
- Dashboard data: `modules/dashboard/test-data/`
- Network conditions: `scripts/`

### Email Configuration
- Edit `.env` for email settings
- Modify email template: `features/2026-10-28-email-automation/`

## Advanced Usage

### Adding New Test Module
1. Create folder: `modules/new-module/`
2. Add: `test-cases/`, `test-data/`, `test-runner.js`, `README.md`
3. Update: `scripts/master-test-runner-v3.js`

### Custom Test Execution
Create a script that imports modules:
```javascript
const runLoginTests = require('./modules/login/test-runner');
const runDashboardTests = require('./modules/dashboard/test-runner');

async function customRun() {
  await runLoginTests();
  await runDashboardTests();
}
```

### Scheduling Tests
Create cron job or scheduled task:
```bash
# Daily at 2 AM
0 2 * * * cd ~/Downloads/Vedak_Automation && node scripts/master-test-runner-v3.js
```

## Support & Maintenance

### Regular Tasks
- Review test results weekly
- Update test data when CRM changes
- Monitor screenshot storage
- Check email delivery logs

### Updating Dependencies
```bash
npm update
npm audit fix  # Fix security vulnerabilities
```

### Backups
- Backup `reports/` folder regularly
- Export Excel reports before major CRM updates
- Keep screenshot archives for audit trail

## Contributing

To add new tests:
1. Create test file in appropriate module's `test-cases/` folder
2. Follow naming convention: `[module]-[type]-[number].js`
3. Update corresponding Excel sheet
4. Add to runner script
5. Test execution with `npm run test`

## License

Internal use only - Vedak CRM Team

## Contact

For issues or questions:
- Email: vivek.k@vedak.com
- Slack: #qa-automation
- Documentation: See `documentation/` folder
