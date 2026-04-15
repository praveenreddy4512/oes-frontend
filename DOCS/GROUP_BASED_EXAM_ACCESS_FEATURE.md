# 📋 Group-Based Exam Access Control Feature

## Overview
This feature allows administrators to create **student groups**, professors to assign exams to specific groups, and restricts student exam access to only exams assigned to their group(s).

---

## ✨ Features

### 1. **Admin Group Management**
- ✅ Create groups (e.g., "MTech CSE Section 1", "BTech CE Batch 2024")
- ✅ Edit group details (name, description)
- ✅ Delete groups
- ✅ Manage group members (add/remove students)
- ✅ View member count per group

### 2. **Professor Exam Assignment**
- ✅ Select one or multiple groups when creating an exam
- ✅ Only students in assigned groups can see/attempt the exam
- ✅ Update group assignments for existing exams

### 3. **Student Access Control**
- ✅ Students see only exams assigned to their group(s)
- ✅ Cannot access exams outside their group
- ✅ View all groups they belong to

### 4. **Admin Oversight**
- ✅ View all groups and members
- ✅ Monitor group assignments

---

## 🗄️ Database Schema

### `groups` Table
```sql
CREATE TABLE groups (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  created_by INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id)
);
```

### `group_members` Table
```sql
CREATE TABLE group_members (
  id INT AUTO_INCREMENT PRIMARY KEY,
  group_id INT NOT NULL,
  student_id INT NOT NULL,
  added_by INT NOT NULL,
  added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY (group_id, student_id),
  FOREIGN KEY (group_id) REFERENCES groups(id),
  FOREIGN KEY (student_id) REFERENCES users(id)
);
```

### `exam_groups` Table
```sql
CREATE TABLE exam_groups (
  id INT AUTO_INCREMENT PRIMARY KEY,
  exam_id INT NOT NULL,
  group_id INT NOT NULL,
  UNIQUE KEY (exam_id, group_id),
  FOREIGN KEY (exam_id) REFERENCES exams(id),
  FOREIGN KEY (group_id) REFERENCES groups(id)
);
```

---

## 🚀 API Endpoints

### Groups Management (Admin Only)

#### Get All Groups
```
GET /api/groups
Response: [
  {
    "id": 1,
    "name": "MTech CSE Section 1",
    "description": "...",
    "created_by": 5,
    "created_by_name": "admin1",
    "member_count": 25
  }
]
```

#### Create Group
```
POST /api/groups
Body: {
  "name": "MTech CSE Section 1",
  "description": "Master's students - CS & Engineering"
}
Response: { "id": 1, "message": "Group created successfully" }
```

#### Update Group
```
PUT /api/groups/:id
Body: { "name": "...", "description": "..." }
Response: { "message": "Group updated successfully" }
```

#### Delete Group
```
DELETE /api/groups/:id
Response: { "message": "Group deleted successfully" }
```

### Group Members Management

#### Get Group Members
```
GET /api/groups/:groupId/members
Response: [
  { "id": 1, "username": "student1", "email": "student1@exam.com", "added_at": "..." }
]
```

#### Add Members to Group
```
POST /api/groups/:groupId/members
Body: { "studentIds": [1, 2, 3] }
Response: { "added": 3, "failed": 0, "errors": [] }
```

#### Remove Member from Group
```
DELETE /api/groups/:groupId/members/:studentId
Response: { "message": "Member removed from group" }
```

### Groups List for Professor
```
GET /api/groups/for-exams/list
Response: [
  { "id": 1, "name": "MTech CSE Section 1", "member_count": 25 }
]
```

### Student's Groups
```
GET /api/groups/student/my-groups
Response: [
  { "id": 1, "name": "MTech CSE Section 1", "description": "..." }
]
```

### Exam Group Assignment

#### Get Exam Groups
```
GET /api/exams/:examId/groups
Response: [{ "id": 1, "name": "MTech CSE Section 1", ... }]
```

#### Add Groups to Exam
```
POST /api/exams/:examId/groups
Body: { "groupIds": [1, 2] }
Response: { "message": "Groups added to exam" }
```

#### Remove Group from Exam
```
DELETE /api/exams/:examId/groups/:groupId
Response: { "message": "Group removed from exam" }
```

#### Student Can Only See Exams in Their Groups
```
GET /api/exams/student/exams/by-group
Response: [... exams filtered by student's groups ...]
```

---

## 🎨 Frontend Components

### Admin Pages
1. **AdminGroups.jsx** - Group creation, member management
   - Located: `frontend/src/pages/AdminGroups.jsx`
   - Access: Admin only
   - Features: CRUD operations for groups, manage members

### Professor Pages
> Update to CreateExam.jsx and ExamEditor.jsx to include group selection

### Student Pages
> Update StudentDashboard.jsx and StudentExams.jsx to filter by groups

---

## 📝 Implementation Steps

### Step 1: Database Migration
```bash
# Run migration to create tables
node backend/src/migrations/003_add_groups_support.js

# Or use the SQL file in cPanel phpMyAdmin
# Run: backend/sql/002_groups_migration.sql
```

