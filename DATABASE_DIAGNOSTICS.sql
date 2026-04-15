-- DIAGNOSTIC QUERIES FOR GROUP ASSIGNMENT ISSUE
-- Run these in phpMyAdmin to debug why students aren't being added to groups

-- 1. Check if groups table exists and has data
SELECT 'GROUPS TABLE' as check_name, COUNT(*) as count FROM groups;

-- 2. Check if group_members table exists and has data  
SELECT 'GROUP_MEMBERS TABLE' as check_name, COUNT(*) as count FROM group_members;

-- 3. Check if exam_groups table exists
SELECT 'EXAM_GROUPS TABLE' as check_name, COUNT(*) as count FROM exam_groups;

-- 4. Check all users and their roles
SELECT id, username, role FROM users LIMIT 10;

-- 5. Check admin users
SELECT id, username, role FROM users WHERE role = 'admin';

-- 6. Check all students
SELECT id, username, role FROM users WHERE role = 'student' LIMIT 10;

-- 7. Check all groups with member counts
SELECT 
  g.id, 
  g.name, 
  COUNT(gm.id) as member_count
FROM groups g
LEFT JOIN group_members gm ON g.id = gm.group_id
GROUP BY g.id, g.name;

-- 8. Check group members detail
SELECT 
  gm.id,
  gm.group_id,
  gm.student_id,
  g.name as group_name,
  u.username as student_username,
  u.role as student_role,
  gm.added_at
FROM group_members gm
JOIN groups g ON gm.group_id = g.id
JOIN users u ON gm.student_id = u.id;

-- 9. Check if group_members table structure is correct
DESCRIBE group_members;

-- 10. Check foreign key constraints
SELECT CONSTRAINT_NAME, TABLE_NAME, REFERENCED_TABLE_NAME 
FROM INFORMATION_SCHEMA.REFERENTIAL_CONSTRAINTS 
WHERE TABLE_NAME = 'group_members';

-- 11. Check if there are any students recently created
SELECT id, username, role, created_at FROM users 
WHERE role = 'student' 
ORDER BY created_at DESC 
LIMIT 5;

-- 12. Verify groups database exists
SHOW TABLES LIKE 'group%';
