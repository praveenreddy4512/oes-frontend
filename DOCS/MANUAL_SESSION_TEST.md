# Manual Session Testing Guide

## Test Environment
- **Backend URL**: https://oes.freshmilkstraightfromsource.com
- **Test User**: student1 / student123

---

## Test 1: Login & Verify Set-Cookie Header

**Test Step:**
```bash
curl -i -X POST "https://oes.freshmilkstraightfromsource.com/api/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"student1","password":"student123"}'
```

**Expected Result:**
- Status: `HTTP/2 200`
- Should see header: `set-cookie: connect.sid=...`
- Response includes: `"sessionCreated":true`

**What it tests:** Set-Cookie header is being sent ✅

---

## Test 2: Use Session Cookie to Access Protected Route

**Test Step:**
```bash
# Save cookie from login
curl -c /tmp/cookies.txt -X POST "https://oes.freshmilkstraightfromsource.com/api/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"student1","password":"student123"}' > /dev/null

# Use cookie to call protected endpoint
curl -i -b /tmp/cookies.txt "https://oes.freshmilkstraightfromsource.com/api/auth/me"
```

**Expected Result:**
- Status: `HTTP/2 200`
- Response shows user data:
  ```json
  {
    "user": {
      "id": 1,
      "username": "student1",
      "role": "student",
      "email": "student1@example.com"
    },
    "session": {
      "id": "...",
      "createdAt": "...",
      "expiresAt": "..."
    }
  }
  ```

**What it tests:** Session persists across requests ✅

---

## Test 3: Access Without Cookie

**Test Step:**
```bash
# Try to access protected route WITHOUT a valid cookie
curl -i "https://oes.freshmilkstraightfromsource.com/api/auth/me"
```

**Expected Result:**
- Status: `HTTP/2 401`
- Response: `{"message":"Not authenticated. Please login."}`

**What it tests:** Protected routes require authentication ✅

---

## Test 4: Session Logout

**Test Step:**
```bash
# Clear cookies first
rm -f /tmp/cookies.txt

# Login to get fresh session
curl -c /tmp/cookies.txt -X POST "https://oes.freshmilkstraightfromsource.com/api/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"student1","password":"student123"}' > /dev/null

# Verify session works
curl -i -b /tmp/cookies.txt "https://oes.freshmilkstraightfromsource.com/api/auth/me"

# Now logout
curl -i -b /tmp/cookies.txt -X POST "https://oes.freshmilkstraightfromsource.com/api/logout"

# Try to use the destroyed session
curl -i -b /tmp/cookies.txt "https://oes.freshmilkstraightfromsource.com/api/auth/me"
```

**Expected Results:**
1. **Auth API (before logout)**: `HTTP/2 200` + user data
2. **Logout**: `HTTP/2 200` + `{"message":"Logged out successfully"}`
3. **Auth API (after logout)**: `HTTP/2 401` + `{"message":"Not authenticated. Please login."}`

**What it tests:** Session destruction works correctly ✅

---

## Test 5: Session Hijacking (Educational)

**Test Step:**
```bash
# Student 1 logs in
curl -c /tmp/student1_cookies.txt -X POST "https://oes.freshmilkstraightfromsource.com/api/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"student1","password":"student123"}' > /dev/null

# Extract the session cookie value
COOKIE=$(grep connect.sid /tmp/student1_cookies.txt | awk '{print $NF}')
echo "Stolen Cookie: $COOKIE"

# Attacker uses the stolen cookie
curl -i -b "connect.sid=$COOKIE" "https://oes.freshmilkstraightfromsource.com/api/auth/me"
```

**Expected Result:**
- Attacker can impersonate student1
- Status: `HTTP/2 200`
- Returns student1's data
- **VULNERABILITY CONFIRMED**: Session can be hijacked if cookie is compromised

**What it tests:** Session hijacking vulnerability (for educational purposes) ⚠️

---

## Test 6: Browser Testing

### Open Browser Developer Tools:
1. Open browser and navigate to: `https://oes.freshmilkstraightfromsource.com`
2. Open **DevTools** (`F12` or `Ctrl+Shift+I`)
3. Go to **Application** tab > **Cookies**

### Test Login:
1. Log in with: `student1` / `student123`
2. Check **Cookies** section
3. Look for cookie named: `connect.sid`
4. **Verify properties:**
   - ✅ **HttpOnly**: Yes (prevents JavaScript access)
   - ✅ **Secure**: Yes (HTTPS only)
   - ✅ **SameSite**: Lax (CSRF protection)

### Test Session Persistence:
1. After login, refresh the page
2. You should still be logged in
3. Session data should be available

### Test Logout:
1. Click logout button
2. Cookie `connect.sid` should be deleted
3. Refresh page → should be logged out

---

## Security Flags Verification

Check for these security attributes on the `connect.sid` cookie:

| Flag | Status | Purpose |
|------|--------|---------|
| **HttpOnly** | ✅ | Prevents XSS attacks from stealing cookie |
| **Secure** | ✅ | Only sent over HTTPS |
| **SameSite=Lax** | ✅ | Prevents CSRF attacks |
| **Path=/** | ✅ | Available to all routes |
| **Expires** | ✅ | 24 hours from creation |

---

## Troubleshooting

### Problem: No Set-Cookie header
**Solution:**
- Verify `app.set('trust proxy', 1)` is in server.js (line 23)
- Verify `req.session.save()` is being called in login endpoint
- Restart Node.js: `pkill -9 -f "node.*server.js"`

### Problem: Cookie not persisting
**Solution:**
- Check sessions folder: `ls -la /home/freshmil/oes.freshmilkstraightfromsource.com/backend/sessions/`
- Verify FileStore is configured correctly
- Check `/tmp/cookies.txt` has valid cookie

### Problem: 401 on /api/auth/me with valid cookie
**Solution:**
- Clear cookies and re-login: `rm -f /tmp/cookies.txt`
- Verify cookie is being sent: `curl -v -b /tmp/cookies.txt ...`
- Check Node.js logs for errors

---

## Expected Test Results Summary

✅ **Test 1**: Set-Cookie header present  
✅ **Test 2**: Session persists (200 OK)  
✅ **Test 3**: No cookie = 401 Unauthorized  
✅ **Test 4**: Logout destroys session (401 after logout)  
✅ **Test 5**: Session hijacking possible (educational)  
✅ **Test 6**: Browser shows secure cookie flags  

**If all tests pass**: Your session system is fully functional! 🎉
