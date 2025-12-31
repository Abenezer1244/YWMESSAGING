# COMPREHENSIVE END-TO-END TEST PLAN
## Database-Per-Tenant Architecture - Full Verification

**Date**: December 30, 2025
**Purpose**: Execute thorough, honest end-to-end testing with REAL system execution
**Test Type**: Production-grade verification (no shortcuts, no assumptions)

---

## Executive Summary

### What This Test Will Do

This is a **REAL EXECUTION TEST** - not code review or static analysis. I will:

1. Start the actual backend server
2. Execute HTTP requests against real endpoints
3. Create real databases in your PostgreSQL cluster
4. Verify tenant isolation by querying actual databases
5. Test concurrent operations and edge cases
6. Monitor resource usage and connection pooling
7. Document every finding with brutal honesty

### Previous Testing Context

Based on the reports I've read:
- ✅ **Phase 1 (Stability)**: Completed with Redis graceful degradation and connection pool fixes
- ✅ **Stress Test**: 20 registrations succeeded (backend stable)
- ⚠️ **API Issues**: Some response structure inconsistencies found
- ⚠️ **Earlier Testing**: Backend crashed after 5+ registrations (now fixed in Phase 1)

### This Test's Scope

I will verify the CURRENT state of your system comprehensively, including:
- All Phase 1 fixes
- Database-per-tenant architecture end-to-end
- Multi-tenant isolation
- Connection pool management
- Error handling and graceful degradation
- Production environment readiness

---

## Test Architecture Overview

### What's Implemented (From Code Review)

**1. Registry Database** (`REGISTRY_DATABASE_URL`)
   - Stores: Church, Tenant, AdminEmailIndex, PhoneNumberRegistry
   - Purpose: Metadata and routing information
   - Used by: All authentication, tenant resolution

**2. Tenant Databases** (One per church)
   - Format: `tenant_<tenantId>`
   - Stores: Admin, Member, Message, Conversation, Branch, etc.
   - Purpose: Complete data isolation per customer
   - Created: During registration via `provisionTenantDatabase()`

**3. Connection Management** (`tenant-prisma.ts`)
   - LRU cache: Max 100 tenant connections
   - Idle timeout: 30 minutes
   - Graceful eviction and cleanup
   - Phase 1 fixes: Timeout-protected disconnects

**4. Multi-Tenant Flow**
   - JWT contains `churchId` (tenant ID)
   - Middleware extracts tenant ID from token
   - `getTenantPrisma(tenantId)` returns tenant-specific client
   - `req.prisma` injected into every authenticated request

---

## Detailed Test Plan

### TEST 1: Registration Flow with Database Provisioning
**Status**: Critical - Core functionality
**Duration**: ~20 seconds per registration

#### What I'll Test:
1. POST `/api/auth/register` with new church details
2. Monitor backend logs for database provisioning
3. Verify new database created in PostgreSQL
4. Confirm Tenant record in registry with connection info
5. Verify Admin created in both registry and tenant database
6. Check JWT tokens contain correct tenant ID
7. Validate Stripe customer creation
8. Test trial period set correctly (14 days)

#### Success Criteria:
- ✅ HTTP 201 response within 90 seconds
- ✅ New database `tenant_<id>` exists
- ✅ Tenant record in registry has correct connection info
- ✅ Admin can be found in tenant database (not registry)
- ✅ JWT payload includes `churchId`
- ✅ No connection leaks (check pool stats)

#### What Can Go Wrong:
- Database provisioning timeout (> 90s)
- Prisma migrations fail on new database
- Stripe API failure causes rollback
- Connection leak during provisioning
- Duplicate email rejection fails

---

### TEST 2: Login and Tenant Resolution
**Status**: Critical - Multi-tenancy foundation
**Duration**: < 500ms per login

#### What I'll Test:
1. POST `/api/auth/login` with registered email
2. Verify backend looks up email in AdminEmailIndex
3. Confirm tenant ID resolved from email
4. Check correct tenant database connection established
5. Validate JWT includes tenant context
6. Test login speed (should be sub-second)

