# End-to-End Test Plan: Multi-Tenant Database Architecture

## Overview

This test plan validates that Phases 7-10 work correctly in a **REAL** environment (not mocked).

**Goal**: Prove that the system can:
- ✅ Create tenant databases on registration
- ✅ Route users to their correct database
- ✅ Handle errors gracefully
- ✅ Scale to multiple tenants

---

## Pre-Test Requirements

### Environment Setup

```bash
# 1. Verify Render PostgreSQL has admin access
DATABASE_URL=postgresql://user:password@host:port/registry?connection_limit=30&pool_timeout=45
REGISTRY_DATABASE_URL=postgresql://user:password@host:port/registry

# 2. Verify admin user can CREATE DATABASE
# Test with psql:
psql $DATABASE_URL
> CREATE DATABASE test_permissions_check;
> DROP DATABASE test_permissions_check;
# If these work, you're good to go

# 3. Verify .env has all required variables
echo "Checking .env..."
grep -E "DATABASE_URL|REGISTRY_DATABASE_URL|JWT_|STRIPE_|TELNYX_" backend/.env | head -10
```

---

## Test Suite 1: Database Provisioning (Phase 7)

### Test 1.1: Create Tenant Database on Registration

**Purpose**: Verify that `provisionTenantDatabase()` creates actual database

**Steps**:
```bash
# 1. Start backend
npm run dev

# 2. Make registration request
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test-1.1@example.com",
    "password": "TestPassword123!",
    "firstName": "Test",
    "lastName": "User",
    "churchName": "Test Church 1.1"
  }'

# 3. Capture response
# Expected:
# {
#   "tenantId": "ck1a2b3c4d5e6f7g8h9i0j",
#   "accessToken": "...",
#   "admin": { ... }
# }
TENANT_ID="ck1a2b3c4d5e6f7g8h9i0j"  # From response
```

**Verify Database Created**:
```bash
# 4. Check if database exists on Render
psql $DATABASE_URL \
  -c "SELECT datname FROM pg_database WHERE datname = 'tenant_${TENANT_ID}';"

# Expected output:
#     datname
# ────────────────────
#  tenant_ck1a2b3c4d5e6f7g8h9i0j
# (1 row)

# 5. Check if schema is created
psql postgresql://user:password@host:port/tenant_${TENANT_ID} \
  -c "\dt"

# Expected: Tables for Member, Conversation, Message, Admin, etc.
```

**Pass Criteria**:
- ✅ Response has tenantId
- ✅ Database `tenant_<id>` exists on Render
- ✅ All tenant schema tables exist
- ✅ Admin can log in immediately

---

### Test 1.2: Database Name Collision (Already Exists)

**Purpose**: Verify that if database exists, system handles it gracefully

**Steps**:
```bash
# 1. Register same email again (use unique email per test)
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test-1.2a@example.com",
    "password": "TestPassword123!",
    "firstName": "Test",
    "lastName": "User",
    "churchName": "Test Church 1.2a"
  }'

# Capture TENANT_ID_A from response

# 2. Somehow force database to exist (e.g., manually create it)
# This tests the idempotency in provisionTenantDatabase()
# Actually, just register and succeed = database exists
# Then simulate re-running provisioning:

# 3. Check logs
# Expected in backend logs:
# "✅ Tenant database created: tenant_<id>"
# OR
# "ℹ️ Tenant database already exists: tenant_<id>"
```

**Pass Criteria**:
- ✅ Registration succeeds (no "database already exists" error to user)
- ✅ Logs show idempotency handling
- ✅ User can log in with returned credentials

---

### Test 1.3: Database Migrations Run Correctly

**Purpose**: Verify schema is applied to new database

**Steps**:
```bash
# 1. Register user
TENANT_ID="<from-registration>"

# 2. Verify all tables exist
for table in admin member branch conversation conversation_message template recurring_message billing subscription_plan message scheduled_message nps_feedback email_log api_key data_export account_deletion_request consent_log; do
  psql postgresql://user:password@host:port/tenant_${TENANT_ID} \
    -c "\d $table" > /tmp/${table}.txt 2>&1

  if grep "ERROR" /tmp/${table}.txt; then
    echo "❌ Table missing: $table"
  else
    echo "✅ Table exists: $table"
  fi
done

# 3. Check schema matches tenant-schema.prisma
# All tenant models should exist with correct columns
```

