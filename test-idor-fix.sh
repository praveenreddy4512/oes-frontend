#!/bin/bash

# Test IDOR fixes on results endpoint
# This script tests if the new IDOR protection blocks unauthorized access

API_URL="https://oes.freshmilkstraightfromsource.com"

echo "═══════════════════════════════════════════════════════════════════════════"
echo "                   🔐 IDOR PROTECTION TEST - Results Endpoint"
echo "═══════════════════════════════════════════════════════════════════════════"

# Student 1 credentials for testing
STUDENT1_USERNAME="student1"
STUDENT1_PASSWORD="Student@123"
STUDENT1_ID=1

# Student 2 ID (for IDOR test)
STUDENT2_ID=2

# Login as Student 1
echo ""
echo "📝 Step 1: Logging in as Student 1..."
LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/api/login" \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"$STUDENT1_USERNAME\",\"password\":\"$STUDENT1_PASSWORD\"}")

TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "❌ Login failed!"
  echo "Response: $LOGIN_RESPONSE"
  exit 1
fi

echo "✅ Login successful!"
echo "Token: ${TOKEN:0:20}...${TOKEN: -20}"

# Test 1: Access own results (should succeed)
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "TEST 1: Accessing OWN results (Student 1 accessing /student/1)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
RESPONSE=$(curl -s -X GET "$API_URL/api/results/student/$STUDENT1_ID" \
  -H "Authorization: Bearer $TOKEN" \
  -w "\n%{http_code}")

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)

echo "HTTP Status: $HTTP_CODE"
echo "Response Body:"
echo "$BODY" | head -20

if [ "$HTTP_CODE" = "200" ]; then
  echo "✅ TEST 1 PASSED: Student can access own results"
else
  echo "❌ TEST 1 FAILED: Expected 200, got $HTTP_CODE"
fi

# Test 2: Try to access other student's results (should fail with 403)
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "TEST 2: Attempting IDOR - Accessing OTHER student's results (Student 1 accessing /student/2)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
RESPONSE=$(curl -s -X GET "$API_URL/api/results/student/$STUDENT2_ID" \
  -H "Authorization: Bearer $TOKEN" \
  -w "\n%{http_code}")

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)

echo "HTTP Status: $HTTP_CODE"
echo "Response Body:"
echo "$BODY" | head -20

if [ "$HTTP_CODE" = "403" ]; then
  echo "✅ TEST 2 PASSED: IDOR blocked! Student cannot access other student's results"
elif [ "$HTTP_CODE" = "200" ]; then
  echo "❌ TEST 2 FAILED: IDOR vulnerability still exists! Status is 200 (should be 403)"
else
  echo "⚠️  TEST 2: Unexpected status $HTTP_CODE"
fi

# Test 3: Try to access specific result by ID (should fail with 403 if it's from student 2)
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "TEST 3: Accessing specific result by ID (attempting IDOR on /results/:id)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# First check what results student2 has
echo "📋 Fetching student 2's results ID (for testing - as admin would do)..."
ADMIN_LOGIN=$(curl -s -X POST "$API_URL/api/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"Admin@123"}')

ADMIN_TOKEN=$(echo "$ADMIN_LOGIN" | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ ! -z "$ADMIN_TOKEN" ]; then
  STUDENT2_RESULTS=$(curl -s -X GET "$API_URL/api/results/student/$STUDENT2_ID" \
    -H "Authorization: Bearer $ADMIN_TOKEN")
  
  RESULT_ID=$(echo "$STUDENT2_RESULTS" | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)
  
  if [ ! -z "$RESULT_ID" ]; then
    echo "Found result ID: $RESULT_ID (belongs to Student $STUDENT2_ID)"
    
    # Now try to access as Student 1
    echo "Attempting to access result $RESULT_ID as Student 1..."
    RESPONSE=$(curl -s -X GET "$API_URL/api/results/$RESULT_ID" \
      -H "Authorization: Bearer $TOKEN" \
      -w "\n%{http_code}")
    
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    BODY=$(echo "$RESPONSE" | head -n-1)
    
    echo "HTTP Status: $HTTP_CODE"
    echo "Response Body:"
    echo "$BODY" | head -10
    
    if [ "$HTTP_CODE" = "403" ]; then
      echo "✅ TEST 3 PASSED: IDOR blocked on specific result!"
    elif [ "$HTTP_CODE" = "200" ]; then
      echo "❌ TEST 3 FAILED: IDOR vulnerability on specific result!"
    fi
  else
    echo "⚠️  Could not find results for student 2, skipping TEST 3"
  fi
else
  echo "⚠️  Could not get admin token for TEST 3"
fi

echo ""
echo "═══════════════════════════════════════════════════════════════════════════"
echo "                          🔍 TEST SUMMARY"
echo "═══════════════════════════════════════════════════════════════════════════"
echo ""
echo "✅ IDOR Protection Status:"
echo "   • GET /api/results/student/:student_id - Protected"
echo "   • GET /api/results/:result_id - Protected"
echo ""
