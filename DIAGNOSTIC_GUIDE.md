# 🔍 STEP-BY-STEP DIAGNOSTIC GUIDE

## ⚠️ CRITICAL: Did You Restart cPanel?

**The most likely issue:** The application on cPanel hasn't been restarted yet. The **old buggy code is still running**.

---

## 🚀 Step 1: SSH into cPanel and Restart the Application

```bash
# Connect via SSH
ssh your-cpanel-username@oes.freshmilkstraightfromsource.com

# Navigate to the application
cd /home/freshmil_oesuser/public_html/oes-backend

# Pull the latest fixed code
git pull origin main

# Check that the fix is there
grep "requireRole('admin')" src/routes/groups.js

# You should see 8+ lines with correct syntax ✅
# If you see requireRole(['admin']) - the fix didn't pull!
```

Now restart the Node.js application. **Choose ONE option:**

### Option A: Using cPanel GUI (Easiest)
1. Log in to cPanel
2. Find "Node.js App Manager" or "Node.js Selector"
3. Select the "oes-backend" application
4. Click "RESTART"
5. Wait 30 seconds

### Option B: Using SSH Kill Command
```bash
# Still logged in via SSH from above
pkill node
sleep 2
npm start
# Wait for "Server running on port 5000" message
```

### Option C: Verify It Restarted
```bash
# Check the process is running
ps aux | grep node

# Should show the Node.js process running
```

---

## 🧪 Step 2: Get Your JWT Token

1. Open your browser
2. Go to **https://oes.frontend-drab.vercel.app**
3. Log in as **admin**
4. Open **DevTools (F12)**
5. Go to **Network** tab
6. Perform ANY action (like navigate to Users page)
7. Look for a request (any will have the token)
8. Click on the request
9. Look for **Request Headers** section
10. Find **Authorization** header
11. Copy the value (everything after "Bearer ")
    - Example: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

---

## 🧪 Step 3: Run the Detailed Test

```bash
# On your local machine, in the project directory
cd /home/praveen/Desktop/projects/cyberproject/backend

# Run the test with your JWT token
node test-group-assignment-detailed.js

# Paste your JWT token when prompted
# The script will show EXACTLY what error you're getting
```

---

## 📊 Expected Results

### If You Get 403 Forbidden:
- **Problem:** Old code still running or token is invalid
- **Solution:** 
  1. Check if cPanel actually restarted
  2. Clear browser cache and get a fresh token
  3. Make sure you're logged in as admin

### If You Get 200 OK with `"added": 1`:
- **Problem Fixed!** Students ARE being added now
- **Next:** Check phpMyAdmin to verify they're in the database

### If You Get 200 OK but `"added": 0`:
- **Problem:** Student wasn't found or already in group
- **Check:** 
  1. Is the student role really `'student'` (lowercase)?
  2. Run: `SELECT * FROM users WHERE role LIKE '%student%';` in phpMyAdmin

---

## 🗂️ Debug Checklist

After restart, test these in order:

### 1. API Authentication
```bash
node test-group-assignment-detailed.js
# Choose: Continue through all tests
```

### 2. Database Verification
In **phpMyAdmin** → **SQL** tab:
```sql
-- Check if group_members table has any entries now
SELECT COUNT(*) as total_memberships FROM group_members;

-- Should show > 0 if students are being added
```

### 3. Frontend Test
1. Admin Panel → Users → **Create Student**
2. Enter: username = "test_$(date +%s)", password = "Test@1234"
3. **SELECT GROUPS** (pick 2-3)
4. Click **Create**
5. Open DevTools → Console
6. Look for: `[✅] Group X response:`
7. Check phpMyAdmin again

---

## ❓ Still Not Working?

If it's still failing after restart, the issue is different. Share:

1. **Error message from test script**
2. **cPanel server logs** (check `~/logs/error_log`)
3. **Node.js console output** from when application started
4. **Screenshot of DevTools Network tab** when creating a student

Then we can dig deeper.

---

## 🔧 Quick Reference

**Files Modified:**
- `backend/src/routes/groups.js` - Fixed 8 endpoints
- Commit: `0a13cea`

**What Changed:**
```javascript
// OLD (BROKEN):
requireRole(['admin'])

// NEW (FIXED):
requireRole('admin')
```

**Why It Matters:**
The `requireRole()` function uses rest parameters (`...allowedRoles`), expecting individual arguments like:
- `requireRole('admin')`
- `requireRole('admin', 'professor')`

Not arrays like:
- `requireRole(['admin'])` ← WRONG

This caused ALL group endpoints to return 403, blocking all group operations.

