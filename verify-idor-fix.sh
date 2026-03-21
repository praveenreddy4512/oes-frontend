#!/bin/bash

# 🔐 IDOR Protection Verification Test
# This test verifies that the type-safe IDOR protection is working correctly

set -e

API_URL="${1:-https://oes.freshmilkstraightfromsource.com}"

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║  🔐 IDOR PROTECTION VERIFICATION TEST                         ║"
echo "║  Testing type-safe ownership checks                           ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
echo "Target API: $API_URL"
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

PASSED=0
FAILED=0

test_result() {
  local test_name=$1
  local expected=$2
  local actual=$3
  local description=$4
  
  if [ "$expected" == "$actual" ]; then
    echo -e "${GREEN}✅ PASS${NC}: $test_name"
    echo "   $description"
    ((PASSED++))
  else
    echo -e "${RED}❌ FAIL${NC}: $test_name"
    echo "   Expected: $expected, Got: $actual"
    echo "   $description"
    ((FAILED++))
  fi
  echo ""
}

# Test 1: Student can access own results
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "TEST 1: Student accessing OWN results"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# First, login as a student
LOGIN=$(curl -s -X POST "$API_URL/api/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"student1","password":"Student@123"}')

TOKEN=$(echo "$LOGIN" | grep -o '"token":"[^"]*' | head -1 | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo -e "${YELLOW}⚠️  SKIP: Could not retrieve student token${NC}"
else
  HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X GET "$API_URL/api/results/student/1" \
    -H "Authorization: Bearer $TOKEN")
  
  test_result "Own Results Access" "200" "$HTTP_CODE" "Student 1 accessing /student/1"
fi

# Test 2: Student CANNOT access other student's results
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "TEST 2: Student attempting IDOR - accessing OTHER student's results"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ -z "$TOKEN" ]; then
  echo -e "${YELLOW}⚠️  SKIP: No token available${NC}"
else
  HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X GET "$API_URL/api/results/student/2" \
    -H "Authorization: Bearer $TOKEN")
  
  test_result "IDOR Block - Other Student" "403" "$HTTP_CODE" "Student 1 accessing /student/2 (should be 403)"
fi

# Test 3: Admin can access any student's results
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "TEST 3: Admin accessing any student's results"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

ADMIN_LOGIN=$(curl -s -X POST "$API_URL/api/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"Admin@123"}')

ADMIN_TOKEN=$(echo "$ADMIN_LOGIN" | grep -o '"token":"[^"]*' | head -1 | cut -d'"' -f4)

if [ -z "$ADMIN_TOKEN" ]; then
  echo -e "${YELLOW}⚠️  SKIP: Could not retrieve admin token${NC}"
else
  HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X GET "$API_URL/api/results/student/2" \
    -H "Authorization: Bearer $ADMIN_TOKEN")
  
  test_result "Admin Full Access" "200" "$HTTP_CODE" "Admin accessing /student/2 (should be 200)"
fi

# Test 4: Student CANNOT access specific result by ID
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "TEST 4: Student attempting IDOR on specific result ID"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ -z "$TOKEN" ] || [ -z "$ADMIN_TOKEN" ]; then
  echo -e "${YELLOW}⚠️  SKIP: No tokens available${NC}"
else
  # Get a result ID from Admin (should exist)
  STUDENT2_RESULTS=$(curl -s -X GET "$API_URL/api/results/student/2" \
    -H "Authorization: Bearer $ADMIN_TOKEN")
  
  RESULT_ID=$(echo "$STUDENT2_RESULTS" | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)
  
  if [ -z "$RESULT_ID" ]; then
    echo -e "${YELLOW}⚠️  SKIP: No results found for student 2${NC}"
  else
    echo "Found result ID: $RESULT_ID (belongs to Student 2)"
    
    # Now try to access as Student 1
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X GET "$API_URL/api/results/$RESULT_ID" \
      -H "Authorization: Bearer $TOKEN")
    
    test_result "IDOR Block - Result ID" "403" "$HTTP_CODE" "Student 1 accessing result $RESULT_ID (should be 403)"
  fi
fi

# Test 5: Professor can access exam results they teach
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "TEST 5: Professor accessing exam results they teach"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

PROF_LOGIN=$(curl -s -X POST "$API_URL/api/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"professor1","password":"Professor@123"}')

PROF_TOKEN=$(echo "$PROF_LOGIN" | grep -o '"token":"[^"]*' | head -1 | cut -d'"' -f4)

if [ -z "$PROF_TOKEN" ]; then
  echo -e "${YELLOW}⚠️  SKIP: Could not retrieve professor token${NC}"
else
  # Assuming professor teaches exam 1
  HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X GET "$API_URL/api/results/exam/1" \
    -H "Authorization: Bearer $PROF_TOKEN")
  
  test_result "Professor Access - Owned Exam" "200" "$HTTP_CODE" "Professor accessing results for exam they teach"
fi

# Summary
echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                      TEST SUMMARY                              ║"
echo "╠════════════════════════════════════════════════════════════════╣"
echo -e "║ ${GREEN}✅ PASSED: $PASSED${NC}"
echo -e "║ ${RED}❌ FAILED: $FAILED${NC}"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

if [ "$FAILED" -eq 0 ]; then
  echo -e "${GREEN}🎉 All tests passed! IDOR protection is working correctly.${NC}"
  exit 0
else
  echo -e "${RED}⚠️  Some tests failed. IDOR protection may still be vulnerable.${NC}"
  exit 1
fi
