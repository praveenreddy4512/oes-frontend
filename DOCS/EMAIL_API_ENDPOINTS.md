# Email & Password Reset API Reference

## New API Endpoints

### 1. Password Reset

#### Forgot Password (Request Reset Email)
```http
POST /api/forgot-password
Content-Type: application/json

{
  "email": "user@example.com"
}
```

**Response (200):**
```json
{
  "message": "If email exists, a reset link has been sent"
}
```

**Note:** Response is always the same whether email exists or not (security)

---

#### Reset Password (Change Password with Token)
```http
POST /api/reset-password
Content-Type: application/json

{
  "token": "token-from-email-link",
  "newPassword": "newPassword123"
}
```

**Response (200):**
```json
{
  "message": "Password reset successfully"
}
```

**Error (400):**
```json
{
  "error": "Invalid or expired reset token"
}
```

**Requirements:**
- Token must be from the email link (expires in 1 hour)
- Password must be at least 6 characters

---

### 2. Exam Submission Notification

#### Submit Exam (Auto-sends Success Email)
```http
POST /api/submissions/:submission_id/submit
Content-Type: application/json
Authorization: Bearer <jwt_token>
```

**Response (200):**
```json
{
  "message": "Exam submitted",
  "total_questions": 50,
  "correct_answers": 42,
  "percentage": "84.00",
  "status": "completed"
}
```

**Automatic Actions:**
- ✅ Updates exam submission status
- ✅ Calculates score
- ✅ Creates result record
- ✅ **Sends success email to student** (non-blocking)

**Email Content Sent to Student:**
- Exam name
- Score and percentage
- Success confirmation

---

### 3. Exam Completion Notification (Professor)

#### Send Exam Completion Report
```http
POST /api/exams/:examId/send-completion-notification
Authorization: Bearer <jwt_token>
```

**Response (200):**
```json
{
  "message": "Exam completion notification sent",
  "stats": {
    "totalStudents": 30,
    "submittedCount": 28,
    "notSubmittedCount": 2,
    "averageScore": 72.50,
    "topScores": [
      {
        "studentName": "John Doe",
        "percentage": 95,
        "score": 95,
        "totalMarks": 100
      },
      {
        "studentName": "Jane Smith",
        "percentage": 92,
        "score": 92,
        "totalMarks": 100
      },
      {
        "studentName": "Bob Johnson",
        "percentage": 88,
        "score": 88,
        "totalMarks": 100
      }
    ]
  }
}
```

**Email Content Sent to Professor:**
- Exam name
- Total students assigned
- Number submitted vs not submitted
- Submission rate percentage
- Average score
- Top 3 performers with scores

**Note:** Called when exam time ends (can be from frontend or backend job)

---

## Frontend Implementation Examples

### Password Reset Flow

#### Step 1: Request Password Reset
```javascript
// User clicks "Forgot Password"
async function requestPasswordReset(email) {
  const response = await fetch('/api/forgot-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email })
  });
  
  const data = await response.json();
  console.log(data.message); // "If email exists, a reset link has been sent"
  
  // Show message to user: "Check your email for reset link"
}
```

#### Step 2: Process Reset Link (from email)
```javascript
// Extract token from URL: /reset-password?token=xxx
const params = new URLSearchParams(window.location.search);
const resetToken = params.get('token');

async function resetPassword(token, newPassword) {
  const response = await fetch('/api/reset-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      token: token,
      newPassword: newPassword 
    })
  });
  
  if (!response.ok) {
    const error = await response.json();
    console.error(error.error); // "Invalid or expired reset token"
    return false;
  }
  
  const data = await response.json();
  console.log(data.message); // "Password reset successfully"
  
  // Redirect to login page
  window.location = '/login';
  return true;
}
```

### Exam Submission

#### Auto-sends email on submit
```javascript
async function submitExam(submissionId) {
  const response = await fetch(`/api/submissions/${submissionId}/submit`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });
  
  const data = await response.json();
  // {
  //   "message": "Exam submitted",
  //   "percentage": "84.00",
  //   ...
  // }
  
  // Email is automatically sent to student
  // Show success message with score
  showSuccessMessage(`Your exam submitted! Score: ${data.percentage}%`);
}
```

### Exam Completion (Professor)

