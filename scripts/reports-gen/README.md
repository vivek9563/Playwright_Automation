# reports-gen/ — Report Generators

Scripts that generate Excel and HTML reports from test result JSON files.

| File | Purpose |
|------|---------|
| `generate-master-report-comprehensive.js` | ⭐ Main: aggregates all modules into Master Excel + HTML |
| `generate-dashboard-major-html-report.js` | Dashboard-only HTML report |
| `generate-html-report.js` | Generic HTML report generator (v1) |
| `generate-html-report-v2.js` | Generic HTML report generator (v2) |
| `generate-master-report.js` | Earlier master report generator |
| `generate-projects-report.js` | Projects-specific report |
| `update-master-report-with-organization.js` | Adds Organization results to master |
| `update-master-report-with-sidebar.js` | Adds Sidebar results to master |
| `update-master-test-report.js` | General master report updater |

> ✅ **Recommended**: `node scripts/reports-gen/generate-master-report-comprehensive.js`
