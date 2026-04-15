# 503 Error - Quick Fix Guide (cPanel)

**Error:** Service Unavailable  
**URL:** oes.freshmilkstraightfromsource.com  
**Likely Cause:** Backend not running or environment variables missing

---

## Quick Fix Steps (In Order)

### Step 1: Check Application Status in cPanel

**Location:** cPanel → Node.js Application Manager (or App Manager)

1. Look for your application (should be "oes-backend" or similar)
2. Check status - should say **"Running"** (green)
3. If **"Stopped"** (grey/red):
   - Click **"Restart"** button
   - Wait 30 seconds
   - Refresh your website

---

### Step 2: Verify Environment Variables

**Location:** cPanel → Node.js Application Manager → Edit Application

**Required Variables (Check ALL are set):**

```
✓ DB_HOST              Usually: localhost or 127.0.0.1
✓ DB_PORT              Usually: 3306
✓ DB_USER              Database username (NOT cpanel username)
✓ DB_PASSWORD          Database password
✓ DB_NAME              Database name (usually: cpanel_oes_database)
✓ SESSION_SECRET       Any random string (at least 20 characters)
✓ FRONTEND_URL         https://oes.freshmilkstraightfromsource.com
✓ NODE_ENV             production
✓ PORT                 5000
```

**Optional but Recommended for Email:**
```
EMAIL_SERVICE          gmail
EMAIL_USER             your-email@gmail.com
EMAIL_PASSWORD         your-app-password
```

### If Missing Variables:
1. Click **"Edit Variables"** in Application Manager
2. Add each missing variable
3. Click **"Save"**
4. Click **"Restart"** to apply changes
5. Wait 30 seconds and refresh website

---

### Step 3: Test Database Connection

**In cPanel → Terminal (or SSH):**

```bash
# Replace dbuser and oes_database with your actual values
mysql -h localhost -u dbuser -p

# You'll be prompted for password - paste it

# Once connected, type:
USE oes_database;
SELECT * FROM users LIMIT 1;
exit;
```

**Expected:** Should show user data, no errors

**If Error:** Database credentials might be wrong
- Double-check DB_USER, DB_PASSWORD, DB_NAME in Application Manager
- Make sure user has permissions on database

---

### Step 4: Check Application Logs

**Location:** cPanel → Node.js Application Manager → View Logs

**Look for:**
```
✓ [✅ EMAIL] Email service initialized
✓ Backend running on http://localhost:5000
✓ Connected to database

✗ Error: Cannot find module
✗ ENOTFOUND db_host
✗ Error: connect EACCES
```

**If you see errors:**
1. Note the exact error message
2. Go back to Step 1 or Step 2
3. Fix the issue listed in the error

---

### Step 5: Test Health Endpoint

**In any terminal or browser:**

```bash
curl -X GET https://oes.freshmilkstraightfromsource.com/api/health
```

**Expected Response:**
```json
{"status":"ok","message":"API and DB are reachable"}
```

**If Still 503:**
- Application crashed after restart
- Check logs again for errors
- Go to Step 1 and restart application
- Wait 1 minute for full startup

---

### Step 6: Check Node.js Installation

**In cPanel → Node.js Application Manager:**

1. Check Node.js version
2. Should be v18.x or higher (v20+ preferred)
3. If old version, click **"Update"**
4. Restart application after update

---

## Database Schema Check

**If you get "Unknown column" errors after login:**

The password reset columns need to be added. Run in cPanel → phpMyAdmin:

```sql
USE oes_database;

-- Check if columns exist:
DESCRIBE users;

-- Should show: reset_token, reset_token_expires

-- If NOT showing, add them:
ALTER TABLE users ADD COLUMN reset_token VARCHAR(255) NULL;
ALTER TABLE users ADD COLUMN reset_token_expires TIMESTAMP NULL;
```

---

## Session Directory Check

**In cPanel → Terminal:**

```bash
# Navigate to your application directory
cd /home/username/public_html/oes-backend

# Check if sessions directory exists
ls -la | grep sessions

# If NOT shown, create it:
mkdir -p sessions
chmod 755 sessions
chmod 755 .

# Restart application in cPanel
```

---

## Email Configuration (Optional)

If password reset emails not sending:

### Gmail Setup (Easiest):
1. Go to: https://myaccount.google.com/apppasswords
2. Select: Mail + Windows Computer
3. Copy the 16-character password
4. In cPanel Application Manager, set:
   ```
   EMAIL_SERVICE = gmail
   EMAIL_USER = your-email@gmail.com
   EMAIL_PASSWORD = (paste 16-char password)
   ```
5. Restart application

### Outlook Setup:
```
EMAIL_SERVICE = outlook
EMAIL_USER = your-outlook-email@outlook.com
EMAIL_PASSWORD = your-outlook-password
```

### Custom SMTP:
```
EMAIL_SERVICE = custom
SMTP_HOST = mail.yourdomain.com
SMTP_PORT = 587
SMTP_SECURE = false
EMAIL_USER = your-email-user
EMAIL_PASSWORD = your-email-password
```

---

## Still Getting 503?

### Check Application Process:

**In Terminal (SSH):**

```bash
# Show running Node processes
ps aux | grep node

# Should show something like:
# /usr/local/bin/node /path/to/app/src/server.js

# If nothing shown, application is not running
# Go back to Step 1 and restart in Application Manager
```

### Check Port Accessibility:

```bash
# Check if port 5000 is listening
netstat -tulpn | grep 5000

# Or: (if netstat not available)
ss -tulpn | grep 5000

# Should show: LISTEN on 127.0.0.1:5000
```

### Restart Everything:

1. **Stop** application in cPanel Panel (App Manager)
2. **Wait 10 seconds**
3. **Start** application
4. **Wait 30 seconds** for full startup
5. **Refresh** website in browser (Ctrl+F5 for hard refresh)

---

## Manual Recovery (If All Else Fails)

**In cPanel Terminal:**

```bash
# Navigate to backend directory
cd /home/username/public_html/oes-backend

# Kill any existing node processes
pkill -f "node src/server.js"

# Clear old sessions
rm -rf sessions/*
mkdir -p sessions

# Verify npm dependencies installed
npm install

# Start application manually (for testing):
npm start

# You should see:
# ✅ SESSION File-based session store configured
# ✅ CORS Allowing requests from: https://oes.freshmilkstraightfromsource.com  
# ✅ EMAIL Email service initialized (or ⚠️ if not configured)
# Backend running on http://localhost:5000

# Press Ctrl+C to stop
# Then restart via cPanel Application Manager
```

---

## Verification Checklist

Before contacting support, verify:

- [ ] Application Manager shows status: **Running** (green)
- [ ] All environment variables set (see Step 2)
- [ ] Database connection works (see Step 3)
- [ ] `/api/health` endpoint responds (see Step 5)
- [ ] Node.js version is v18+ (see Step 6)
- [ ] Sessions directory exists and writable (see Session Directory Check)
- [ ] Database has reset_token columns (see Database Schema Check)
- [ ] Application logs show no errors (see Step 4)

---

## Still Need Help?

Provide these details:

1. **Application Manager Logs** - Copy full error message
2. **MySQL Connection Status** - Can you connect in phpMyAdmin?
3. **Environment Variables** - Screenshot all variable names (not values for security)
4. **Node.js Version** - Check in Application Manager
5. **Error in Browser** - Full error message from browser console (F12)

