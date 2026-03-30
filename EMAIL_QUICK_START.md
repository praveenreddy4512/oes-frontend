# Email Notifications & Password Reset - Quick Start Guide

## What's New? 📧

Your exam system now has:
1. ✅ **Email notifications** when students submit exams
2. ✅ **Professor reports** with submission statistics
3. ✅ **Forget password** feature with secure reset
4. ✅ Support for **Gmail, Outlook, and Custom SMTP**

## 5-Minute Setup

### Step 1: Install Package ✓ (Already Done)
```bash
npm install nodemailer
```

### Step 2: Configure Email (2 minutes)

**Edit `backend/.env` file:**

**Option A - Gmail (Easiest):**
```env
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
FRONTEND_URL=http://localhost:5173
```

To get Gmail app password:
1. Go to https://myaccount.google.com/apppasswords
2. Select "Mail" → "Windows Computer"
3. Copy the 16-character password
4. Paste in `.env`

**Option B - Outlook:**
```env
EMAIL_SERVICE=outlook
EMAIL_USER=your-email@outlook.com
EMAIL_PASSWORD=your-password
FRONTEND_URL=http://localhost:5173
```

**Option C - Custom (SendGrid, etc):**
```env
EMAIL_SERVICE=custom
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=false
EMAIL_USER=apikey
EMAIL_PASSWORD=SG.xxxxxxxxxxxxxxx
FRONTEND_URL=http://localhost:5173
```

### Step 3: Apply Database Changes (1 minute)
```bash
node backend/migrations/002_add_password_reset_fields.js
```

Or manually in MySQL:
```sql
USE online_exam_db;
ALTER TABLE users ADD COLUMN reset_token VARCHAR(255) NULL;
ALTER TABLE users ADD COLUMN reset_token_expires TIMESTAMP NULL;
```

### Step 4: Start Server
```bash
cd backend
npm run dev
```

Check logs for:
```
[✅ EMAIL] SMTP connection verified successfully
```

## What Users Can Do Now 🎯

### Students
1. **Submit Exam** → Auto-receive email with score ✅
2. **Forgot Password** → Reset email link arrives in 1 hour ⏰

### Professors
1. When exam ends → Get statistics email with:
   - How many students submitted
   - Average score
   - Top 3 students
   - Submission rate

### Admin
1. Set up password reset for students

## API Endpoints 🔗

### Password Reset
```
POST /api/forgot-password
{ "email": "student@example.com" }
→ Email with reset link sent

POST /api/reset-password
{ "token": "...", "newPassword": "new123" }
→ Password changed + confirmation email
```

### Exam Submission
```
POST /api/submissions/:id/submit
→ Auto-sends success email to student
```

### Professor Notification
```
POST /api/exams/:examId/send-completion-notification
→ Sends stats email to professor
```

## Email Examples

### Student Gets (After Submission):
```
✅ Exam Submitted Successfully

Your Score: 42/50 (84%)
Exam: Mathematics Final Exam

Your submission has been recorded.
```

### Professor Gets (When Exam Ends):
```
📊 Exam Completion Report

Students Submitted: 28/30 (93%)
Average Score: 72.5%

Top Performers:
1. John Doe - 95%
2. Jane Smith - 92%
3. Bob Johnson - 88%
```

## Troubleshooting 🔧

### "Email service not configured"
→ Check EMAIL_USER and EMAIL_PASSWORD in .env

### "SMTP connection failed"
→ For Gmail: Use App Password, not regular password
→ For Outlook: Verify email/password correct
→ For Custom: Check SMTP_HOST and SMTP_PORT

### Emails not arriving
→ Check spam folder
→ Wait 1-2 minutes (email can be slow)
→ Verify email address in database

### "Invalid or expired reset token"
→ User must request new password reset
→ Tokens expire after 1 hour

## File Changes 📁

**New Files Created:**
- `src/services/emailService.js` - Email engine
- `migrations/002_add_password_reset_fields.js` - Database update
- `.env.example` - Updated with email config
- `EMAIL_NOTIFICATIONS_GUIDE.md` - Detailed guide
- `EMAIL_API_ENDPOINTS.md` - API reference
- `EMAIL_QUICK_START.md` - This file!

**Modified Files:**
- `src/server.js` - Added password reset routes + email init
- `src/routes/submissions.js` - Added success email on submit
- `src/routes/exams.js` - Added completion notification endpoint
- `package.json` - Added nodemailer dependency
- `sql/setup.sql` - Added reset token columns

**Database Changes:**
- `users` table: Added `reset_token` and `reset_token_expires` columns

## Next Steps (Optional) 🚀

1. **Customize Email Templates**
   - Edit `emailService.js` HTML templates
   - Brand with your logo
   - Change colors/styling

2. **Add SMS Notifications**
   - Integrate Twilio for SMS alerts

3. **Automate Professor Notification**
   - Create cron job to send reports automatically
   - No manual API call needed

4. **Email Scheduling**
   - Send reminder emails before exam
   - Send daily digests to students

5. **Delivery Tracking**
   - Watch email opens
   - Track link clicks
   - Monitor bounce rates

## Security 🔐

✅ Passwords hashed with Argon2
✅ Reset tokens expire in 1 hour
✅ Email addresses validated
✅ No account enumeration possible
✅ HTTPS recommended in production

## Testing 

Try these in your browser console:

**Test 1: Request Password Reset**
```javascript
fetch('/api/forgot-password', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'student1@example.com' })
})
.then(r => r.json())
.then(d => console.log(d))
```

**Test 2: Submit Exam (Check logs)**
```javascript
fetch('/api/submissions/1/submit', {
  method: 'POST',
  headers: { 
    'Authorization': 'Bearer YOUR_TOKEN',
    'Content-Type': 'application/json'
  }
})
.then(r => r.json())
.then(d => console.log('Exam submitted, email sent!', d))
```

**Test 3: Send Professor Report**
```javascript
fetch('/api/exams/1/send-completion-notification', {
  method: 'POST',
  headers: { 
    'Authorization': 'Bearer YOUR_TOKEN',
    'Content-Type': 'application/json'
  }
})
.then(r => r.json())
.then(d => console.log('Stats:', d.stats))
```

## Support

📚 Full guide: See `EMAIL_NOTIFICATIONS_GUIDE.md`
🔗 API reference: See `EMAIL_API_ENDPOINTS.md`
❓ Check server logs: `[✅ EMAIL]`, `[⚠️ EMAIL]`, `[❌ EMAIL]`

## Billing/Limits (Free Plans)

- **Gmail**: Unlimited (with App Password)
- **Outlook**: Unlimited
- **SendGrid Free**: 100 emails/day
- **Mailgun Free**: 25,000 emails/month
- **AWS SES Free**: 62,000 emails/month

## Need Help?

1. Check the logs in terminal (search for "EMAIL")
2. Verify .env configuration
3. Test SMTP directly (use Telnet)
4. Check email provider settings
5. Read full guide: EMAIL_NOTIFICATIONS_GUIDE.md

---

**Setup Complete! 🎉**

Your exam system can now send emails. Students will receive confirmations, professors will get reports, and users can reset passwords.

Happy grading! 📊
