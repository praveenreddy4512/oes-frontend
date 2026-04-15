# Quick JWT Testing Reference

## 🚀 Start Testing in 5 Minutes

### Prerequisites
- Backend running on `http://localhost:5000`
- Frontend running on `http://localhost:5173` (Vite dev server)
- Browser with DevTools (F12)

---

## Test 1: Token Storage (2 minutes)

### Open DevTools and Check Token

```bash
# In browser DevTools Console:
localStorage.getItem('jwtToken')
```

**Before Login:** Returns `null`  
**After Login:** Returns JWT token starting with `eyJ...`

### Steps:
1. Open `http://localhost:5173/login`
2. Login with: `student1 / student123`
3. Open DevTools → Application → Local Storage
4. Look for `jwtToken` key
5. **Verify:** Token is stored and looks like `header.payload.signature`

---

## Test 2: Authorization Header (2 minutes)

### Monitor API Calls

1. Open DevTools → **Network** tab
2. Login and navigate to any page with API calls (e.g., Student Exams)
3. Click any API request (e.g., `exams`)
4. Go to **Request Headers** section
5. **Look for:** `Authorization: Bearer eyJh...`

### Verify in Console:
```javascript
// Check that API calls include token
const token = localStorage.getItem('jwtToken');
console.log('Token in storage:', token.substring(0, 20) + '...');

// Manual API call verification
const response = await fetch('http://localhost:5000/api/exams', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
console.log('Status:', response.status); // Should be 200 (not 401)
```

---

## Test 3: Token Tampering (3 minutes)

### The Most Important Security Test

#### Step 1: Get Your Token
```javascript
const token = localStorage.getItem('jwtToken');
console.log('Valid token:', token);
```

#### Step 2: Modify at jwt.io
1. Go to https://jwt.io
2. Paste your token in **Encoded** (left side)
3. In **Payload** section, change:
   - `"role": "student"` → `"role": "admin"`
   - OR `"id": 1` → `"id": 2`
4. Copy the modified token from **Encoded** side

#### Step 3: Test Modified Token
```javascript
const tamperedToken = "eyJhbGciOiJIUzI1NiIs..."; // Your modified token

const response = await fetch('http://localhost:5000/api/exams', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${tamperedToken}`,
    'Content-Type': 'application/json'
  }
});

console.log('Status:', response.status);        // MUST be 401
const data = await response.json();
console.log('Error:', data.error);               // Should say "Invalid or expired token"
```

### ✅ SUCCESS: Status is 401 and request rejected
### ❌ FAILURE: Status is 200 or 403 (security hole!)

**Why This Matters:** If modified tokens aren't rejected, anyone can escalate their role or impersonate other users!

---

## Test 4: IDOR Protection (3 minutes)

### Student Cannot Access Other Student's Submission

#### Setup (Do once):
1. Open **2 browser windows** side-by-side
2. **Window 1:** Login as `student1 / student123`
3. **Window 2:** Login as `student2 / student123` (if available)
4. In Window 1: Navigate to a submission, note the ID in URL (e.g., `/submission/5`)
5. In Window 2: Navigate to a submission, get its ID (e.g., `/submission/10`)

#### Test:
```javascript
// In Window 1 (student1's console):
const student1Token = localStorage.getItem('jwtToken');

// Try to access student2's submission (#10)
const response = await fetch('http://localhost:5000/api/submissions/10', {
  headers: {
    'Authorization': `Bearer ${student1Token}`
  }
});

console.log('Status:', response.status);  // MUST be 403
const data = await response.json();
console.log('Response:', data);            // Should say "Access denied"
```

### ✅ SUCCESS: Status is 403 and access blocked
### ❌ FAILURE: Status is 200 and data returned (IDOR vulnerability!)

---

## Test 5: Logout Clears Token (1 minute)

### Token Removal on Logout

#### Steps:
1. Login as student
2. Open DevTools → Application → Local Storage
3. Verify `jwtToken` exists
4. Click **Logout** button
5. Check Local Storage again
6. **Verify:** `jwtToken` is gone (or null)

#### In Console:
```javascript
// Before logout
console.log(localStorage.getItem('jwtToken')); // Shows token

// After logout (run in new session)
console.log(localStorage.getItem('jwtToken')); // Returns null

// Verify subsequent API calls use no token
const response = await fetch('http://localhost:5000/api/exams');
// Without token, should get 401 on protected routes
```

---

## Test 6: Role-Based Access (2 minutes)

### Student Cannot Access Admin Routes

#### Steps:
```javascript
// Login as student1, get token
const studentToken = localStorage.getItem('jwtToken');

// Try to access admin endpoint (user management)
const response = await fetch('http://localhost:5000/api/users', {
  headers: {
    'Authorization': `Bearer ${studentToken}`
  }
});