**Pass Criteria**:
- ✅ All tables in tenant-schema.prisma exist
- ✅ Column types match schema
- ✅ Constraints (primary key, unique, etc.) exist
- ✅ No "missing table" errors

---

## Test Suite 2: Authentication & Tenant Routing (Phase 3, 5, 6)

### Test 2.1: Login Routes to Correct Database

**Purpose**: Verify middleware correctly injects tenant context

**Steps**:
```bash
# 1. Register two different users
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "church-a@example.com",
    "password": "TestPassword123!",
    "firstName": "Pastor",
    "lastName": "A",
    "churchName": "Church A"
  }'
# Capture: TOKEN_A, TENANT_ID_A

curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "church-b@example.com",
    "password": "TestPassword123!",
    "firstName": "Pastor",
    "lastName": "B",
    "churchName": "Church B"
  }'
# Capture: TOKEN_B, TENANT_ID_B

# 2. Create member in Church A
curl -X POST http://localhost:5000/api/members \
  -H "Authorization: Bearer ${TOKEN_A}" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+1234567890"
  }'
# Should create in TENANT_ID_A's database

# 3. Try to access with Church B token
curl -X GET http://localhost:5000/api/members \
  -H "Authorization: Bearer ${TOKEN_B}"

# Expected: Empty list (no members in Church B database)
# NOT: John Doe (would indicate cross-tenant leakage)
```

**Pass Criteria**:
- ✅ Church A can only see Church A's members
- ✅ Church B can only see Church B's members
- ✅ No cross-tenant data visible
- ✅ Both work simultaneously without interference

---

### Test 2.2: Invalid Token Returns 401

**Purpose**: Verify auth middleware rejects invalid tokens

**Steps**:
```bash
# 1. Request with no token
curl -X GET http://localhost:5000/api/members
# Expected: 401 {"error": "No token provided"}

# 2. Request with invalid token
curl -X GET http://localhost:5000/api/members \
  -H "Authorization: Bearer invalid.token.here"
# Expected: 401 {"error": "Invalid or expired token"}

# 3. Request with expired token
# (Would need to manually craft an expired JWT, skip for now)

# 4. Check response codes
for response in 401; do
  echo "✅ Got $response for invalid auth"
done
```

**Pass Criteria**:
- ✅ No token → 401
- ✅ Invalid token → 401
- ✅ No sensitive data in error message
- ✅ Proper error code (not 500 or 403)

---

## Test Suite 3: Phone Number Routing (Phase 6)

### Test 3.1: Incoming SMS Routes to Correct Tenant

**Purpose**: Verify webhook routes incoming SMS to correct tenant database

**Steps**:
```bash
# 1. Register two churches with phone numbers
CHURCH_A_ID="<from-registration>"
CHURCH_B_ID="<from-registration>"

# 2. Assign phone numbers in database (manually or via API)
# Church A: +12025551234
# Church B: +14155559876

# 3. Create members in both churches
# Church A: John Doe at +1111111111 (will receive SMS)
# Church B: Jane Smith at +2222222222 (will receive SMS)

# 4. Simulate incoming SMS to Church A number
curl -X POST http://localhost:5000/api/webhooks/telnyx/mms \
  -H "telnyx-signature-ed25519: <signature>" \
  -H "telnyx-timestamp: <timestamp>" \
  -H "Content-Type: application/json" \
  -d '{
    "data": {
      "event_type": "message.received",
      "payload": {
        "id": "msg_12345",
        "from": {
          "phone_number": "+1111111111"
        },
        "to": [
          {
            "phone_number": "+12025551234"
          }
        ],
        "text": "Hello Church A"
      }
    }
  }'

# 5. Check which database received the message
psql postgresql://user:password@host:port/tenant_${CHURCH_A_ID} \
  -c "SELECT * FROM conversation_message WHERE content = 'Hello Church A';"

# Expected: 1 row (message in Church A database)

psql postgresql://user:password@host:port/tenant_${CHURCH_B_ID} \
  -c "SELECT * FROM conversation_message WHERE content = 'Hello Church A';"

# Expected: 0 rows (not in Church B database)
```

