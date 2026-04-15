# Hostinger MySQL Setup Guide

This guide walks you through setting up the Online Examination System using **Hostinger's MySQL database**.

---

## 🔧 Step 1: Create MySQL Database in Hostinger

### Access Hostinger Control Panel
1. Go to [Hostinger.com](https://hostinger.com) and log in
2. Navigate to **Hosting → Manage** (or your hosting dashboard)
3. Look for **MySQL Databases** or **Databases** section

### Create a New Database
1. Click **+ Create Database**
2. Enter database name: `online_exam_db`
3. Enter username: `examuser` (or your preferred name)
4. Enter password: Create a **strong password** (you'll need this)
5. Click **Create Database**

### Get Your Connection Details
You'll see:
- **Host/Server:** (format like `mysql1.hostinger.xxxxx.com` or similar)
- **Database Name:** `online_exam_db`
- **Username:** `examuser`
- **Port:** Usually `3306` (default MySQL port)
- **Password:** The one you created

---

## 📋 Step 2: Configure Backend for Hostinger

### Copy and Edit `.env`

```bash
cd backend
cp .env.example .env
```

### Edit `backend/.env` with Hostinger Credentials

```env
PORT=5000
DB_HOST=mysql1.hostinger.xxxxx.com
DB_PORT=3306
DB_USER=examuser
DB_PASSWORD=your_strong_password_here
DB_NAME=online_exam_db
```

**Replace placeholders:**
- `mysql1.hostinger.xxxxx.com` → Your actual Hostinger MySQL host
- `examuser` → Your database username
- `your_strong_password_here` → Your database password

---

## 🗄️ Step 3: Import Database Schema into Hostinger MySQL

### Option A: Using Hostinger Control Panel (Easiest)

1. In Hostinger dashboard, find **Database Management** or **phpmyadmin**
2. Click on your database `online_exam_db`
3. Click **Import** tab
4. Upload `backend/sql/setup.sql` file
5. Click **Go/Execute**

✅ Your database schema + seed data is now imported!

### Option B: Using MySQL Command Line (If You Have SSH Access)

```bash
# From your local machine
mysql -h mysql1.hostinger.xxxxx.com \
       -u examuser \
       -p \
       online_exam_db < backend/sql/setup.sql

# When prompted, enter your Hostinger database password
```

### Option C: Copy-Paste SQL Manually

1. Open `backend/sql/setup.sql` in a text editor
2. In Hostinger phpmyadmin, go to **SQL** tab
3. Paste entire content
4. Click **Execute**

---

## ✅ Step 4: Verify Database Connection

### Test from Your Local Machine

```bash
cd backend
npm install
node src/server.js
```

You should see:
```
Backend running on http://localhost:5000
```

Test the health endpoint:
```bash
curl http://localhost:5000/api/health
```

Expected response:
```json
{
  "status": "ok",
  "message": "API and DB are reachable"
}
```

If you get an error, double-check:
- Hostinger host/username/password in `.env`
- Database name matches exactly
- Port is 3306

---

## 🧪 Step 5: Verify Seeded Data

### Check Users Were Imported

```bash
mysql -h mysql1.hostinger.xxxxx.com \
       -u examuser \
       -p \
       online_exam_db

# At MySQL prompt:
SELECT * FROM users;
```

You should see:
```
+----+----------+----------+----------+-------------------+---------------------+
| id | username | password | role     | email             | created_at          |
+----+----------+----------+----------+-------------------+---------------------+
| 1  | student1 | student123 | student | student1@exam.com | 2026-03-15 10:00:00 |
| 2  | student2 | student456 | student | student2@exam.com | 2026-03-15 10:00:00 |
| 3  | professor1 | prof123 | professor | professor1@exam.com | 2026-03-15 10:00:00 |
| 4  | professor2 | prof456 | professor | professor2@exam.com | 2026-03-15 10:00:00 |
| 5  | admin1 | admin123 | admin | admin@exam.com | 2026-03-15 10:00:00 |
```

---

## 🚀 Step 6: Run Both Applications

### Terminal 1 - Start Backend (Connected to Hostinger MySQL)

```bash
cd backend
npm run dev
```

Server should connect and be ready:
```
Backend running on http://localhost:5000
```

### Terminal 2 - Start Frontend

```bash
cd frontend
npm run dev
```

Frontend will be available at:
```
http://localhost:5173
```

---

## 🧑‍🔬 Step 7: Test with Hostinger MySQL

### Login and Test
1. Open `http://localhost:5173` in browser
2. Login as `student1 / student123`
3. ✅ If login works, you're connected to Hostinger MySQL!

### Try Admin Functions
- Login as `admin1 / admin123`
- Go to **Manage Users**
- Try creating a new user
- Data will be stored in your **Hostinger database**

---

## 🌐 Step 8: Deploy Frontend & Backend to Hostinger (Optional)

### Deploy Backend to Hostinger

If your Hostinger plan has **Node.js support**:

1. In Hostinger dashboard, enable **Node.js** application
2. Upload backend code (or git clone)
3. Set environment variables in Hostinger:
   - `DB_HOST`, `DB_USER`, `DB_PASSWORD`, etc.
4. Deploy and get a public URL (e.g., `https://yourapp.com/api`)

### Deploy Frontend to Hostinger

1. Build React app:
   ```bash
   cd frontend
   npm run build
   ```

2. Upload `frontend/dist/` folder to Hostinger public_html

3. Update `frontend/.env` to point to deployed backend:
   ```env
   VITE_API_URL=https://yourapp.com/api
   ```

---

## 🔐 Security Considerations for Production

When using Hostinger for production:

1. **Use HTTPS** - Hostinger provides free SSL
2. **Replace plaintext passwords** with bcrypt hashing
3. **Add rate limiting** to login endpoint
4. **Use JWT tokens** instead of session-based auth
5. **Restrict database access** to only your app server IP
6. **Enable database backups** in Hostinger settings
7. **Use strong database passwords** (not like `admin123`)
8. **Keep database private** - don't expose credentials

---

## 📞 Troubleshooting

### "Can't connect to MySQL server"
- ✓ Check Hostinger host, user, password in `.env`
- ✓ Verify database exists in Hostinger
- ✓ Check if database is active (not suspended)
- ✓ Try connecting via Hostinger phpmyadmin first

### "Access denied for user"
- ✓ Verify username and password are **exactly** as shown in Hostinger
- ✓ Make sure you're using the correct database user (not admin)
- ✓ Check for extra spaces in `.env`

### "Schema/tables not found"
- ✓ Re-import `backend/sql/setup.sql` using phpmyadmin
- ✓ Verify you're importing to the correct database

### "CORS errors when testing from frontend"
- ✓ Backend `.env` PORT is set (default 5000)
- ✓ Frontend `.env` has correct backend URL
- ✓ Backend has `cors()` middleware enabled

### "Login returns 404"
- ✓ Ensure backend is running (`npm run dev`)
- ✓ Check backend health: `curl http://localhost:5000/api/health`

---

## 📊 Hostinger MySQL Specifications

| Feature | Value |
|---------|-------|
| **Host Format** | `mysqlX.hostinger.com` or `mysql.your-domain.com` |
| **Default Port** | 3306 |
| **Max Connections** | Varies by plan (usually 50-100) |
| **Storage Limit** | Depends on hosting plan |
| **Backups** | Usually included |
| **SSL Support** | Yes, free |
| **Remote Access** | May need to whitelist your IP |

---

## ✨ You're Ready!

Your Online Examination System is now running with **Hostinger MySQL**:
- ✅ Database hosted on Hostinger
- ✅ Backend connected and pulling data
- ✅ Frontend ready to test
- ✅ All seed users available
- ✅ Full role-based access

**Next steps:**
1. Test login with Hostinger credentials ✓
2. Create new exams as professor
3. Submit answers as student
4. View system analytics as admin
5. Deploy to production when ready

Enjoy! 🎓
