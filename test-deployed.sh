#!/bin/bash
# JWT Testing Script for Deployed Instance
# Tests the production deployment at https://oes.freshmilkstraightfromsource.com

set -e

API_URL="https://oes.freshmilkstraightfromsource.com"
TIMESTAMP=$(date +%s)
COOKIE_JAR="/tmp/oes_cookies_${TIMESTAMP}.txt"
TOKEN_FILE="/tmp/oes_token_${TIMESTAMP}.txt"

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

cleanup() {
  rm -f "$COOKIE_JAR" "$TOKEN_FILE"
  echo ""
}

trap cleanup EXIT

echo "================================"
echo "🔐 JWT Security Testing - Deployed"
echo "================================"
echo ""
echo "Testing: $API_URL"
echo "Timestamp: $(date)"
echo ""

# Test 1: Health Check
echo -e "${BLUE}TEST 1: API Health Check${NC}"
echo "---"
HEALTH=$(curl -s -i "$API_URL/api" 2>&1 | head -1)
echo "Response: $HEALTH"
if echo "$HEALTH" | grep -q "200\|301\|302"; then
  echo -e "${GREEN}✅ API is responding${NC}"
else
  echo -e "${RED}❌ API might not be responding${NC}"
  echo "Trying with -k flag (ignore SSL)..."
  curl -k -s -i "$API_URL/api" 2>&1 | head -5
fi
echo ""

# Test 2: Login Test
echo -e "${BLUE}TEST 2: JWT Generation on Login${NC}"
echo "---"
echo "Logging in as: student1 / student123"

LOGIN_RESPONSE=$(curl -s -k -X POST "$API_URL/api/login" \
  -H "Content-Type: application/json" \
  -c "$COOKIE_JAR" \
  -d '{"username":"student1","password":"student123"}')

echo "Response:"
echo "$LOGIN_RESPONSE" | jq . 2>/dev/null || echo "$LOGIN_RESPONSE"
echo ""

# Extract token
TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.token' 2>/dev/null)

if [ -z "$TOKEN" ] || [ "$TOKEN" = "null" ]; then
  echo -e "${RED}❌ Failed to get token from login${NC}"
  echo "Response was: $LOGIN_RESPONSE"
  exit 1
fi

echo -e "${GREEN}✅ Got JWT Token${NC}"
echo "Token (first 50 chars): ${TOKEN:0:50}..."
echo "$TOKEN" > "$TOKEN_FILE"
echo ""

# Test 3: Decode Token
echo -e "${BLUE}TEST 3: Decode & Inspect JWT Payload${NC}"
echo "---"

# Extract payload (middle part of JWT)
IFS='.' read -ra TOKEN_PARTS <<< "$TOKEN"
PAYLOAD="${TOKEN_PARTS[1]}"

