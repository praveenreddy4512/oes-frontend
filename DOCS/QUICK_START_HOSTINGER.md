# 🚀 Quick Start Checklist - Hostinger MySQL

Use this checklist to get your system running with Hostinger in ~5 minutes.

---

## ✅ Hostinger Dashboard Setup (5 min)

- [ ] Log in to Hostinger control panel
- [ ] Navigate to **MySQL Databases**
- [ ] Click **Create Database**
  - Database name: `online_exam_db`
  - Username: `examuser`
  - Password: (create strong password, copy it!)
- [ ] Click **Create Database**
- [ ] Copy these details:
  - Host: ________________________
  - Username: ________________________
  - Password: ________________________
  - Database: `online_exam_db`

---

## 💻 Local Backend Setup (5 min)

```bash
cd backend
cp .env.example .env
```

Open `backend/.env` and fill in:
```env
PORT=5000
DB_HOST=[Hostinger Host from above]
DB_PORT=3306
DB_USER=[Hostinger Username]
DB_PASSWORD=[Hostinger Password]
DB_NAME=online_exam_db
```

- [ ] `.env` file created with Hostinger credentials
- [ ] Verify no extra spaces in values
- [ ] Save file

---

## 📊 Import Database Schema (5 min)

### Option A: Hostinger phpmyadmin (Easiest)
- [ ] In Hostinger, click **Database Management** / **phpmyadmin**
- [ ] Select database `online_exam_db`
- [ ] Click **Import** tab
- [ ] Upload file: `backend/sql/setup.sql`
- [ ] Click **Execute/Go**
- [ ] See "Success" message

### Option B: Command Line (If you have MySQL client)
```bash
mysql -h [Host] -u [User] -p [Database] < backend/sql/setup.sql
# Enter password when prompted
```

- [ ] Schema imported successfully

---

## 🔌 Test Connection (2 min)

```bash
cd backend
npm install
npm run dev
```

Watch for message:
```
Backend running on http://localhost:5000
```

Then test:
```bash
curl http://localhost:5000/api/health
```

Should return:
```json
{"status":"ok","message":"API and DB are reachable"}
```

- [ ] Backend connected to Hostinger MySQL ✓

---

## 🎨 Start Frontend (2 min)

```bash
cd frontend
npm install
npm run dev
```

Opens at: `http://localhost:5173`

- [ ] Frontend running ✓

---

## 🧪 Test Login (1 min)

In browser at `http://localhost:5173`:

**Test as Student:**
- Username: `student1`
- Password: `student123`
- [ ] ✓ Login successful → Dashboard appears

**Test as Admin (create new user):**
- Log out → Login as `admin1` / `admin123`
- Go to **Manage Users** → **+ Add User**
- Create test user with role `student`
- [ ] ✓ User appears in Hostinger MySQL

---

## 🔒 Verify Plaintext Passwords in Hostinger MySQL

In Hostinger phpmyadmin:
1. Select database `online_exam_db`
2. Click **users** table
3. View data

- [ ] ✓ See plaintext passwords: `student123`, `prof123`, etc.

---

## 🛡️ Burp Suite Demo (5 min)

1. Start Burp Suite
2. Set browser proxy to `127.0.0.1:8080`
3. Enable Intercept in Burp
4. Logout and try login in frontend
5. In Burp, see plaintext JSON:
```json
{"username":"student1","password":"student123"}
```

- [ ] ✓ Password visible in plaintext in intercept

---

## ✨ Done!

You now have:
- ✅ Hostinger MySQL database
- ✅ Backend connected to Hostinger
- ✅ Frontend running locally
- ✅ Full test data seeded
- ✅ Plaintext password vulnerability demonstrated

---

## 📁 File Reference

| File | Purpose |
|------|---------|
| `backend/.env` | Your Hostinger credentials |
| `backend/sql/setup.sql` | Schema to import into Hostinger |
| `HOSTINGER_SETUP.md` | Detailed setup guide |
| `README_COMPREHENSIVE.md` | Full system documentation |

---

## 🆘 Quick Troubleshooting

**"Can't connect to database"**
- Check `.env` values match Hostinger exactly
- Try connecting via Hostinger phpmyadmin first

**"Login returns 404"**
- Ensure backend is running (`npm run dev`)
- Test: `curl http://localhost:5000/api/health`

**"SQL import failed"**
- Delete all tables in Hostinger database first
- Then re-import `setup.sql`

---

Estimated total time: **~20-25 minutes**