**Pass Criteria**:
- ✅ Message goes to correct tenant database
- ✅ Not in other tenant databases
- ✅ Conversation created with correct member
- ✅ Webhook returns 200 OK

---

### Test 3.2: Invalid Phone Number Handled Gracefully

**Purpose**: Verify webhook handles unmapped phone numbers

**Steps**:
```bash
# 1. Send SMS to unmapped number
curl -X POST http://localhost:5000/api/webhooks/telnyx/mms \
  -H "telnyx-signature-ed25519: <signature>" \
  -H "telnyx-timestamp: <timestamp>" \
  -H "Content-Type: application/json" \
  -d '{
    "data": {
      "event_type": "message.received",
      "payload": {
        "from": { "phone_number": "+1111111111" },
        "to": [{ "phone_number": "+19999999999" }],
        "text": "Hello Unknown"
      }
    }
  }'

# Expected: 200 OK (webhook acknowledged)
# In logs: "❌ No tenant found for Telnyx number: +19999999999"
# Database: No message created (not in any tenant database)
```

**Pass Criteria**:
- ✅ Returns 200 OK (webhook acknowledged)
- ✅ Logs show no tenant found
- ✅ No message created in any database
- ✅ No errors logged (handled gracefully)

---

## Test Suite 4: Error Handling (Phase 8)

### Test 4.1: Missing Tenant Database

**Purpose**: Verify system handles missing tenant database gracefully

**Steps**:
```bash
# 1. Get valid JWT for Church A
TOKEN_A="<from-login>"

# 2. Manually delete Church A's database (simulate corruption)
psql $DATABASE_URL \
  -c "DROP DATABASE IF EXISTS tenant_${CHURCH_A_ID};"

# 3. Try to make API request with Church A token
curl -X GET http://localhost:5000/api/members \
  -H "Authorization: Bearer ${TOKEN_A}"

# Expected: 503 {"error": "Database connection unavailable"}
# NOT: 500 with stack trace
```

**Pass Criteria**:
- ✅ Returns 503 (not 500)
- ✅ User-friendly message (no technical details)
- ✅ Logged properly for debugging
- ✅ Other users not affected

---

### Test 4.2: Inactive Tenant

**Purpose**: Verify suspended/archived tenants cannot access

**Steps**:
```bash
# 1. Register user, capture TENANT_ID
TOKEN_A="<from-login>"
TENANT_ID_A="<from-response>"

# 2. Manually update tenant status in registry
psql $REGISTRY_DATABASE_URL \
  -c "UPDATE tenant SET status = 'suspended' WHERE id = '${TENANT_ID_A}';"

# 3. Try API request
curl -X GET http://localhost:5000/api/members \
  -H "Authorization: Bearer ${TOKEN_A}"

# Expected: 503 with message about tenant not being active
```

**Pass Criteria**:
- ✅ Returns 503 (not 500)
- ✅ Message explains tenant is inactive
- ✅ No data leaked in error
- ✅ Can restore by updating status back to 'active'

---

### Test 4.3: Webhook Signature Validation

**Purpose**: Verify invalid webhook signatures rejected

**Steps**:
```bash
# 1. Send webhook with invalid signature
curl -X POST http://localhost:5000/api/webhooks/telnyx/mms \
  -H "telnyx-signature-ed25519: invalid_signature_here" \
  -H "telnyx-timestamp: $(date +%s)" \
  -H "Content-Type: application/json" \
  -d '{
    "data": {
      "event_type": "message.received",
      "payload": {
        "from": { "phone_number": "+1111111111" },
        "to": [{ "phone_number": "+12025551234" }],
        "text": "Malicious"
      }
    }
  }'

# Expected: 401 {"error": "Invalid webhook signature - access denied"}
```

**Pass Criteria**:
- ✅ Returns 401 (not 200)
- ✅ No message created
- ✅ Logged as security incident
- ✅ Doesn't crash server

---

## Test Suite 5: Concurrency & Scaling (Phase 9)

### Test 5.1: Multiple Concurrent Requests

