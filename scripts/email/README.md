# email/ — Email Senders

All scripts here send test reports via Gmail SMTP using credentials from `.env`.

| File | Purpose |
|------|---------|
| `send-master-report-email.js` | Sends Master Excel + HTML report (all modules) |
| `send-organization-email.js` | Sends Organization module test report |
| `send-dashboard-major-report-email.js` | Sends Dashboard Major test report |
| `send-updated-dashboard-email.js` | Sends updated Dashboard Excel |
| `send-final-complete-email.js` | Sends final complete report with all attachments |

> ✅ **Recommended**: Use `node ../run-all-tests-and-report.js` from root — it handles email automatically after test execution.