#### Trigger when exam time ends
```javascript
async function notifyProfessorExamComplete(examId) {
  const response = await fetch(`/api/exams/${examId}/send-completion-notification`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });
  
  const data = await response.json();
  // {
  //   "message": "Exam completion notification sent",
  //   "stats": { ... }
  // }
  
  // Show professor the stats on dashboard
  displayExamStats(data.stats);
  
  // Email is sent to professor with same info
}
```

---

## Email Content Examples

### Student Receives - Exam Submission Success
```
Subject: ✅ Exam Submitted Successfully - Mathematics Final Exam

Dear Student,

Your exam has been submitted successfully. Here are your results:

📊 Exam Title: Mathematics Final Exam
Score: 42/50
Percentage: 84%

Your submission has been recorded in the system. You can view your detailed results in your exam portal.

---
This is an automated email from Online Exam System.
```

### Professor Receives - Exam Completion Report
```
Subject: 📊 Exam Completed - Mathematics Final Exam - Results Summary

Dear Professor,

Your exam "Mathematics Final Exam" has concluded. Here is the summary of submissions:

Total Students: 30
Submitted: 28 ✅
Not Submitted: 2 ❌
Submission Rate: 93%
Average Score: 72.50%

Top Performers:
1. John Doe: 95% (95/100)
2. Jane Smith: 92% (92/100)
3. Bob Johnson: 88% (88/100)

Login to your professor dashboard to view detailed analysis and student results.

---
This is an automated email from Online Exam System.
```

### User Receives - Password Reset
```
Subject: 🔐 Password Reset Request

Hello User,

We received a request to reset your password. Click the button below to proceed:

[RESET YOUR PASSWORD BUTTON]

Or copy and paste this link:
https://yourapp.com/reset-password?token=...

⚠️ Security Note: This link will expire in 1 hour. 
If you did not request a password reset, please ignore this email. 
Your account remains secure.

---
This is an automated email from Online Exam System.
```

---

## Database Schema Changes

### Users Table Updates
```sql
ALTER TABLE users ADD COLUMN reset_token VARCHAR(255) NULL 
  COMMENT 'Hashed password reset token';

ALTER TABLE users ADD COLUMN reset_token_expires TIMESTAMP NULL 
  COMMENT 'When the reset token expires';
```

---

## Environment Variables Required

```env
# SMTP Configuration (choose one option)
EMAIL_SERVICE=gmail  # or 'outlook' or 'custom'
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password  # or password for your provider

# For custom SMTP:
# SMTP_HOST=smtp.example.com
# SMTP_PORT=587
# SMTP_SECURE=false

# Frontend URL for email links
FRONTEND_URL=http://localhost:5173
```

---

## Error Handling

### Common Errors:

| Error | Cause | Solution |
|-------|-------|----------|
| `Email service not configured` | EMAIL_USER or EMAIL_PASSWORD missing | Set SMTP in .env |
| `Invalid or expired reset token` | Token expired or invalid | User must request new link |
| `Password must be at least 6 characters` | Password too short | Enforce 6+ char requirement |
| `Submission not found` | Wrong submission ID | Verify submission_id is correct |
| `Invalid token format` | Malformed JWT | Use valid authorization token |

---

## Testing Checklist

- [ ] Gmail/Outlook/Custom SMTP configured in .env
- [ ] Email service initializes without errors in logs
- [ ] Password reset email received when requested
- [ ] Reset link works and changes password
- [ ] Email received after exam submission
- [ ] Professor email received when exam completes
- [ ] All emails are properly formatted and readable
- [ ] Emails don't block API responses
- [ ] Failed emails logged but don't crash system

---

## Rate Limiting Recommendations

For production, consider adding rate limiting:

```javascript
// Example: Limit password reset requests
const rateLimit = require('express-rate-limit');

const resetPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // 3 requests per window
  message: 'Too many password reset attempts, please try again later'
});

router.post('/api/forgot-password', resetPasswordLimiter, async (req, res) => {
  // ...
});
```

---

## Support & Debugging

Check server logs for email status:
- `[✅ EMAIL]` - Success
- `[⚠️ EMAIL]` - Warning/Configuration issue
- `[❌ EMAIL]` - Error

Enable verbose logging in `.env`:
```env
DEBUG=nodemailer
```
