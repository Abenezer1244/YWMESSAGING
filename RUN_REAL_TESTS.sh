#!/bin/bash

# ============================================================================
# REAL E2E TESTS - NO SHORTCUTS, NO MOCKS, NO LIES
# ============================================================================
# This script actually tests the multi-tenant system by:
# 1. Reading the environment
# 2. Checking PostgreSQL access
# 3. Starting the backend
# 4. Running real HTTP requests
# 5. Verifying database changes
# ============================================================================

set -e  # Exit on error

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=================================${NC}"
echo -e "${BLUE}KOINONIA MULTI-TENANT E2E TESTS${NC}"
echo -e "${BLUE}=================================${NC}"
echo ""

# ============================================================================
# PHASE 1: PRE-FLIGHT CHECKS
# ============================================================================
echo -e "${YELLOW}[PHASE 1] Pre-flight Checks${NC}"
echo ""

# Check 1.1: DATABASE_URL configured
echo -n "1.1 Checking DATABASE_URL... "
if [ -z "$DATABASE_URL" ]; then
  echo -e "${RED}❌ FAIL${NC}"
  echo "   DATABASE_URL not set. Set it with:"
  echo "   export DATABASE_URL='postgresql://user:password@host:port/database'"
  exit 1
fi
echo -e "${GREEN}✅ PASS${NC}"

# Check 1.2: Can connect to PostgreSQL
echo -n "1.2 Testing PostgreSQL connection... "
if ! psql "$DATABASE_URL" -c "SELECT 1" > /dev/null 2>&1; then
  echo -e "${RED}❌ FAIL${NC}"
  echo "   Cannot connect to PostgreSQL at: $DATABASE_URL"
  echo "   Verify credentials and connection"
  exit 1
fi
echo -e "${GREEN}✅ PASS${NC}"

# Check 1.3: Can CREATE DATABASE
echo -n "1.3 Testing CREATE DATABASE permission... "
TEST_DB_NAME="test_create_db_$(date +%s)"
if ! psql "$DATABASE_URL" -c "CREATE DATABASE \"$TEST_DB_NAME\"" > /dev/null 2>&1; then
  echo -e "${RED}❌ FAIL${NC}"
  echo "   PostgreSQL user cannot CREATE DATABASE"
  echo "   This is REQUIRED for multi-tenant system to work"
  exit 1
fi
# Clean up test database
psql "$DATABASE_URL" -c "DROP DATABASE \"$TEST_DB_NAME\"" > /dev/null 2>&1
echo -e "${GREEN}✅ PASS${NC}"

# Check 1.4: Node/npm available
echo -n "1.4 Checking Node.js installation... "
if ! command -v node &> /dev/null; then
  echo -e "${RED}❌ FAIL${NC}"
  echo "   Node.js not installed"
  exit 1
fi
NODE_VERSION=$(node --version)
echo -e "${GREEN}✅ PASS${NC} ($NODE_VERSION)"

# Check 1.5: Code compiles
echo -n "1.5 Testing TypeScript compilation... "
cd backend
if ! npm run build > /dev/null 2>&1; then
  echo -e "${RED}❌ FAIL${NC}"
  echo "   Build failed. Check 'npm run build' for errors"
  exit 1
fi
echo -e "${GREEN}✅ PASS${NC}"
cd ..

echo ""
echo -e "${GREEN}[PHASE 1] ✅ All pre-flight checks passed${NC}"
echo ""

# ============================================================================
# PHASE 2: DATABASE SCHEMA VERIFICATION
# ============================================================================
echo -e "${YELLOW}[PHASE 2] Database Schema Verification${NC}"
echo ""

