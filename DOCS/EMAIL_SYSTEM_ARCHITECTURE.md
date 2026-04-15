# Email System Architecture & Flows

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    ONLINE EXAM SYSTEM                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Frontend (React/Vue)                Backend (Node.js/Express)   │
│  ┌─────────────────┐               ┌──────────────────────────┐  │
│  │ Login Page      │──────────────▶│ /api/login               │  │
│  │ Forgot Password │               │ /api/forgot-password  ◀──┼──│──▶ Email Service
│  │ Reset Form      │               │ /api/reset-password      │  │
│  └─────────────────┘               └──────────────────────────┘  │
│         │                                    │                    │
│         │                                    │                    │
│  ┌─────────────────┐               ┌──────────────────────────┐  │
│  │ Exam Page       │──────────────▶│ /api/submissions/**      │  │
│  │ Submit Button   │               │ - POST submit        ◀───┼──│──▶ Email Service
│  │ Success Message │◀──────────────│ - Returns score      │    │  │
│  └─────────────────┘               │ - Sends email        │    │  │
│         │                          └──────────────────────────┘  │
│         │                                    │                    │
│         │                                    │                    │
│  ┌─────────────────┐               ┌──────────────────────────┐  │
│  │ Professor       │               │ /api/exams/*/       │  │
│  │ Dashboard       │◀──────────────│  send-completion     ◀───┼──│──▶ Email Service
│  │ Stats View      │               │ - Calculates stats   │    │  │
│  └─────────────────┘               │ - Returns stats      │    │  │
│                                    │ - Sends email        │    │  │
│                                    └──────────────────────────┘  │
│                                             │                     │
│                                      ┌──────▼──────┐              │
│                                      │   Database  │              │
│                                      │   MySQL     │              │
│                                      └─────────────┘              │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
                    ┌──────────────────────────┐
                    │  Email Service Module    │
                    │  emailService.js         │
                    │  ┌────────────────────┐  │
                    │  │ SMTP Transporter   │  │
                    │  │ - Gmail            │  │
                    │  │ - Outlook          │  │
                    │  │ - Custom SMTP      │  │
                    │  └────────────────────┘  │
                    │  ┌────────────────────┐  │
                    │  │ Email Templates    │  │
                    │  │ - Submission OK    │  │
                    │  │ - Password Reset   │  │
                    │  │ - Completion Info  │  │
                    │  └────────────────────┘  │
                    └──────────────────────────┘
                                  │
                        ┌─────────┴─────────┐
                        ▼                   ▼
                   ┌─────────┐         ┌─────────┐
                   │  Gmail  │         │ Outlook │
                   │  SMTP   │         │  SMTP   │
                   └─────────┘         └─────────┘
                        │                   │
                        └─────────┬─────────┘
                                  ▼
                        ┌──────────────────────┐
                        │  Email Providers     │
                        │  Send to Recipients  │
                        └──────────────────────┘
                                  │
                        ┌─────────┴──────────┐
                        ▼                    ▼
                   ┌──────────┐         ┌──────────┐
                   │ Student  │         │Professor │
                   │ Email    │         │ Email    │
                   └──────────┘         └──────────┘
