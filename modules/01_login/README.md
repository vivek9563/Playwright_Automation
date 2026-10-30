# Login Module Test Suite

This module contains all automated tests for the Vedak CRM login functionality.

## Structure

```
login/
├── test-cases/           # All test scripts organized by category
│   ├── ui-tests/        # UI element visibility and interaction tests
│   ├── functionality-tests/  # Core login functionality tests
│   ├── major-tests/      # Critical path tests
│   ├── minor-tests/      # Secondary feature tests
│   └── edge-case-tests/  # Edge cases and error scenarios
├── test-data/           # Test data files
│   ├── valid-accounts.json
│   └── invalid-accounts.json
├── test-runner.js       # Main test orchestrator
└── README.md           # This file
```

## Running Tests

### Run All Login Tests
```bash
node modules/login/test-runner.js
```

### Run Specific Category
```bash
node modules/login/test-cases/ui-tests/run-ui-tests.js
node modules/login/test-cases/functionality-tests/run-functionality-tests.js
node modules/login/test-cases/major-tests/run-major-tests.js
node modules/login/test-cases/minor-tests/run-minor-tests.js
node modules/login/test-cases/edge-case-tests/run-edge-case-tests.js
```

## Test Categories

### UI Tests (5 tests)
- Page loading and element visibility
- Button and text verification
- Welcome message display
- Element state verification

### Functionality Tests (5 tests)
- Valid domain login
- Invalid domain error handling
- OAuth popup handling
- Session persistence
- Login cancellation

### Major Tests (3 tests)
- Session creation
- Domain validation
- Login flow

### Minor Tests (3 tests)
- Browser compatibility (Firefox, Chrome)
- Performance monitoring

### Edge Case Tests (5 tests)
- Slow network conditions
- Mobile device simulation
- Rapid clicks handling
- Session timeout
- Browser back button behavior

## Test Data

### valid-accounts.json
Contains credentials for successful login tests:
- Email: vivek.k@vedak.com
- Domain: vedak.com

### invalid-accounts.json
Contains invalid credentials for negative testing:
- Wrong domain emails
- Invalid formats
- Edge case inputs

## Configuration

All tests use the following configuration:
- **URL**: http://localhost:5173/
- **Browser**: Chrome (headless: false for visibility)
- **Timeout**: 30000ms per test
- **Retry**: 0 (tests fail immediately)

## Results

Test results are saved to:
- `reports/test-results/login-results.json`
- `reports/test-results/latest-results.json`
- `reports/test-reports/master-test-report.html`

## Troubleshooting

### Tests timeout
- Ensure the CRM application is running on localhost:5173
- Check network connectivity
- Verify Google OAuth is accessible

### Screenshot issues
- Check disk space in `screenshots/current/login/`
- Old screenshots are automatically compressed to `screenshots/archive/`

### Session persistence
- Session data stored in `sessions/session-data.json`
- Clear this file to force re-authentication
