# Production Validation Checklist

Before deploying to production, complete this checklist to validate Phases 7-10 work correctly.

---

## Pre-Deployment Checks

- [ ] **Database Access Verified**
  - [ ] Can connect to Render PostgreSQL as admin
  - [ ] Can create databases: `CREATE DATABASE test; DROP DATABASE test;`
  - [ ] Connection string format correct: `postgresql://user:password@host:port/db`

- [ ] **Environment Variables Set**
  - [ ] `DATABASE_URL` points to registry database
  - [ ] `REGISTRY_DATABASE_URL` set (if separate)
  - [ ] `JWT_ACCESS_SECRET` set (min 32 chars)
  - [ ] `TELNYX_WEBHOOK_PUBLIC_KEY` configured
  - [ ] All other secrets in place

- [ ] **Code Deployed**
  - [ ] Latest code on production branch
  - [ ] Build passes: `npm run build` (0 errors)
  - [ ] All migrations applied
  - [ ] Registry database schema exists

---

## Phase 7: Database Provisioning

**Test**: Can the system create tenant databases?

### Checklist

- [ ] **Test 7.1: Create database on registration**
  ```bash
  # Register user
  curl -X POST https://api.yourdomain.com/api/auth/register \
    -H "Content-Type: application/json" \
    -d '{"email":"test7.1@example.com","password":"Pass123!","firstName":"John","lastName":"Doe","churchName":"Test Church"}'

  # Expected: ✅ 200 OK with tenantId
  # Verify: Database tenant_<id> exists on Render
  ```
  - Response: ✅ 200 OK
  - Database created: ✅ YES / ❌ NO
  - Schema present: ✅ YES / ❌ NO
  - Issues: _________________

- [ ] **Test 7.2: Handle duplicate database**
  - Register same email twice
  - Expected: First succeeds, second fails with duplicate email error
  - Result: ✅ PASS / ❌ FAIL
  - Issues: _________________

- [ ] **Test 7.3: Migrations applied correctly**
  ```bash
  # Verify all tables exist in tenant database
  psql postgresql://user:password@host:port/tenant_ID \
    -c "\dt"

  # Should show: admin, member, conversation, message, etc.
  ```
  - All tables present: ✅ YES / ❌ NO
  - Schema matches tenant-schema.prisma: ✅ YES / ❌ NO
  - Issues: _________________

**Phase 7 Status**: ✅ PASS / ❌ FAIL

---

## Phase 8: Error Handling

**Test**: Does the system handle errors gracefully?

### Checklist

- [ ] **Test 8.1: Missing tenant database**
  ```bash
  # Register user, capture token and TENANT_ID
  # Manually delete database: DROP DATABASE tenant_<id>;
  # Try API request with token
  curl -X GET https://api.yourdomain.com/api/members \
    -H "Authorization: Bearer TOKEN"

  # Expected: 503 with "Database connection unavailable" message
  ```
  - Returns 503: ✅ YES / ❌ NO
  - Error message user-friendly: ✅ YES / ❌ NO
  - Not a 500 error: ✅ YES / ❌ NO
  - Issues: _________________

- [ ] **Test 8.2: Invalid JWT token**
  ```bash
  curl -X GET https://api.yourdomain.com/api/members \
    -H "Authorization: Bearer invalid.token.xyz"

  # Expected: 401 with "Invalid or expired token"
  ```
  - Returns 401: ✅ YES / ❌ NO
  - No sensitive data in error: ✅ YES / ❌ NO
  - Issues: _________________

- [ ] **Test 8.3: No token provided**
  ```bash
  curl -X GET https://api.yourdomain.com/api/members

  # Expected: 401 with "No token provided"
  ```
  - Returns 401: ✅ YES / ❌ NO
  - Issues: _________________

- [ ] **Test 8.4: Invalid webhook signature**
  ```bash
  curl -X POST https://api.yourdomain.com/api/webhooks/telnyx/mms \
    -H "telnyx-signature-ed25519: invalid_signature" \
    -H "telnyx-timestamp: 1234567890" \
    -H "Content-Type: application/json" \
    -d '{"data":{"event_type":"message.received","payload":{...}}}'

  # Expected: 401 "Invalid webhook signature"
  ```
  - Returns 401: ✅ YES / ❌ NO
  - No message created: ✅ YES / ❌ NO
  - Issues: _________________

**Phase 8 Status**: ✅ PASS / ❌ FAIL

---

## Phase 9: Architecture Validation

**Test**: Does the system maintain tenant isolation?

### Checklist