#### Success Criteria:
- ✅ HTTP 200 response < 500ms
- ✅ Correct tenant ID returned
- ✅ JWT contains matching `churchId`
- ✅ Access token and refresh token provided
- ✅ Backend logs show tenant resolution
- ✅ No cross-tenant data leak

#### What Can Go Wrong:
- Email lookup returns wrong tenant
- JWT missing tenant information
- Wrong database connection established
- Slow query times (> 1 second)

---

### TEST 3: Multi-Tenant Data Isolation
**Status**: CRITICAL - Security foundation
**Duration**: ~60 seconds

#### What I'll Test:
1. Register TWO separate churches (Tenant A & B)
2. Login as Tenant A, create members/branches
3. Login as Tenant B, create different data
4. Attempt to query Tenant A's data using Tenant B's token
5. Verify Tenant B CANNOT see Tenant A's data
6. Check database-level isolation (query both DBs directly)
7. Test JWT prevents cross-tenant access at middleware level

#### Success Criteria:
- ✅ Two separate databases created
- ✅ Tenant A's data NOT visible to Tenant B
- ✅ Middleware rejects wrong tenant access
- ✅ JWT validation prevents token swapping
- ✅ Database queries prove complete isolation
- ✅ No shared data between tenants

#### What Can Go Wrong:
- Middleware fails to isolate tenants
- JWT doesn't enforce tenant boundaries
- Shared cache leaks data between tenants
- Wrong Prisma client attached to request

---

### TEST 4: Concurrent Tenant Operations
**Status**: High Priority - Stability under load
**Duration**: ~2-5 minutes

#### What I'll Test:
1. Register 5 churches SIMULTANEOUSLY (parallel requests)
2. Monitor connection pool during concurrent load
3. Check for race conditions in database provisioning
4. Verify each tenant gets isolated database
5. Test concurrent logins from multiple tenants
6. Monitor memory and connection usage

#### Success Criteria:
- ✅ All 5 registrations succeed (100%)
- ✅ No database name collisions
- ✅ Connection pool stays within limits (< 100)
- ✅ No connection leaks (Created - Closed = Cached)
- ✅ Backend doesn't crash
- ✅ Each tenant completely isolated

#### What Can Go Wrong:
- Connection pool exhaustion
- Database name collision (race condition)
- Memory leak during rapid provisioning
- Backend crashes under concurrent load
- Stripe API rate limiting

---

### TEST 5: Connection Pool Management
**Status**: Critical - Phase 1 verification
**Duration**: Ongoing monitoring

#### What I'll Test:
1. Create 20+ tenant registrations
2. Monitor connection pool statistics:
   - `totalConnectionsCreated`
   - `totalConnectionsClosed`
   - `totalConnectionsEvicted`
   - `tenantClients.size`
3. Calculate potential leaks: `Created - Closed - Cached`
4. Test LRU eviction when cache > 100 clients
5. Verify idle timeout (30 minutes)
6. Test graceful shutdown

#### Success Criteria:
- ✅ Potential leaks = 0
- ✅ LRU eviction works when cache full
- ✅ Idle clients cleaned up after timeout
- ✅ Disconnect timeouts prevent hangs (5s limit)
- ✅ Graceful shutdown closes all connections
- ✅ Connection pool stats accurate

#### What Can Go Wrong:
- Connections never close (leak)
- Disconnect hangs forever (no timeout)
- LRU eviction fails
- Idle cleanup job doesn't run
- Shutdown leaves connections open

---

### TEST 6: Redis Graceful Degradation
**Status**: Critical - Phase 1 Fix Verification
**Duration**: ~5 minutes

#### What I'll Test:
1. Start backend WITHOUT Redis running
2. Verify max 5 reconnection attempts
3. Confirm permanent fallback mode engaged
4. Test backend continues serving requests
5. Verify no error spam after fallback
6. Test registration/login work WITHOUT Redis
7. Confirm token revocation disabled (documented)

