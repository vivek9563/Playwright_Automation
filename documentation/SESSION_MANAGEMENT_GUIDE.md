# 🔐 SESSION MANAGEMENT GUIDE - Vedak CRM Test Suite

## Overview

The Vedak CRM Test Suite now includes **automatic session management** that:
- ✅ Logs in once and saves the session
- ✅ Reuses the saved session across multiple test runs
- ✅ Automatically detects when session expires
- ✅ Automatically logs in again if needed
- ✅ Eliminates repeated Google OAuth flows

---

## 🚀 Quick Start

### Step 1: Configure Credentials

Your `.env` file is already configured with:
```
APP_URL=http://localhost:5173/
GMAIL_EMAIL=vivek.k@vedak.com
GMAIL_PASSWORD=your_gmail_app_password
HEADLESS=false
```

### Step 2: Initialize Session (First Time)

```bash
cd ~/Downloads/Vedak_Automation
npm run init:session
```

This will:
- Open browser and log in to the application
- Save session cookies to `./sessions/session-data.json`
- Display success message
- Close browser

### Step 3: Run Tests with Saved Session

```bash
npm run test:dashboard
```

Tests will:
- ✅ Check for saved session
- ✅ Reuse if still valid (< 8 hours old)
- ✅ Automatically login if expired
- ✅ Run all dashboard tests

---

## 📁 Session Storage Location

Sessions are stored at:
```
~/Downloads/Vedak_Automation/sessions/session-data.json
```

This file contains:
- Browser cookies
- Local storage data
- Session timestamp
- User agent info

---

## 🔄 Session Lifecycle

### Fresh Login Flow
```
1. npm run init:session
   ↓
2. Browser launches (non-headless)
3. Logs into application via Google OAuth
   ↓
4. Cookies/session data saved to file
   ↓
5. Browser closes
6. Ready for test runs
```

### Test Run Flow (with Saved Session)
```
1. npm run test:dashboard
   ↓
2. initialize-session.js runs automatically
3. Checks for saved session
   ↓
   IF Session Valid (< 8 hours):
   └─ Reuses existing session ✅
   
   ELSE:
   └─ Performs fresh login 🔄
   ↓
4. Saves updated session
5. Runs dashboard tests
6. Tests run in logged-in state
```

---

## 🛠️ Available Commands

### Initialize/Update Session
```bash
npm run init:session
```
- Forces fresh login
- Saves session for reuse
- Validates login was successful

### Run Dashboard Tests (Auto Session)
```bash
npm run test:dashboard
```
- Automatically initializes session if needed
- Reuses saved session if valid
- Runs all dashboard tests

### Other Test Suites
```bash
# Login module tests (non-session)
npm run test:all

# Individual categories
npm run test:ui
npm run test:functionality
npm run test:major
npm run test:minor
npm run test:edge
```

---

## 📊 Session Information

### View Current Session Info
```bash
cd ~/Downloads/Vedak_Automation
node -e "const SM = require('./utils/session-manager'); const sm = new SM(); const info = sm.getSessionInfo(); console.log(JSON.stringify(info, null, 2));"
```

Output example:
```json
{
  "savedAt": "2026-10-27T16:20:43.583+05:30",
  "lastUsedBy": "authentication",
  "cookieCount": 12,
  "storageItemCount": 8
}
```

### Clear Session (Force New Login)
```bash
cd ~/Downloads/Vedak_Automation
node -e "const SM = require('./utils/session-manager'); const sm = new SM(); sm.clearSession();"
```

---

## 🔍 How It Works

### SessionManager Class (`utils/session-manager.js`)
Handles session persistence:
- **saveSession()** - Captures cookies & local storage
- **loadSession()** - Retrieves saved session from file
- **restoreSession()** - Applies saved cookies to new browser context
- **isSessionValid()** - Checks if session is still fresh (default: 8 hours)
- **clearSession()** - Removes saved session

### AuthHelperV2 Class (`utils/auth-helper-v2.js`)
Handles authentication:
- **authenticate()** - Main auth flow with session reuse logic
- **performGoogleLogin()** - Handles Google OAuth flow
- **handleGoogleOAuth()** - Manages OAuth popup interaction
- **checkIfLoggedIn()** - Verifies login status
- **saveSessionForReuse()** - Saves session after login

### CommonUtilsV2 Class (`utils/common-v2.js`)
Enhanced utilities with session support:
- **createPage()** - Creates page with auto-restored session
- **saveSession()** - Saves session after test run
- All existing utility methods preserved