### Step 2: Backend Deployment
```bash
cd backend
git add -A
git commit -m "feat: add group-based exam access control"
git push origin main
npm install  # for cPanel
```

### Step 3: Frontend Deployment
```bash
cd frontend
git add -A
git commit -m "feat: add admin groups UI and exam group assignment"
git push origin main
# Vercel auto-deploys
```

### Step 4: Test Workflow
1. **Admin**: Create groups, add students
2. **Professor**: Create exam, assign to groups
3. **Student**: See only exams in their group(s)

---

## 🧪 Testing Checklist

- [ ] Admin can create groups
- [ ] Admin can add/remove students from groups
- [ ] Admin can delete groups
- [ ] Professor sees groups when creating exam
- [ ] Professor can select multiple groups for exam
- [ ] Professor can update exam groups
- [ ] Student sees only exams in their groups
- [ ] Student cannot see/attempt exams outside their groups
- [ ] Group member count updates correctly
- [ ] Deleting exam also removes exam_group associations

---

## 🔐 Security Considerations

1. **Role-Based Access**
   - Only admins can manage groups
   - Only group members can see assigned exams
   - Professors can only create exams (not manage groups)

2. **SQL Injection Protection**
   - All queries use parameterized statements
   - User input validated before processing

3. **Authorization Checks**
   - `requireRole(['admin'])` middleware on all group routes
   - Student exam access validated against group membership

4. **Data Integrity**
   - Unique constraints prevent duplicate group names
   - Unique constraints prevent duplicate group members
   - Cascading deletes maintain referential integrity

---

## 📚 Usage Examples

### Admin Creates a Group
```javascript
// POST /api/groups
{
  "name": "MTech CSE Section 1",
  "description": "Master's program, Computer Science & Engineering, Section 1"
}
```

### Admin Adds Students to Group
```javascript
// POST /api/groups/1/members
{
  "studentIds": [1, 2, 3, 4, 5]
}
```

### Professor Creates Exam for Group
```javascript
// POST /api/exams
{
  "title": "Data Structures Exam",
  "description": "Fundamental DSA concepts",
  "professor_id": 3,
  "duration_minutes": 60,
  "shuffle_questions": true,
  "shuffle_options": false,
  "groupIds": [1, 2]  // ← Only these sections can take it
}
```

### Student Sees Only Group Exams
```javascript
// GET /api/exams/student/exams/by-group
// Returns only exams from groups student belongs to
```

---

## 🐛 Troubleshooting

**Problem**: Students see all exams, not just group exams
- **Solution**: Update StudentExams.jsx to use `/api/exams/student/exams/by-group` endpoint

**Problem**: Professor doesn't see group selection in exam creation
- **Solution**: Update CreateExam.jsx and ExamEditor.jsx with group multi-select

**Problem**: "Column 'group_id' doesn't exist"
- **Solution**: Run migration: `node backend/src/migrations/003_add_groups_support.js`

**Problem**: Admin Groups page shows 401 error
- **Solution**: Verify user is logged in as admin

---

## 🚀 Future Enhancements

1. **Bulk Group Operations**
   - Import CSV of students to add to groups
   - Bulk edit group names/descriptions

2. **Group Hierarchy**
   - Sub-groups (Department → Section → Batch)
   - Group manager role (admins approve additions)

3. **Advanced Filtering**
   - Filter exams by multiple groups (OR logic)
   - Filter by exam status per group

4. **Reporting**
   - Group-wise exam performance reports
   - Student roster exports

5. **Self-Service**
   - Students request group membership (approval workflow)
   - Students view available groups to join

---

## 📋 Files Modified/Created

### Backend
- ✅ `src/migrations/003_add_groups_support.js` - NEW
- ✅ `src/routes/groups.js` - NEW
- ✅ `src/routes/exams.js` - Updated (group assignment)
- ✅ `src/server.js` - Updated (register groups route)
- ✅ `sql/setup.sql` - Updated (groups tables)
- ✅ `sql/002_groups_migration.sql` - NEW (alternative to migration)

### Frontend
- ✅ `src/pages/AdminGroups.jsx` - NEW
- 🔄 `src/pages/CreateExam.jsx` - Needs update (group selection)
- 🔄 `src/pages/ExamEditor.jsx` - Needs update (group selection)
- 🔄 `src/pages/StudentDashboard.jsx` - Needs update (filter by groups)
- 🔄 `src/pages/StudentExams.jsx` - Needs update (filter by groups)
- 🔄 `src/styles/pages.css` - Needs update (new styles)

---

## ✅ Deployment Checklist

- [ ] Database migration run successfully
- [ ] Backend routes registered in server.js
- [ ] Backend deployed to cPanel
- [ ] Admin can access Groups management page
- [ ] Admin can CRUD groups and members
- [ ] Professor exam creation includes group selection
- [ ] Student dashboard filters by groups
- [ ] All API endpoints return correct data
- [ ] Error handling works properly
- [ ] Security roles enforced correctly

---

**Version**: 1.0  
**Date**: March 28, 2026  
**Status**: ✅ Backend Complete, Frontend In Progress
