#!/bin/bash

# ========================================
# DIAGNOSTIC: Check cPanel deployment status
# ========================================
# Run this via SSH on your cPanel server

echo "==========================================="
echo "📊 CHECKING CPANEL DEPLOYMENT STATUS"
echo "==========================================="
echo ""

# Find backend directory
BACKEND_DIR=$(find ~ -name "oes-backend" -type d 2>/dev/null | head -1)

if [ -z "$BACKEND_DIR" ]; then
    echo "❌ Backend directory not found!"
    echo "   Try: find ~ -name oes-backend -type d"
    exit 1
fi

echo "✅ Backend found at: $BACKEND_DIR"
cd "$BACKEND_DIR"
echo ""

# Check current git commit
echo "📝 [1] Current git commit:"
git log --oneline -1
echo ""

# Check if we're on the fix commit
COMMIT=$(git log --oneline -1 | grep "remove global authMiddleware")
if [ -z "$COMMIT" ]; then
    echo "❌ ISSUE: Latest commit is NOT the auth fix"
    echo "   Expected: 56a2cc6 fix: remove global authMiddleware"
    echo "   This means git pull didn't work!"
    echo ""
    echo "🔧 FIX: Running git reset..."
    git fetch origin main
    git reset --hard origin/main
    echo "✅ Code updated"
else
    echo "✅ Latest commit is correct"
fi
echo ""

# Check if Node.js is running
echo "📊 [2] Checking Node.js process:"
ps aux | grep "node src/server.js" | grep -v grep && {
    echo "✅ Node.js is running"
} || {
    echo "❌ Node.js is NOT running!"
    echo "   Will start it..."
}
echo ""

# Check file exists
echo "📝 [3] Checking submissions.js matches GitHub:"
if grep -q "Apply authMiddleware per-route instead" src/routes/submissions.js; then
    echo "✅ submissions.js has the fix"
else
    echo "❌ submissions.js NOT updated"
    echo "   Content doesn't match expected fix"
fi
echo ""

# Check if exam-events route exists
echo "📝 [4] Checking exam-events has /exam/:examId route:"
if grep -q "router.get('/exam/:examId'" src/routes/exam-events.js; then
    echo "✅ Route exists in exam-events.js"
else
    echo "❌ Route NOT found in exam-events.js"
fi
echo ""

echo "==========================================="
echo "🔧 IF ISSUES FOUND, RUN THIS:"
echo "==========================================="
echo ""
echo "cd $BACKEND_DIR"
echo "git fetch origin main"
echo "git reset --hard origin/main"
echo "npm install"
echo "pkill -f 'node src/server.js'"
echo "sleep 2"
echo "nohup node src/server.js > /tmp/oes-backend.log 2>&1 &"
echo "sleep 3"
echo "tail -20 /tmp/oes-backend.log"
echo ""
