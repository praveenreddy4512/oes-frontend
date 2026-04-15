-- ============================================================
-- GROUP-BASED EXAM ACCESS CONTROL MIGRATION FOR CPANEL
-- Run this in phpMyAdmin or MySQL CLI on cPanel
-- ============================================================

-- Step 1: Create groups table
CREATE TABLE IF NOT EXISTS groups (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  created_by INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_name (name),
  INDEX idx_created_by (created_by)
);

-- Step 2: Create group_members table
CREATE TABLE IF NOT EXISTS group_members (
  id INT AUTO_INCREMENT PRIMARY KEY,
  group_id INT NOT NULL,
  student_id INT NOT NULL,
  added_by INT NOT NULL,
  added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (added_by) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_group_member (group_id, student_id),
  INDEX idx_student_id (student_id)
);

-- Step 3: Create exam_groups table
CREATE TABLE IF NOT EXISTS exam_groups (
  id INT AUTO_INCREMENT PRIMARY KEY,
  exam_id INT NOT NULL,
  group_id INT NOT NULL,
  
  FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE CASCADE,
  FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE,
  UNIQUE KEY unique_exam_group (exam_id, group_id),
  INDEX idx_group_id (group_id)
);

-- ============================================================
-- SEED DATA (OPTIONAL - Remove if you don't want test data)
-- ============================================================

-- Insert sample groups (replace IDs with actual admin ID)
-- First, find your admin ID by running: SELECT id, username, role FROM users WHERE role='admin' LIMIT 1;
-- Then replace '1' in the INSERT below with that ID

INSERT INTO groups (name, description, created_by) VALUES
('MTech CSE Section 1', 'Master of Technology - Computer Science Section 1', 1),
('MTech CSE Section 2', 'Master of Technology - Computer Science Section 2', 1),
('BTech IT Batch 2024', 'Bachelor of Technology - Information Technology Batch 2024', 1),
('BTech IT Batch 2025', 'Bachelor of Technology - Information Technology Batch 2025', 1)
ON DUPLICATE KEY UPDATE updated_at=NOW();

-- ============================================================
-- VERIFICATION QUERIES
-- Run these to verify the migration was successful
-- ============================================================

-- Check if tables exist
-- SHOW TABLES LIKE 'group%';

-- Check groups structure
-- DESCRIBE groups;

-- Check if groups were created
-- SELECT id, name, description FROM groups;

-- ============================================================
-- NOTE FOR EXISTING DEPLOYMENTS
-- ============================================================
-- This migration is non-destructive and can be run on
-- existing databases without affecting existing data.
-- 
-- If you get an error about "Cannot add or modify foreign key constraint":
-- 1. Ensure the 'exams' and 'users' tables exist
-- 2. Check that foreign key references point to existing columns
-- 3. Run each CREATE TABLE statement individually
