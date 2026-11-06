# Organization Module Test Suite

This module contains automated tests for the Vedak CRM organization page functionality.

## Structure

```
organization/
├── test-cases/
│   └── organization-tests/
│       ├── UI/                          # UI element tests
│       ├── Functionality/               # Feature tests
│       ├── Major/                       # Critical path tests
│       ├── Minor/                       # Secondary feature tests
│       └── Edge/                        # Edge case tests
├── Vedak_CRM_Organization_TestCases.xlsx  # Excel documentation
├── test-runner.js                       # Main test orchestrator
└── README.md                           # This file
```

## Running Tests

### Run All Organization Tests
```bash
node modules/organization/test-runner.js
```

### Run Specific Category
```bash
node modules/organization/test-cases/organization-tests/run-organization-ui-tests.js
node modules/organization/test-cases/organization-tests/run-organization-functionality-tests.js
node modules/organization/test-cases/organization-tests/run-organization-major-tests.js
node modules/organization/test-cases/organization-tests/run-organization-minor-tests.js
node modules/organization/test-cases/organization-tests/run-organization-edge-tests.js
```

## Test Coverage

### UI Tests
- Organization page visibility and layout
- Button presence and accessibility
- Menu navigation elements

### Functionality Tests
- Navigation to subpages (Apply Leave, Calendar, etc.)
- Widget interactions (View All buttons)
- Page redirects

### Major Tests
- Complete organization workflow
- All submenu navigation
- Dashboard return functionality

### Minor Tests
- Hover interactions
- Widget expansions
- Secondary features

### Edge Cases
- Rapid navigation
- Network timeouts
- Session expiration

## Test Specifications

See `Vedak_CRM_Organization_TestCases.xlsx` for:
- Detailed test steps
- Expected results
- Status tracking
- Execution history

## Results

Test results are automatically saved to:
- `reports/test-results/organization-results.json`
- `reports/test-reports/master-test-report.html`

## Screenshots

Organization test screenshots:
- Location: `screenshots/current/organization/`
- Archived: `screenshots/archive/`

## Dependencies

- Login session must be active (run login tests first)
- CRM application running on http://localhost:5173/
- Google OAuth configured

## Troubleshooting

### Tests failing on page load
- Verify you're logged in and on the dashboard
- Check network connectivity to CRM application
- Ensure organization page URL is accessible

### Missing screenshots
- Check disk space availability
- Verify write permissions in screenshots folder
- Review browser console for errors
