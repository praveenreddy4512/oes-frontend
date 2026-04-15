# Online Examination System Login (Intentionally Vulnerable Demo)

This project implements a role-based login system using:

- React (frontend)
- Express (backend)
- MySQL (database)

Roles supported:

- `student`
- `professor`
- `admin`

Database table used:

- `users(id, username, password, role)`

## Important Warning

This step **intentionally stores passwords in plaintext** to demonstrate insecurity.
Do not use this approach in production.

## Project Structure

- `backend/` Express API + MySQL connection
- `frontend/` React login form (Vite)

## 1) Setup MySQL (Local or Free Online)

You can use a free MySQL provider (examples: `db4free.net`, `PlanetScale` free tier when available, `Aiven` trial/free offers).

After getting DB credentials, configure backend env:

1. Copy `backend/.env.example` to `backend/.env`
2. Fill in:
   - `DB_HOST`
   - `DB_PORT`
   - `DB_USER`
   - `DB_PASSWORD`
   - `DB_NAME`

Create schema and seed data:

```sql
SOURCE backend/sql/setup.sql;
```

If your MySQL client does not support `SOURCE`, paste the contents of `backend/sql/setup.sql` manually.

## 2) Install Dependencies

Backend:

```bash
cd backend
npm install
```

Frontend:

```bash
cd ../frontend
npm install
```

## 3) Configure Frontend API URL

1. Copy `frontend/.env.example` to `frontend/.env`
2. Keep or edit:

```env
VITE_API_URL=http://localhost:5000
```

## 4) Run the Application

Terminal 1:

```bash
cd backend
npm run dev
```

Terminal 2:

```bash
cd frontend
npm run dev
```

Open the frontend URL shown by Vite (usually `http://localhost:5173`).

## 5) Test Login

Use seeded users:

- `student1 / student123`
- `professor1 / prof123`
- `admin1 / admin123`

## 6) Burp Suite Intercept Demonstration

1. Start Burp Suite.
2. Configure browser proxy to Burp (usually `127.0.0.1:8080`).
3. In Burp, go to **Proxy -> Intercept** and click **Intercept is on**.
4. Try login as `student1` in the React app.
5. In Burp request view, inspect body. You will see plaintext JSON like:

```json
{"username":"student1","password":"student123"}
```

This proves the password is transmitted in readable form in the request body.

## 7) Verify Plaintext Passwords in MySQL

Run:

```sql
USE online_exam_db;
SELECT id, username, password, role FROM users;
```

You will see passwords directly (e.g., `student123`, `prof123`, `admin123`).

## Why Plaintext Password Storage Is Insecure

- If the database is leaked, all user passwords are immediately exposed.
- Attackers can reuse stolen passwords on other websites (credential stuffing).
- Insiders with DB access can read all passwords.
- A backup leak is enough to compromise every account.

## How an Attacker Could Steal Credentials

- Intercept traffic on an insecure network or compromised endpoint and read login bodies.
- Breach the database and directly exfiltrate the `users` table.
- Use leaked plaintext credentials to log in as users/admin and escalate access.
- Reuse those credentials against email, social media, or enterprise accounts.

## Next Secure Step (After This Demo)

Replace plaintext storage with salted hashing using `bcrypt`, use HTTPS everywhere, and add rate limiting + session/token hardening.
