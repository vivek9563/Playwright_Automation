# scripts/ — Folder Structure Guide

All supporting scripts are organized into subfolders by purpose.

---

## Folder Map

```
scripts/
├── utils/          ← Shared utilities (auth, logging, session, report)
├── email/          ← Email delivery scripts
├── reports-gen/    ← Report generation scripts (Excel + HTML)
├── debug/          ← Debug and inspection scripts
├── maintenance/    ← Screenshot cleanup and compression
├── config/         ← Configuration JSON files (browsers, devices, network)
└── archive/        ← Deprecated old runners (do not use)
```

---

## Quick Reference

### Run everything (tests + Excel update + email)
```bash
# From project root
node run-all-tests-and-report.js
```

### Generate reports only (no test run)
```bash
node scripts/reports-gen/generate-master-report-comprehensive.js
```

### Send email only
```bash
node scripts/email/send-master-report-email.js
```

### Debug a failing test
```bash
node scripts/debug/debug-login.js
node scripts/debug/debug-selectors.js
```

### Clean up old screenshots
```bash
node scripts/maintenance/cleanup-screenshots.js
```

---

## utils/ — Shared Utilities (used by all test scripts)

| File | What it does |
|------|-------------|
| `auth-helper.js` | Google OAuth login with session reuse |
| `session-manager.js` | Save/restore browser session across runs |
| `common.js` | Browser setup, navigation, screenshot, wait helpers |
| `logger.js` | INFO/WARN/ERROR/DEBUG console + file logging |
| `report-generator.js` | HTML report builder from result objects |

### How to import in a test script:
```js
const AuthHelper      = require('../../scripts/utils/auth-helper');
const SessionManager  = require('../../scripts/utils/session-manager');
const CommonUtils     = require('../../scripts/utils/common');
const logger          = require('../../scripts/utils/logger');
const ReportGenerator = require('../../scripts/utils/report-generator');
```

---

## projects-menu-tests.js
Standalone script that tests the Projects sidebar menu navigation.
```bash
node scripts/projects-menu-tests.js
```
