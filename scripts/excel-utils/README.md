# excel-utils/ — Excel File Utilities

Scripts that create, append, and update Excel test case files.

| File | Purpose |
|------|---------|
| `common-excel-utils.js` | Shared Projects module Excel utility (theme, styling, categorized workbook creation, non-destructive row appending, categorized & flat-sheet result updates, and `createProjectsExcelReporter`) |
| `update-recent-projects-excel.js` | Backward-compatible wrapper around `common-excel-utils.js` for `Vedak_CRM_Recent_Projects_TestCases.xlsx` |
| `create-recent-projects-excel.js` | Non-destructively creates/syncs `Vedak_CRM_Recent_Projects_TestCases.xlsx` with all categorized tabs |
| `append-recent-projects-filter-columns.js` | Appends Filter Columns test cases non-destructively into `Vedak_CRM_Recent_Projects_TestCases.xlsx` |
| `append-recent-projects-detail-cases.js` | Appends Project Detail window test cases non-destructively into `Vedak_CRM_Recent_Projects_TestCases.xlsx` |
| `create-organization-excel.js` | Creates `Organization_TestCases.xlsx` with all 12 test cases |
| `create-projects-excel.js` | Creates Projects menu test cases Excel file |
| `update-excel-results.js` | Updates Login/Dashboard/Master Excel files with latest test results |
| `update-main-dashboard-excel.js` | Updates Dashboard Master Excel with Organization results |

## Using `common-excel-utils.js` in New Projects Suites

```js
const path = require('path');
const { createProjectsExcelReporter } = require('../scripts/excel-utils/common-excel-utils');

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

> Run manually only if you need to initialize or append to a workbook:
```bash
npm run generate:recent-projects-excel
npm run append:recent-projects-excel
npm run append:recent-project-details-excel
```
