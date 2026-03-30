# Fix 1: Add Missing Database Columns to Users Table

**Problem:** Backend crashed because `reset_token` and `reset_token_expires` columns don't exist in the users table.

**Solution:** Add these columns using cPanel phpMyAdmin.

---

## Step-by-Step Guide

### Step 1: Open phpMyAdmin in cPanel

1. Go to **cPanel Dashboard**
2. Look for **"phpMyAdmin"** (usually under "Databases" section)
3. Click on it
4. It opens phpMyAdmin in a new tab

---

### Step 2: Select Your Database

1. On the left sidebar, find **"freshmil_oes"** database
2. Click on it
3. You should see list of tables

---

### Step 3: Select Users Table

1. Click on **"users"** table
2. Look for **"SQL"** tab at the top
3. Click on **"SQL"** tab

---

### Step 4: Run the SQL Command

Copy and paste this into the SQL editor:

```sql
ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_token VARCHAR(255) NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_token_expires TIMESTAMP NULL;
```

Then click **"Go"** button (bottom right, usually blue).

---

## Alternative Method (Using Structure Tab)

If you prefer the visual way:

1. Click **"users"** table
2. Click **"Structure"** tab at top
3. Scroll down to bottom
4. Look for **"Add 1 field at the end of the table"** link
5. Add two new fields:
   - **Field Name:** `reset_token`
   - **Type:** `VARCHAR(255)`
   - **Null:** `YES`
   
6. Click again to add second field:
   - **Field Name:** `reset_token_expires`
   - **Type:** `TIMESTAMP`
   - **Null:** `YES`

---

## Verify It Worked

After running the SQL:

1. Click **"Structure"** tab
2. Scroll down and look for:
   - `reset_token` column ✓
   - `reset_token_expires` column ✓

Both should be there now.

---

## After Adding Columns

1. Close phpMyAdmin
2. Go back to **cPanel → Node.js Application Manager**
3. Click **"Restart"** on your app
4. Wait **45 seconds**
5. Try: `https://oes.freshmilkstraightfromsource.com/`

It should work now! 🎯

---

## If You Get Error in phpMyAdmin

**"MySQL Error: Unknown column 'reset_token'"**

This actually means the columns don't exist, which is exactly what we're fixing. That's good!

Just run the SQL command above and it will add them.

---

## Need Help?

Let me know:
1. Did you find phpMyAdmin? ✓
2. Did the SQL command run successfully? ✓
3. Can you see the new columns in Structure tab? ✓
4. Does the website work now? ✓

