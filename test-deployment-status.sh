#!/bin/bash
# Quick diagnostic test for group assignment

echo "=================================================="
echo "GROUP ASSIGNMENT DIAGNOSTIC TEST"
echo "=================================================="
echo ""

# Test 1: Check if fix is deployed locally
echo "📋 Test 1: Checking if requireRole fix is in the code..."
if grep -q "requireRole('admin')" backend/src/routes/groups.js; then
    echo "✅ Fix is present in local code"
else
    echo "❌ Fix NOT found - checking for old syntax..."
    if grep -q "requireRole(\['admin'\])" backend/src/routes/groups.js; then
        echo "❌ Old buggy syntax still present!"
    fi
fi
echo ""

# Test 2: Check git status
echo "📋 Test 2: Checking git status..."
cd backend
git log --oneline -3
echo ""
git status
echo ""
cd ..

echo "=================================================="
echo "🚀 NEXT STEPS:"
echo "=================================================="
echo ""
echo "1. SSH into cPanel and restart Node.js:"
echo "   ssh your-username@oes.freshmilkstraightfromsource.com"
echo "   cd /home/freshmil_oesuser/public_html/oes-backend"
echo "   git pull origin main"
echo ""
echo "2. Restart Node.js via cPanel → Node.js App Manager"
echo "   OR kill and restart the process:"
echo "   pkill node && npm start"
echo ""
echo "3. Then test using the test-api-flow.js script"
echo ""