# Add padding if needed
PADDING=$((4 - ${#PAYLOAD} % 4))
if [ $PADDING -lt 4 ]; then
  PAYLOAD="${PAYLOAD}$(printf '=%.0s' $(seq 1 $PADDING))"
fi

DECODED=$(echo "$PAYLOAD" | base64 -d 2>/dev/null)
echo "Decoded Payload:"
echo "$DECODED" | jq . 2>/dev/null || echo "$DECODED"
echo ""

# Check required claims
if echo "$DECODED" | jq -e '.id' >/dev/null 2>&1; then
  echo -e "${GREEN}✅ Token contains 'id' claim${NC}"
fi
if echo "$DECODED" | jq -e '.username' >/dev/null 2>&1; then
  echo -e "${GREEN}✅ Token contains 'username' claim${NC}"
fi
if echo "$DECODED" | jq -e '.role' >/dev/null 2>&1; then
  echo -e "${GREEN}✅ Token contains 'role' claim${NC}"
fi
if echo "$DECODED" | jq -e '.exp' >/dev/null 2>&1; then
  EXP=$(echo "$DECODED" | jq -r '.exp')
  NOW=$(date +%s)
  if [ "$EXP" -gt "$NOW" ]; then
    echo -e "${GREEN}✅ Token is not expired (exp: $(date -d @$EXP))${NC}"
  else
    echo -e "${RED}❌ Token is already expired${NC}"
  fi
fi
echo ""

# Test 4: Protected Endpoint WITHOUT Token
echo -e "${BLUE}TEST 4: Protected Endpoint - No Token${NC}"
echo "---"
echo "Attempting GET /api/exams without authorization..."

NO_TOKEN_RESPONSE=$(curl -s -k -w "\nHTTP_STATUS:%{http_code}" "$API_URL/api/exams")
STATUS=$(echo "$NO_TOKEN_RESPONSE" | grep HTTP_STATUS | cut -d: -f2)
BODY=$(echo "$NO_TOKEN_RESPONSE" | sed '$d')

echo "Status: $STATUS"
echo "Response: $BODY"

if [ "$STATUS" = "401" ]; then
  echo -e "${GREEN}✅ Request correctly rejected (401 Unauthorized)${NC}"
else
  echo -e "${YELLOW}⚠️  Expected 401, got $STATUS${NC}"
fi
echo ""

# Test 5: Protected Endpoint WITH Token
echo -e "${BLUE}TEST 5: Protected Endpoint - With Valid Token${NC}"
echo "---"
echo "Attempting GET /api/exams with token..."

WITH_TOKEN_RESPONSE=$(curl -s -k -w "\nHTTP_STATUS:%{http_code}" \
  -H "Authorization: Bearer $TOKEN" \
  "$API_URL/api/exams")

STATUS=$(echo "$WITH_TOKEN_RESPONSE" | grep HTTP_STATUS | cut -d: -f2)
BODY=$(echo "$WITH_TOKEN_RESPONSE" | sed '$d')

echo "Status: $STATUS"
echo "Response (first 200 chars): ${BODY:0:200}..."
echo ""

if [ "$STATUS" = "200" ]; then
  echo -e "${GREEN}✅ Request accepted with valid token (200 OK)${NC}"
else
  echo -e "${YELLOW}⚠️  Expected 200, got $STATUS${NC}"
fi
echo ""

# Test 6: Token Tampering Detection
echo -e "${BLUE}TEST 6: Token Tampering Detection (CRITICAL SECURITY TEST)${NC}"
echo "---"
echo "Creating tampered token by modifying payload..."

# Tamper with the payload by swapping characters
TAMPERED="${TOKEN_PARTS[0]}"
TAMPERED_PAYLOAD=$(echo "$PAYLOAD" | sed 's/\(.\)\(.\)\(.*\)\(.\)\(.\)$/\2\1\3\5\4/')
TAMPERED="${TAMPERED}.${TAMPERED_PAYLOAD}.${TOKEN_PARTS[2]}"

echo "Original token:  ${TOKEN:0:50}..."
echo "Tampered token:  ${TAMPERED:0:50}..."
echo ""
echo "Attempting API call with tampered token..."

TAMPERED_RESPONSE=$(curl -s -k -w "\nHTTP_STATUS:%{http_code}" \
  -H "Authorization: Bearer $TAMPERED" \
  "$API_URL/api/exams")

STATUS=$(echo "$TAMPERED_RESPONSE" | grep HTTP_STATUS | cut -d: -f2)
BODY=$(echo "$TAMPERED_RESPONSE" | sed '$d')

echo "Status: $STATUS"
echo "Response: $BODY"
echo ""

if [ "$STATUS" = "401" ]; then
  echo -e "${GREEN}✅ Tampered token correctly rejected (401 Unauthorized)${NC}"
  echo -e "${GREEN}✅ HMAC-SHA256 signature verification is working!${NC}"
else
  echo -e "${RED}❌ SECURITY ISSUE: Tampered token was not rejected (Status: $STATUS)${NC}"
  echo -e "${RED}❌ This is a critical security vulnerability!${NC}"
fi
echo ""

# Test 7: Privilege Escalation Attempt
echo -e "${BLUE}TEST 7: Privilege Escalation Prevention${NC}"
echo "---"
echo "Attempting to escalate from student to admin role..."
echo "(Modifying token payload: role: student → role: admin)"
echo ""

# Create admin escalation attempt
ADMIN_PAYLOAD=$(echo "$DECODED" | jq '.role = "admin"' | base64 -w 0)
ESCALATED="${TOKEN_PARTS[0]}.${ADMIN_PAYLOAD}.${TOKEN_PARTS[2]}"

echo "Testing with escalated token against admin endpoint..."
ESCALATION_RESPONSE=$(curl -s -k -w "\nHTTP_STATUS:%{http_code}" \
  -H "Authorization: Bearer $ESCALATED" \
  "$API_URL/api/users" 2>/dev/null)

STATUS=$(echo "$ESCALATION_RESPONSE" | grep HTTP_STATUS | cut -d: -f2)
BODY=$(echo "$ESCALATION_RESPONSE" | sed '$d')

echo "Status: $STATUS"
echo "Response: $BODY"
echo ""

if [ "$STATUS" = "401" ] || [ "$STATUS" = "403" ]; then
  echo -e "${GREEN}✅ Privilege escalation attempt blocked (Status: $STATUS)${NC}"
else
  echo -e "${YELLOW}⚠️  Got status $STATUS - verify this is expected${NC}"
fi
echo ""

# Test 8: IDOR Protection
echo -e "${BLUE}TEST 8: IDOR (Insecure Direct Object Reference) Protection${NC}"
echo "---"
echo "Testing if student can access other users' data..."
echo ""

for user_id in 2 3 999; do
  echo "Attempting to access user #$user_id submission (might not exist)..."
  IDOR_RESPONSE=$(curl -s -k -w "\nHTTP_STATUS:%{http_code}" \
    -H "Authorization: Bearer $TOKEN" \
    "$API_URL/api/submissions/$user_id" 2>/dev/null)
  
  STATUS=$(echo "$IDOR_RESPONSE" | grep HTTP_STATUS | cut -d: -f2)
  BODY=$(echo "$IDOR_RESPONSE" | sed '$d')
  
  if [ "$STATUS" = "403" ]; then
    echo "  Status: $STATUS - ${GREEN}Access Denied (correct)${NC}"
  elif [ "$STATUS" = "404" ]; then
    echo "  Status: $STATUS - Not Found (or owned by this user)"
  elif [ "$STATUS" = "200" ]; then
    echo "  Status: $STATUS - ${RED}⚠️  Got data (verify ownership)${NC}"
  else
    echo "  Status: $STATUS"
  fi
done
echo ""
echo -e "${GREEN}✅ IDOR protection tested${NC}"
echo ""

# Test 9: Token Expiration
echo -e "${BLUE}TEST 9: Token Expiration${NC}"
echo "---"
EXP=$(echo "$DECODED" | jq -r '.exp // empty')
if [ -n "$EXP" ]; then
  NOW=$(date +%s)
  DIFF=$((EXP - NOW))
  HOURS=$((DIFF / 3600))
  
  if [ $DIFF -gt 0 ]; then
    echo "Token expires in: $HOURS hours ($DIFF seconds)"
    echo -e "${GREEN}✅ Token has valid expiration${NC}"
  else
    echo -e "${RED}❌ Token is already expired${NC}"
  fi
else
  echo -e "${YELLOW}⚠️  Could not determine token expiration${NC}"
fi
echo ""

# Test 10: Logout & Token Invalidation
echo -e "${BLUE}TEST 10: Logout Endpoint${NC}"
echo "---"
echo "Testing logout (if implemented)..."

LOGOUT_RESPONSE=$(curl -s -k -w "\nHTTP_STATUS:%{http_code}" -X POST \
  -H "Authorization: Bearer $TOKEN" \
  "$API_URL/api/logout" 2>/dev/null)

STATUS=$(echo "$LOGOUT_RESPONSE" | grep HTTP_STATUS | cut -d: -f2)
BODY=$(echo "$LOGOUT_RESPONSE" | sed '$d')

if [ "$STATUS" = "200" ]; then
  echo "Logout Status: $STATUS"
  echo -e "${GREEN}✅ Logout endpoint exists${NC}"
  
  # Try to use token after logout
  echo ""
  echo "Testing if token is invalidated after logout..."
  POST_LOGOUT=$(curl -s -k -w "\nHTTP_STATUS:%{http_code}" \
    -H "Authorization: Bearer $TOKEN" \
    "$API_URL/api/exams")
  
  STATUS=$(echo "$POST_LOGOUT" | grep HTTP_STATUS | cut -d: -f2)
  if [ "$STATUS" = "401" ]; then
    echo -e "${GREEN}✅ Token invalidated after logout${NC}"
  fi
else
  echo "Logout Status: $STATUS (endpoint may not be implemented)"
fi
echo ""

# Summary
echo "================================"
echo "🧪 Testing Summary"
echo "================================"
echo ""
echo "✅ Tests Completed"
echo ""
echo "Files saved:"
echo "  Cookies: $COOKIE_JAR"
echo "  Token: $TOKEN_FILE"
echo ""
echo "Next Steps:"
echo "1. Review all tests above"
echo "2. Verify HTTP status codes match expectations"
echo "3. Check logs on server for IDOR attempt logging"
echo "4. Confirm token tamper detection is working"
echo ""
echo "Critical Tests:"
echo "  ✓ Test 6: Token tampering should return 401"
echo "  ✓ Test 7: Privilege escalation should return 401/403"
echo "  ✓ Test 8: IDOR protection should block access"
echo ""
