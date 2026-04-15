# Email Notifications & Password Reset Implementation Guide

## Overview
This document describes the newly implemented email notification system for the Online Exam System. The system handles:
- Exam submission confirmations (sent to students)
- Password reset functionality with secure tokens
- Exam completion statistics (sent to professors)
- Email service integration with multiple SMTP providers

## Features Implemented

### 1. Email Service Module (`src/services/emailService.js`)
The core email service that handles all email communications.

#### Features:
- **Multiple SMTP Provider Support**:
  - Gmail (with App Passwords)
  - Outlook/Office365
  - Custom SMTP servers (SendGrid, Mailgun, AWS SES, etc.)
  
- **Email Templates** for:
  - Exam submission success (htmlbeautified, styled)
  - Exam non-submission notifications
  - Password reset with secure links
  - Password change confirmations
  - Professor exam completion reports with statistics

#### Functions:
```javascript
// Initialize email transporter on server startup
initializeEmailTransporter()

// Send emails (all use this function)
sendEmail(to, subject, html, baseSubject)

// Specific email types
sendSubmissionSuccessEmail(studentEmail, studentName, examTitle, score, totalMarks, percentage)
sendNonSubmissionEmail(studentEmail, studentName, examTitle, reason)
sendExamCompletionEmail(professorEmail, professorName, examTitle, totalStudents, submittedCount, notSubmittedCount, averageScore, topScores)
sendPasswordResetEmail(email, userName, resetToken)
sendPasswordChangedEmail(email, userName)
```

### 2. Password Reset Functionality

#### Endpoints Added:

