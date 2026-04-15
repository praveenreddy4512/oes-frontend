# MySQL Database Migration - cPanel PhpMyAdmin Guide

## 🎯 What You Need to Do

Add two columns to the `users` table to support password reset functionality.

---

## Step-by-Step Instructions

### Method 1: Using cPanel PhpMyAdmin (Easiest)

#### 1. Login to cPanel
- Go to: `https://yourdomain.com:2083` or your cPanel URL
- Enter your cPanel username and password
- Click "Login"

#### 2. Open PhpMyAdmin
- In cPanel, scroll down and find **"Databases"** section
- Click on **"phpMyAdmin"**
- OR directly: `https://yourdomain.com/phpmyadmin`

#### 3. Select Your Database
- In the left sidebar, click on your database name
- Default name: `online_exam_db` (or whatever you called it)

#### 4. Select the `users` Table
- In the left sidebar under your database, find the `users` table
- Click on it

#### 5. Go to SQL Tab
- At the top of the screen, click on the **"SQL"** tab

#### 6. Copy & Paste the SQL Commands Below
```sql
-- Add reset_token column
ALTER TABLE users ADD COLUMN reset_token VARCHAR(255) NULL 
COMMENT 'Hashed password reset token';

-- Add reset_token_expires column
ALTER TABLE users ADD COLUMN reset_token_expires TIMESTAMP NULL 
COMMENT 'When the reset token expires';
```

#### 7. Click "Go" Button
- Paste the SQL above into the text area
- Click the **"Go"** button (usually at the bottom right)

#### 8. Verify Success
You should see a message like:
```
Query successful!
```

Or if columns already exist, you'll see:
```
#1060 - Duplicate column name 'reset_token'
```
(This is fine - it just means the columns already exist)

---

### Method 2: Using cPanel Raw SQL Interface

#### 1. Login to cPanel
- Go to: `https://yourdomain.com:2083`
- Enter credentials

#### 2. Find MySQL Access
- Go to **"Databases"** > **"Remote MySQL"** or **"MySQL Databases"**
- You'll see your database credentials:
  - **Database name:**
  - **Username:**
  - **Password:**
  - **Host:** (usually `localhost` or IP address)

#### 3. Run Commands
Copy these exact SQL commands:

```sql
USE online_exam_db;

ALTER TABLE users ADD COLUMN reset_token VARCHAR(255) NULL 
COMMENT 'Hashed password reset token';

ALTER TABLE users ADD COLUMN reset_token_expires TIMESTAMP NULL 
COMMENT 'When the reset token expires';
```

Run each command in sequence.

---

## ✅ Verification

### Check if columns were added successfully:

**In PhpMyAdmin:**
1. Select the `users` table
2. Click **"Structure"** tab
3. Scroll down - you should see two new columns:
   - `reset_token` (VARCHAR 255)
   - `reset_token_expires` (TIMESTAMP)

**Or run this SQL to verify:**
```sql
DESCRIBE users;
```

You should see:
```
| Field                  | Type          | Null | Key |
|------------------------|---------------|------|-----|
| id                     | int(11)       | NO   | PRI |
| username               | varchar(100)  | NO   | UNI |
| password               | varchar(255)  | NO   |     |
| role                   | enum(...)     | NO   |     |
| email                  | varchar(100)  | YES  |     |
| reset_token            | varchar(255)  | YES  |     | ← NEW
| reset_token_expires    | timestamp     | YES  |     | ← NEW
| created_at             | timestamp     | NO   |     |
```

---

## 🚨 If Something Goes Wrong

### Error: "Duplicate column name"
**Solution:** The columns already exist - that's fine! No action needed.

### Error: "Table doesn't exist"
**Solution:** Make sure you selected the correct database and table name.

### Error: "Access denied"
**Solution:** 
1. Make sure your database user has ALTER privileges
2. In cPanel, go to **Databases > MySQL Users**
3. Find your user and make sure "ALTER" is checked

### Error: "Connection refused"
**Solution:**
1. Make sure the database is running
2. Check your database credentials are correct
3. Restart MySQL from cPanel

---

## 📝 Alternative: Single Combined Command

If you want to run everything at once, copy this:

```sql
ALTER TABLE users ADD COLUMN reset_token VARCHAR(255) NULL COMMENT 'Hashed password reset token', ADD COLUMN reset_token_expires TIMESTAMP NULL COMMENT 'When the reset token expires';
```

---

## 🔒 Security Note

These columns are safe to add anytime:
- They don't affect existing data
- They're only used for password reset tokens
- Tokens are hashed (not plaintext)
- Tokens expire in 1 hour

---

## ✨ After Migration

Once you've added these columns, your backend can:
1. ✅ Send password reset emails
2. ✅ Store reset tokens securely
3. ✅ Validate token expiration
4. ✅ Update passwords safely

No code changes needed - the email service is already configured to use these columns!

---

## 📸 Screenshots / Visual Guide

### PhpMyAdmin Steps:
```
1. cPanel Dashboard
        ↓
2. Databases Section
        ↓
3. Click "phpMyAdmin"
        ↓
4. Select "online_exam_db" (left sidebar)
        ↓
5. Click "users" table (left sidebar)
        ↓
6. Click "SQL" tab (top menu)
        ↓
7. Paste SQL commands
        ↓
8. Click "Go" button
        ↓
9. ✅ Success message
```

---

## 🎯 Quick Copy-Paste Solution

**Just copy and paste this in PhpMyAdmin SQL tab:**

```sql
ALTER TABLE users ADD COLUMN reset_token VARCHAR(255) NULL COMMENT 'Hashed password reset token';
ALTER TABLE users ADD COLUMN reset_token_expires TIMESTAMP NULL COMMENT 'When the reset token expires';
```

That's it! ✅

---

## Need Help?

If you get stuck:
1. Check your database is named correctly
2. Verify you're in the right table (`users`)
3. Make sure syntax is exactly as shown above
4. Check user permissions in cPanel Database Users

After this, your password reset system is ready to go! 🚀
