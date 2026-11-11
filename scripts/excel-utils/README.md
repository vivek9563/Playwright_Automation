# excel-utils/ — Excel File Utilities

Scripts that create, append, and update Excel test case files.

| File | Purpose |
|------|---------|
| `projects-excel-utils.js` | Unified Projects module Excel utility & test case registry (theme, styling, workbook creation, non-destructive appending, result updates, flat-sheet updates, `createProjectsExcelReporter`, and all Recent Projects Scroll, Filter Columns & Project Detail test cases) |
| `create-organization-excel.js` | Creates `Organization_TestCases.xlsx` with all 12 test cases |
| `create-projects-excel.js` | Creates Projects menu test cases Excel file |
| `update-excel-results.js` | Updates Login/Dashboard/Master Excel files with latest test results |
| `update-main-dashboard-excel.js` | Updates Dashboard Master Excel with Organization results |

## Target Workbook (Recent Projects)
- [modules/04_projects/Vedak_CRM_Recent_Projects_TestCases.xlsx](../../modules/04_projects/Vedak_CRM_Recent_Projects_TestCases.xlsx)

## CLI Usage (`projects-excel-utils.js`)

```bash
npm run generate:recent-projects-excel       # Initialize workbook if missing & sync all 44 cases
npm run append:recent-projects-excel         # Sync Filter Columns cases non-destructively
npm run append:recent-project-details-excel  # Sync Project Detail cases non-destructively
npm run stats:recent-projects-excel          # Print PASS/FAIL/PENDING counts
```

## Using `projects-excel-utils.js` in New Projects Suites

```js
const path = require('path');
const { createProjectsExcelReporter } = require('../scripts/excel-utils/projects-excel-utils');

const reporter = createProjectsExcelReporter({
  filePaths: [
    path.join(__dirname, '../modules/04_projects/Vedak_CRM_<Feature>_TestCases.xlsx'),
  ],
  summaryMeta: {
    title: 'VEDAK CRM — <FEATURE> TEST REPORT',
    testSuite: '<Feature> Validation',
    module: 'Projects (<Feature>)',
  },
});

// 1. Seed workbook if missing & non-destructively append cases:
await reporter.ensureWorkbook(TEST_CASES_BY_TAB);
await reporter.appendTestCases(NEW_CASES_BY_TAB, { preserveExistingStatus: true });

// 2. Update execution results from Playwright afterAll():
await reporter.updateResults(testResults);
```
