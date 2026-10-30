# 🔐 Session Management Setup - Vedak CRM

## What is Session Management?

Session management saves your login session so you don't need to login repeatedly for each test run. Once logged in, your session is reused across all test executions until it expires.

---

## ⚡ Quick Start (3 Steps)

### Step 1️⃣ Verify Configuration
```bash
cat .env | grep GMAIL
```

Should show:
```
GMAIL_EMAIL=vivek.k@vedak.com
GMAIL_PASSWORD=your_gmail_app_password
```

✅ **Already configured!**

### Step 2️⃣ Initialize Session
```bash
cd ~/Downloads/Vedak_Automation
npm run init:session
```

What happens:
- Opens browser (visible window)
- Logs into app via Google OAuth
- Saves session cookies to `sessions/session-data.json`
- Closes browser
- Shows success message

**Expected output:**
```
✅ SESSION INITIALIZATION COMPLETE
📧 Logged in as: vivek.k@vedak.com
💾 Session saved to: ./sessions/session-data.json
✨ Ready to run test suite
```

### Step 3️⃣ Run Tests with Saved Session
```bash
npm run test:dashboard
```

What happens:
- Checks for saved session
- Loads existing session if valid (< 8 hours old)
- OR logs in fresh if expired
- Runs all dashboard tests
- Saves updated session

**Expected output:**
```
✅ SESSION REUSED - User already logged in!
[Tests run without login delay]
```

---

## 🎯 Typical Usage Pattern

### Morning
```bash
npm run init:session        # Fresh login, save session
npm run test:dashboard      # Tests use saved session (50% faster)
```

### Throughout Day
```bash
npm run test:dashboard      # 10:00 AM - Session reused
npm run test:dashboard      # 2:00 PM  - Session reused  
npm run test:dashboard      # 4:00 PM  - Session reused
```

### Evening (Optional)
```bash
npm run init:session        # Fresh login for tomorrow
```

---

## 📁 Session Storage

**Location:** `~/Downloads/Vedak_Automation/sessions/session-data.json`

**Contains:**
```json
{
  "timestamp": "2026-10-27T16:20:43Z",
  "testName": "authentication",
  "cookies": [...],
  "localStorage": {...},
  "userAgent": "Mozilla/5.0..."
}
```

**Security:**
- ✅ Stored locally only
- ✅ Added to `.gitignore` (not committed)
- ✅ Safe to store on your machine
- ⚠️ Don't share between machines
- ⚠️ Contains auth cookies (treat as sensitive)

---

## 🔄 Session Lifecycle

### Session Valid (< 8 hours)
```
┌─────────────────┐
│  Session Valid  │
│  (< 8 hours)    │
└────────┬────────┘
         │
         ├─→ ✅ REUSED
         ├─→ No login needed
         └─→ Faster tests
```

### Session Expired (> 8 hours)
```
┌──────────────────┐
│ Session Expired  │
│  (> 8 hours)     │
└────────┬─────────┘
         │
         ├─→ 🔄 AUTO RE-LOGIN
         ├─→ Fresh login
         ├─→ New session saved
         └─→ Tests proceed
```

---

## 🛠️ Commands Reference

| Command | Purpose | Duration |
|---------|---------|----------|
| `npm run init:session` | Initialize/refresh session | 30-60 sec |
| `npm run test:dashboard` | Run tests (auto-session) | 2-3 min |
| `rm sessions/session-data.json` | Clear session (force login) | Instant |

---

## 🔍 Checking Session Status

### View Current Session Info
```bash
node -e "const SM = require('./utils/session-manager'); const sm = new SM(); console.log(JSON.stringify(sm.getSessionInfo(), null, 2));"
```

Example output:
```json
{
  "savedAt": "2026-10-27T16:20:43.583+05:30",
  "lastUsedBy": "authentication",
  "cookieCount": 12,
  "storageItemCount": 8
}
```

### Check .env Configuration
```bash
cat .env | grep -E "GMAIL|APP_URL|HEADLESS"
```

Should show:
```
APP_URL=http://localhost:5173/
GMAIL_EMAIL=vivek.k@vedak.com
GMAIL_PASSWORD=your_gmail_app_password
HEADLESS=false
```

---

## ⚙️ Configuration

### .env Settings (Already Set)
```env
# Application
APP_URL=http://localhost:5173/
HEADLESS=false                    # Show browser window

# Gmail credentials
GMAIL_EMAIL=vivek.k@vedak.com
GMAIL_PASSWORD=your_gmail_app_password

# Session options
SESSION_TIMEOUT=480               # Minutes (8 hours)
```

### Change Session Timeout
Edit `utils/auth-helper-v2.js` line 60:
```javascript
// Change 480 to desired minutes
const sessionIsValid = this.sessionManager.isSessionValid(savedSession, 480);
```