**POST /api/forgot-password**
- Request: `{ "email": "user@example.com" }`
- Response: Success message (doesn't reveal if email exists - security best practice)
- Action: Sends email with password reset link
- Token validity: 1 hour

**POST /api/reset-password**
- Request: `{ "token": "reset-token-from-email", "newPassword": "newPassword123" }`
- Response: Success/error message
- Action: Validates token, hashes new password, sends confirmation email

#### Database Schema Changes:
Two new columns added to `users` table:
- `reset_token` (VARCHAR 255) - Hashed password reset token
- `reset_token_expires` (TIMESTAMP) - Token expiration time

Migration script: `migrations/002_add_password_reset_fields.js`

### 3. Exam Submission Email Notification

#### When Triggered:
- When student clicks "Submit Exam" button
- After exam time runs out (if auto-submit enabled)

#### Implementation:
Modified `src/routes/submissions.js`:
```javascript
// In POST /:submission_id/submit endpoint
sendSubmissionSuccessEmail(
  student.email,
  student.username,
  exam.title,
  correctAnswers,
  totalQuestions,
  percentage
)
```

#### Email Content:
- Exam title
- Score (correct answers / total questions)
- Percentage (%)
- Encouragement message

### 4. Non-Submission Email Notification

#### When to Use:
- Student doesn't submit exam before time ends
- Triggered via frontend or cron job

#### Implementation:
```javascript
sendNonSubmissionEmail(studentEmail, studentName, examTitle, reason)
```

#### Email Content:
- Exam title
- Non-submission status
- Reason (e.g., "Time ended", "Did not submit")
- Instructions to contact professor

### 5. Exam Completion Notification (Professor)

#### Endpoint:
**POST /api/exams/:examId/send-completion-notification**
- Triggered when exam end time is reached
- Can be called from frontend or scheduled job

#### Response:
```json
{
  "message": "Exam completion notification sent",
  "stats": {
    "totalStudents": 30,
    "submittedCount": 28,
    "notSubmittedCount": 2,
    "averageScore": 72.5,
    "topScores": [
      {
        "studentName": "John Doe",
        "percentage": 95,
        "score": 95,
        "totalMarks": 100
      }
    ]
  }
}
```

#### Email Content to Professor:
- Total students assigned to exam
- Number of students who submitted
- Number of students who didn't submit
- Submission rate (%)
- Average score
- Top 3 performers with names and scores

## Setup Instructions

### Step 1: Install Dependencies
```bash
npm install nodemailer
```

### Step 2: Configure Environment Variables
Copy `.env.example` to `.env` and add email configuration.

#### Option A: Using Gmail (Recommended for Testing)
```env
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
FRONTEND_URL=http://localhost:5173
```

Steps for Gmail:
1. Enable 2-Step Verification: https://myaccount.google.com/security
2. Go to App Passwords: https://myaccount.google.com/apppasswords
3. Select "Mail" and "Windows Computer"
4. Copy the 16-character password
5. Update `.env` with this password

#### Option B: Using Outlook
```env
EMAIL_SERVICE=outlook
EMAIL_USER=your-email@outlook.com
EMAIL_PASSWORD=your-password
FRONTEND_URL=http://localhost:5173
```

#### Option C: Custom SMTP Provider
```env
EMAIL_SERVICE=custom
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_SECURE=false
EMAIL_USER=your-email@example.com
EMAIL_PASSWORD=your-password
FRONTEND_URL=http://localhost:5173
```

Common SMTP Providers:
- **SendGrid**: `smtp.sendgrid.net:587`, username: `apikey`
- **Mailgun**: `smtp.mailgun.org:587`
- **AWS SES**: `email-smtp.region.amazonaws.com:587`

### Step 3: Run Database Migration
```bash
node migrations/002_add_password_reset_fields.js
```

Or manually:
```sql
ALTER TABLE users ADD COLUMN reset_token VARCHAR(255) NULL;
ALTER TABLE users ADD COLUMN reset_token_expires TIMESTAMP NULL;
```

### Step 4: Verify Email Configuration
```bash
npm run dev
```

Check logs for:
- `[✅ EMAIL] SMTP connection verified successfully`
- Or `[⚠️ EMAIL] EMAIL_USER or EMAIL_PASSWORD not configured`

## Frontend Integration

### 1. Password Reset Flow
```javascript
// Frontend sends reset request
POST /api/forgot-password
{ "email": "user@example.com" }

// User checks email, clicks link
// Link contains token: https://yourapp.com/reset-password?token=...

// Frontend sends new password
POST /api/reset-password
{ 
  "token": "token-from-url",
  "newPassword": "newPassword123"
}
```

### 2. Exam Submission Flow
```javascript
// Frontend calls submit exam endpoint
POST /api/submissions/:submission_id/submit

// System automatically sends email to student
// Frontend shows success message
```

### 3. Exam End Time Flow
```javascript
// When exam duration ends (on frontend timer or backend)
// Frontend can call:
POST /api/exams/:examId/send-completion-notification

// Or setup a cron job for automatic notifications
// Response includes statistics for professor dashboard
```

## Email Templates

### Exam Submission Success
- Status badge with checkmark
- Exam title
- Score display
- Percentage calculation
- Professional HTML styling

### Exam Completion Report (Professor)
- Formatted table with submission statistics
- Submission rate calculation
- Average score display
- Top performers list with rankings
- Color-coded HTML for clarity

### Password Reset
- Secure reset link
- 1-hour expiration notice
- Security warning if not requested
- Professional styling

## Security Considerations

### 1. Token Generation
- Uses `crypto.randomBytes(32)` for random token generation
- Tokens are hashed with Argon2 before storage
- Tokens expire after 1 hour

### 2. Email Validation
- All email addresses validated before sending
- Invalid emails logged but don't break requests
- Failed email sends don't block user operations

### 3. Privacy
- Email addresses never exposed to other users
- "User not found" messages same as "email sent" messages
- Prevents account enumeration attacks

### 4. Password Reset
- Original password not changed until token verified
- Confirmation email sent after password change
- User can reset password multiple times

## Troubleshooting

### "Email service not configured"
- Check `.env` file has `EMAIL_USER` and `EMAIL_PASSWORD`
- Verify `EMAIL_SERVICE` is set to `gmail`, `outlook`, or `custom`
- For custom SMTP, verify `SMTP_HOST` is set

### "Email verification failed"
- Gmail: Ensure App Password is correct (not regular password)
- Outlook: Verify email and password are correct
- Custom: Test SMTP connection with tools like Telnet

### "Emails not received"
- Check spam/junk folder
- Verify sender email address matches configuration
- Check email provider's sending limits

### "Token invalid or expired"
- Tokens expire after 1 hour
- User needs to request new reset link
- Check server time is correct (affects expiration)

## Testing

### Test Email Sending
```javascript
// In node console or test file
import { initializeEmailTransporter, sendEmail } from './src/services/emailService.js';

await initializeEmailTransporter();
await sendEmail(
  'test@example.com',
  'Test Subject',
  '<h1>Test Email</h1>'
);
```

### Test Password Reset
```bash
# Request password reset
curl -X POST http://localhost:5000/api/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"student1@example.com"}'

# Reset password
curl -X POST http://localhost:5000/api/reset-password \
  -H "Content-Type: application/json" \
  -d '{"token":"token-from-email","newPassword":"newpass123"}'
```

## Performance Notes

- Email sending is non-blocking (uses `.catch()` for async handling)
- Failed emails don't affect exam submission responses
- Multiple emails sent in parallel for exam completions
- Consider rate limiting for high-traffic exams

## Future Enhancements

1. **Email Templates Database**
   - Store custom templates per institution
   - Admin panel to customize emails

2. **Scheduled Emails**
   - Automated reminders before exam
   - Digest emails for professors
   - Weekly exam reports

3. **Email Attachments**
   - Send exam certificates
   - Attach detailed score reports

4. **SMS Integration**
   - SMS notifications via Twilio
   - For urgent reminders

5. **Email Queuing**
   - Database queue for failed emails
   - Automatic retry mechanism
   - Email delivery tracking

6. **Webhook Support**
   - Track email opens
   - Track email clicks
   - Delivery status updates

## Support

For issues or questions:
1. Check the logs for detailed error messages
2. Verify SMTP configuration is correct
3. Test email service independently
4. Check email provider documentation
5. Review security settings on email account

## Related Files

- `src/services/emailService.js` - Core email service
- `src/routes/submissions.js` - Exam submission with email
- `src/routes/exams.js` - Exam completion notification
- `src/server.js` - Email service initialization and password reset routes
- `migrations/002_add_password_reset_fields.js` - Database migration
- `.env.example` - Environment configuration template
