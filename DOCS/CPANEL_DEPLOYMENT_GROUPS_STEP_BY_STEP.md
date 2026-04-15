# cPanel Database Migration - Groups Feature Deployment

## 🎯 Objective
Deploy the group-based exam access control feature to your existing cPanel MySQL database.

---

## ⚡ Quick Start (5 minutes)

### Option 1: Using phpMyAdmin (EASIEST - Recommended)

**Step 1: Access phpMyAdmin**
1. Log in to cPanel (oes.freshmilkstraightfromsource.com:2087)
2. Find and click **phpMyAdmin**
3. Select your database (usually `online_exam_db` or similar)

**Step 2: Run the Migration SQL**
1. Click the **SQL** tab at the top
2. Copy the entire content from `CPANEL_MIGRATION_GROUPS.sql` (from your project root)
3. Paste into the SQL query box
4. Click **Go** button

**Expected Result:**
- You should see success messages (no red errors)
- Tables `groups`, `group_members`, `exam_groups` are created

**Step 3: Verify**
```sql
-- Run this query to verify
SHOW TABLES LIKE 'group%';
```

You should see:
```
group_members
group_groups
exam_groups
```

---

### Option 2: Using MySQL CLI (SSH Terminal)

**Step 1: Connect via SSH**
```bash
# In cPanel Terminal or SSH client
ssh username@oes.freshmilkstraightfromsource.com

# Navigate to project
cd /home/username/public_html/oes-backend
```

**Step 2: Run the Migration**
```bash
# Make sure Node.js is in PATH
source ~/.bashrc

# Run the Node migration script
node src/migrations/003_add_groups_support.js
```

OR use MySQL directly:
```bash
mysql -u database_user -p database_name < CPANEL_MIGRATION_GROUPS.sql
```

**Step 3: Verify**
```bash
mysql -u database_user -p database_name -e "SHOW TABLES LIKE 'group%';"
```

---

## 📋 What Gets Created

After running the migration, your database will have **3 new tables**:

### 1. `groups` Table
- Stores group names and descriptions
- Example: "MTech CSE Section 1"
- Created by admin users

### 2. `group_members` Table
- Links students to groups
- Tracks who added members and when
- Prevents duplicate entries (unique constraint)

### 3. `exam_groups` Table
- Links exams to groups
- Controls which exams are visible to group students
- Prevents duplicate assignments

---

## 🔍 Verification Checklist

After migration, run these queries in phpMyAdmin → SQL tab:

### Check 1: Tables Exist
```sql
SHOW TABLES LIKE 'group%';
```
✅ Should return 3 tables: `group_members`, `groups`, `exam_groups`

### Check 2: Verify Table Structure
```sql
DESCRIBE groups;
```
✅ Should show columns: id, name, description, created_by, created_at, updated_at

### Check 3: Check Indexes
```sql
SHOW INDEXES FROM groups;
```
✅ Should have indexes on: PRIMARY (id), UNIQUE (name), idx_name, idx_created_by

### Check 4: Test Query
```sql
SELECT COUNT(*) as group_count FROM groups;
```
✅ Should return 0 (if fresh) or a number if seed data was included

---

## ✅ Deployment Complete!

Once migration succeeds:

1. **Backend is ready** - API endpoints active and calling group tables
2. **Frontend is ready** - Components can fetch and display groups
3. **APIs are active:**
   - `/api/groups` - Manage groups
   - `/api/exams/:id/groups` - Assign exams to groups
   - `/api/exams/student/exams/by-group` - Student exam filtering

---

## 🚨 Troubleshooting

### Error: "Cannot add or modify foreign key constraint"
**Cause:** Tables don't exist or references are wrong

**Solution:**
1. Verify `users` and `exams` tables exist:
   ```sql
   SHOW TABLES LIKE 'users';
   SHOW TABLES LIKE 'exams';
   ```
2. If they don't exist, run the full `backend/sql/setup.sql` first

### Error: "Duplicate entry" for unique constraint
**Cause:** Running migration twice or duplicate group names

**Solution:**
- The migration uses `IF NOT EXISTS`, so it's safe to run again
- If you get this only on seed data, the groups were already created (harmless)
- Either delete old groups or remove the seed data section and re-run

### Error: "Access denied for user"
**Cause:** Wrong username/password for MySQL

**Solution:**
1. Get correct credentials from cPanel:
   - Go to cPanel → MySQL Databases
   - Find your database and user
   - Note the exact username (includes prefix)
2. Try using phpMyAdmin instead (already logged in)

### Tables showing but APIs returning errors
**Cause:** Backend server hasn't restarted

**Solution:**
1. **Option A:** Restart in cPanel
   - Go to cPanel → Application Manager
   - Find your Node/Express app
   - Click Restart

2. **Option B:** Manual restart (if SSH access)
   ```bash
   # Stop the process
   pkill -f "node"
   
   # Restart (varies by setup)
   npm start
   # or
   node src/server.js
   ```

---

## 🎮 Test the Feature

After successful deployment:

### 1. Create a Group (As Admin)
```
Login → Admin Settings → Groups → Create New Group
- Name: "Test Group 1"
- Description: "Testing group functionality"
```

### 2. Add Students to Group
```
Click on group card → Edit Members
- Select 2-3 students
- Click "Add Members"
```

### 3. Create Exam in Test Group
```
Professor Login → Create Exam
- Fill in exam details
- Check "Assign to Groups"
- Select "Test Group 1"
- Create exam
```

### 4. Verify Student Sees Exam
```
Login as student (who is in Test Group 1) → Available Exams
✅ Should see the exam you just created

Login as student (NOT in Test Group 1) → Available Exams
✅ Should NOT see that exam
```

---

## 📝 Command Reference

### Quick MySQL Commands
```bash
# Check if groups table exists
mysql -u user -p db_name -e "SHOW TABLES LIKE 'group%';"

# Count groups
mysql -u user -p db_name -e "SELECT COUNT(*) FROM groups;"

# List all groups
mysql -u user -p db_name -e "SELECT id, name, description FROM groups;"

# Check foreign key constraints
mysql -u user -p db_name -e "SELECT CONSTRAINT_NAME FROM INFORMATION_SCHEMA.REFERENTIAL_CONSTRAINTS WHERE TABLE_NAME='exam_groups';"
```

---

## 🔑 Key Points

✅ **Non-destructive** - Doesn't modify existing tables
✅ **Safe to run multiple times** - Uses `IF NOT EXISTS`
✅ **No downtime required** - Can run while system is live
✅ **Automatic cascading deletes** - Groups are properly linked

---

## 📞 What's Next?

1. ✅ Run the migration (above)
2. ✅ Verify tables were created
3. 👉 Test the feature with real data
4. 📚 Check `GROUPS_FEATURE_COMPLETE.md` for full API reference
5. 🚀 Deploy frontend to Vercel

---

## 💾 Backup Recommendation

Before running:
```bash
# Backup your database
mysqldump -u user -p database_name > backup_before_migration.sql
```

This way you can restore if anything goes wrong.

---

**Status:** Ready to Deploy ✅
**Estimated Time:** 2-5 minutes
**Risk Level:** Very Low (additive changes only)
