# Online Examination System (Intentionally Vulnerable Demo)

This project implements a **complete role-based online examination platform** with plaintext password storage for security demonstration purposes.

**Technologies:** React + Express + MySQL | **Roles:** Student, Professor, Admin

---

## 🔐 Security Notice

This project **intentionally stores passwords in plaintext** to demonstrate critical security vulnerabilities. **Never use this approach in production.**

---

## 📋 Features Overview

### ✅ Authentication
- Login system with role-based access control
- Three roles: Student, Professor, Admin
- Plaintext password storage (for demo purposes)

### 👤 Role-Based Pages

#### **Student Portal**
- **Dashboard**: Quick links to exams, results, and profile
- **Browse Exams**: View all published exams
- **Take Exam**: Interactive exam interface with timer and question answering
- **View Results**: See past exam scores, percentages, and pass/fail status
- **Profile**: View and edit personal information

#### **Professor Portal**
- **Dashboard**: Quick access to exam management and grading
- **Create Exam**: Create new exams with title, description, duration, and passing score
- **Manage Exams**: Edit, delete, and view all created exams
- **Grade Submissions**: Review student exam submissions
- **View Results**: Analytics on student performance
- **Profile**: View profile information

#### **Admin Portal**
- **Dashboard**: System overview and quick actions
- **Manage Users**: Create, view, and delete users (student, professor, admin)
- **Manage Exams**: View and control all exams in the system
- **System Statistics**: View aggregate data (total exams, students, avg score, pass/fail rates)
- **Settings**: Configure system parameters
- **User Management**: Bulk user operations

---

## 🗄️ Database Schema

### Tables:
- **users**: User accounts with plaintext passwords
- **exams**: Exam metadata created by professors
- **questions**: Multiple choice questions attached to exams
- **submissions**: Student exam attempts
- **answers**: Individual student answers to questions
- **results**: Final scores and pass/fail for each submission

---

## 🚀 Quick Start

### 1. Setup MySQL

