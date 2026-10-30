# Vedak CRM Dashboard Test Suite

## Overview
Comprehensive automated test suite for the Vedak CRM Dashboard page functionality.

## Test Cases Created
**Total: 35 Dashboard Test Cases**

### Test Case Categories

#### 1. UI Tests (6 tests)
- DASH-UI-01: Dashboard Page Loads Successfully
- DASH-UI-02: Vedak Logo Visibility and Clickability
- DASH-UI-03: Daily Training Widget Hover Effect
- DASH-UI-04: Last 30 Days Section Hover Effect
- DASH-UI-05: Todos Widget Visibility
- DASH-UI-06: Email Observations Widget Hover

#### 2. Functionality Tests (8 tests)
- DASH-FUNC-01: Click Vedak Logo Redirect
- DASH-FUNC-02: Page Refresh Functionality
- DASH-FUNC-03: Work/Organization Button Navigation
- DASH-FUNC-04: View All Button Click - Daily Training
- DASH-FUNC-05: View All Button Click - Todos
- DASH-FUNC-06: View All Button Click - Observations
- DASH-FUNC-07: Contribution Last 30 Days Toggle
- DASH-FUNC-08: Contribution Monthly Toggle

#### 3. Major Tests (3 tests)
- DASH-MAJOR-01: Page Scroll Down Functionality
- DASH-MAJOR-02: Page Scroll Up Functionality
- DASH-MAJOR-03: Complete Dashboard Navigation Flow

#### 4. Minor Tests (2 tests)
- DASH-MINOR-01: Dashboard Performance Check
- DASH-MINOR-02: Dashboard Responsiveness Check

#### 5. Edge Cases (3 tests)
- DASH-EDGE-01: Rapid Section Hovers
- DASH-EDGE-02: Rapid Scroll Up and Down
- DASH-EDGE-03: Rapid View All Button Clicks

#### 6. UI Advanced Tests (8 tests)
- DASH-UI-07: Interested Experts Widget Visibility
- DASH-UI-08: Your Notes Widget Visibility
- DASH-UI-09: Your Responsibilities Widget Hover
- DASH-UI-10: Recent Projects Widget Visibility
- DASH-UI-11: Recent Target Widget Hover Effect
- DASH-UI-12: Recent To Dos Widget Visibility
- DASH-UI-13: Profiles Added Widget Visibility

#### 7. Functionality Advanced Tests (5 tests)
- DASH-FUNC-09: Interested Experts Refresh Button
- DASH-FUNC-10: Add Notes to Your Notes Widget
- DASH-FUNC-11: Recent Projects View All Navigation
- DASH-FUNC-12: Recent Target View All Navigation
- DASH-FUNC-13: Recent To Dos View All Navigation

## Test Coverage

### Pages/Features Tested
1. ✓ Dashboard Login Redirect
2. ✓ Dashboard Page Load
3. ✓ Vedak Logo Click (Navigate to Home)
4. ✓ Page Refresh (Session Persistence)
5. ✓ Work/Organization Navigation
6. ✓ Daily Training Widget & Hover Effects
7. ✓ Last 30 Days Section
8. ✓ Todos Widget & Functionality
9. ✓ Email Observations
10. ✓ View All Buttons (All Sections)
11. ✓ Contribution Section (Last 30d & Monthly Toggles)
12. ✓ Page Scrolling (Up & Down)
13. ✓ Interested Experts Onboarded
14. ✓ Interested Experts Refresh Button
15. ✓ Your Notes Widget (Add/Save/Persist)
16. ✓ Your Responsibilities
17. ✓ Recent Projects (View All Navigation)
18. ✓ Recent Target (View All Navigation)
19. ✓ Recent To Dos (View All Navigation)
20. ✓ Profiles Added Widget
21. ✓ Widget Hover Effects
22. ✓ Performance Testing
23. ✓ Responsiveness Testing
24. ✓ Edge Cases (Rapid Interactions)

## Deliverables

### 1. Excel Test Case Document
**File**: `Vedak_CRM_Dashboard_TestCases.xlsx`
- Summary Sheet: Overview of test categories and counts
- Test Cases Sheet: Detailed test cases with all information
- Execution Log Sheet: For recording test execution results

### 2. Test Automation Scripts
**Location**: `dashboard-tests/` directory

