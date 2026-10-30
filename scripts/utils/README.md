# Utils — Shared Utilities

These files are shared across all test modules. Import them directly using relative paths.

---

## Files

### `auth-helper.js`
Handles Google OAuth login with session persistence.  
Reuses saved sessions to avoid repeated login between runs.

```js
const AuthHelper = require('../scripts/utils/auth-helper');
const auth = new AuthHelper();
await auth.login(page);
```

### `session-manager.js`
Saves and restores browser session (cookies/tokens) to `sessions/` folder.  
Automatically triggers re-login if session is expired.

```js
const SessionManager = require('../scripts/utils/session-manager');
const sm = new SessionManager();
await sm.saveSession(context);
const saved = await sm.loadSession();
```

### `common.js`
Shared browser setup, page navigation, screenshot capture, and wait helpers.  
Uses session persistence from `session-manager.js`.

```js
const CommonUtils = require('../scripts/utils/common');
const utils = new CommonUtils();
await utils.init();
await utils.navigateTo('http://localhost:5173/app/dashboard');
```

### `logger.js`
Structured console + file logging with levels: INFO, WARN, ERROR, DEBUG.  
Logs are written to `logs/` folder.

```js
const logger = require('../scripts/utils/logger');
logger.info('Test started');
logger.error('Element not found');
```

### `report-generator.js`
Generates HTML test reports from test result objects.  
Used internally by report generation scripts.

```js
const ReportGenerator = require('../scripts/utils/report-generator');
const rg = new ReportGenerator();
rg.addResult({ name: 'Test 1', status: 'PASS' });
rg.generate('./reports/output.html');
```

---

## archive/
Contains older v1 versions of `auth-helper` and `common` for reference only.  
Do **not** use these in new tests — use the active files above.