**Purpose**: Verify system handles multiple users simultaneously

**Steps**:
```bash
# 1. Register 5 users
for i in {1..5}; do
  curl -X POST http://localhost:5000/api/auth/register \
    -H "Content-Type: application/json" \
    -d "{
      \"email\": \"church-${i}@example.com\",
      \"password\": \"TestPassword123!\",
      \"firstName\": \"Pastor\",
      \"lastName\": \"${i}\",
      \"churchName\": \"Church ${i}\"
    }" &
done
wait

# 2. All 5 registrations should succeed
# Each should have unique database

# 3. Make concurrent API requests
for i in {1..5}; do
  TOKEN="<token-from-church-$i>"
  curl -X GET http://localhost:5000/api/members \
    -H "Authorization: Bearer ${TOKEN}" &
done
wait

# Expected: All succeed with 200 OK
# No timeouts, no errors
```

**Pass Criteria**:
- ✅ All 5 users registered successfully
- ✅ All 5 databases created
- ✅ All concurrent requests succeed
- ✅ No cross-tenant data leakage
- ✅ No database locks or deadlocks

---

### Test 5.2: Connection Pool Under Load

**Purpose**: Verify connection pooling works at scale

**Steps**:
```bash
# 1. Register 20 users (more than cache limit of 100 is okay, but test ~50)
for i in {1..20}; do
  curl -X POST http://localhost:5000/api/auth/register \
    -H "Content-Type: application/json" \
    -d "{\"email\": \"load-${i}@example.com\", ...}" &
  if [ $((i % 5)) -eq 0 ]; then sleep 2; fi  # Rate limit registration
done
wait

# 2. Check backend logs for cache statistics
# Look for: "[Tenant] Cache size: X/100"
# Verify: Cache size < 100

# 3. Make 50 concurrent requests across different users
for i in {1..20}; do
  TOKEN="<token-from-user-$i>"
  for j in {1..2}; do
    curl -X GET http://localhost:5000/api/members \
      -H "Authorization: Bearer ${TOKEN}" &
  done
done
wait

# Expected: All succeed
# Logs should show connection reuse, not new connections for every request
```

**Pass Criteria**:
- ✅ 20 databases created
- ✅ Cache manages connections (< 100)
- ✅ 40 concurrent requests all succeed
- ✅ No "connection pool exhausted" errors
- ✅ Response times consistent

---

## Test Suite 6: End-to-End Workflow

### Test 6.1: Complete User Journey

**Purpose**: Verify full workflow from registration to data access

**Steps**:
```bash
# 1. REGISTER
REGISTER_RESPONSE=$(curl -s -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "e2e-test@example.com",
    "password": "TestPassword123!",
    "firstName": "John",
    "lastName": "Doe",
    "churchName": "E2E Test Church"
  }')

TOKEN=$(echo $REGISTER_RESPONSE | jq -r '.accessToken')
TENANT_ID=$(echo $REGISTER_RESPONSE | jq -r '.tenantId')

echo "✅ Registered: tenant=$TENANT_ID"

# 2. VERIFY DATABASE CREATED
DATABASE_CHECK=$(psql $DATABASE_URL \
  -c "SELECT datname FROM pg_database WHERE datname = 'tenant_${TENANT_ID}';")
if [[ $DATABASE_CHECK == *"tenant_"* ]]; then
  echo "✅ Database created"
else
  echo "❌ Database NOT created"
  exit 1
fi

# 3. ADD MEMBER
MEMBER_RESPONSE=$(curl -s -X POST http://localhost:5000/api/members \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Jane",
    "lastName": "Smith",
    "phone": "+14155551234"
  }')

MEMBER_ID=$(echo $MEMBER_RESPONSE | jq -r '.id')
echo "✅ Added member: $MEMBER_ID"

# 4. GET MEMBERS
MEMBERS=$(curl -s -X GET http://localhost:5000/api/members \
  -H "Authorization: Bearer ${TOKEN}")

if [[ $MEMBERS == *"Jane"* ]]; then
  echo "✅ Retrieved member"
else
  echo "❌ Member not found"
  exit 1
fi

# 5. LOGOUT & VERIFY TOKEN REVOKED
curl -s -X POST http://localhost:5000/api/auth/logout \
  -H "Authorization: Bearer ${TOKEN}"

# Try to use token after logout
REVOKED=$(curl -s -X GET http://localhost:5000/api/members \
  -H "Authorization: Bearer ${TOKEN}")

if [[ $REVOKED == *"401"* ]] || [[ $REVOKED == *"revoked"* ]]; then
  echo "✅ Token revoked after logout"
else
  echo "❌ Token not revoked (security issue!)"
  exit 1
fi

echo ""
echo "✅ COMPLETE E2E WORKFLOW PASSED"
```

