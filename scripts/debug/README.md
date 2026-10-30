# debug/ — Debug Scripts

Use these when a test is failing and you need to inspect login or selectors manually.

| File | Purpose |
|------|---------|
| `debug-login.js` | Opens browser and steps through Google login |
| `debug-oauth.js` | Inspects OAuth popup and token flow |
| `debug-selectors.js` | Prints all found selectors on a page for writing tests |
| `test-session-demo.js` | Demonstrates session save/restore workflow |

**Usage:**
```bash
node scripts/debug/debug-login.js
node scripts/debug/debug-selectors.js
```
