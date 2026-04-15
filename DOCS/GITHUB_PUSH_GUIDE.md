# Push Backend & Frontend to GitHub - Step-by-Step Guide

## 📋 Prerequisites

1. ✅ GitHub account created (https://github.com)
2. ✅ Git installed on your machine (`git --version`)
3. ✅ SSH key or GitHub token set up
4. ✅ Two empty repositories created on GitHub (one for backend, one for frontend)

---

## 🚀 Step 1: Create GitHub Repositories

### A. Create Backend Repository
1. Go to https://github.com/new
2. **Repository name:** `cyberproject-backend` (or your choice)
3. **Description:** Online Exam System - Backend (Node.js)
4. **Visibility:** Public or Private (your choice)
5. **Do NOT initialize** with README, .gitignore, or license
6. Click **"Create repository"**
7. **Copy the HTTPS URL** (looks like: `https://github.com/yourname/cyberproject-backend.git`)

### B. Create Frontend Repository
1. Go to https://github.com/new
2. **Repository name:** `cyberproject-frontend` (or your choice)
3. **Description:** Online Exam System - Frontend (React/Vue)
4. **Visibility:** Public or Private (your choice)
5. **Do NOT initialize** with README, .gitignore, or license
6. Click **"Create repository"**
7. **Copy the HTTPS URL** (looks like: `https://github.com/yourname/cyberproject-frontend.git`)

---

## 🔧 Step 2: Initialize & Push Backend

### Terminal Commands:

```bash
# Navigate to backend directory
cd /home/praveen/Desktop/projects/cyberproject/backend

# Initialize git repository
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: Backend setup with email notifications and password reset"

# Add remote (replace with YOUR repository URL)
git remote add origin https://github.com/YOUR-USERNAME/cyberproject-backend.git

# Push to GitHub (replace 'main' if your default branch is different)
git branch -M main
git push -u origin main
```

### Expected Output:
```
Counting objects: 234, done.
Delta compression using up to 8 threads.
Compressing objects: 100% (150/150), done.
Writing objects: 100% (234/234), ...
remote: Resolving deltas: 100% (84/84), done.
To https://github.com/yourname/cyberproject-backend.git
 * [new branch]      main -> main
Branch 'main' set up to track remote branch 'main' from 'origin'.
```

---

## 🎨 Step 3: Initialize & Push Frontend

### Terminal Commands:

```bash
# Navigate to frontend directory
cd /home/praveen/Desktop/projects/cyberproject/frontend

# Initialize git repository
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: Frontend setup with exam interface and password reset"

# Add remote (replace with YOUR repository URL)
git remote add origin https://github.com/YOUR-USERNAME/cyberproject-frontend.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### Expected Output:
```
Counting objects: 456, done.
Delta compression using up to 8 threads.
Compressing objects: 100% (300/300), done.
Writing objects: 100% (456/456), ...
remote: Resolving deltas: 100% (156/156), done.
To https://github.com/yourname/cyberproject-frontend.git
 * [new branch]      main -> main
Branch 'main' set up to track remote branch 'main' from 'origin'.
```

---

## 📝 Step 4: Create .gitignore Files (IMPORTANT!)

### Backend .gitignore

Create file: `backend/.gitignore`

```
# Environment variables (NEVER commit these!)
.env
.env.local
.env.*.local

# Dependencies
node_modules/
package-lock.json
yarn.lock

# Logs
logs/
*.log
npm-debug.log*
yarn-debug.log*

# Session files
sessions/

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# OS
.DS_Store
Thumbs.db

# Build
dist/
build/

# Testing
coverage/
.nyc_output/

# Misc
.tmp/
temp/
```

### Frontend .gitignore

Create file: `frontend/.gitignore`

```
# Environment variables (NEVER commit these!)
.env
.env.local
.env.*.local

# Dependencies
node_modules/
package-lock.json
yarn.lock

# Logs
logs/
*.log
npm-debug.log*
yarn-debug.log*

# Build outputs
dist/
build/

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# OS
.DS_Store
Thumbs.db

# Testing
coverage/
.nyc_output/

# Misc
.tmp/
temp/
.cache/
```

### Root .gitignore (Optional, for main repo)

Create file: `/cyberproject/.gitignore`

```
# Node
node_modules/
package-lock.json
yarn.lock

# Environment
.env
.env.local
.env.*.local

# IDE
.vscode/
.idea/

# OS
.DS_Store

# Logs
*.log
logs/

# Session files
sessions/

# Build
dist/
build/
```

---

## ✅ Step 5: Push Root Documentation (Optional)

If you want to push all docs and root files:

```bash
# Navigate to project root
cd /home/praveen/Desktop/projects/cyberproject

# Initialize git (if not already done)
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: Online Exam System with full documentation"

# Add remote
git remote add origin https://github.com/YOUR-USERNAME/cyberproject.git

# Push
git branch -M main
git push -u origin main
```

---

## 🔐 Security Checklist

Before pushing, verify:

- [ ] ✅ `.env` file is in `.gitignore` (never commit secrets!)
- [ ] ✅ `node_modules/` is in `.gitignore`
- [ ] ✅ Session files not committed
- [ ] ✅ Private keys not committed
- [ ] ✅ Passwords not in any JSON files
- [ ] ✅ Database credentials not in code

### Check what will be pushed:

```bash
# See what files will be committed
git status

# See actual file contents before commit
git diff --cached

# For backend
cd backend
git status

# For frontend
cd frontend
git status
```

---

## 📊 Verify Push Success

### Check GitHub

1. Go to your GitHub repository
2. Click the code browser - you should see all your files
3. Verify folder structure looks correct
4. Check that `.env` files are NOT there (good!)
5. Verify `node_modules/` is NOT there (good!)

### Or from Terminal:

```bash
# Check remote
git remote -v

# See commit history
git log --oneline -5

# See branch
git branch -a
```

---

## 🚨 If Something Goes Wrong

### "fatal: not a git repository"
```bash
# Make sure you're in the right directory
cd /home/praveen/Desktop/projects/cyberproject/backend
git status
```

### "Permission denied (publickey)"
You need to set up SSH keys:
```bash
# Generate SSH key
ssh-keygen -t ed25519 -C "your-email@example.com"

# Add to SSH agent
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_ed25519

# Add public key to GitHub:
# Settings > SSH and GPG keys > New SSH key
cat ~/.ssh/id_ed25519.pub
```

### "fatal: remote origin already exists"
```bash
# Remove existing remote and add new one
git remote remove origin
git remote add origin https://github.com/YOUR-USERNAME/repo-name.git
```

### "everything up-to-date" but files missing
```bash
# Make sure files are staged
git add .
git status  # Should show files to commit

git commit -m "Your message"
git push
```

---

## 📚 Quick Reference Commands

```bash
# See current status
git status

# Add all changes
git add .

# Commit changes
git commit -m "Your message"

# Push to GitHub
git push

# See commit history
git log

# Create a new branch
git checkout -b feature-name

# Switch between branches
git checkout main
git checkout feature-name

# Pull latest changes
git pull

# See all remotes
git remote -v
```

---

## 🎯 Complete Quick Setup (Copy-Paste)

### For Backend:
```bash
cd /home/praveen/Desktop/projects/cyberproject/backend
git init
git add .
git commit -m "Initial commit: Backend with email notifications"
git remote add origin https://github.com/YOUR-USERNAME/cyberproject-backend.git
git branch -M main
git push -u origin main
```

### For Frontend:
```bash
cd /home/praveen/Desktop/projects/cyberproject/frontend
git init
git add .
git commit -m "Initial commit: Frontend with exam interface"
git remote add origin https://github.com/YOUR-USERNAME/cyberproject-frontend.git
git branch -M main
git push -u origin main
```

---

## 📖 Next Steps (After Pushing)

1. ✅ Add README.md files to each repository
2. ✅ Set up branch protection rules
3. ✅ Enable GitHub Actions for CI/CD
4. ✅ Add collaborators if working in a team
5. ✅ Create issues and pull requests for feature development

### Example README for Backend:

```markdown
# Online Exam System - Backend

Node.js/Express API with SMTP email notifications and password reset.

## Features
- JWT & Session authentication
- SMTP email notifications
- Password reset with secure tokens
- Exam submissions & grading
- Professor reports

## Setup
1. Copy `.env.example` to `.env`
2. Configure email service (Gmail, Outlook, or Custom SMTP)
3. Run database migration
4. Start: `npm run dev`

## Email Configuration
See EMAIL_QUICK_START.md for setup instructions.
```

---

## 🎉 Done!

Your Backend and Frontend are now on GitHub! Share the repository URLs with your team. 

**Remember:**
- ✅ Never commit `.env` files
- ✅ Never commit `node_modules/`
- ✅ Use meaningful commit messages
- ✅ Pull before pushing to avoid conflicts
- ✅ Review changes before pushing (`git diff`)

---

## 💡 Pro Tips

### Use SSH Instead of HTTPS (Recommended)
After setting up SSH keys, update remote:
```bash
git remote set-url origin git@github.com:YOUR-USERNAME/cyberproject.git
```

### Create Releases
```bash
git tag -a v1.0.0 -m "First release"
git push origin v1.0.0
```

### Add GitHub Actions for CI/CD
Create `.github/workflows/test.yml` for automated testing

### Use Branch Protection
Settings > Branches > Add rule (require reviews before merge)

---

Need help with any step? Let me know! 🚀