---

## 🌍 Environment Variables

Required in `.env`:
```
APP_URL=http://localhost:5173/
GMAIL_EMAIL=vivek.k@vedak.com
GMAIL_PASSWORD=your_gmail_app_password
HEADLESS=false
SCREENSHOT_ON_EACH_STEP=true
```

Optional:
```
TIMEOUT=30000              # Request timeout
SLOW_MO=0                  # Slow motion mode (ms)
SESSION_TIMEOUT=480        # Session validity (minutes)
```

---

## ✅ Session Validation Checks

The system validates session using these indicators:
1. **Cookies present** - Has valid auth cookies
2. **Age check** - Session < 8 hours old
3. **URL check** - Not redirected to login page
4. **Element check** - Dashboard/sidebar visible
5. **User indicator** - Profile/logout button visible

---

## ⏰ Session Timeout

Default session validity: **480 minutes (8 hours)**

This means:
- If you initialize at 9:00 AM
- Session is valid until 5:00 PM same day
- After 5:00 PM, next test run will auto-login again

To change timeout:
1. Edit `utils/auth-helper-v2.js` line ~60
2. Change `isSessionValid(savedSession, 480)` to desired minutes
3. Save and re-initialize session

---

## 🐛 Troubleshooting

### "Session expired" message
```bash
# Clear and re-initialize
npm run init:session
```

### "Failed to restore session"
```bash
# Remove corrupted session file
rm sessions/session-data.json

# Re-initialize
npm run init:session
```

### "Google login popup not appearing"
```bash
# Check .env credentials
cat .env | grep GMAIL

# Re-initialize with fresh login
npm run init:session
```

### "Still on login page after session restore"
- Session might be expired
- Run `npm run init:session` to login again
- Then run `npm run test:dashboard`

---

## 📈 Test Execution Flow

```
Command: npm run test:dashboard
    ↓
initialize-session.js
    ├─ Load saved session
    ├─ Check if valid (< 8 hours)
    │   ├─ YES → Reuse session
    │   └─ NO → Fresh login
    ├─ Save session
    └─ Exit with session ready
    ↓
dashboard-tests/run-dashboard-tests.js
    ├─ Load browser with saved session
    ├─ Run all dashboard tests
    ├─ Capture screenshots
    └─ Generate report
    ↓
reports/test-report.html (Ready to view)
```

---

## 🎯 Best Practices

1. **Run init:session once at start of day**
   ```bash
   npm run init:session
   ```

2. **Then run tests multiple times**
   ```bash
   npm run test:dashboard  # Uses saved session
   npm run test:dashboard  # Reuses same session
   npm run test:dashboard  # Session auto-renewed if expired
   ```

3. **Clear session if credentials changed**
   ```bash
   rm sessions/session-data.json
   npm run init:session
   ```

4. **Verify session health regularly**
   ```bash
   node -e "const SM = require('./utils/session-manager'); const sm = new SM(); console.log(sm.getSessionInfo());"
   ```

---

## 🔒 Security Notes

- Session file stored locally (not uploaded)
- Contains cookies (treat as sensitive)
- .gitignore includes `sessions/` directory
- Store .env safely (contains credentials)
- Don't share session files between machines

---

## 📞 Support

For issues:
1. Check logs: `tail -100 logs/test-execution.log`
2. Review .env configuration
3. Clear session and re-initialize: `npm run init:session`
4. Check screenshots: `ls -la screenshots/`

---

## 📝 Example Workflow

### Morning: Initialize Session
```bash
cd ~/Downloads/Vedak_Automation
npm run init:session
# ✅ Session saved
```

### Throughout Day: Run Tests
```bash
npm run test:dashboard    # 9:00 AM - Uses saved session ✅
npm run test:dashboard    # 11:00 AM - Reuses session ✅
npm run test:dashboard    # 2:00 PM - Reuses session ✅
npm run test:dashboard    # 5:30 PM - Auto-logs in (8h+) 🔄
```

### Evening: Cleanup (Optional)
```bash
npm run init:session      # Fresh session for tomorrow
```

---

## ✨ Summary

- ✅ **One-time login** per 8 hours
- ✅ **Automatic reuse** across test runs
- ✅ **Smart expiry detection** with auto-renewal
- ✅ **Secure storage** in local sessions directory
- ✅ **No repeated OAuth** flows
- ✅ **Faster test execution** (no login delay)

**Ready to use!** Start with:
```bash
npm run init:session && npm run test:dashboard
```
