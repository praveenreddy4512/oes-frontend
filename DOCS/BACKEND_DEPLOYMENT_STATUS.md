# Backend URL: https://oes.freshmilkstraightfromsource.com/

**Status: 503 Service Unavailable**  
**Server: LiteSpeed**  
**Cause: Node.js application not running in cPanel**

---

## Immediate Troubleshooting

### Step 1: Open cPanel and Go to Node.js Application Manager

**Path:** cPanel Dashboard → Node.js Application Manager (or "Node.js Hosting Manager")

---

### Step 2: Look for Your Application

You should see a list with one app. Find the one that points to:
```
/home/freshmil_oesuser/public_html/oes-backend
```
or similar path with "oes-backend"

---

### Step 3: Check Application Status

**What do you see?**

#### Option A: 🟢 Status Shows "Running" (Green)
```
✓ This means Node.js IS running
→ But the 503 might be from before restart
→ Try: Clear browser cache (Ctrl+Shift+Delete) and refresh (Ctrl+F5)
```

#### Option B: 🔴 Status Shows "Stopped" (Red/Grey)
```
✗ This means application NOT started
→ Click "Start" or "Restart" button
→ Wait 45 seconds
→ Refresh your browser
```

#### Option C: 🟡 Status Shows "Error"
```
✗ Application crashed on startup
→ Click "View Logs" 
→ Share the ERROR message with me
→ Likely causes:
   - npm modules not installed
   - Database connection failed
   - Missing environment variables
```

---

## What to Check in App Manager

### 1. Application Path
Should point to backend folder:
```
/home/freshmil_oesuser/public_html/oes-backend
```
or: `/home/username/public_html/oes-backend`

### 2. Application URL
Should show:
```
https://oes.freshmilkstraightfromsource.com
```

### 3. Node.js Version
Should show v18.x, v20.x, or v22.x (NOT old versions)

### 4. Environment Variables
Should show configured:
```
✓ PORT=5000
✓ DB_HOST=localhost
✓ DB_USER=freshmil_oesuser
✓ DB_PASSWORD=Reddys4512@
✓ DB_NAME=freshmil_oes
✓ EMAIL_SERVICE=gmail
✓ EMAIL_USER=thetelugugamer296@gmail.com
✓ EMAIL_PASSWORD=qmzs maum feyv xrif
```

---

## If Application Shows "Stopped"

### Quick Fix:
1. Click **"Restart"** button in App Manager
2. Wait 45 seconds (first start takes longer)
3. Refresh your browser: `Ctrl+F5`

---

## If Application Shows "Error"

### Check Logs:
1. In App Manager, click **"View Logs"** or **"Open Logs"**
2. Look for RED/ERROR messages
3. Screenshot or copy the error message

### Common Errors & Fixes:

**Error: "Cannot find module 'nodemailer'"**
```bash
# In cPanel Terminal, run:
cd /home/freshmil_oesuser/public_html/oes-backend
npm install
```

**Error: "ECONNREFUSED 127.0.0.1:3306"**
```
MySQL not running or wrong host
→ Contact cPanel support to verify MySQL is running
→ Or check if DB_HOST should be something other than 'localhost'
```

**Error: "ER_ACCESS_DENIED_FOR_USER"**
```
Database credentials wrong
→ Verify in App Manager:
   DB_USER = freshmil_oesuser ✓ (matches yours)
   DB_PASSWORD = Reddys4512@ ✓ (matches yours)
   DB_NAME = freshmil_oes ✓ (matches yours)
```

**Error: "ENOENT: no such file or directory, 'sessions'"**
```bash
# In cPanel Terminal, run:
cd /home/freshmil_oesuser/public_html/oes-backend
mkdir -p sessions
chmod 755 sessions
chmod 755 .
```

---

## Manual Test in cPanel Terminal

If you want to test without App Manager:

```bash
# Navigate to backend
cd /home/freshmil_oesuser/public_html/oes-backend

# Install dependencies
npm install

# Test if it starts
npm start
```

**Look for:**
```
✅ SESSION File-based session store configured
✅ CORS Allowing requests from: https://oes.freshmilkstraightfromsource.com
✅ EMAIL Email service initialized
Backend running on http://localhost:5000
```

If you see this, app is working! Press `Ctrl+C` to stop, then restart via App Manager.

---

## Test the Backend

Once application is running:

### Test 1: Health Endpoint
```bash
curl -X GET https://oes.freshmilkstraightfromsource.com/api/health
```

**Should return:**
```json
{"status":"ok","message":"API and DB are reachable"}
```

### Test 2: Login (in browser)
Navigate to:
```
https://oes.freshmilkstraightfromsource.com/
```

Should show login page with:
- OES Logo
- Username/Password fields
- "Forgot Password?" link ✓ (new!)
- Demo credentials

---

## Summary

**Your backend URL:** `https://oes.freshmilkstraightfromsource.com/`

**Current problem:** Application not running in cPanel

**Solution:**
1. Open cPanel → Node.js Application Manager
2. Find your app (oes-backend) 
3. Click "Restart" if showing "Stopped"
4. Wait 45 seconds
5. Refresh browser

**Tell me:**
- What status does App Manager show?
- After restart, does it work?
- If error, what's the error message?

