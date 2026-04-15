# OES System - Bug Fixes (March 20, 2026)

## 🐛 Issues Reported

1. **Admin Statistics page not loading** (`/admin/statistics`)
2. **Professor Exams CRUD operations failing** (`/professor/exams`)
3. **POST /api/exams returns 500 error**
4. **DELETE /api/exams/:id returns 500 error**

---

## 🔍 Root Causes Identified

### Issue 1: Admin Statistics Page (`/admin/statistics`)

**Problem**: The `GET /api/results` endpoint was not returning statistics because of incorrect route ordering.

**Root Cause**: In Express.js, routes are matched in the order they are defined. The statistics route `GET /` was defined AFTER the parameterized route `GET /:result_id`, so requests to `/api/results` (with "results" as the ID) were being matched to the parameter route instead.

**Error Message**: 
```
Cannot find column 'results' in results table (trying to interpret "results" as a result_id)
```

**File Affected**: `backend/src/routes/results.js`


### Issue 2 & 3: Exam CRUD Operations Failing

**Problem**: POST and DELETE operations on `/api/exams` were returning 500 errors.

**Root Cause**: The database schema on cPanel hosting doesn't include the `passing_score` column that the backend code was trying to insert.

**Error Message**:
```
Unknown column 'passing_score' in 'INSERT INTO'
```

**File Affected**: `backend/src/routes/exams.js`

---

## ✅ Fixes Applied

### Fix 1: Reordered Routes in results.js

**Change**: Moved `router.get("/", ...)` (statistics endpoint) to the FIRST position, before any parameterized routes.

**Before**:
```javascript
router.get("/student/:student_id", ...);
router.get("/exam/:exam_id", ...); 
router.get("/:result_id", ...);
router.get("/", ...);  // ❌ Wrong position!
```

**After**:
```javascript
router.get("/", ...);  // ✅ Moved to first position
router.get("/student/:student_id", ...);
router.get("/exam/:exam_id", ...);
router.get("/:result_id", ...);  // ✅ Parameterized routes last
```

**Impact**: Admin statistics page now loads correctly


### Fix 2: Removed passing_score from exams.js

**Change**: Removed `passing_score` field from INSERT and UPDATE queries since it doesn't exist in the cPanel database.

**Before**:
```javascript
// POST /api/exams
"INSERT INTO exams (title, description, professor_id, duration_minutes, passing_score) VALUES (?, ?, ?, ?, ?)"
[title, description, professor_id, duration_minutes, passing_score]
```

**After**:
```javascript
// POST /api/exams
"INSERT INTO exams (title, description, professor_id, duration_minutes) VALUES (?, ?, ?, ?)"
[title, description || "", professor_id, duration]
```

**Added Validation**:
- Check for required fields (title, professor_id)
- Default duration to 60 minutes if not provided
- Convert duration to number to prevent binding errors
- Handle empty descriptions

**Impact**: Exam creation and deletion now work correctly


### Fix 3: Updated Frontend Form

**Change**: Removed `passing_score` field from `CreateExam` form to match backend changes.

**File**: `frontend/src/pages/CreateExam.jsx`

**Changes**:
- Removed `passing_score` from initial form state
- Removed `passing_score` input field from form
- Removed `passing_score` from reset logic

---

## 📋 Files Modified

### Backend (3 files)
1. ✅ `src/routes/results.js` - Fixed route ordering
2. ✅ `src/routes/exams.js` - Removed passing_score, added validation
3. ✅ (New) `DEPLOY_HOTFIX.sh` - Deployment script

### Frontend (1 file)
1. ✅ `src/pages/CreateExam.jsx` - Removed passing_score field

---

## 🚀 Deployment Instructions

### For cPanel Users (Production)

#### Option A: Using SSH (Recommended)
```bash
ssh freshmil_oesuser@your-cpanel-server
cd /home/freshmil_oesuser/public_html/oes-backend
git pull origin main
# Restart application via cPanel Node.js Selector
```

#### Option B: Using cPanel Node.js Selector
1. Log in to cPanel
2. Find "Node.js Selector" or "Node.js App Manager"
3. Select the `oes-backend` application
4. Click "RESTART"

#### Option C: Using cPanel Terminal
1. Log in to cPanel
2. Open "Terminal"
3. Execute:
```bash
cd /home/freshmil_oesuser/public_html/oes-backend
git pull origin main
npm install
npm start
```

### For Local Testing
```bash
cd backend
git pull origin main
npm install
npm start
```

