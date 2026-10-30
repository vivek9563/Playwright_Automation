# maintenance/ — Maintenance Utilities

Run these periodically to keep the project folder clean.

| File | Purpose |
|------|---------|
| `cleanup-screenshots.js` | Deletes screenshots older than 30 days from archive/ |
| `compress-screenshots.js` | Compresses screenshots older than 30 days into .zip |

**Suggested schedule:** Run once a week or after every major test run.

```bash
node scripts/maintenance/cleanup-screenshots.js
node scripts/maintenance/compress-screenshots.js
```