#### Success Criteria:
- ✅ Exactly 5 reconnection attempts (not infinite)
- ✅ Permanent fallback mode message logged
- ✅ Backend stays running (no crash)
- ✅ Registration and login work normally
- ✅ No repeated Redis error spam
- ✅ Application clearly logs fallback mode

#### What Can Go Wrong:
- Infinite reconnection loop (was the bug)
- Backend crashes without Redis
- Error spam floods logs
- Operations fail that should work without Redis

---

### TEST 7: Error Handling and Rollback
**Status**: High Priority - Production readiness
**Duration**: ~30 seconds per scenario

#### What I'll Test:
**Scenario A: Migration Failure**
1. Simulate Prisma migration failure
2. Verify database deletion (rollback)
3. Check no orphaned database left

**Scenario B: Stripe Failure**
1. Simulate Stripe API error
2. Verify graceful error handling
3. Check rollback behavior

**Scenario C: Invalid Token**
1. Use expired JWT
2. Use revoked token
3. Use malformed token
4. Verify all rejected with 401

**Scenario D: Tenant Not Found**
1. Use valid JWT with deleted tenant ID
2. Verify graceful error message

#### Success Criteria:
- ✅ Failed registrations rollback cleanly
- ✅ No orphaned databases
- ✅ Clear error messages returned
- ✅ No sensitive info leaked
- ✅ Backend doesn't crash on errors
- ✅ HTTP status codes correct

#### What Can Go Wrong:
- Orphaned databases on failure
- Sensitive error details exposed
- Backend crashes on error
- No rollback mechanism

---

### TEST 8: Production Environment Verification
**Status**: Critical - Real-world validation
**Duration**: ~10 minutes

#### What I'll Test:
1. Verify REGISTRY_DATABASE_URL points to production
2. Test database provisioning on Render PostgreSQL
3. Confirm connection pooling limits appropriate
4. Check environment variables set correctly
5. Test CORS and cookie settings
6. Verify logging appropriate for production
7. Monitor actual performance metrics

#### Success Criteria:
- ✅ Using production database (not local)
- ✅ Render PostgreSQL working correctly
- ✅ Connection limits prevent OOM
- ✅ Environment variables secure
- ✅ CORS configured properly
- ✅ No verbose dev logging in production

#### What Can Go Wrong:
- Wrong database URL (dev vs prod)
- Connection limits too high (OOM)
- Missing environment variables
- CORS misconfigured
- Secrets in logs

---

### TEST 9: API Contract Verification
**Status**: Medium Priority - Developer experience
**Duration**: ~15 minutes

#### What I'll Test:
1. Registration response structure
2. Login response structure
3. Member/Branch creation responses
4. Error response consistency
5. Tenant ID naming (`churchId` vs `tenantId`)
6. Response wrapping (`{success, data}` pattern)

#### Known Issues (From Previous Reports):
- Response structure inconsistent across endpoints
- Tenant ID buried in nested structure
- Branch routes still have `/churches/:churchId/branches` pattern
- Not fully refactored for database-per-tenant

#### What I'll Document:
- Current API structure
- Inconsistencies found
- Recommendations for Phase 2 refactoring
- Breaking changes needed

---

### TEST 10: Performance and Scalability
**Status**: Medium Priority - Future planning
**Duration**: ~20 minutes

#### What I'll Test:
1. Registration time (target: < 20s)
2. Login time (target: < 500ms)
3. Query time with tenant DB (target: < 100ms)
4. Memory usage during load
5. Connection pool utilization
6. Database query performance

#### Metrics to Collect:
- Average registration time
- P95/P99 login latency
- Memory footprint per tenant
- Connection pool hit rate
- Database query efficiency

---

## Test Execution Strategy

### Phase 1: Basic Functionality (30 minutes)
1. TEST 1: Registration
2. TEST 2: Login
3. TEST 3: Data Isolation

### Phase 2: Stability & Resilience (30 minutes)
4. TEST 4: Concurrent Operations
5. TEST 5: Connection Pool
6. TEST 6: Redis Degradation