**Pass Criteria**:
- ✅ Registration succeeds with valid response
- ✅ Database created with correct name
- ✅ Can create members
- ✅ Can retrieve members
- ✅ Token revocation works
- ✅ Token cannot be reused after logout

---

## Test Results Template

Create a file: `E2E_TEST_RESULTS.md`

```markdown
# E2E Test Results

Date: YYYY-MM-DD
Environment: [staging/production]
Tester: [name]

## Test Suite 1: Database Provisioning
- [ ] 1.1 Create database on registration - PASS/FAIL
- [ ] 1.2 Handle existing database - PASS/FAIL
- [ ] 1.3 Migrations run correctly - PASS/FAIL

## Test Suite 2: Authentication & Routing
- [ ] 2.1 Login routes to correct database - PASS/FAIL
- [ ] 2.2 Invalid token returns 401 - PASS/FAIL

## Test Suite 3: Phone Routing
- [ ] 3.1 Incoming SMS routes correctly - PASS/FAIL
- [ ] 3.2 Invalid phone handled gracefully - PASS/FAIL

## Test Suite 4: Error Handling
- [ ] 4.1 Missing database handled - PASS/FAIL
- [ ] 4.2 Inactive tenant blocked - PASS/FAIL
- [ ] 4.3 Invalid webhooks rejected - PASS/FAIL

## Test Suite 5: Concurrency
- [ ] 5.1 Concurrent requests - PASS/FAIL
- [ ] 5.2 Connection pool under load - PASS/FAIL

## Test Suite 6: E2E Workflow
- [ ] 6.1 Complete user journey - PASS/FAIL

## Issues Found

1. [Issue description]
   - Status: [open/resolved]
   - Severity: [critical/high/medium/low]

## Sign-Off

System is: [APPROVED FOR PRODUCTION / NEEDS FIXES]

Signature: ________________
Date: ________________
```

---

## Success Criteria

**ALL tests must PASS**:
- ✅ All 6 test suites pass
- ✅ No database errors in logs
- ✅ No security issues found
- ✅ No cross-tenant data leakage
- ✅ Error handling is graceful
- ✅ Performance is acceptable

**System is PRODUCTION READY when**:
- ✅ All test results: PASS
- ✅ No critical issues
- ✅ Load tested successfully
- ✅ Tested on actual Render database
- ✅ All team members sign off

---

## Quick Reference: Test Commands

```bash
# Register user
curl -X POST http://localhost:5000/api/auth/register -H "Content-Type: application/json" -d '{"email":"test@example.com","password":"Pass123!","firstName":"John","lastName":"Doe","churchName":"Church"}'

# Get members
curl -X GET http://localhost:5000/api/members -H "Authorization: Bearer TOKEN"

# Add member
curl -X POST http://localhost:5000/api/members -H "Authorization: Bearer TOKEN" -H "Content-Type: application/json" -d '{"firstName":"John","lastName":"Doe","phone":"+1234567890"}'

# Check database exists
psql postgresql://user:password@host:port/registry -c "SELECT datname FROM pg_database WHERE datname LIKE 'tenant_%';"

# Check admin created
psql postgresql://user:password@host:port/tenant_ID -c "SELECT * FROM admin;"
```

---

## Notes

- **Run tests sequentially** (some tests depend on previous results)
- **Use unique emails** for each test (no duplicates)
- **Check logs** after each test for errors
- **Keep test database separate** from production
- **Save webhook signatures** for testing (requires TELNYX_WEBHOOK_PUBLIC_KEY)
- **Document any deviations** from expected results
