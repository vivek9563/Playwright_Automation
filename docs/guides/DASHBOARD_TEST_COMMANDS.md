# Dashboard Test Cases - Command Reference

## 📋 Overview
This document provides all commands to run the Vedak CRM Dashboard Major Functionality tests.

---

## ✅ Quick Start - Run Dashboard Tests

### **macOS/Linux:**
```bash
cd ~/Downloads/Vedak_Automation
./RUN_DASHBOARD_TESTS.sh
```

### **Windows (PowerShell):**
```powershell
cd C:\Users\<YourUsername>\Downloads\Vedak_Automation
.\RUN_DASHBOARD_TESTS.bat
```

### **Windows (Command Prompt):**
```cmd
cd C:\Users\<YourUsername>\Downloads\Vedak_Automation
RUN_DASHBOARD_TESTS.bat
```

### **Direct Node Command (All Platforms):**
```bash
cd ~/Downloads/Vedak_Automation
node modules/dashboard/test-cases/dashboard-tests/dashboard-major-func-tests-fixed.js
```

---

## 🔍 What Each Command Does

### 1. **RUN_DASHBOARD_TESTS.sh** (macOS/Linux)
- Navigates to project directory
- Runs dashboard major functionality tests
- Displays formatted output with test results
- Exit code indicates success (0) or failure (non-zero)

**Usage:**
```bash
./RUN_DASHBOARD_TESTS.sh
```

### 2. **RUN_DASHBOARD_TESTS.bat** (Windows)
- Windows batch file equivalent
- Runs same dashboard tests
- Color-coded console output
- Includes pause at end for result viewing

**Usage:**
```bash
RUN_DASHBOARD_TESTS.bat
```

### 3. **Direct Node Execution**
- Runs the test script directly without wrapper
- Useful for CI/CD pipelines
- Returns raw test output

**Usage:**
```bash
node modules/dashboard/test-cases/dashboard-tests/dashboard-major-func-tests-fixed.js
```

---

## 📊 Test Execution Details

### Test Suite Information
- **Module**: Dashboard
- **Category**: Major Functionality Tests
- **Total Tests**: 16
- **Execution Mode**: Non-Headless (visible browser)
- **Test Framework**: Playwright
- **Timeout**: 60 seconds per test

### Test Cases Executed
1. Dashboard Redirect
2. Work Tab Access
3. Daily Training Hover
4. TODOs Hover
5. Email Observations Hover
6. Contribution Toggle
7. Interested Experts Onboarded
8. Your Notes
9. Your Responsibilities
10. Recent Projects
11. Recent Targets
12. Recent To Dos
13. Profiles Added
14. Overdue TODOs List
15. Upcoming TODOs List
16. Email Observations - View All

### Prerequisites
- ✅ Node.js installed (v14+)
- ✅ npm dependencies installed (`npm install`)
- ✅ Vedak CRM application running on `http://localhost:5173`
- ✅ User logged in with Google account (vedak.com domain)

---

## 🚀 Advanced Usage

### Running with Custom Timeout
```bash
cd ~/Downloads/Vedak_Automation
PLAYWRIGHT_TIMEOUT=120000 node modules/dashboard/test-cases/dashboard-tests/dashboard-major-func-tests-fixed.js
```

### Running Specific Test (if supported)
```bash
# Run and capture output to file
node modules/dashboard/test-cases/dashboard-tests/dashboard-major-func-tests-fixed.js > dashboard-test-results.txt 2>&1
```

### Running in Different Browsers (if configured)
```bash
# Chromium (default)
node modules/dashboard/test-cases/dashboard-tests/dashboard-major-func-tests-fixed.js

# With different viewport
VIEWPORT_WIDTH=1920 VIEWPORT_HEIGHT=1080 node modules/dashboard/test-cases/dashboard-tests/dashboard-major-func-tests-fixed.js
```

---

## 📈 Expected Output Format

When tests run successfully, you'll see:

```
╔════════════════════════════════════════════════════════╗
║    VEDAK CRM - DASHBOARD MAJOR FUNCTIONALITY TESTS    ║
╚════════════════════════════════════════════════════════╝

🧪 Test 1: Dashboard Redirect ✓ PASS
🧪 Test 2: Work Tab Access ✓ PASS
🧪 Test 3: Daily Training Hover ✓ PASS
... (16 tests total)

✅ TEST SUMMARY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total Tests: 16
✓ Passed: 16
✗ Failed: 0
Success Rate: 100.00%
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## ⚠️ Troubleshooting

### Issue: "Module not found" error
**Solution:** Make sure you're in the project root directory
```bash
cd ~/Downloads/Vedak_Automation
```

### Issue: "Port 5173 not accessible"
**Solution:** Ensure the CRM application is running
```bash
# In another terminal
npm run dev  # or start the CRM app
```

### Issue: Test timeouts
**Solution:** Increase timeout value
```bash
PLAYWRIGHT_TIMEOUT=180000 node modules/dashboard/test-cases/dashboard-tests/dashboard-major-func-tests-fixed.js
```

### Issue: Permission denied on shell script
**Solution:** Make script executable
```bash
chmod +x RUN_DASHBOARD_TESTS.sh
./RUN_DASHBOARD_TESTS.sh
```

---

## 📊 Output Report Files

After execution, check these locations for reports:

1. **Console Output** - Displayed during test execution
2. **Excel Report** - `reports/Dashboard_Major_Test_Report.html`
3. **JSON Results** - `reports/test-results/dashboard-major-results.json`

---

## 🔄 Scheduling Tests (Optional)

### macOS/Linux - Cron Job
```bash
# Run dashboard tests daily at 8 AM
0 8 * * * cd ~/Downloads/Vedak_Automation && ./RUN_DASHBOARD_TESTS.sh
```

### Windows Task Scheduler
1. Open Task Scheduler
2. Create New Task
3. Set Trigger: Daily at 8:00 AM
4. Set Action: Run script `RUN_DASHBOARD_TESTS.bat`

---

## 📝 Exit Codes

- **0** - All tests passed ✓
- **1** - One or more tests failed ✗
- **2** - Setup error or missing dependencies

---

## 💡 Tips

1. **Non-Headless Mode**: Tests run in visible browser window for debugging
2. **Graceful Error Handling**: Failed elements are logged but don't stop tests
3. **Retry Logic**: Automatic retry for flaky interactions (3-4 attempts)
4. **Parallel Execution**: Can run multiple test suites in separate terminals
5. **CI/CD Integration**: Compatible with GitHub Actions, Jenkins, etc.

---

## 📞 Support

For issues or questions:
1. Check test logs in console output
2. Review Dashboard Excel file: `modules/dashboard/Vedak_CRM_Dashboard_Major_TestCases.xlsx`
3. Check HTML report: `reports/Dashboard_Major_Test_Report.html`

---

**Last Updated**: October 28, 2026
**Version**: 1.0
**Status**: Production Ready ✅