### Phase 3: Edge Cases & Errors (20 minutes)
7. TEST 7: Error Handling
8. TEST 9: API Contracts

### Phase 4: Production Readiness (20 minutes)
9. TEST 8: Production Environment
10. TEST 10: Performance Metrics

**Total Estimated Time**: ~2 hours of comprehensive testing

---

## Test Environment

### Requirements:
- ✅ Backend server running (`npm run dev`)
- ✅ Render PostgreSQL accessible
- ✅ REGISTRY_DATABASE_URL configured
- ⚠️ Redis optional (will test graceful degradation)
- ✅ Stripe test keys configured
- ✅ Environment variables set

### Tools I'll Use:
- `axios` for HTTP requests
- `@prisma/client` for direct database queries
- Backend logs for monitoring
- Connection pool stats endpoint
- Custom test scripts

---

## Success Criteria

### Must Pass (Blockers):
- ✅ Registration creates isolated databases
- ✅ Login resolves correct tenant
- ✅ Complete data isolation between tenants
- ✅ Zero connection leaks
- ✅ Redis graceful degradation works
- ✅ Backend stable under concurrent load

### Should Pass (High Priority):
- ✅ Registration < 20 seconds
- ✅ Login < 500ms
- ✅ Error handling graceful
- ✅ Rollback mechanisms work
- ✅ Production environment correct

### Nice to Have (Future):
- API response consistency
- Performance optimizations
- Enhanced monitoring

---

## Reporting

### What I'll Document:

**1. Test Execution Report**
- Each test result (PASS/FAIL)
- Actual measurements (time, memory, connections)
- Screenshots of backend logs
- Database queries executed
- Connection pool statistics

**2. Issues Found**
- Severity (Critical/High/Medium/Low)
- Steps to reproduce
- Root cause analysis (where possible)
- Recommended fixes

**3. Architecture Validation**
- What works as designed
- What needs improvement
- Security assessment
- Scalability concerns

**4. Honest Assessment**
- Production readiness grade
- What's safe to deploy
- What needs fixing first
- Risks and mitigation

---

## Risk Assessment

### Known Risks from Previous Tests:
1. ⚠️ Backend crashed after 5+ registrations (supposedly fixed in Phase 1)
2. ⚠️ API response inconsistencies
3. ⚠️ Registration time 16+ seconds
4. ⚠️ Redis dependency issues

### What I'll Validate:
- Are Phase 1 fixes actually working?
- Is the system stable for production?
- Are there hidden issues not yet discovered?
- Can this scale beyond beta?

---

## Next Steps After Testing

Based on results, I will recommend:

**If All Tests Pass**:
- ✅ Ready for limited beta launch
- 📋 Create deployment checklist
- 📋 Set up monitoring and alerting
- 📋 Document operational procedures

**If Critical Issues Found**:
- 🔴 Block production deployment
- 🛠️ Provide fix recommendations
- 🔄 Re-test after fixes
- 📋 Update test plan

**If Minor Issues Found**:
- 🟡 Document workarounds
- 📋 Create technical debt tickets
- ✅ Proceed with beta (monitored)
- 🔄 Plan Phase 2 improvements

---

## Commitment to Honesty

### My Testing Philosophy:

1. **No Shortcuts**: I will actually run every test, not assume it works
2. **Real Execution**: I will use the actual system, not mock anything
3. **Brutal Honesty**: I will report exactly what I find, good or bad
4. **Root Causes**: I will investigate failures, not just document symptoms
5. **No Lazy**: I will trace through code flows when issues found

### What You Can Expect:

- ✅ Real measurements, not estimates
- ✅ Actual logs and evidence
- ✅ Honest assessment of readiness
- ✅ Clear recommendations
- ✅ No sugarcoating

---

**Test Plan Created By**: Claude Code (Sonnet 4.5)
**Awaiting Approval**: Ready to execute upon your confirmation
**Estimated Duration**: 2 hours comprehensive testing
**Output**: Detailed test report with honest findings