```

---

## Password Reset Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                  PASSWORD RESET WORKFLOW                         │
└─────────────────────────────────────────────────────────────────┘

1. USER REQUESTS RESET
   ┌──────────────────┐
   │ Student          │
   │ Forgot Password  │
   │ Page             │
   └────────┬─────────┘
            │
            │ Enters email
            ▼
   ┌──────────────────────────┐
   │ Frontend                 │
   │ POST /api/forgot-password│
   │ { email }                │
   └────────┬─────────────────┘
            │
            ▼
   ┌──────────────────────────────┐
   │ Backend Server               │
   │ 1. Find user by email        │
   │ 2. Generate random token     │
   │ 3. Hash token with Argon2    │
   │ 4. Store in DB (1 hour TTL)  │
   │ 5. Send email with link      │
   └────────┬─────────────────────┘
            │
            ▼
   ┌──────────────────────────────┐
   │ Email Service                │
   │ sendPasswordResetEmail()      │
   └────────┬─────────────────────┘
            │
            ▼
   ┌──────────────────────────────┐
   │ Email Provider (Gmail/etc)    │
   │ Sends email to user           │
   └────────┬─────────────────────┘
            │
            ▼
   ┌──────────────────────────────┐
   │ Student Inbox                │
   │ 📧 Password Reset Email       │
   │    Contains: Reset Link       │
   │    Valid for: 1 hour          │
   └────────┬─────────────────────┘
            │
            │ Clicks link
            │ Link: /reset-password?token=...
            ▼
   ┌──────────────────────────────┐
   │ Frontend                     │
   │ Reset Password Form          │
   │ - New password input         │
   │ - Submit button              │
   └────────┬─────────────────────┘
            │
            │ Fills new password
            │ Clicks Submit
            ▼
   ┌──────────────────────────────┐
   │ Frontend                     │
   │ POST /api/reset-password     │
   │ { token, newPassword }       │
   └────────┬─────────────────────┘
            │
            ▼
   ┌──────────────────────────────────┐
   │ Backend Server                   │
   │ 1. Find token in DB              │
   │ 2. Check token NOT expired       │
   │ 3. Verify token hash matches     │
   │ 4. Hash new password with Argon2 │
   │ 5. Update user password          │
   │ 6. Clear reset_token from DB     │
   │ 7. Send confirmation email       │
   └────────┬─────────────────────────┘
            │
            ▼
   ┌──────────────────────────────┐
   │ Email Service                │
   │ sendPasswordChangedEmail()    │
   └────────┬─────────────────────┘
            │
            ▼
   ┌──────────────────────────────┐
   │ Email Provider               │
   │ Sends confirmation email      │
   └────────┬─────────────────────┘
            │
            ▼
   ┌──────────────────────────────┐
   │ Student Inbox                │
   │ 📧 Password Changed Email     │
   │    Confirmation message       │
   └────────┬─────────────────────┘
            │
            │ Password reset complete!
            │ Can now login with new password
            ▼
   ┌──────────────────┐
   │ Login Page       │
   │ Username:        │
   │ Password: ****   │
   └──────────────────┘
```

---

## Exam Submission Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                 EXAM SUBMISSION WORKFLOW                         │
└─────────────────────────────────────────────────────────────────┘