**UI Tests**:
- `ui/dash-ui-01-dashboard-load.js` - Dashboard loading verification
- More UI tests for widgets and elements

**Functionality Tests**:
- `functionality/dash-func-01-logo-click.js` - Logo click navigation
- `functionality/dash-func-02-page-refresh.js` - Page refresh test
- More functionality tests for buttons and features

**Major Tests**:
- `major/dash-major-scroll.js` - Scroll functionality (up/down)
- More major feature tests

**Test Runner**:
- `run-dashboard-tests.js` - Master runner orchestrating all tests

### 3. Test Data
**File**: `test-data/dashboard-test-data.json`
- Valid credentials for login
- Test notes for note-adding verification
- Scroll test parameters
- Hover test elements
- View All button data
- Toggle section data

### 4. npm Script
**Command**: `npm run test:dashboard`
- Automatically runs all dashboard tests
- Generates HTML report
- Creates logs and screenshots

## How to Run Tests

### Run All Dashboard Tests
```bash
cd ~/Downloads/Vedak_Automation
npm run test:dashboard
```

### Run Specific Test Category
```bash
# UI Tests Only
node dashboard-tests/ui/dash-ui-01-dashboard-load.js

# Functionality Tests Only
node dashboard-tests/functionality/dash-func-01-logo-click.js

# Major Tests Only
node dashboard-tests/major/dash-major-scroll.js
```

### Run Master Suite (All Tests at Once)
```bash
node dashboard-tests/run-dashboard-tests.js
```

## Test Execution

### Prerequisites
- Node.js v18+
- Vedak CRM app running on http://localhost:5173/
- .env file configured with credentials:
  ```
  APP_URL=http://localhost:5173/
  GMAIL_EMAIL=vivek.k@vedak.com
  GMAIL_PASSWORD=your_gmail_app_password
  HEADLESS=false
  ```

### Test Features
- ✓ Non-headless mode (visible browser)
- ✓ Screenshots after each test step
- ✓ Structured logging with timestamps
- ✓ HTML report generation
- ✓ Cross-browser support (Chromium, Firefox, WebKit)
- ✓ Real Gmail OAuth authentication
- ✓ Session persistence verification
- ✓ Automatic browser cleanup

### Output Files Generated
1. **Reports**: `reports/dashboard-test-report.html`
2. **Logs**: `logs/test-execution.log`
3. **Screenshots**: `screenshots/[TEST_ID]/[step_name].png`
4. **Test Data**: `test-data/dashboard-test-data.json`

## Test Results Interpretation

### Report Format
- Test ID and Name
- Category Classification
- Pass/Fail Status
- Execution Duration
- Error Messages (if failed)
- Screenshots for each step

### Success Criteria
- All UI elements visible and accessible
- All navigation works correctly
- Page refresh maintains session
- Scrolling works smoothly
- Widgets show correct hover effects
- Notes persist after save
- View All buttons navigate correctly
- Performance within acceptable limits

## Continuous Integration

### Add to CI/CD Pipeline
```yaml
# Example GitHub Actions
- name: Run Dashboard Tests
  run: npm run test:dashboard
```

### Scheduled Execution
Set up automated test runs on:
- Daily basis
- Before deployments
- After UI changes
- Weekly regression suite

## Troubleshooting

### Tests Failing?
1. Verify Vedak CRM is running on http://localhost:5173/
2. Check .env file has correct credentials
3. Ensure browser viewport is 1920x1080
4. Check internet connection for OAuth
5. Review screenshots in ./screenshots/ for visual debugging

### Browser Issues?
```bash
# Re-install Playwright browsers
npm run install-browsers
```

### Performance Issues?
- Increase timeout values in test files
- Check system resources
- Verify network speed
- Clear cache and temporary files

## Future Enhancements

- [ ] Mobile viewport testing
- [ ] Network throttling simulation
- [ ] Multi-user concurrent testing
- [ ] Data-driven testing framework
- [ ] Video recording of test execution
- [ ] Email notification integration
- [ ] Database state verification
- [ ] API response validation

## Support

For issues or questions:
1. Check test logs: `logs/test-execution.log`
2. Review screenshots: `screenshots/`
3. Verify .env configuration
4. Run individual tests for debugging

---

**Created**: October 27, 2026
**Version**: 1.0.0
**Status**: Production Ready
