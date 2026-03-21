# Exam Event Tracking System

## Overview

This system tracks student actions during exam-taking to detect:
- **Tab Switching** - Student switched away from exam tab
- **Page Refreshes** - Student refreshed or closed the browser
- **Time per Question** - How long student spent on each question
- **Answer Saves** - When student selected an answer
- **Suspicious Activity** - Patterns indicating academic dishonesty

## Database Schema

### Table: `exam_events`

```sql
CREATE TABLE exam_events (
  id INT AUTO_INCREMENT PRIMARY KEY,
  submission_id INT NOT NULL,
  student_id INT NOT NULL,
  exam_id INT NOT NULL,
  event_type VARCHAR(50) NOT NULL,
  event_details JSON,
  question_id INT,
  time_spent_seconds INT,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (submission_id) REFERENCES submissions(submission_id),
  FOREIGN KEY (student_id) REFERENCES users(id),
  FOREIGN KEY (exam_id) REFERENCES exams(id),
  
  INDEX idx_submission (submission_id),
  INDEX idx_student (student_id),
  INDEX idx_event_type (event_type),
  INDEX idx_timestamp (timestamp)
);
```

### Event Types

| Event Type | Triggered | Data Captured |
|------------|-----------|---------------|
| `exam_started` | When student loads the exam | exam_id, student_id |
| `question_viewed` | When student first sees a question | question_id, timestamp |
| `answer_saved` | When student selects an answer | question_id, selected_option, time_spent_seconds |
| `tab_switched` | When student switches browser tabs/windows | action (switched_away/returned), tab_switch_count |
| `page_refreshed` | When student refreshes the page | page_refresh_count |
| `exam_submitted` | When student submits the exam | score, percentage, suspicious_activity_summary |

## API Endpoints

### 1. Log an Event
**POST** `/api/submissions/:submissionId/events`

**Request Body:**
```json
{
  "event_type": "tab_switched",
  "student_id": 2,
  "exam_id": 1,
  "question_id": 5,
  "time_spent_seconds": 45,
  "event_details": {
    "action": "switched_away",
    "tabSwitchCount": 2
  }
}
```

**Response:**
```json
{
  "eventId": 1,
  "message": "Event logged successfully",
  "event": {
    "type": "tab_switched",
    "timestamp": "2026-03-20T17:32:47.520Z"
  }
}
```

### 2. Get All Events for a Submission
**GET** `/api/submissions/:submissionId/events`

**Response:**
```json
{
  "submissionId": 5,
  "totalEvents": 15,
  "events": [
    {
      "id": 1,
      "event_type": "exam_started",
      "event_details": { "message": "Student started the exam" },
      "question_id": null,
      "time_spent_seconds": null,
      "timestamp": "2026-03-20T17:32:47.520Z"
    },
    {
      "id": 2,
      "event_type": "tab_switched",
      "event_details": { "action": "switched_away", "tabSwitchCount": 1 },
      "question_id": null,
      "time_spent_seconds": null,
      "timestamp": "2026-03-20T17:35:12.220Z"
    }
    // ... more events
  ]
}
```

### 3. Get Event Summary
**GET** `/api/submissions/:submissionId/events/summary`

**Response:**
```json
{
  "submissionId": 5,
  "summary": [
    {
      "event_type": "exam_started",
      "count": 1,
      "total_time_seconds": 0,
      "first_occurrence": "2026-03-20T17:32:47.520Z",
      "last_occurrence": "2026-03-20T17:32:47.520Z"
    },
    {
      "event_type": "tab_switched",
      "count": 4,
      "total_time_seconds": 0,
      "first_occurrence": "2026-03-20T17:35:12.220Z",
      "last_occurrence": "2026-03-20T17:58:01.560Z"
    },
    {
      "event_type": "answer_saved",
      "count": 10,
      "total_time_seconds": 450,
      "first_occurrence": "2026-03-20T17:35:45.000Z",
      "last_occurrence": "2026-03-20T17:58:45.000Z"
    }
  ],
  "suspiciousActivity": {
    "tabSwitches": 4,
    "pageRefreshes": 2,
    "suspicionLevel": "HIGH"
  }
}
```

## Frontend Integration

### TakeExam Component Tracking

The frontend automatically tracks:

**1. Tab Switching**
```javascript
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    logEvent({
      event_type: 'tab_switched',
      event_details: { action: 'switched_away' }
    });
  }
});
```

**2. Page Refresh**
```javascript
window.addEventListener('beforeunload', () => {
  logEvent({
    event_type: 'page_refreshed',
    event_details: { pageRefreshCount: refreshCount }
  });
});
```

**3. Time Per Question**
```javascript
// Measured from when student views a question to when they answer
time_spent_seconds = (Date.now() - questionStartTime) / 1000
```

**4. Answer Saves**
```javascript
handleAnswer = (questionId, option) => {
  logEvent({
    event_type: 'answer_saved',
    question_id: questionId,
    time_spent_seconds: timeSpent,
    event_details: { selectedOption: option }
  });
};
```

## Testing Procedure

### Automated Test Script

Run the comprehensive test to verify the entire system:

```bash
cd /home/praveen/Desktop/projects/cyberproject/backend
./test_exam_events.sh
```

**What the test does:**
1. ✅ Verifies backend is running
2. ✅ Logs in as student1
3. ✅ Creates a new exam submission
4. ✅ Logs an "exam_started" event
5. ✅ Simulates 3 tab switch events
6. ✅ Simulates 2 page refresh events
7. ✅ Simulates question viewing and answering
8. ✅ Retrieves all events
9. ✅ Gets event summary with suspicious activity flags
10. ✅ Provides MySQL query to verify in database