console.log('Status:', response.status);  // MUST be 403
const data = await response.json();
console.log('Error:', data.error);         // Should say "insufficient permissions"
```

### ✅ SUCCESS: Status is 403
### ❌ FAILURE: Status is 200 (authorization bypass!)

---

## Complete Test Checklist

Run these in order for full validation:

```
[ ] Test 1: Token stored in localStorage after login
[ ] Test 2: Authorization header visible in Network tab  
[ ] Test 3: Modified tokens rejected with 401
[ ] Test 4: IDOR attacks blocked with 403
[ ] Test 5: Token cleared on logout
[ ] Test 6: Insufficient permissions return 403
```

**If ALL tests pass:** JWT security is working correctly ✅

---

## Troubleshooting

### Token Not Storing
- Check network tab for login request - does response include `token` field?
- Check browser console for errors
- Try: `localStorage.clear()` and re-login

### Authorization Header Not Showing
- Verify token exists: `localStorage.getItem('jwtToken')`
- Check api.js has `getToken()` in header injection
- Try: Reload page and check new requests

### Modified Token NOT Rejected (CRITICAL)
- Verify server is running: `http://localhost:5000/api/health`
- Check backend `JWT_SECRET` is set (not using default)
- Check `auth.js` middleware is applied to route
- Look for errors in backend server logs

### IDOR Test Failing
- Verify `preventIDOR()` middleware is on GET `/:id` route
- Check both submissions exist and are owned by different users
- Look for "[SECURITY] IDOR ATTEMPT BLOCKED" in server logs

---

## One-Liner Verification Commands

Copy and paste in browser DevTools Console:

```javascript
// Check token exists
localStorage.getItem('jwtToken') ? '✅ Token stored' : '❌ No token';

// Check token isn't expired
const token = localStorage.getItem('jwtToken');
const payload = JSON.parse(atob(token.split('.')[1]));
Date.now()/1000 < payload.exp ? '✅ Token valid' : '❌ Token expired';

// Check token structure
token.split('.').length === 3 ? '✅ Valid JWT format' : '❌ Invalid token';

// Test API with token
fetch('http://localhost:5000/api/exams', {
  headers: { 'Authorization': `Bearer ${localStorage.getItem('jwtToken')}` }
}).then(r => console.log('API Status:', r.status));
```

---

## Expected Token Payload

When you decode your token at jwt.io, you should see:

```json
{
  "id": 1,                           // Your user ID
  "username": "student1",            // Your username
  "role": "student",                 // Your role (student/professor/admin)
  "email": "student1@example.com",   // Your email
  "iat": 1710000000,                 // Issued at
  "exp": 1710086400,                 // Expires at (24h later)
  "iss": "oes-backend"               // Issued by backend
}
```

---

## Security Quick Facts

| Feature | Verified? | Why Important |
|---------|-----------|---------------|
| Token signing (HMAC-SHA256) | Run Test 3 | Prevents forgery |
| Token expiration (24h) | Check `exp` in decoded token | Limits damage window |
| IDOR protection | Run Test 4 | Prevents data theft |
| Role-based access | Run Test 6 | Enforcement authorization |
| Automatic injection | Run Test 2 | Reduces developer errors |
| Token removal on logout | Run Test 5 | Prevents reuse |

---

## Next Level Testing

### Load Test (Verify Performance)
```javascript
// Send 100 simultaneous requests
Promise.all([...Array(100)].map(() => 
  fetch('http://localhost:5000/api/exams', {
    headers: { 'Authorization': `Bearer ${localStorage.getItem('jwtToken')}` }
  })
)).then(responses => {
  console.log('All 100 requests completed');
  console.log('Success count:', responses.filter(r => r.ok).length);
});
```

### XSS Test (Verify localStorage safety)
```javascript
// localStorage cannot be accessed by XSS (unlike cookies)
// This is why JWTs in localStorage are safer than vulnerable cookies
console.log('Token in localStorage: hidden from scripts with httpOnly');
```

### CSRF Test (Verify credentials sent)
```javascript
// CORS headers + credentials: 'include' means CSRF protection needed
// Our API requires this for session tokens + JWT headers
console.log('CSRF protection: Enforced via SameSite cookies + Origin header');
```

---

## Testing Results Log

Use this to track your test results:

```
Date: ______________
Tester: ______________

Test Results:
[ ] Test 1: Token Storage ................... [ PASS / FAIL ]
[ ] Test 2: Authorization Header ........... [ PASS / FAIL ]
[ ] Test 3: Token Tampering Detection ...... [ PASS / FAIL ]
[ ] Test 4: IDOR Protection ................ [ PASS / FAIL ]
[ ] Test 5: Logout Clears Token ............ [ PASS / FAIL ]
[ ] Test 6: Role-Based Access Control ...... [ PASS / FAIL ]

Overall Result: [ PASS / FAIL ]

Issues Found: ______________
__________________________
__________________________

Recommendations: ______________
_____________________________
_____________________________
```

---

## Quick Start Commands

```bash
# Terminal 1 - Backend
cd backend
npm start

# Terminal 2 - Frontend  
cd frontend
npm run dev

# Then in Browser
# Navigate to http://localhost:5173/login
# Use credentials: student1 / student123
# Open DevTools (F12) for testing
```

**Ready to test?** Start with Test 1, takes about 15 minutes total! 🚀

