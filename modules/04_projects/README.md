# Projects Module Test Suite

This module contains automated tests for the Vedak CRM projects and sidebar navigation functionality.

## Structure

```
projects/
├── test-cases/
│   ├── projects-submenu-tests/      # Projects submenu navigation
│   ├── recent-projects-tests/       # Recent Projects scroll & Filter Columns tests
│   └── sidebar-tests/               # Sidebar menu tests
├── Vedak_CRM_Projects_Submenu_TestCases.xlsx
├── Vedak_CRM_Recent_Projects_TestCases.xlsx
├── Vedak_CRM_Sidebar_TestCases.xlsx
├── Vedak_CRM_Projects_Menu_TestCases.xlsx
├── test-runner.js                   # Main test orchestrator
└── README.md                       # This file
```

## Running Tests

### Run All Projects Tests
```bash
node modules/04_projects/test-runner.js
```

### Run Recent Projects Tests (Scroll & Filter Columns)
```bash
npx playwright test --project=recent-projects --headed
# or via module script:
node modules/04_projects/test-cases/recent-projects-tests/run-recent-projects-tests.js --headed
```

### Run Projects Submenu Tests
```bash
node modules/projects/test-cases/projects-submenu-tests/run-projects-submenu-tests.js
```

### Run Sidebar Tests
```bash
node modules/projects/test-cases/sidebar-tests/run-sidebar-tests.js
```

## Test Coverage

### Projects Submenu Tests (11 tests)
- Recent Projects navigation
- Expert Links
- All Projects view
- Subproject Statistics
- Targets management
- Project Summary
- Client Portal Requests
- Public Projects view
- Checkpoints management
- Experts Rating
- Project Lifecycle

### Sidebar Tests (25 tests)
- Sidebar expansion/collapse
- Menu item clicks
- Navigation to each submenu
- Dashboard return functionality
- Multiple click scenarios
- Rapid navigation handling

## Test Data

Test data files are located in `test-data/`:
- Submenu URLs and endpoints
- Sidebar menu structure
- Navigation parameters

## Test Documentation

Excel files contain detailed specifications:
- **Vedak_CRM_Projects_Submenu_TestCases.xlsx**: Submenu navigation tests
- **Vedak_CRM_Sidebar_TestCases.xlsx**: Sidebar interaction tests
- **Vedak_CRM_Projects_Menu_TestCases.xlsx**: Combined project menu tests

## Results

Test results are saved to:
- `reports/test-results/projects-submenu-results.json`
- `reports/test-results/sidebar-results.json`
- `reports/test-reports/master-test-report.html`

## Screenshots

Project test screenshots are organized as:
- Recent captures: `screenshots/current/projects/`
- Archived: `screenshots/archive/`

## URLs Tested

Projects Submenu navigates to:
- http://localhost:5173/app/projects
- http://localhost:5173/app/project-expert-links
- http://localhost:5173/app/projects?recent=false
- http://localhost:5173/app/projects/subprojects
- http://localhost:5173/app/targets
- http://localhost:5173/app/project_summary
- http://localhost:5173/app/client_portal_requests
- http://localhost:5173/app/public-projects
- http://localhost:5173/app/check-points
- http://localhost:5173/app/experts-rating
- http://localhost:5173/app/projects?recent=false&tab=idle

## Dependencies

- Active login session required
- CRM running on http://localhost:5173/
- Sidebar visible in dashboard

## Troubleshooting

### Navigation failing
- Ensure you're on the dashboard page first
- Check CRM application is responding
- Verify sidebar is visible

### Timeout errors
- Check network latency
- Reduce parallel test execution
- Increase test timeout values

### Missing results
- Verify test-results folder has write permissions
- Check JSON result files are being created
- Review browser console for JS errors
