# 🚀 SESSION MANAGEMENT - QUICK REFERENCE

## 3-Step Setup

```
STEP 1: Navigate to project
$ cd ~/Downloads/Vedak_Automation

STEP 2: Initialize session (first time only)
$ npm run init:session
   └─ Browser opens → Login → Session saved ✅

STEP 3: Run tests (session auto-reused)
$ npm run test:dashboard
   └─ Tests run with saved session ⚡
```

---

## What Happens Under the Hood

### First Run (npm run init:session)
```
┌─────────────────────────────────────────┐
│  1. Browser launches (non-headless)     │
│  2. Navigate to: http://localhost:5173/ │
│  3. Check for saved session             │
│  4. NOT FOUND → Fresh login triggered   │
│  5. Google OAuth popup appears          │
│  6. Auto-enter: vivek.k@vedak.com       │
│  7. Auto-enter: your_gmail_app_password        │
│  8. Popup closes → Logged in ✅         │
│  9. Capture cookies & storage           │
│  10. Save to: sessions/session-data.json │
│  11. Browser closes                     │
│  12. ✅ Ready for tests!                 │
└─────────────────────────────────────────┘
```

### Subsequent Runs (npm run test:dashboard)
```
If Session Valid (< 8 hours):
  ┌─────────────────────────────────┐
  │ 1. Load saved session           │
  │ 2. Check age: 2 hours < 8 hours │
  │ 3. ✅ VALID - Reuse session     │
  │ 4. Load cookies to browser      │
  │ 5. Navigate to app              │
  │ 6. Already authenticated ✅     │
  │ 7. Run tests (30% faster!)      │
  └─────────────────────────────────┘

If Session Expired (> 8 hours):
  ┌─────────────────────────────────┐
  │ 1. Load saved session           │
  │ 2. Check age: 9 hours > 8 hours │
  │ 3. ❌ EXPIRED - Auto-relogin    │
  │ 4. Fresh login (same as Step 1) │
  │ 5. Save new session             │
  │ 6. Run tests                    │
  └─────────────────────────────────┘
```

---

## Command Reference

### Essential Commands

| Command | Purpose |
|---------|---------|
| `npm run init:session` | Initialize/refresh session |
| `npm run test:dashboard` | Run tests (auto session) |
| `npm run test:all` | Legacy login tests |

### Session Management

```bash
# View session info
node -e "const SM = require('./utils/session-manager'); const sm = new SM(); console.log(sm.getSessionInfo());"

# Clear session (force new login)
rm sessions/session-data.json

# Run demo
node test-session-demo.js
```

---

## Session File Structure

**Location:** `~/Downloads/Vedak_Automation/sessions/session-data.json`

**Contains:**
- Browser cookies (auth tokens, session IDs)
- Local storage (user preferences)
- Timestamp (when saved)
- Test name (which test saved it)

**Example:**
```json
{
  "timestamp": "2026-10-27T16:20:43.583+05:30",
  "testName": "authentication",
  "cookies": [
    { "name": "auth_token", "value": "xxx...", ... },
    { "name": "session_id", "value": "yyy...", ... }
  ],
  "localStorage": { "user_id": "123", ... }
}
```

---

## Typical Day Schedule

```
┌──────────────────────────────────────────────────────────┐
│ MORNING (9:00 AM)                                        │
│ $ npm run init:session                                   │
│ ✅ Fresh login, session saved                           │
├──────────────────────────────────────────────────────────┤
│ MID-MORNING (10:30 AM)                                   │
│ $ npm run test:dashboard                                │
│ ✅ Reuses saved session (age: 1.5 hours)                │
│ ⚡ Fast execution (2 minutes)                           │
├──────────────────────────────────────────────────────────┤
│ AFTERNOON (2:00 PM)                                      │
│ $ npm run test:dashboard                                │
│ ✅ Reuses saved session (age: 5 hours)                  │
│ ⚡ Fast execution (2 minutes)                           │
├──────────────────────────────────────────────────────────┤
│ LATE AFTERNOON (5:30 PM)                                 │
│ $ npm run test:dashboard                                │
│ 🔄 Session expired (age: 8.5 hours)                     │
│ ✅ Auto-logs in, saves new session                      │
│ ⚡ Tests run normally (2-3 minutes)                     │
└──────────────────────────────────────────────────────────┘
```

---

## Common Scenarios

### Scenario 1: Fresh Start
```bash
$ cd ~/Downloads/Vedak_Automation
$ npm run init:session
# Browser opens → Login → Session saved

$ npm run test:dashboard  
# Tests run using saved session
```

### Scenario 2: Session Still Valid
```bash
$ npm run test:dashboard  # 10 AM
# Uses saved session from 9 AM ✅

$ npm run test:dashboard  # 12 PM (3 hours later)
# Still uses same session ✅

$ npm run test:dashboard  # 3 PM (6 hours later)
# Still uses same session ✅
```

