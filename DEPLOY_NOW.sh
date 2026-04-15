#!/bin/bash

# ==========================================
# CRITICAL: Deploy exam-events fix to cPanel
# ==========================================
# Run this script via SSH on your cPanel server
# Usage: bash DEPLOY_NOW.sh

echo "=========================================="
echo "🚀 DEPLOYING EXAM-EVENTS FIX TO CPANEL"
echo "=========================================="
echo ""

# Navigate to backend
cd ~/public_html/oes-backend || cd ~/oes-backend || cd ./backend || {
    echo "❌ Could not find backend directory"
    echo "   Try: find ~ -name 'oes-backend' -type d"
    exit 1
}

echo "✅ In directory: $(pwd)"
echo ""

# Step 1: Pull latest code
echo "[STEP 1] Pulling latest code from GitHub..."
git status
echo ""
git pull origin main
if [ $? -ne 0 ]; then
    echo "❌ Git pull failed"
    exit 1
fi
echo "✅ Code pulled successfully"
echo ""

# Step 2: Install dependencies
echo "[STEP 2] Installing dependencies..."
npm install
if [ $? -ne 0 ]; then
    echo "❌ npm install failed"
    exit 1
fi
echo "✅ Dependencies installed"
echo ""

# Step 3: Kill old Node process
echo "[STEP 3] Stopping old Node.js process..."
pkill -f "node src/server.js" || echo "   (No old process found)"
sleep 2
echo "✅ Old process stopped"
echo ""

# Step 4: Start new process with nohup
echo "[STEP 4] Starting new Node.js server..."
nohup node src/server.js > /tmp/oes-backend.log 2>&1 &
sleep 3
echo "✅ New process started"
echo ""

# Step 5: Verify
echo "[STEP 5] Verifying deployment..."
ps aux | grep "node src/server.js" | grep -v grep && {
    echo "✅ Node.js process is running!"
} || {
    echo "❌ Process not found. Check logs:"
    tail -20 /tmp/oes-backend.log
    exit 1
}
echo ""

# Step 6: Show logs
echo "=========================================="
echo "📋 RECENT SERVER LOGS:"
echo "=========================================="
tail -15 /tmp/oes-backend.log
echo ""

echo "=========================================="
echo "✅ DEPLOYMENT COMPLETE!"
echo "=========================================="
echo ""
echo "🔗 Test the fix with:"
echo "curl -X GET 'https://oes.freshmilkstraightfromsource.com/api/submissions/exam/14' \\"
echo "  -H 'Authorization: Bearer YOUR_JWT_TOKEN' \\"
echo "  -H 'Content-Type: application/json'"
echo ""
echo "Expected: JSON data (not 404 HTML)"
echo ""
echo "If the endpoint still returns 404:"
echo "  1. Check logs: tail -f /tmp/oes-backend.log"
echo "  2. Verify code: git log --oneline -3"
echo "  3. Check route: grep -n 'exam/:examId' src/routes/exam-events.js"
echo ""