### Manual Testing Steps

**Step 1: Start an Exam in Browser**
```
1. Login to https://oes-frontend-drab.vercel.app as student1
2. Start an exam
3. Open DevTools (F12) → Console to see event logs
```

**Step 2: Switch Tabs**
```
1. While exam is open, click another browser tab
2. DevTools should show: "⚠️ Student switched away from exam tab!"
3. Switch back to exam tab
4. DevTools should show: "✅ Student returned to exam tab"
```

**Step 3: Refresh Page**
```
1. Press F5 to refresh the exam page
2. DevTools shows: "[✅ EVENT LOGGED] tab_switch event"
3. Page refreshes and resumes with the same session
```

**Step 4: Answer Questions**
```
1. Select an answer for a question
2. DevTools shows: "[✅ EVENT LOGGED] answer_saved event"
3. Shows time spent on that question
```

**Step 5: Verify in Database**

Connect to your MySQL database:
```bash
mysql -h localhost -u freshmil_oesuser -p'Reddys4512@' freshmil_oes
```

View events for a specific exam submission:
```sql
-- Find recent submissions
SELECT submission_id, student_id, status, submitted_at 
FROM submissions 
ORDER BY submitted_at DESC 
LIMIT 5;

-- View all events for a submission
SELECT * FROM exam_events 
WHERE submission_id = 5 
ORDER BY timestamp ASC;

-- Get summary of events
SELECT event_type, COUNT(*) as count, MAX(timestamp) as last_event
FROM exam_events 
WHERE submission_id = 5 
GROUP BY event_type;

-- Find suspicious activity (multiple tab switches)
SELECT submission_id, 
       COUNT(*) as tab_switches,
       GROUP_CONCAT(timestamp) as times
FROM exam_events 
WHERE event_type = 'tab_switched'
GROUP BY submission_id 
HAVING tab_switches > 3;
```

## Use Cases

### Academic Integrity Monitoring

Professors can use this data to:

1. **Identify Cheating Patterns**
   - High number of tab switches (looking up answers online)
   - Multiple page refreshes (trying to reload with cached data)
   - Unusual time patterns (answering questions too fast)

2. **Audit Exam Sessions**
   ```sql
   SELECT s.submission_id, s.student_id, u.username,
          COUNT(CASE WHEN e.event_type = 'tab_switched' THEN 1 END) as tab_switches,
          COUNT(CASE WHEN e.event_type = 'page_refreshed' THEN 1 END) as refreshes
   FROM submissions s
   JOIN users u ON s.student_id = u.id
   LEFT JOIN exam_events e ON s.submission_id = e.submission_id
   GROUP BY s.submission_id
   ORDER BY tab_switches DESC;
   ```

3. **Flag High-Risk Sessions**
   - Submissions with tab_switches > 5
   - Submissions with page_refreshes > 3
   - Submissions with inconsistent answer patterns

### Performance Analytics

Students/Teachers can use this to:
- Track time spent per question
- Identify difficult questions
- Optimize exam difficulty
- Analyze student time management

## Security Considerations

### What's Tracked
✅ Tab switching (when student leaves exam)
✅ Page refresh events
✅ Time per question (for analytics)
✅ When answers are saved

### What's NOT Tracked
❌ Keystrokes (privacy protection)
❌ Biometric data
❌ Audio/video (students opt-in)
❌ System-level activity

### Data Protection
- ✅ Events are associated with authenticated users only
- ✅ Events are immutable (INSERT only, no DELETE/UPDATE)
- ✅ Events are timestamped for audit trails
- ✅ Parameterized queries prevent SQL injection
- ✅ Session validation required for all event submissions

## Future Enhancements

1. **Proctoring Integration**
   - Integrate with Zoom/Teams for live proctoring
   - Combine event logs with video for verification

2. **AI-Powered Cheating Detection**
   - ML models to identify suspicious patterns
   - Anomaly detection for unusual behavior

3. **Biometric Verification**
   - Face recognition (with student consent)
   - Fingerprint verification

4. **Advanced Analytics Dashboard**
   - Real-time monitoring for instructors
   - Statistical analysis of exam patterns
   - Comparative analytics between students

5. **Blockchain Audit Trail**
   - Immutable event recording
   - Cryptographic proof of integrity

## Troubleshooting

### Events Not Logging

**Problem:** Events not appearing in database
**Solution:**
1. Check backend is running: `curl https://oes.freshmilkstraightfromsource.com/api/health`
2. Check database connection: verify DB credentials in .env
3. Check migration ran: `DESCRIBE exam_events;` in MySQL
4. Check console for errors: DevTools F12 → Console tab

### High False Positive Rate

**Problem:** Too many "suspicious" flags
**Solution:**
1. Adjust thresholds: modify suspiciousLevel logic in exam-events.js
2. Account for legitimate reasons (multi-monitor, accidental clicks)
3. Combine with other signals before flagging

### Database Permissions

**Problem:** "Table doesn't exist" error
**Solution:**
1. Ensure freshmil_oesuser has CREATE TABLE permissions
2. Run migration manually: see "Create Database Table" section
3. Check table exists: `SHOW TABLES LIKE 'exam_events';`

## Contact & Support

For issues or enhancements:
1. Check server logs: `tail -f /var/log/nodejs.log`
2. Enable debug logging: `DEBUG=* npm start`
3. Contact system admin for database issues