# Check 2.1: Registry database exists and has tables
echo -n "2.1 Checking registry database schema... "
REGISTRY_TABLES=$(psql "$DATABASE_URL" -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='public'" -t | xargs)
if [ "$REGISTRY_TABLES" -lt 3 ]; then
  echo -e "${RED}❌ FAIL${NC}"
  echo "   Registry database missing tables (found $REGISTRY_TABLES, need at least 3)"
  echo "   Run: npx prisma migrate deploy"
  exit 1
fi
echo -e "${GREEN}✅ PASS${NC} (found $REGISTRY_TABLES tables)"

# Check 2.2: Tenant schema file exists
echo -n "2.2 Checking tenant-schema.prisma exists... "
if [ ! -f "backend/prisma/tenant-schema.prisma" ]; then
  echo -e "${RED}❌ FAIL${NC}"
  echo "   File not found: backend/prisma/tenant-schema.prisma"
  exit 1
fi
echo -e "${GREEN}✅ PASS${NC}"

echo ""
echo -e "${GREEN}[PHASE 2] ✅ Schema verification complete${NC}"
echo ""

# ============================================================================
# PHASE 3: TEST 1.1 - REGISTRATION CREATES DATABASE
# ============================================================================
echo -e "${YELLOW}[PHASE 3] TEST 1.1: Registration Creates Database${NC}"
echo ""

# Generate unique email for this test run
TEST_TIMESTAMP=$(date +%s)
TEST_EMAIL="test-e2e-$TEST_TIMESTAMP@example.com"
TEST_PASSWORD="TestPassword123!"

echo "Starting backend server..."
cd backend
BACKEND_PID=""

# Start backend in background
timeout 10 npm run dev > /tmp/backend.log 2>&1 &
BACKEND_PID=$!

# Wait for server to start
sleep 4

# Check if backend is running
if ! kill -0 $BACKEND_PID 2>/dev/null; then
  echo -e "${RED}❌ FAIL${NC}"
  echo "   Backend failed to start. Check /tmp/backend.log:"
  tail -20 /tmp/backend.log
  cd ..
  exit 1
fi

echo "Backend started (PID: $BACKEND_PID)"
echo ""

# Make registration request
echo -n "3.1 Sending registration request... "
REGISTER_RESPONSE=$(curl -s -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$TEST_EMAIL\",
    \"password\": \"$TEST_PASSWORD\",
    \"firstName\": \"Test\",
    \"lastName\": \"User\",
    \"churchName\": \"Test Church\"
  }")

# Check if response contains error
if echo "$REGISTER_RESPONSE" | grep -q "error"; then
  echo -e "${RED}❌ FAIL${NC}"
  echo "   Response: $REGISTER_RESPONSE"
  kill $BACKEND_PID 2>/dev/null || true
  cd ..
  exit 1
fi

echo -e "${GREEN}✅ PASS${NC}"

# Extract tenantId from response
TENANT_ID=$(echo "$REGISTER_RESPONSE" | grep -o '"tenantId":"[^"]*' | cut -d'"' -f4)
echo "   TenantId: $TENANT_ID"
echo ""

if [ -z "$TENANT_ID" ]; then
  echo -e "${RED}❌ FAIL${NC}"
  echo "   Could not extract tenantId from response"
  echo "   Response: $REGISTER_RESPONSE"
  kill $BACKEND_PID 2>/dev/null || true
  cd ..
  exit 1
fi

# Wait a moment for database to be created
sleep 2

# Check if database was created on PostgreSQL
echo -n "3.2 Verifying database created on PostgreSQL... "
cd ..
DATABASE_NAME="tenant_$TENANT_ID"
DB_EXISTS=$(psql "$DATABASE_URL" -c "SELECT datname FROM pg_database WHERE datname = '$DATABASE_NAME'" -t | xargs)

if [ "$DB_EXISTS" != "$DATABASE_NAME" ]; then
  echo -e "${RED}❌ FAIL${NC}"
  echo "   Database '$DATABASE_NAME' not found on PostgreSQL"
  echo "   Existing databases:"
  psql "$DATABASE_URL" -c "SELECT datname FROM pg_database WHERE datname LIKE 'tenant_%'" -t
  kill $BACKEND_PID 2>/dev/null || true
  exit 1
fi

echo -e "${GREEN}✅ PASS${NC}"
echo ""

# Check if admin table exists in tenant database
echo -n "3.3 Verifying tenant schema applied... "
TENANT_DATABASE_URL="${DATABASE_URL%/*}/$DATABASE_NAME"  # Replace database name
ADMIN_EXISTS=$(psql "$TENANT_DATABASE_URL" -c "SELECT table_name FROM information_schema.tables WHERE table_name='admin'" -t | xargs 2>/dev/null || echo "")

if [ -z "$ADMIN_EXISTS" ]; then
  echo -e "${RED}❌ FAIL${NC}"
  echo "   Schema not applied to tenant database"
  echo "   Tables in tenant database:"
  psql "$TENANT_DATABASE_URL" -c "\dt" 2>/dev/null || echo "   (Cannot connect)"
  kill $BACKEND_PID 2>/dev/null || true
  exit 1
fi

echo -e "${GREEN}✅ PASS${NC}"
echo ""

echo -e "${GREEN}[PHASE 3] ✅ Registration creates database - SUCCESS${NC}"
echo ""

# ============================================================================
# PHASE 4: TEST 2.1 - MULTI-TENANT ISOLATION
# ============================================================================
echo -e "${YELLOW}[PHASE 4] TEST 2.1: Multi-Tenant Isolation${NC}"
echo ""

# Get access token from registration response
ACCESS_TOKEN=$(echo "$REGISTER_RESPONSE" | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)

if [ -z "$ACCESS_TOKEN" ]; then
  echo -e "${RED}❌ FAIL${NC}"
  echo "   Could not extract access token"
  kill $BACKEND_PID 2>/dev/null || true
  exit 1
fi

echo "Using access token for user 1"
echo ""

# Register a second user
echo -n "4.1 Registering second user... "
TEST_EMAIL_2="test-e2e-2-$TEST_TIMESTAMP@example.com"
REGISTER_RESPONSE_2=$(curl -s -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$TEST_EMAIL_2\",
    \"password\": \"$TEST_PASSWORD\",
    \"firstName\": \"Test2\",
    \"lastName\": \"User2\",
    \"churchName\": \"Test Church 2\"
  }")

TENANT_ID_2=$(echo "$REGISTER_RESPONSE_2" | grep -o '"tenantId":"[^"]*' | cut -d'"' -f4)
ACCESS_TOKEN_2=$(echo "$REGISTER_RESPONSE_2" | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)

if [ -z "$TENANT_ID_2" ] || [ -z "$ACCESS_TOKEN_2" ]; then
  echo -e "${RED}❌ FAIL${NC}"
  echo "   Could not register second user"
  kill $BACKEND_PID 2>/dev/null || true
  exit 1
fi

echo -e "${GREEN}✅ PASS${NC}"
echo "   User 2 TenantId: $TENANT_ID_2"
echo ""

# Create a member in user 1's database
echo -n "4.2 Creating member in User 1's church... "
MEMBER_RESPONSE=$(curl -s -X POST http://localhost:5000/api/members \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"firstName\": \"John\",
    \"lastName\": \"Doe\",
    \"phone\": \"+12025551234\"
  }")

MEMBER_ID=$(echo "$MEMBER_RESPONSE" | grep -o '"id":"[^"]*' | cut -d'"' -f4 | head -1)

if [ -z "$MEMBER_ID" ]; then
  echo -e "${RED}❌ FAIL${NC}"
  echo "   Could not create member in user 1's church"
  echo "   Response: $MEMBER_RESPONSE"
  kill $BACKEND_PID 2>/dev/null || true
  exit 1
fi

echo -e "${GREEN}✅ PASS${NC}"
echo "   Member created: $MEMBER_ID"
echo ""

# Try to access user 1's members as user 2
echo -n "4.3 Checking User 2 cannot see User 1's member... "
MEMBERS_RESPONSE=$(curl -s -X GET http://localhost:5000/api/members \
  -H "Authorization: Bearer $ACCESS_TOKEN_2")

# User 2 should get empty members list, NOT the member created by user 1
if echo "$MEMBERS_RESPONSE" | grep -q "John\|Doe"; then
  echo -e "${RED}❌ FAIL - CRITICAL SECURITY ISSUE${NC}"
  echo "   User 2 can see User 1's member! Cross-tenant data leakage!"
  echo "   Response: $MEMBERS_RESPONSE"
  kill $BACKEND_PID 2>/dev/null || true
  exit 1
fi

echo -e "${GREEN}✅ PASS${NC}"
echo ""

echo -e "${GREEN}[PHASE 4] ✅ Multi-tenant isolation verified - SUCCESS${NC}"
echo ""

# ============================================================================
# CLEANUP
# ============================================================================
echo -e "${YELLOW}[CLEANUP]${NC}"
echo ""

echo -n "Stopping backend... "
kill $BACKEND_PID 2>/dev/null || true
sleep 1
echo -e "${GREEN}✅${NC}"

echo ""
echo -e "${GREEN}=================================${NC}"
echo -e "${GREEN}ALL TESTS PASSED ✅${NC}"
echo -e "${GREEN}=================================${NC}"
echo ""
echo "Summary:"
echo "  ✅ Phase 1: Pre-flight checks"
echo "  ✅ Phase 2: Database schema verified"
echo "  ✅ Phase 3: Registration creates isolated database"
echo "  ✅ Phase 4: Multi-tenant isolation confirmed"
echo ""
echo "System is ready for production testing!"
echo ""