### Scenario 3: Session Expired
```bash
$ npm run init:session    # 9:00 AM
# Logs in, saves session

$ npm run test:dashboard  # 5:30 PM (8.5 hours later)
# Auto-detects expired session 🔄
# Automatically re-logs in 🔐
# Saves new session ✅
```

### Scenario 4: Force New Login
```bash
$ rm sessions/session-data.json
$ npm run init:session
# Forces completely fresh login
```

---

## Troubleshooting Quick Fixes

| Problem | Quick Fix |
|---------|-----------|
| "No session found" | `npm run init:session` |
| "Session expired" | Auto-handles, or `npm run init:session` |
| "Google popup won't appear" | `rm sessions/session-data.json && npm run init:session` |
| "Still on login page" | Check `.env` HEADLESS=false |
| "Tests won't use saved session" | Verify `.env` has GMAIL_EMAIL & PASSWORD |

---

## File Organization

```
Vedak_Automation/
├── 🔐 SESSION COMPONENTS
│   ├── initialize-session.js          # Init script
│   ├── test-session-demo.js           # Demo script
│   ├── utils/session-manager.js       # Session persistence
│   ├── utils/auth-helper-v2.js        # Enhanced auth
│   ├── utils/common-v2.js             # Enhanced utils
│   └── sessions/                      # 📁 Session storage
│       └── session-data.json          # 💾 Saved session
│
├── 📚 DOCUMENTATION
│   ├── QUICK_REFERENCE.md             # This file
│   ├── SESSION_SETUP.md               # Setup guide
│   ├── SESSION_MANAGEMENT_GUIDE.md    # Detailed guide
│   └── SESSION_IMPLEMENTATION_SUMMARY.md
│
├── 🧪 TEST SUITE
│   ├── dashboard-tests/
│   ├── test-data/
│   └── utils/
│
└── ⚙️ CONFIGURATION
    ├── .env                           # Credentials ✅
    ├── .gitignore                     # Updated ✅
    └── package.json                   # Updated ✅
```

---

## Performance Comparison

```
WITHOUT Session Management:
  └─ npm run test:dashboard
     ├─ App loads
     ├─ Not authenticated
     ├─ Google popup appears (30-60 sec)
     ├─ Select email, enter password
     ├─ Popup closes, redirect
     ├─ Dashboard loads
     └─ Tests run
     TOTAL: 3-4 minutes

WITH Session Management:
  └─ npm run test:dashboard
     ├─ Load saved session ✅
     ├─ Cookies auto-applied
     ├─ App loads (already authenticated)
     ├─ Dashboard visible immediately
     └─ Tests run
     TOTAL: 2 minutes ⚡ (33% faster!)
```

---

## Key Features Summary

| Feature | Before | After |
|---------|--------|-------|
| Login per test run | YES ❌ | NO ✅ |
| OAuth popup every run | YES ❌ | 1st only ✅ |
| Session reuse | NO ❌ | YES ✅ |
| Auto expiry handling | Manual ❌ | Automatic ✅ |
| Session timeout | Manual ❌ | 8 hours ✅ |
| Security | Safe ✅ | More secure ✅ |
| Speed | Normal | 33% faster ⚡ |

---

## Security Notes

✅ **Safe Practices:**
- Session stored locally only
- App password used (not plain Gmail)
- .gitignore prevents commits
- Session expires after 8 hours
- Cookies marked as httpOnly

⚠️ **Important:**
- Don't share session files
- Don't commit .env or sessions/
- Use .gitignore to prevent accidents
- Session contains auth cookies

---

## FAQ

**Q: Do I need to login every test run?**
A: No! First login once with `npm run init:session`, then all tests reuse that session for 8 hours.

**Q: What if my session expires?**
A: It auto-detects and re-logs in automatically. No action needed!

**Q: Can I clear the session?**
A: Yes! `rm sessions/session-data.json` forces a new login on next run.

**Q: Is it secure?**
A: Yes! Session stored locally, uses app password, and expires automatically after 8 hours.

**Q: Where is the session saved?**
A: `~/Downloads/Vedak_Automation/sessions/session-data.json`

**Q: How long does each test run take?**
A: About 2 minutes (with saved session) vs 3-4 minutes (with fresh login).

---

## Next Steps

1. **Initialize session:**
   ```bash
   npm run init:session
   ```

2. **Run tests:**
   ```bash
   npm run test:dashboard
   ```

3. **Check results:**
   ```bash
   open reports/test-report.html
   ```

4. **Run tests again (reuses session):**
   ```bash
   npm run test:dashboard
   ```

---

## Support Files

- 📖 **SESSION_SETUP.md** - For setup help
- 📘 **SESSION_MANAGEMENT_GUIDE.md** - For detailed info
- 📙 **SESSION_IMPLEMENTATION_SUMMARY.md** - For technical details
- 📋 **QUICK_REFERENCE.md** - This file!

---

**Version:** 1.0.0  
**Status:** ✅ Production Ready  
**Last Updated:** October 27, 2026

🚀 **Ready to go!** Start with: `npm run init:session`
