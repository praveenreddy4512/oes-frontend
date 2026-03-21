# Frontend JWT Testing Guide

## Overview
This guide demonstrates how to test JWT authentication and tampering detection from the frontend.

## Prerequisites
- Application running at `http://localhost:5173` (Vite dev server)
- Backend running at `http://localhost:5000`
- Firefox or Chrome with Developer Tools open
- Access to [jwt.io](https://jwt.io) for token inspection

---

## Test 1: Verify Token Storage on Login

### Steps:
1. Open browser DevTools (F12)
2. Go to **Application** → **Local Storage** → `http://localhost:5173`
3. Open LoginPage at `http://localhost:5173/login`
4. Login with credentials:
   - **Username:** `student1`
   - **Password:** `student123`
5. Check Local Storage for `jwtToken` key

### Expected Result:
```
Key: jwtToken
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwi...
```

A three-part token (Header.Payload.Signature) should appear in Local Storage.

### What It Means:
✅ Token is properly extracted from login response  
✅ Token is stored in localStorage for future API calls  
✅ Frontend JWT integration is working

---

## Test 2: Inspect Token Structure

### Steps:
1. Copy the token value from Local Storage
2. Go to [jwt.io](https://jwt.io)
3. Paste token in **Encoded** section (left side)
4. Review decoded Payload (right side)

### Expected Decoded Payload:
```json
{
  "id": 1,
  "username": "student1",
  "role": "student",
  "email": "student1@example.com",
  "iat": 1710000000,
  "exp": 1710086400,
  "iss": "oes-backend"
}
```

### What to Verify:
- ✅ `id`: Student's database ID
- ✅ `username`: Matches login username
- ✅ `role`: "student" (authority level)
- ✅ `email`: Student's email address
- ✅ `exp`: Unix timestamp approximately 24 hours from now
- ✅ `iss`: "oes-backend" (issuer claim)

### Security Feature:
The **Signature** section at bottom of jwt.io shows the HMAC-SHA256 hash. Even if you modify the payload, the signature won't match—server verification will fail.

---

## Test 3: Verify Token in API Requests

### Steps:

#### 3a. Monitor Network Requests (Recommended Method)
1. Open DevTools (F12)
2. Go to **Network** tab
3. Login and navigate to a page that makes API calls
4. Click on any API request (e.g., `/api/exams`, `/api/submissions`)
5. Go to **Request Headers** section
6. Look for `Authorization: Bearer eyJhb...`

#### 3b. Programmatic Verification
1. Open DevTools **Console**
2. Run:
   ```javascript
   // Get stored token
   const token = localStorage.getItem('jwtToken');
   console.log('Token:', token);
   console.log('Token parts:', token.split('.').length); // Should be 3
   ```

### Expected Result:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwi...
```

Every API request (GET, POST, PUT, DELETE) should include the token in the Authorization header with `Bearer ` prefix.

### What It Means:
✅ Frontend is automatically adding token to all API calls  
✅ Middleware will verify signature on backend  
✅ Unauthorized requests without token will be rejected

---

## Test 4: Token Tampering Detection (Most Important)

### CRITICAL Security Test - Verify Tampering is Detected

#### Step 1: Get Valid Token
```javascript
// In DevTools Console:
const validToken = localStorage.getItem('jwtToken');
console.log('Valid token:', validToken);
```

#### Step 2: Inspect Token at jwt.io
1. Copy the token
2. Go to [jwt.io](https://jwt.io)
3. Paste in **Encoded** field
4. In the **Payload** (left side), modify:
   - Change `"role": "student"` → `"role": "admin"`
   - OR Change `"id": 1` → `"id": 2`
5. Copy the modified **Encoded** token (right side)

#### Step 3: Store Tampered Token
```javascript
// In DevTools Console:
const tamperedToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Miw..."; // Modified token
localStorage.setItem('jwtToken', tamperedToken);
```

#### Step 4: Make API Request with Tampered Token
```javascript
// In DevTools Console:
const response = await fetch('http://localhost:5000/api/exams', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${tamperedToken}`,
    'Content-Type': 'application/json'
  },
  credentials: 'include'
});

const data = await response.json();
console.log('Status:', response.status);
console.log('Response:', data);
```

### Expected Result - REJECTION:
```
Status: 401
Response: {
  "error": "Invalid or expired token"
}
```

**The request MUST fail with 401 Unauthorized.**

### Why This Works:
1. Server has `JWT_SECRET` hardcoded
2. When token is modified, payload changes
3. Server verifies: `HMAC-SHA256(Header.Payload) === Signature`
4. Since payload changed but signature didn't, verification fails
5. Server returns 401 and rejects the request

### Security Implications:
✅ **Tampering is impossible** - Modified tokens are always rejected  
✅ **No privilege escalation** - Even modifying role fails  
✅ **Access control enforced** - Even changing user ID fails  
✅ **HMAC signature is computationally verified** - Can't be forged without the secret

---

## Test 5: IDOR Protection with JWT

### Scenario: Student Tries to Access Another Student's Submission

#### Step 1: Student 1 Login
1. Clear localStorage: `localStorage.clear()`
2. Login as `student1 / student123`
3. Get token: `const student1Token = localStorage.getItem('jwtToken')`

#### Step 2: Get Student 1's Submission ID
1. Navigate to **Student Exams** or **My Results**
2. Open DevTools Network tab
3. Click to view a submission
4. Find API request to `/api/submissions/:id`
5. Note the `id` (e.g., `5`)

#### Step 3: Try to Access Student 2's Submission
```javascript
// In DevTools Console:
const student2SubmissionId = 10; // Different submission (owned by student2)

const response = await fetch(`http://localhost:5000/api/submissions/${student2SubmissionId}`, {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${student1Token}`,
    'Content-Type': 'application/json'
  },
  credentials: 'include'
});