Use a free MySQL provider:
- [db4free.net](https://db4free.net)
- [PlanetScale](https://planetscale.com) (free tier)
- [Aiven](https://aiven.io) (free trial)
- Or local MySQL

### 2. Create Database & Schema

```bash
cd backend
# Copy SQL file contents and paste into MySQL client, OR:
mysql -u root -p online_exam_db < sql/setup.sql
```

Or manually run:
```sql
SOURCE backend/sql/setup.sql;
```

### 3. Configure Backend

```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env` with your MySQL credentials:
```env
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=online_exam_db
```

### 4. Configure Frontend

```bash
cp frontend/.env.example frontend/.env
```

Keep default or edit API URL:
```env
VITE_API_URL=http://localhost:5000
```

### 5. Install & Run

**Terminal 1 - Backend:**
```bash
cd backend
npm install
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:5173` (usually)

---

## 🔓 Test Credentials

All passwords stored in plaintext (seeded in database):

| Role | Username | Password | Email |
|------|----------|----------|-------|
| Student | student1 | student123 | student1@exam.com |
| Student | student2 | student456 | student2@exam.com |
| Professor | professor1 | prof123 | professor1@exam.com |
| Professor | professor2 | prof456 | professor2@exam.com |
| Admin | admin1 | admin123 | admin@exam.com |

---

## 🛡️ Burp Suite Testing Procedure

### Intercept Login Request (Plaintext Password)

1. **Start Burp Suite** (Community or Pro)
2. **Configure Browser Proxy:**
   - Set to `127.0.0.1:8080`
   - Example for Chrome: Settings → Proxy setup (or use FoxyProxy extension)
3. **Turn on Burp Intercept:**
   - Proxy → Intercept → "Intercept is on"
4. **Login in Frontend:**
   - Username: `student1`
   - Password: `student123`
5. **Inspect Request in Burp:**
   - Captured request shows plaintext JSON:
   ```json
   {
     "username": "student1",
     "password": "student123"
   }
   ```
   - Password is **visible in clear**

### Observe Plaintext in MySQL

1. **Connect to MySQL:** `mysql -u root -p online_exam_db`
2. **Query passwords:**
   ```sql
   SELECT id, username, password, role FROM users;
   ```
3. **Result:**
   - Passwords shown directly: `student123`, `prof123`, `admin123`

---

## 🚨 Why Plaintext Passwords Are Insecure

| Vulnerability | Impact |
|---|---|
| **Database Breach** | Every password instantly compromised |
| **Credential Reuse** | Attackers use stolen passwords on other sites |
| **Insider Threat** | DBAs/admins can read user passwords directly |
| **Backup Exposure** | Database backups leak all credentials |
| **Traffic Interception** | Network traffic sniffers capture passwords |
| **No Recovery** | Can't tell if passwords were stolen |

---

## ⚠️ How an Attacker Could Steal Credentials

### Attack Scenario 1: Network Interception
- Attacker intercepts unencrypted HTTP traffic on public WiFi
- Captures plaintext password from login payload
- Uses credentials to access system as student/professor/admin

### Attack Scenario 2: Database Breach
- Attacker exploits SQL injection or database server vulnerability
- Exfiltrates entire `users` table with plaintext passwords
- Tests passwords on this system and other sites (credential stuffing)

### Attack Scenario 3: Insider Threat
- Malicious DBA queries `SELECT * FROM users`
- Sees all passwords immediately
- Uses to escalate privileges or launch targeted attacks

### Attack Scenario 4: Backup Leak
- Database backup copied to insecure storage
- Backup discovered by attacker (cloud misconfiguration, etc.)
- Plaintext passwords extracted from backup

---

## 📚 API Endpoints

### Authentication
- `POST /api/login` - Login (plaintext)

### Exams (CRUD)
- `GET /api/exams` - Get all exams
- `GET /api/exams/:id` - Get exam with questions
- `POST /api/exams` - Create exam (professor/admin)
- `PUT /api/exams/:id` - Update exam
- `DELETE /api/exams/:id` - Delete exam

### Questions
- `GET /api/questions/exam/:exam_id` - Get questions for exam
- `POST /api/questions` - Add question
- `PUT /api/questions/:id` - Update question
- `DELETE /api/questions/:id` - Delete question

### Submissions
- `POST /api/submissions` - Start exam submission
- `POST /api/submissions/:id/answer` - Submit answer
- `POST /api/submissions/:id/submit` - Finalize submission

### Results
- `GET /api/results/student/:student_id` - Get student results
- `GET /api/results/exam/:exam_id` - Get exam results
- `GET /api/results/:result_id` - Get detailed result

### Users (Admin)
- `GET /api/users` - Get all users
- `POST /api/users` - Create user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

---

## 🔒 Next Steps: Implement Security

### Replace Plaintext Passwords with Bcrypt
```javascript
import bcrypt from 'bcrypt';

// Hashing: During registration/update
const hashedPassword = await bcrypt.hash(plainPassword, 10);

// Verification: During login
const isValid = await bcrypt.compare(inputPassword, hashedPassword);
```

### Use HTTPS/TLS
- Encrypt data in transit
- Prevents network interception

### Add Rate Limiting
- Prevent brute force attacks
- Example: Limit login attempts to 5 per minute

### Implement Session/JWT Tokens
- Replace plaintext password checks with secure tokens
- Add token expiration
- Example: `Authorization: Bearer <jwt_token>`

### Password Policy
- Enforce minimum length (12+ characters)
- Require uppercase, lowercase, numbers, symbols
- Prevent password reuse

### Logging & Monitoring
- Log all login attempts
- Alert on suspicious activity
- Monitor for unusual access patterns

---

## 📁 Project Structure

```
cyberproject/
├── backend/
│   ├── src/
│   │   ├── server.js          # Express server
│   │   ├── db.js              # MySQL connection
│   │   └── routes/
│   │       ├── exams.js
│   │       ├── questions.js
│   │       ├── submissions.js
│   │       ├── results.js
│   │       └── users.js
│   ├── sql/
│   │   └── setup.sql          # Database schema
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── Navbar.jsx
│   │   ├── pages/
│   │   │   ├── LoginPage.jsx
│   │   │   ├── StudentDashboard.jsx
│   │   │   ├── StudentExams.jsx
│   │   │   ├── StudentResults.jsx
│   │   │   ├── StudentProfile.jsx
│   │   │   ├── TakeExam.jsx
│   │   │   ├── ProfessorDashboard.jsx
│   │   │   ├── ProfessorExams.jsx
│   │   │   ├── CreateExam.jsx
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── AdminUsers.jsx
│   │   │   ├── AdminExams.jsx
│   │   │   ├── AdminStatistics.jsx
│   │   │   └── AdminSettings.jsx
│   │   ├── styles/
│   │   │   ├── app.css
│   │   │   ├── navbar.css
│   │   │   ├── dashboard.css
│   │   │   ├── login.css
│   │   │   └── pages.css
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── .env.example
├── README.md
└── .gitignore
```

---

## ⚡ Common Issues

### MySQL Connection Error
- Check `.env` credentials match your MySQL instance
- Ensure MySQL service is running
- Verify database `online_exam_db` exists

### Port Already in Use
- Backend default: 5000 (change in `.env`)
- Frontend default: 5173 (Vite auto-increments if busy)

### CORS Error
- Ensure `frontend/.env` has correct `VITE_API_URL`
- Backend has `cors()` middleware enabled

### Login Always Fails
- Check seeded users in MySQL: `SELECT * FROM users;`
- Verify plaintext password comparison in `/api/login`

---

## 📝 License

This is an educational demonstration project for understanding security vulnerabilities.

---

## 🎯 Educational Goals

This project teaches:
1. **Plaintext Password Vulnerabilities** - Why they're catastrophic
2. **Attack Vectors** - Network interception, database breaches, insider threats
3. **Secure Alternatives** - Hashing, HTTPS, rate limiting, tokens
4. **Full-Stack Development** - React + Express + MySQL integration
5. **Burp Suite Usage** - Intercepting and analyzing HTTP traffic

**Always apply security best practices in production code.**
