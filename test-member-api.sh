#!/bin/bash

# Test member creation and list API
# Using a known group ID from our logs: cmjnzo0wq0009o29s6zrc3wt8

GROUP_ID="cmjnzo0wq0009o29s6zrc3wt8"
API_URL="https://api.koinoniasms.com"

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║     Test: Member API (Add + List Check)                       ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Login to get token
echo "[LOGIN] Authenticating..."
LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "DOKaA@GMAIL.COM",
    "password": "12!Michael"
  }')

TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "❌ Failed to get authentication token"
  echo "Response: $LOGIN_RESPONSE"
  exit 1
fi

echo "✅ Logged in (token: ${TOKEN:0:20}...)"
echo ""

# Get initial member count
echo "[API] Getting initial member count for group: $GROUP_ID"
INITIAL_COUNT_RESPONSE=$(curl -s "$API_URL/api/groups/$GROUP_ID/members?limit=100" \
  -H "Authorization: Bearer $TOKEN")

INITIAL_COUNT=$(echo "$INITIAL_COUNT_RESPONSE" | grep -o '"data":\[[^]]*' | grep -o '"id"' | wc -l)
echo "Initial members: $INITIAL_COUNT"
echo ""

# Create a new member
echo "[ADD] Creating new member..."
NEW_MEMBER_RESPONSE=$(curl -s -X POST "$API_URL/api/groups/$GROUP_ID/members" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "TestMember",
    "lastName": "APITest'$(date +%s)'",
    "phone": "+15556347283",
    "optInSms": true
  }')

NEW_MEMBER_ID=$(echo "$NEW_MEMBER_RESPONSE" | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)
NEW_MEMBER_SUCCESS=$(echo "$NEW_MEMBER_RESPONSE" | grep -o '"success":true')

if [ -z "$NEW_MEMBER_ID" ]; then
  echo "❌ Failed to create member"
  echo "Response: $NEW_MEMBER_RESPONSE"
  exit 1
fi

echo "✅ Member created with ID: $NEW_MEMBER_ID"
echo ""

# Immediate check
echo "[API] Checking member list immediately after creation..."
IMMEDIATE_LIST=$(curl -s "$API_URL/api/groups/$GROUP_ID/members?limit=100" \
  -H "Authorization: Bearer $TOKEN")

IMMEDIATE_COUNT=$(echo "$IMMEDIATE_LIST" | grep -o '"id":"[^"]*' | wc -l)
MEMBER_IN_LIST=$(echo "$IMMEDIATE_LIST" | grep "$NEW_MEMBER_ID")

echo "Members after creation: $IMMEDIATE_COUNT"
echo "New member in list: $([ -n "$MEMBER_IN_LIST" ] && echo '✅ YES' || echo '❌ NO')"
echo ""

# Wait and check again
echo "[WAIT] Waiting 3 seconds and checking again..."
sleep 3

DELAYED_LIST=$(curl -s "$API_URL/api/groups/$GROUP_ID/members?limit=100" \
  -H "Authorization: Bearer $TOKEN")

DELAYED_COUNT=$(echo "$DELAYED_LIST" | grep -o '"id":"[^"]*' | wc -l)
MEMBER_IN_DELAYED=$(echo "$DELAYED_LIST" | grep "$NEW_MEMBER_ID")

echo "Members after delay: $DELAYED_COUNT"
echo "New member in list: $([ -n "$MEMBER_IN_DELAYED" ] && echo '✅ YES' || echo '❌ NO')"

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "Summary:"
echo "  Initial: $INITIAL_COUNT members"
echo "  After creation: $IMMEDIATE_COUNT members"
echo "  After 3s delay: $DELAYED_COUNT members"
echo "  New member found: $([ -n "$MEMBER_IN_LIST" ] && echo 'YES' || echo 'NO')"
echo "═══════════════════════════════════════════════════════════════"
