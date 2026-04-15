#!/bin/bash
# JWT Testing Startup Script
# This script helps you test the complete JWT authentication system

set -e

PROJECT_ROOT="/home/praveen/Desktop/projects/cyberproject"
BACKEND_DIR="$PROJECT_ROOT/backend"
FRONTEND_DIR="$PROJECT_ROOT/frontend"

echo "================================"
echo "🔐 JWT Authentication Testing"
echo "================================"
echo ""
echo "This script will help you test JWT implementation."
echo ""

# Menu
echo "Select testing mode:"
echo "1) Start both Backend and Frontend (Local Testing)"
echo "2) Backend only (for API testing)"
echo "3) Frontend only (for UI testing)"
echo "4) Run curl tests against local backend"
echo "5) View testing documentation"
echo ""

read -p "Enter choice (1-5): " choice

case $choice in
  1)
    echo ""
    echo "🚀 Starting Backend (Terminal 1)..."
    echo "Command: cd $BACKEND_DIR && npm start"
    echo ""
    echo "🚀 Starting Frontend (Terminal 2)..."
    echo "Command: cd $FRONTEND_DIR && npm run dev"
    echo ""
    echo "⏳ Waiting 5 seconds before showing API test info..."
    sleep 2
    echo ""
    echo "---"
    echo ""
    echo "Once servers are running, open in browser:"
    echo "  Frontend: http://localhost:5173/login"
    echo "  Backend API: http://localhost:5000/api"
    echo ""
    echo "Test Credentials:"
    echo "  Student: student1 / student123"
    echo "  Professor: professor1 / prof123"
    echo "  Admin: admin1 / admin123 (if exists)"
    echo ""
    echo "Quick Tests (in browser console):"
    echo "  1. Check token: localStorage.getItem('jwtToken')"
    echo "  2. Get API: fetch('http://localhost:5000/api/exams').then(r=>r.json()).then(console.log)"
    echo ""
    echo "See JWT_QUICK_TEST_REFERENCE.md for detailed tests"
    echo ""
    ;;
    
  2)
    echo ""
    echo "Starting Backend on port 5000..."
    cd "$BACKEND_DIR"
    npm start
    ;;
    
  3)
    echo ""
    echo "Starting Frontend on port 5173..."
    cd "$FRONTEND_DIR"
    npm run dev
    ;;
    
  4)
    echo ""
    echo "Testing Backend API with curl..."
    echo ""
    
    # Check if backend is running
    if ! timeout 2 bash -c "echo >/dev/tcp/localhost/5000" 2>/dev/null; then
      echo "❌ Backend not running on localhost:5000"
      echo "Start it first with: cd $BACKEND_DIR && npm start"
      exit 1
    fi
    
    echo "✅ Backend is responding"
    echo ""
    
    # Test 1: Login
    echo "TEST 1: Login (POST /api/login)"
    echo "---"
    LOGIN_RESPONSE=$(curl -s -X POST http://localhost:5000/api/login \
      -H "Content-Type: application/json" \
      -d '{"username":"student1","password":"student123"}')
    
    echo "Response:"
    echo "$LOGIN_RESPONSE" | jq . 2>/dev/null || echo "$LOGIN_RESPONSE"
    echo ""
    
    # Extract token if login successful
    TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.token' 2>/dev/null)
    
    if [ -z "$TOKEN" ] || [ "$TOKEN" = "null" ]; then
      echo "❌ Failed to get token from login response"
      exit 1
    fi
    
    echo "✅ Got token: ${TOKEN:0:30}..."
    echo ""
    
    # Test 2: Protected endpoint without token
    echo "TEST 2: Access protected endpoint WITHOUT token"
    echo "---"
    RESPONSE=$(curl -s http://localhost:5000/api/exams)
    echo "Status should be 401 Unauthorized"
    echo "Response: $RESPONSE"
    echo ""
    
    # Test 3: Protected endpoint with token
    echo "TEST 3: Access protected endpoint WITH token"
    echo "---"
    curl -s -H "Authorization: Bearer $TOKEN" http://localhost:5000/api/exams | jq . 2>/dev/null || echo "(Response displayed above)"
    echo ""
    
    # Test 4: Token tampering
    echo "TEST 4: Token Tampering Detection"
    echo "---"
    echo "Original token (first 50 chars): ${TOKEN:0:50}..."
    
    # Create a tampered token by swapping two characters in the middle
    TAMPERED=$(echo "$TOKEN" | sed 's/\(.\)\(.\)\(.*\)\(.\)\(.\)$/\2\1\3\5\4/')
    echo "Tampered token (first 50 chars):  ${TAMPERED:0:50}..."
    echo ""
    
    echo "Attempting request with tampered token..."
    TAMPER_RESPONSE=$(curl -s -H "Authorization: Bearer $TAMPERED" http://localhost:5000/api/exams)
    echo "Response: $TAMPER_RESPONSE"
    
    if echo "$TAMPER_RESPONSE" | grep -q "Invalid\|Unauthorized"; then
      echo "✅ Tampered token correctly rejected!"
    else
      echo "❌ WARNING: Tampered token was not rejected!"
    fi
    echo ""
    
    # Test 5: IDOR protection
    echo "TEST 5: IDOR Protection Test"
    echo "---"
    echo "Attempting to access submission #999 (which probably doesn't belong to user)"
    IDOR_RESPONSE=$(curl -s -H "Authorization: Bearer $TOKEN" http://localhost:5000/api/submissions/999)
    echo "Response: $IDOR_RESPONSE"
    
    if echo "$IDOR_RESPONSE" | grep -q "Access denied\|denied"; then
      echo "✅ IDOR protection working!"
    else
      echo "⚠️  Check server logs for IDOR behavior"
    fi
    echo ""
    
    echo "================================"
    echo "✅ Backend Testing Complete"
    echo "================================"
    ;;
    
  5)
    echo ""
    echo "Available Testing Documentation:"
    echo ""
    echo "📄 JWT_QUICK_TEST_REFERENCE.md"
    echo "   Quick copy-paste tests for browser console (~15 min)"
    echo ""
    echo "📄 JWT_FRONTEND_TESTING.md"
    echo "   Detailed frontend testing procedures"
    echo ""
    echo "📄 JWT_SECURITY_TESTING.md"
    echo "   Backend security testing guide (500+ lines)"
    echo ""
    echo "📄 JWT_IMPLEMENTATION_COMPLETE.md"
    echo "   Full technical reference"
    echo ""
    echo "View documentation:"
    echo "  cat JWT_QUICK_TEST_REFERENCE.md"
    echo ""
    ;;
    
  *)
    echo "❌ Invalid choice"
    exit 1
    ;;
esac