- [ ] **Test 9.1: Multi-tenant isolation**
  ```bash
  # Register Church A and Church B
  # Add member "John" to Church A
  # Login as Church B
  # List members
  # Expected: Church B should NOT see John
  ```
  - Church A data isolated: ✅ YES / ❌ NO
  - Church B data isolated: ✅ YES / ❌ NO
  - No cross-tenant leakage: ✅ YES / ❌ NO
  - Issues: _________________

- [ ] **Test 9.2: Concurrent users**
  ```bash
  # Register 5 churches
  # Make concurrent API requests from all 5
  # Expected: All succeed without errors
  ```
  - 5 churches registered: ✅ YES / ❌ NO
  - 5 concurrent requests succeed: ✅ YES / ❌ NO
  - No database locks: ✅ YES / ❌ NO
  - Issues: _________________

- [ ] **Test 9.3: Phone routing**
  ```bash
  # Assign phone numbers to Church A and Church B
  # Send incoming SMS webhook to Church A's phone
  # Expected: Message in Church A database, not Church B
  ```
  - SMS routed to correct church: ✅ YES / ❌ NO
  - Not in other church database: ✅ YES / ❌ NO
  - Conversation created correctly: ✅ YES / ❌ NO
  - Issues: _________________

**Phase 9 Status**: ✅ PASS / ❌ FAIL

---

## Phase 10: Testing & Documentation

**Test**: Can developers understand and maintain this system?

### Checklist

- [ ] **Test 10.1: Documentation exists**
  - [ ] Architecture overview documented: ✅ YES / ❌ NO
  - [ ] Key files documented: ✅ YES / ❌ NO
  - [ ] Setup instructions clear: ✅ YES / ❌ NO
  - [ ] E2E test plan provided: ✅ YES / ❌ NO

- [ ] **Test 10.2: Team knowledge**
  - [ ] Backend team understands multi-tenant flow: ✅ YES / ❌ NO
  - [ ] Frontend team knows about tenantId in JWT: ✅ YES / ❌ NO
  - [ ] DevOps team knows about Render setup: ✅ YES / ❌ NO
  - [ ] Team can deploy independently: ✅ YES / ❌ NO

**Phase 10 Status**: ✅ PASS / ❌ FAIL

---

## Overall Assessment

| Phase | Status | Evidence | Approved |
|-------|--------|----------|----------|
| 7: Database Provisioning | ✅/❌ | [test results] | ✅/❌ |
| 8: Error Handling | ✅/❌ | [test results] | ✅/❌ |
| 9: Architecture | ✅/❌ | [test results] | ✅/❌ |
| 10: Testing & Docs | ✅/❌ | [test results] | ✅/❌ |

---

## Issues Found

**Critical** (Blocks production):
1. _________________
2. _________________

**High** (Must fix before production):
1. _________________
2. _________________

**Medium** (Should fix soon):
1. _________________
2. _________________

**Low** (Nice to have):
1. _________________
2. _________________

---

## Sign-Off

```
System Status: [APPROVED FOR PRODUCTION / NEEDS FIXES / BLOCKED]

Tested By: ______________________
Date: ______________________
Signature: ______________________

Approved By: ______________________
Date: ______________________
Signature: ______________________
```

---

## Next Steps

**If APPROVED FOR PRODUCTION**:
1. ✅ Deploy to production
2. ✅ Monitor logs for first 24 hours
3. ✅ Have rollback plan ready
4. ✅ Alert team about multi-tenant system

**If NEEDS FIXES**:
1. ❌ Fix identified issues
2. ❌ Re-run failing tests
3. ❌ Get sign-off from team
4. ❌ Update this checklist

**If BLOCKED**:
1. ❌ Critical issues must be fixed
2. ❌ Do not deploy
3. ❌ Escalate to engineering lead
4. ❌ Schedule retesting

---

## Production Monitoring

Once deployed, monitor these metrics:

**Daily Checks**:
- [ ] No 500 errors in logs
- [ ] No "cross-tenant" errors
- [ ] Database creation completing successfully
- [ ] All login attempts succeeding
- [ ] No unauthorized access attempts

**Weekly Checks**:
- [ ] Tenant database count increasing
- [ ] Connection pool size healthy (< 100)
- [ ] Response times stable
- [ ] Webhook processing working
- [ ] No orphaned databases

**Monthly Checks**:
- [ ] Performance remains good
- [ ] Scaling still working at 20+ tenants
- [ ] No security issues reported
- [ ] All updates applied
- [ ] Backup/recovery tested
