# Dashboard Module Test Suite

This module contains all automated tests for the Vedak CRM dashboard functionality.

## Structure

```
dashboard/
├── test-cases/
│   └── dashboard-tests/     # All dashboard test scripts
├── test-data/
│   └── dashboard-test-data.json
├── Vedak_CRM_Dashboard_TestCases.xlsx  # Excel test documentation
├── test-runner.js           # Main test orchestrator
└── README.md               # This file
```

## Running Tests

### Run All Dashboard Tests
```bash
node modules/dashboard/test-runner.js
```

### Run Specific Test Category
```bash
cd modules/dashboard/test-cases/dashboard-tests
node dashboard-tests.js
```

## Test Coverage

The dashboard module contains comprehensive tests for:

- **UI Tests**: Page elements, navigation, layout
- **Functionality Tests**: Feature workflows, interactions
- **Major Tests**: Critical user paths
- **Minor Tests**: Secondary features
- **Edge Cases**: Error scenarios, edge cases

## Test Data

### dashboard-test-data.json
Contains configuration for:
- Network conditions (fast, slow, offline)
- Browser compatibility settings
- Device simulation parameters

## Results

Test results are saved to:
- `reports/test-results/dashboard-results.json`
- `reports/test-reports/master-test-report.html`

## Documentation

See `Vedak_CRM_Dashboard_TestCases.xlsx` for detailed test specifications:
- Test case descriptions
- Expected results
- Pass/fail status
- Execution date/time

## Screenshots

Dashboard screenshots are automatically saved to:
- `screenshots/current/dashboard/` (recent runs)
- `screenshots/archive/` (older, compressed)

## Troubleshooting

### Session not persisting
- The dashboard tests rely on a valid login session
- Session data is stored in `sessions/session-data.json`
- Run login tests first to establish session

### Slow test execution
- Reduce test parallelization
- Check browser performance
- Monitor system resources
