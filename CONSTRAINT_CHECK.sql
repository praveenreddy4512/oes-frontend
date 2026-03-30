-- Check group_members table structure and constraints
DESCRIBE group_members;

-- Check for unique constraints/indexes
SHOW INDEX FROM group_members;

-- Check for foreign key constraints  
SELECT CONSTRAINT_NAME, TABLE_NAME, COLUMN_NAME, REFERENCED_TABLE_NAME, REFERENCED_COLUMN_NAME
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
WHERE TABLE_NAME = 'group_members';

-- Try inserting a test record manually to see if it works
-- First, verify test student 1 exists
SELECT id, username, role FROM users WHERE id = 1;

-- Verify group 1 exists
SELECT id, name FROM groups WHERE id = 1;

-- Try a manual insert
INSERT IGNORE INTO group_members (group_id, student_id, added_by) VALUES (1, 1, 1);

-- Check if it was inserted
SELECT * FROM group_members WHERE group_id = 1 AND student_id = 1;

-- Check all group_members entries
SELECT * FROM group_members;