1. EXAM IN PROGRESS
   ┌──────────────────────┐
   │ Student              │
   │ Taking Exam          │
   │ Questions showing    │
   │ Timer counting down   │
   └────────┬─────────────┘
            │
            │ Time remaining: 0:00
            │ Clicks "Submit Exam"
            ▼
   ┌──────────────────────────────┐
   │ Frontend                     │
   │ POST /api/submissions/*/submit│
   │ (submission_id)              │
   └────────┬─────────────────────┘
            │
            ▼
   ┌──────────────────────────────────┐
   │ Backend Server                   │
   │ 1. Get submission details        │
   │ 2. Calculate score               │
   │    - Count correct answers       │
   │    - Calculate percentage        │
   │ 3. Update is_submitted = TRUE    │
   │ 4. Create result record          │
   │ 5. Get student info from DB      │
   │ 6. Get exam title from DB        │
   │ 7. Send success email (async)    │
   │ 8. Return response to frontend   │
   └────────┬─────────────────────────┘
            │
            ├─────────────────────────┐
            │                         │
      ▼ ASYNC                    ▼ RESPONSE
   Sends Email            Returns to Frontend
      │                         │
      ▼                         ▼
   Email Service         ┌──────────────────┐
   sendSubmissionSuccess │ Frontend         │
   Email()               │ Shows:           │
      │                  │ ✅ Submitted     │
      ▼                  │ Score: 42/50     │
   Email Provider        │ Percentage: 84%  │
   (Gmail/etc)           └──────────────────┘
      │                         │
      ▼                         │
   Student Inbox                │
   📧 Success Email              │
   Subject: Exam Submitted       │
   Score: 42/50 (84%)            │
      │                         │
      └─────────────────────────┘
            │
            ▼
   Student sees:
   ✅ Exam submitted successfully
   Score: 42/50 (84%)
   Email confirmation in inbox
```

---

## Exam Completion (Professor Notification)

```
┌─────────────────────────────────────────────────────────────────┐
│             EXAM COMPLETION NOTIFICATION FLOW                    │
└─────────────────────────────────────────────────────────────────┘

1. EXAM TIME ENDS
   ┌──────────────────────┐
   │ Exam Timer           │
   │ Reaches 0:00         │
   │ All exams closed     │
   └────────┬─────────────┘
            │
            │ Frontend detects time ended
            │ OR Backend scheduled job runs
            ▼
   ┌─────────────────────────────────────────┐
   │ Frontend (Optional)                     │
   │ POST /api/exams/:examId/                │
   │  send-completion-notification           │
   └────────┬────────────────────────────────┘
            │
            ▼
   ┌──────────────────────────────────────────────┐
   │ Backend Server                              │
   │ 1. Get exam by ID                          │
   │ 2. Get professor info                      │
   │ 3. Calculate submission stats:             │
   │    - Total students assigned               │
   │    - Count submitted exams                 │
   │    - Count not submitted                   │
   │    - Calculate average score               │
   │    - Submission percentage                 │
   │ 4. Get top 3 performers                    │
   │ 5. Send email to professor (async)         │
   │ 6. Return stats in response                │
   └────────┬───────────────────────────────────┘
            │
            ├───────────────────────────────────┐
            │                                   │
      ▼ ASYNC                          ▼ RESPONSE
   Email Service                   Returns Stats
   sendExam                        to Frontend
   CompletionEmail()                    │
      │                                 │
      ▼                                 ▼
   Email Provider                  ┌─────────────────┐
   Creates Email with:             │ Professor sees: │
   - Exam title                    │ Total: 30       │
   - Total students: 30            │ Submitted: 28   │
   - Submitted: 28                 │ Not: 2          │
   - Not submitted: 2              │ Avg: 72.5%      │
   - Submission: 93%               │ Top 3 students  │
   - Average: 72.5%                └─────────────────┘
   - Top 3 students                        │
      │                                    │
      ▼                                    │
   ┌─────────────────────────────────────┐ │
   │ Data Sent to Email Provider         │ │
   │ (Gmail/Outlook/SendGrid)            │ │
   └─────┬───────────────────────────────┘ │
         │                                   │
         ▼                                   │
   Professor Receives Email:                │
   📊 Exam Completion Report                │
   Subject: Exam Complete - Mathematics     │
                                            │
   Total Students: 30                       │
   Submitted: 28 (93%)                      │
   Not Submitted: 2 (7%)                    │
   Average Score: 72.5%                     │
                                            │
   Top Performers:                          │
   1. John Doe - 95%                        │
   2. Jane Smith - 92%                      │
   3. Bob Johnson - 88%                     │
         │                                   │
         └───────────────────────────────────┘
                  │
                  ▼
            Professor can:
            ✅ See submission stats
            ✅ View top performers
            ✅ Access detailed reports
            ✅ Download grades
```

---

## Database Schema

```
USERS TABLE
┌─────────────────────────────────────┐
│ users                               │
├─────────────────────────────────────┤
│ id (PRIMARY KEY)                    │
│ username (UNIQUE)                   │
│ password (HASHED - Argon2)          │
│ role (student|professor|admin)      │
│ email                               │
│ reset_token (NEW) ← Hashed token    │
│ reset_token_expires (NEW) ← Expires │
│ created_at                          │
└─────────────────────────────────────┘

EXAMS TABLE
┌─────────────────────────────────────┐
│ exams                               │
├─────────────────────────────────────┤
│ id (PRIMARY KEY)                    │
│ title                               │
│ description                         │
│ professor_id (FK → users)           │
│ duration_minutes                    │
│ status (draft|published|closed)     │
│ created_at                          │
└─────────────────────────────────────┘

SUBMISSIONS TABLE
┌─────────────────────────────────────┐
│ submissions                         │
├─────────────────────────────────────┤
│ id (PRIMARY KEY)                    │
│ exam_id (FK → exams)                │
│ student_id (FK → users)             │
│ submitted_at                        │
│ completed_at                        │
│ is_submitted (TRUE|FALSE)           │
│ (UNIQUE on exam_id + student_id)    │
└─────────────────────────────────────┘

RESULTS TABLE
┌─────────────────────────────────────┐
│ results                             │
├─────────────────────────────────────┤
│ id (PRIMARY KEY)                    │
│ submission_id (FK → submissions)    │
│ exam_id (FK → exams)                │
│ student_id (FK → users)             │
│ total_marks                         │
│ obtained_marks                      │
│ percentage                          │
│ status (completed|pending)          │
│ created_at                          │
└─────────────────────────────────────┘
```

---

## Email Service Architecture

```
APPLICATION LAYER
┌──────────────────────────────────────────┐
│ API Routes                               │
│ ├─ submissions.js → Email on submit      │
│ ├─ exams.js → Email on completion       │
│ └─ server.js → Password reset emails    │
└────────────┬─────────────────────────────┘
             │
             ▼
SERVICE LAYER
┌──────────────────────────────────────────┐
│ emailService.js                          │
│ ├─ initializeEmailTransporter()         │
│ ├─ sendEmail(to, subject, html)         │
│ ├─ sendSubmissionSuccessEmail()         │
│ ├─ sendPasswordResetEmail()             │
│ ├─ sendPasswordChangedEmail()           │
│ └─ sendExamCompletionEmail()            │
└────────────┬─────────────────────────────┘
             │
             ▼
TRANSPORT LAYER
┌──────────────────────────────────────────┐
│ Nodemailer Transporter                   │
├──────────────────────────────────────────┤
│ Transporter Config:                      │
│ ├─ service: 'gmail'                      │
│ ├─ service: 'outlook'                    │
│ └─ custom: { host, port, auth }         │
└────────────┬─────────────────────────────┘
             │
   ┌─────────┴──────────┬──────────┐
   │                    │          │
   ▼                    ▼          ▼
 Gmail              Outlook      Custom
 SMTP               SMTP      SendGrid/etc
   │                    │          │
   └─────────┬──────────┴──────────┘
             │
             ▼
      Email Delivered
```

---

## Error Handling Flow

```
┌─────────────────────────────────────────┐
│ Email Send Attempted                    │
└────────────┬────────────────────────────┘
             │
             ▼
        ┌─────────┐
        │ Success?│
        └─┬────┬──┘
          │    │
      Yes │    │ No
          ▼    ▼
        ✅    [ERROR] ────────────────┐
        Email  │                      │
        Sent   │ Log error:           │
        │      │ [❌ EMAIL] msg       │
        │      │                      │
        │      │ Continue? ───────────┤─ YES
        │      │                      │ (non-blocking)
        │      └──────────────────────┘
        │
        └──→ API Response
             (with or without email)
             Success = True/False
```

---

## Data Flow Diagram

```
        FRONTEND                    BACKEND                  DATABASE
        
        User Input
            │
            ├──────────┐
            │          │
            ▼          ▼
      Reset Form   Submit Exam
            │          │
            │          ▼
            │     Calculate Score
            │          │
            ▼          ▼
      POST API ────▶ GET DATA
      (email,    Validate Input
       password)     │
            │        │
            │        ▼
            │   UPDATE/INSERT
            │        │
            │        ▼
            │   QUEUE EMAIL ─────────┐
            │   (async)              │
            │                   SEND EMAIL
            │                   (non-blocking)
            │                        │
            │                        ▼
            │                   SMTP Server
            │                        │
            │                        ▼
            │                   Email Provider
            │                        │
            ▼                        ▼
      RESPONSE ◀────────────────────●
      (immediate)
            │
            ▼
      User Sees
      Success/Error
```

---

## Security Layer

```
USER PASSWORD RESET
┌────────────────────────────────────────────┐
│ Original Password                          │
│ "my_password_123"                          │
└────────────┬───────────────────────────────┘
             │
             ▼ [Argon2.hash()]
┌────────────────────────────────────────────┐
│ Stored in DB (hashed)                      │
│ "$argon2id$v=19$m=19456$..."               │
│ (looks like random garbage in DB)          │
└────────────┬───────────────────────────────┘
             │
     At Login ▼ [Argon2.verify()]
┌────────────────────────────────────────────┐
│ User enters password                       │
│ System compares hashes (NOT plain text)    │
│ ✅ Match = Login allowed                   │
│ ❌ No match = Access denied                │
└────────────────────────────────────────────┘

PASSWORD RESET TOKEN
┌────────────────────────────────────────────┐
│ Random Token Generated                     │
│ "8f3a9c2b1d4e5f6a..." (32 bytes)          │
└────────────┬───────────────────────────────┘
             │
             ▼ [Argon2.hash()]
┌────────────────────────────────────────────┐
│ Stored in DB (hashed)                      │
│ "$argon2id$v=19$m=19456$..."               │
│ + ExpiresAt = NOW() + 1 hour               │
└────────────┬───────────────────────────────┘
             │
      Reset use ▼ [Argon2.verify()]
┌────────────────────────────────────────────┐
│ User receives token from email             │
│ User submits reset with token              │
│ System verifies token hash                 │
│ System checks: NOT expired?                │
│ ✅ Valid = Change password                 │
│ ❌ Invalid/Expired = Deny reset            │
└────────────────────────────────────────────┘
```

---

This architecture ensures:
✅ **Scalability:** Email sending is async (non-blocking)
✅ **Reliability:** Failed emails logged but don't crash system
✅ **Security:** Passwords and tokens are hashed with Argon2
✅ **Flexibility:** Works with multiple email providers
✅ **User Experience:** Instant API responses, emails arrive shortly after
