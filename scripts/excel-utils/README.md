# excel-utils/ — Excel File Utilities

Scripts that create and update Excel test case files.

| File | Purpose |
|------|---------|
| `create-organization-excel.js` | Creates Organization_TestCases.xlsx with all 12 test cases |
| `create-projects-excel.js` | Creates Projects test cases Excel file |
| `update-excel-results.js` | Updates any Excel file with latest test results |
| `update-main-dashboard-excel.js` | Updates Dashboard Master Excel with Organization results |

> ✅ These run automatically via `run-all-tests-and-report.js`.  
> Run manually only if you need to recreate an Excel file from scratch:
```bash
node scripts/excel-utils/create-organization-excel.js
node scripts/excel-utils/create-projects-excel.js
```
