#!/bin/bash

# MCP REST Endpoints Test Suite
# Tests all newly created security endpoints

BASE_URL="http://localhost:3000"

echo "======================================"
echo "MCP REST Endpoints Test Suite"
echo "======================================"
echo ""

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counter
TESTS_PASSED=0
TESTS_FAILED=0

# Function to test endpoint
test_endpoint() {
  local METHOD=$1
  local ENDPOINT=$2
  local DATA=$3
  local EXPECTED_STATUS=$4
  local TEST_NAME=$5

  echo -e "${YELLOW}Testing: ${TEST_NAME}${NC}"
  echo "  Method: $METHOD"
  echo "  Endpoint: $ENDPOINT"

  if [ "$DATA" != "" ]; then
    echo "  Data: $DATA"
    RESPONSE=$(curl -s -w "\n%{http_code}" -X "$METHOD" \
      -H "Content-Type: application/json" \
      -d "$DATA" \
      "$BASE_URL$ENDPOINT")
  else
    RESPONSE=$(curl -s -w "\n%{http_code}" -X "$METHOD" \
      "$BASE_URL$ENDPOINT")
  fi

  # Extract status code (last line) and body (everything else)
  HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
  BODY=$(echo "$RESPONSE" | sed '$d')

  echo "  Response Code: $HTTP_CODE"
  echo "  Response Body: $BODY"
  echo ""

  if [ "$HTTP_CODE" == "$EXPECTED_STATUS" ] || [ "$EXPECTED_STATUS" == "*" ]; then
    echo -e "${GREEN}✓ PASSED${NC}"
    ((TESTS_PASSED++))
  else
    echo -e "${RED}✗ FAILED (Expected $EXPECTED_STATUS, got $HTTP_CODE)${NC}"
    ((TESTS_FAILED++))
  fi
  echo "--------------------------------------"
  echo ""
}

echo "⏳ Waiting for backend to be available..."
for i in {1..30}; do
  if curl -s "$BASE_URL/health" > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Backend is running${NC}"
    echo ""
    break
  fi
  if [ $i -eq 30 ]; then
    echo -e "${RED}✗ Backend not available after 30 seconds${NC}"
    exit 1
  fi
  sleep 1
done

# Test 1: Health Check
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "TEST GROUP 1: HEALTH CHECK"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
test_endpoint "GET" "/api/security/health" "" "200" "Health Check Endpoint"

# Test 2: Semgrep Endpoint
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "TEST GROUP 2: SEMGREP ENDPOINTS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
test_endpoint "POST" "/api/security/semgrep-scan" \
  '{"code":"password = \"hardcoded123\"","language":"python"}' \
  "*" "Semgrep Scan - Valid Python Code"

test_endpoint "POST" "/api/security/semgrep-scan" \
  '{"code":"const x = 1;"}' \
  "400" "Semgrep Scan - Missing Language (Should Fail)"

test_endpoint "POST" "/api/security/semgrep-scan" \
  '{"language":"javascript"}' \
  "400" "Semgrep Scan - Missing Code (Should Fail)"

# Test 3: Ref Search Endpoint
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "TEST GROUP 3: REF SEARCH ENDPOINTS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
test_endpoint "POST" "/api/security/ref/search" \
  '{"query":"React hooks"}' \
  "*" "Ref Search - Valid Query"

test_endpoint "POST" "/api/security/ref/search" \
  '{}' \
  "400" "Ref Search - Missing Query (Should Fail)"

test_endpoint "POST" "/api/security/ref/search" \
  '{"query":""}' \
  "400" "Ref Search - Empty Query (Should Fail)"

# Test 4: Ref Read Endpoint
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "TEST GROUP 4: REF READ ENDPOINTS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
test_endpoint "POST" "/api/security/ref/read" \
  '{"url":"https://react.dev/reference/react/useState"}' \
  "*" "Ref Read - Valid URL"

test_endpoint "POST" "/api/security/ref/read" \
  '{}' \
  "400" "Ref Read - Missing URL (Should Fail)"

test_endpoint "POST" "/api/security/ref/read" \
  '{"url":"invalid-url"}' \
  "400" "Ref Read - Invalid URL Format (Should Fail)"

# Test 5: Context7 Resolve Endpoint
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "TEST GROUP 5: CONTEXT7 RESOLVE ENDPOINTS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
test_endpoint "POST" "/api/security/context7/resolve" \
  '{"libraryName":"React"}' \
  "*" "Context7 Resolve - Valid Library Name"

test_endpoint "POST" "/api/security/context7/resolve" \
  '{}' \
  "400" "Context7 Resolve - Missing Library Name (Should Fail)"

# Test 6: Context7 Docs Endpoint
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "TEST GROUP 6: CONTEXT7 DOCS ENDPOINTS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
test_endpoint "POST" "/api/security/context7/docs" \
  '{"libraryId":"/facebook/react"}' \
  "*" "Context7 Docs - Valid Library ID"

test_endpoint "POST" "/api/security/context7/docs" \
  '{"libraryId":"/facebook/react","topic":"hooks","mode":"code"}' \
  "*" "Context7 Docs - With Topic and Mode"

test_endpoint "POST" "/api/security/context7/docs" \
  '{"libraryId":"/facebook/react","mode":"info"}' \
  "*" "Context7 Docs - Info Mode"

test_endpoint "POST" "/api/security/context7/docs" \
  '{}' \
  "400" "Context7 Docs - Missing Library ID (Should Fail)"

test_endpoint "POST" "/api/security/context7/docs" \
  '{"libraryId":"/facebook/react","mode":"invalid"}' \
  "400" "Context7 Docs - Invalid Mode (Should Fail)"

# Summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "TEST SUMMARY"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}Passed: $TESTS_PASSED${NC}"
echo -e "${RED}Failed: $TESTS_FAILED${NC}"
TOTAL=$((TESTS_PASSED + TESTS_FAILED))
echo "Total: $TOTAL"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
  echo -e "${GREEN}✓ ALL TESTS PASSED!${NC}"
  exit 0
else
  echo -e "${RED}✗ SOME TESTS FAILED${NC}"
  exit 1
fi