console.log('Status:', response.status);
const data = await response.json();
console.log('Response:', data);
```

### Expected Result - BLOCKED:
```
Status: 403
Response: {
  "error": "Access denied"
}
```

### Server Logs Should Show:
```
[SECURITY] IDOR ATTEMPT BLOCKED: 
User ID: 1 (student1)
Role: student
Attempted Resource: submission #10
Owner: user #2
Timestamp: 2024-03-20T10:30:45Z
```

### What This Verifies:
✅ Students cannot access other students' submissions  
✅ Server checks resource ownership before returning data  
✅ Suspicious access attempts are logged  
✅ Role-based restrictions are enforced

---

## Test 6: Role-Based Access Control

### Test Student Access to Admin Routes

#### Setup:
1. Login as `student1`
2. Get token: `const studentToken = localStorage.getItem('jwtToken')`

#### Test Admin Endpoint:
```javascript
// In DevTools Console:
const response = await fetch('http://localhost:5000/api/users', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${studentToken}`,
    'Content-Type': 'application/json'
  },
  credentials: 'include'
});

console.log('Status:', response.status);
const data = await response.json();
console.log('Response:', data);
```

### Expected Result:
```
Status: 403
Response: {
  "error": "Access denied - insufficient permissions"
}
```

### Then Test with Admin:
1. Clear localStorage: `localStorage.clear()`
2. Login as `admin1` (if available)
3. Repeat the test

### Expected Result with Admin:
```
Status: 200
Response: [
  { id: 1, username: "student1", role: "student", email: "..." },
  { id: 2, username: "professor1", role: "professor", email: "..." },
  ...
]
```

### What This Verifies:
✅ Role is embedded in token and checked by server  
✅ Students are denied access to admin endpoints  
✅ Admins can access protected admin routes  
✅ Middleware enforces role-based authorization

---

## Test 7: Token Expiration (Advanced)

### Note: Testing token expiration requires waiting 24 hours or modifying the server timeout.

#### To Simulate Expiration:
1. Modify `/backend/src/middleware/auth.js` temporarily:
   ```javascript
   const TOKEN_EXPIRY = '10s';  // Change from '24h' to 10 seconds
   ```

2. Restart backend server
3. Login again to get a token with 10-second expiration
4. Wait 15 seconds
5. Try to make an API request

### Expected Result:
```
Status: 401
Response: {
  "error": "Invalid or expired token"
}
```

### Restore Original Timeout:
```javascript
const TOKEN_EXPIRY = '24h';  // Restore original
```

---

## Troubleshooting

### Problem: Token not appearing in Local Storage
**Solution:**
- Check browser console for errors
- Verify login response includes `token` field
- Ensure `setToken()` function is being called in LoginPage

### Problem: Token not in Authorization Header
**Solution:**
- Verify `getToken()` returns the stored token
- Check `apiCall()` function includes the Authorization header
- Monitor Network tab to see request headers

### Problem: "Invalid or expired token" on valid token
**Solution:**
- Check server logs for error details
- Verify `JWT_SECRET` matches between backend instances
- Ensure token hasn't expired (check `exp` claim)
- Clear localStorage and re-login

### Problem: IDOR protection not blocking access
**Solution:**
- Verify submission exists and is owned by different user
- Check server logs show IDOR check occurring
- Ensure `preventIDOR()` middleware is applied to route
- Verify `getStudentSubmissionUser()` function works correctly

---

## Security Checklist

After completing all tests:

- ✅ Token is generated on login
- ✅ Token is stored in localStorage  
- ✅ Token is included in Authorization header
- ✅ Tampered tokens are rejected (401)
- ✅ Role changes in token are detected (401)
- ✅ IDOR attacks are blocked (403)
- ✅ Insufficient permissions are rejected (403)
- ✅ Token structure matches expected payload
- ✅ HMAC-SHA256 signature prevents forgery
- ✅ Server logs record security events

---

## Quick Reference: Token Parts

Every JWT has 3 parts separated by dots (`.`):

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.
eyJpZCI6MSwicm9sZSI6InN0dWRlbnQifQ.
TJVA95OrM7E2cBab30RMHrHDcEfxjoYZgeFONFh7HgQ

1. Header (Base64-encoded)
   {
     "alg": "HS256",
     "typ": "JWT"
   }

2. Payload (Base64-encoded)
   {
     "id": 1,
     "username": "student1",
     "role": "student",
     "exp": 1710086400
   }

3. Signature (HMAC-SHA256)
   HMAC-SHA256(header.payload, secret)
```

The signature is computed server-side. If even one character of the payload changes, the signature won't match.

---

## API Endpoints Protected by JWT

The following endpoints now require a valid JWT token in the Authorization header:

**Exams Routes:**
- `GET /api/exams` - List all exams
- `GET /api/exams/:id` - Get specific exam
- `POST /api/exams` - Create exam (professors/admins)
- `PUT /api/exams/:id` - Update exam (professors/admins)
- `DELETE /api/exams/:id` - Delete exam (professors/admins)

**Submissions Routes:**
- `GET /api/submissions` - List submissions
- `GET /api/submissions/:id` - Get submission (IDOR protected)
- `POST /api/submissions` - Create submission
- `PUT /api/submissions/:id/submit` - Submit exam

**Results Routes:**
- `GET /api/results` - List results
- `GET /api/results/:id` - Get specific result

---

## Testing Timeline

Recommended testing order:
1. **Test 1-3** (Token storage and requests) - 5 minutes
2. **Test 4** (Tampering) - 10 minutes  
3. **Test 5** (IDOR) - 10 minutes
4. **Test 6** (Role-based access) - 5 minutes
5. **Test 7** (Expiration) - Optional, 15 minutes

**Total: 30-45 minutes for comprehensive security testing**

---

## Success Indicators

Your JWT implementation is secure if:
1. ✅ Every API request includes Authorization header
2. ✅ Modified tokens are rejected immediately (401)
3. ✅ Cross-user access is blocked (403)
4. ✅ Role changes are detected and denied (401)
5. ✅ Server logs show security events
6. ✅ Token expires after 24 hours
7. ✅ HMAC signature prevents any tampering