Then re-initialize:
```bash
rm sessions/session-data.json
npm run init:session
```

---

## 🐛 Troubleshooting

### Issue: "No session found"
**Cause:** First time, or session cleared
**Solution:**
```bash
npm run init:session
```

### Issue: "Session expired" during tests
**Cause:** Session > 8 hours old
**Solution:** Automatic! Tests will auto-login
Or manually:
```bash
npm run init:session
npm run test:dashboard
```

### Issue: "Failed to restore session"
**Cause:** Corrupted session file
**Solution:**
```bash
rm sessions/session-data.json
npm run init:session
```

### Issue: Google popup not appearing
**Cause:** Credentials invalid or network issue
**Solution:**
```bash
# Verify credentials
cat .env | grep GMAIL_PASSWORD

# Try again
rm sessions/session-data.json
npm run init:session
```

### Issue: Tests still asking for login
**Cause:** Session not restored properly
**Solution:**
```bash
# Check .env HEADLESS setting
grep HEADLESS .env

# Should be: HEADLESS=false (or not set)

# Re-initialize
rm sessions/session-data.json
npm run init:session
```

---

## 📊 Session Validation Process

The system checks:
1. ✅ Session file exists
2. ✅ Session age < 480 minutes
3. ✅ Cookies present
4. ✅ Cookies added to browser
5. ✅ Navigate to app URL
6. ✅ Verify logged-in indicators

If all pass → **Reuse session** ✅
If any fail → **Fresh login** 🔄

---

## 🎓 How It Works Behind the Scenes

### Session Manager (`utils/session-manager.js`)
```javascript
// Save session after login
sessionManager.saveSession(browser, context)

// Load session for reuse
const session = sessionManager.loadSession()

// Check if still valid
const isValid = sessionManager.isSessionValid(session)
```

### Auth Helper (`utils/auth-helper-v2.js`)
```javascript
// Main flow with session reuse
const result = await authHelper.authenticate(page)

// Returns:
// { success: true, sessionReused: true }  - Used existing
// { success: true, sessionReused: false } - Fresh login
```

### Common Utils (`utils/common-v2.js`)
```javascript
// Create page with auto-restored session
const page = await commonUtils.createPage(testName)

// Page automatically has cookies loaded
```

---

## 🔒 Security Best Practices

1. **Session File Location**
   - Stored in: `sessions/` directory
   - Added to `.gitignore`
   - Never committed to git

2. **Credentials in .env**
   - Also in `.gitignore`
   - App password used (safe)
   - Not plain Gmail password

3. **Access Control**
   - Only your local machine can access
   - Don't share session file
   - Don't share .env file
   - Session expires after 8 hours

4. **Cleanup**
   - Clear session when switching accounts
   - Remove sessions/ folder before sharing repo
   - Use `.gitignore` to prevent accidents

---

## ✨ Benefits

| Feature | Without Session | With Session |
|---------|-----------------|--------------|
| Login method | OAuth popup | Auto-restore |
| Time per test | 3+ minutes | 2 minutes |
| Browser wait | 30-60 sec | None |
| Repeated OAuth | Yes | No (first time only) |
| Session reuse | No | Yes (8 hours) |
| Credentials safe | Yes | Yes |

---

## 🚀 Getting Started NOW

```bash
# Navigate to project
cd ~/Downloads/Vedak_Automation

# Initialize session (first time)
npm run init:session

# Run tests (uses saved session)
npm run test:dashboard

# View results
open reports/test-report.html
```

---

## 📞 Support

**If something goes wrong:**

1. Check configuration
   ```bash
   cat .env
   ```

2. View logs
   ```bash
   tail -50 logs/test-execution.log
   ```

3. Check screenshots
   ```bash
   ls screenshots/DASH-*/
   ```

4. Clear and restart
   ```bash
   rm sessions/session-data.json
   npm run init:session
   ```

---

## 📋 Checklist Before First Run

- [ ] `.env` configured with credentials
- [ ] `GMAIL_EMAIL=vivek.k@vedak.com`
- [ ] `GMAIL_PASSWORD=your_gmail_app_password`
- [ ] `HEADLESS=false`
- [ ] Node.js installed
- [ ] Dependencies installed (`npm install`)
- [ ] Playwright browsers downloaded (`npx playwright install`)

✅ All checked? Ready to go!

```bash
npm run init:session && npm run test:dashboard
```

---

## Summary

- ✅ Login once with `npm run init:session`
- ✅ Session saved automatically
- ✅ Reused for all tests (8 hours)
- ✅ Auto-renewal if expired
- ✅ Faster test execution
- ✅ No repeated OAuth flows

**Start here:** `npm run init:session` 🚀