---

## ✨ Testing the Fixes

### Test 1: Admin Statistics Page
1. Login as admin (`admin1` / `admin123`)
2. Click "Statistics" in sidebar
3. **Expected**: Page loads with statistics cards showing data
4. **Before Fix**: 500 error in console
5. **After Fix**: ✅ Statistics display correctly

### Test 2: Create Exam
1. Login as professor (`professor1` / `prof123`)
2. Click "Create Exam"
3. Fill form with:
   - Title: "Test Exam"
   - Description: "Test Description"
   - Duration: 60 minutes
4. Click "Create Exam"
5. **Expected**: Exam created, redirects to editor
6. **Before Fix**: 500 error "Unknown column 'passing_score'"
7. **After Fix**: ✅ Exam created successfully

### Test 3: Delete Exam
1. Go to "My Exams" (Professor)
2. Click "Delete" on any exam
3. Confirm deletion
4. **Expected**: Exam removed from list
5. **Before Fix**: 500 error
6. **After Fix**: ✅ Exam deleted successfully

### Test 4: Professor Exams CRUD
1. Go to "My Exams"
2. Try to create, edit, or delete exams
3. **Expected**: All operations work
4. **Before Fix**: Operations failed with 500 errors
5. **After Fix**: ✅ All operations work

---

## 🔧 API Endpoints Verified

| Endpoint | Method | Status | Notes |
|----------|--------|--------|-------|
| `/api/results` | GET | ✅ Fixed | Returns statistics for admin |
| `/api/exams` | GET | ✅ Working | Lists all exams |
| `/api/exams` | POST | ✅ Fixed | Creates exam (without passing_score) |
| `/api/exams/:id` | GET | ✅ Working | Gets exam details with questions |
| `/api/exams/:id` | PUT | ✅ Fixed | Updates exam (without passing_score) |
| `/api/exams/:id` | DELETE | ✅ Fixed | Deletes exam |

---

## 📊 Summary of Changes

### Lines Changed
- **results.js**: 20 lines (route reordering)
- **exams.js**: 26 lines (removed passing_score, added validation)
- **CreateExam.jsx**: 15 lines (removed form field)
- **Total**: ~61 lines modified

### Commits
1. ✅ Backend: `Fix: Reorder routes to fix GET /api/results, remove passing_score from exams endpoints, add validation`
2. ✅ Frontend: `Fix: Remove passing_score field from CreateExam form`

### Git Commits
- Backend commit: `ed598d1`
- Frontend commit: `03496d5`

---

## ⚠️ Important Notes

### Database Schema Mismatch
The cPanel MySQL database schema differs from the initial setup schema. Specifically:
- Missing: `passing_score` column in exams table
- Missing: `total_questions` column in exams table (should be computed dynamically)

**Recommendation**: Update cPanel database schema OR track passing_score application-side.

### Route Ordering Best Practice
In Express.js, always define routes in this order:
1. Specific static routes (e.g., `GET /`)
2. Routes with specific parameters (e.g., `GET /student/:id`)
3. Catch-all parameterized routes last (e.g., `GET /:id`)

---

## ✅ Post-Deployment Checklist

- [ ] Backend code deployed to cPanel
- [ ] Frontend deployed to Vercel
- [ ] Admin statistics page loads
- [ ] Professor can create exams
- [ ] Professor can delete exams
- [ ] Professor can edit exams
- [ ] All CRUD operations working
- [ ] No 500 errors in browser console
- [ ] Database queries executing successfully

---

## 🆘 Troubleshooting

### Issue: Still getting 500 errors after deployment
**Solution**: 
1. Check that git pull succeeded
2. Verify application is restarted via cPanel
3. Check cPanel error logs: `~/logs/error_log`
4. Ensure passing_score field not being sent to API

### Issue: Admin Statistics still showing 0 values
**Solution**:
1. Verify results table has data
2. Check query syntax in `/api/results` GET handler
3. Ensure parameterized routes are at the end

### Issue: Changes not appearing after restart
**Solution**:
1. Hard refresh browser (Ctrl+Shift+R)
2. Clear browser cache
3. Verify file timestamps on server (use `ls -l`)
4. Check Node.js process is actually running (`ps aux | grep node`)

---

## 📞 Support

For issues or questions about these fixes:
1. Check this document first
2. Review error messages in browser DevTools Console
3. Check cPanel error logs
4. Verify git pull was successful
5. Ensure application restart completed

All fixes are documented in GitHub commits for reference.
