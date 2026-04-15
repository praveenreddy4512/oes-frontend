# Direct SQL Queries for cPanel phpMyAdmin

## 📋 Run These Queries in cPanel phpMyAdmin

### Step 1: Log into cPanel phpMyAdmin
1. Go to cPanel
2. Click **phpMyAdmin**
3. Select database: **freshmil_oes**
4. Click **SQL** tab

---

## ✅ SQL Query 1: Add previous_fingerprint Column

```sql
ALTER TABLE users ADD COLUMN IF NOT EXISTS previous_fingerprint VARCHAR(255) DEFAULT NULL;
```

---

## ✅ SQL Query 2: Add session_invalidated_at Column

```sql
ALTER TABLE users ADD COLUMN IF NOT EXISTS session_invalidated_at TIMESTAMP NULL;
```

---

## ✅ SQL Query 3: Verify Columns (Optional - to confirm it worked)

```sql
DESC users;
```

This will show all columns. You should see:
- `previous_fingerprint` (varchar(255))
- `session_invalidated_at` (timestamp)

---

## 🚀 Quick Copy-Paste Method

**Option A: One by one**

1. Copy Query 1, paste in SQL tab, click **Go**
2. Wait for success message
3. Copy Query 2, paste in SQL tab, click **Go**
4. Done!

**Option B: All together**

Paste this entire block in the SQL tab and click **Go**:

```sql
ALTER TABLE users ADD COLUMN IF NOT EXISTS previous_fingerprint VARCHAR(255) DEFAULT NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS session_invalidated_at TIMESTAMP NULL;
```

---

## ✅ Success Indicators

You should see messages like:
- ✅ `Query executed successfully`
- ✅ `Affected rows: 0` (columns already exist) or `1` (columns added)

**If you see these, migration is complete!** 🎉

---

## ⚠️ If You Get an Error

### Error: "Column already exists"
👉 **This is FINE!** It means the migration was already done. You can safely ignore.

### Error: "Syntax error"
👉 **Copy-paste the query exactly as shown above**

### Error: "Table not found"
👉 **Make sure you've selected the correct database (freshmil_oes)**

---

## Next: Restart Your Backend

After running the SQL:

1. Go to cPanel
2. Find **Node.js Applications**
3. Click **Restart** on your app
4. Wait 30 seconds for it to restart

**Multi-login security is now ACTIVE!** ✅
