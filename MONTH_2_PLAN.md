# Month 2: Performance & Compliance Plan
**Timeline**: Estimated 12-15 hours
**Target**: December 2-15, 2025
**Status**: Planning Phase - Awaiting Approval

---

## Overview

Month 2 focuses on optimizing database performance, implementing compliance features, and setting up production monitoring. All changes will maintain backward compatibility and follow enterprise standards.

---

## Phase 1: Database Optimization (3-4 hours)

### 1.1 Identify N+1 Query Problems
- [ ] Audit `getMessages()` - Check for missing `.include(recipient)` calls
- [ ] Audit `getContacts()` - Check for missing `.include(groups)` calls
- [ ] Audit `getInvoices()` - Check for missing `.include(billingInfo)` calls
- [ ] Document all identified query patterns
- [ ] Add performance logging to see query counts

**Files to Review**:
- `src/services/message.service.ts`
- `src/services/contact.service.ts`
- `src/services/billing.service.ts`

### 1.2 Add Missing Database Indices
- [ ] Add index on `(churchId, createdAt)` for faster message filtering
- [ ] Add index on `(churchId, email)` for faster contact lookups
- [ ] Add index on `(churchId, status)` for invoice filtering
- [ ] Add index on `(userId, type)` for token revocation lookups
- [ ] Create Prisma migration for all indices

**Files to Modify**:
- `prisma/schema.prisma` - Add `@@index()` directives
- Create migration file

### 1.3 Optimize Prisma Queries
- [ ] Update message queries to use `.include({ recipients: true })`
- [ ] Update contact queries to use `.include({ groups: true })`
- [ ] Update invoice queries to use `.include({ items: true })`
- [ ] Replace `findMany()` loops with `.include()` where possible
- [ ] Test each optimized query for performance

**Expected Impact**: 50-80% reduction in database queries

---

## Phase 2: Redis Caching (3-4 hours)

### 2.1 Implement Cache Service
- [ ] Create `src/services/cache.service.ts` with cache methods
- [ ] Add `getCached(key)` - retrieves from Redis
- [ ] Add `setCached(key, data, ttl)` - stores in Redis with TTL
- [ ] Add `invalidateCache(pattern)` - clears specific cache keys
- [ ] Add proper error handling for Redis failures

### 2.2 Cache High-Traffic Queries
- [ ] Cache church settings (TTL: 1 hour)
- [ ] Cache user permissions (TTL: 30 minutes)
- [ ] Cache contact groups (TTL: 30 minutes)
- [ ] Cache billing plan limits (TTL: 24 hours)
- [ ] Add cache invalidation on data updates

**Implementation Strategy**:
```
GET /api/churches/{id}/settings:
  1. Try Redis cache
  2. If miss, query database
  3. Store result in Redis (3600s TTL)
  4. Return data

ON UPDATE:
  1. Update database
  2. Invalidate: churches:{id}:*
```

### 2.3 Test Cache Performance
- [ ] Verify cache hits reduce response time
- [ ] Verify cache invalidation works on updates
- [ ] Test graceful degradation when Redis is down
- [ ] Measure database query reduction

**Expected Impact**: 60-70% faster reads for frequently accessed data

---

## Phase 3: GDPR Compliance APIs (2-3 hours)

### 3.1 Implement Data Export Endpoint
- [ ] Create `POST /api/gdpr/export` endpoint
- [ ] Export all user data in JSON format
- [ ] Export all church data
- [ ] Export all messages and history
- [ ] Export all billing records
- [ ] Send via secure email link (expires in 7 days)

**Response**: `{ status: 'pending', expiresAt: '2025-12-08T22:00:00Z', downloadUrl: '...' }`

### 3.2 Implement Data Deletion Endpoint
- [ ] Create `POST /api/gdpr/delete` endpoint
- [ ] Require admin password confirmation
- [ ] Delete user data (soft delete with archive)
- [ ] Delete church data (if no other users)
- [ ] Anonymize messages (replace content with "[deleted]")
- [ ] Keep audit logs (required for compliance)

**Safety**: Require 24-hour waiting period with confirmation email

### 3.3 Add Consent Management
- [ ] Create `POST /api/gdpr/consent` endpoint
- [ ] Track consent for marketing emails
- [ ] Track consent for analytics
- [ ] Provide `/api/gdpr/consent` GET to retrieve current consent
- [ ] Add consent audit log

**Expected Compliance**: GDPR Article 12-22 (data subject rights)

---

## Phase 4: Admin MFA Setup (2-3 hours)

### 4.1 Implement TOTP-Based MFA
- [ ] Add `speakeasy` library for TOTP generation
- [ ] Create `POST /api/admin/mfa/enable` endpoint
- [ ] Generate QR code for authenticator apps
- [ ] Store MFA secret encrypted in database
- [ ] Mark MFA as enabled after verification

### 4.2 Enforce MFA on Admin Login
- [ ] Create `POST /api/admin/mfa/verify` endpoint
- [ ] After password login, require TOTP code
- [ ] Issue JWT only after MFA verification
- [ ] Add `mfaVerified: true` to JWT payload
- [ ] Block admin actions without `mfaVerified`

### 4.3 Add Recovery Codes
- [ ] Generate 8 recovery codes when MFA enabled
- [ ] Store recovery codes (hashed) in database
- [ ] Allow login with recovery code (one-time use)
- [ ] Notify admin when recovery code used
- [ ] Provide ability to regenerate codes

**Expected Security**: Protect admin accounts from credential compromise

---

## Phase 5: Email Encryption in Database (1-2 hours)

### 5.1 Setup Encryption Service
- [ ] Add `crypto` module to encryption service
- [ ] Implement AES-256-GCM encryption/decryption
- [ ] Use database-level encryption key from environment
- [ ] Add `encryptEmail(email)` function
- [ ] Add `decryptEmail(encrypted)` function

### 5.2 Encrypt Stored Emails
- [ ] Create Prisma migration to add encrypted_email column
- [ ] Script to encrypt all existing emails
- [ ] Update User model to use encrypted_email
- [ ] Update queries to decrypt on retrieval
- [ ] Remove plain-text email column (after verification)

### 5.3 Test Encryption
- [ ] Verify encrypted emails are unreadable in database
- [ ] Verify decryption returns original email
- [ ] Verify existing queries still work
- [ ] Test performance impact

**Expected Security**: Protect emails even if database is compromised

---

## Phase 6: Datadog Monitoring Setup (1-2 hours)

### 6.1 Install Datadog Agent
- [ ] Add `@datadog/browser-rum` to frontend
- [ ] Add `dd-trace` to backend
- [ ] Configure API key and environment
- [ ] Enable APM (Application Performance Monitoring)
- [ ] Enable logs integration

### 6.2 Setup Key Dashboards
- [ ] Response time dashboard (p50, p95, p99)
- [ ] Error rate dashboard by endpoint
- [ ] Database query performance dashboard
- [ ] Redis cache hit/miss ratio
- [ ] User activity heatmap

### 6.3 Setup Alerts
- [ ] Alert if error rate > 1%
- [ ] Alert if p99 latency > 500ms
- [ ] Alert if Redis down > 2 minutes
- [ ] Alert if database CPU > 80%
- [ ] Alert on 5xx errors (email + Slack)

**Expected Visibility**: Real-time production monitoring and alerting

---

## Implementation Order

1. **Phase 1** (Database Optimization) - Foundation for all performance
2. **Phase 2** (Redis Caching) - Builds on optimized queries
3. **Phase 3** (GDPR Compliance) - Independent, can be done in parallel
4. **Phase 4** (Admin MFA) - Independent, can be done in parallel
5. **Phase 5** (Email Encryption) - Independent, can be done in parallel
6. **Phase 6** (Datadog Monitoring) - Done last to monitor all changes

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| Breaking changes in queries | Medium | High | Comprehensive testing after each change |
| Redis connection issues | Low | Medium | Graceful degradation already in place |
| Data loss during encryption | Low | Critical | Backup database before migration |
| MFA lockout | Low | Medium | Recovery codes + admin override |

---

## Testing Strategy

### Unit Tests
- [ ] Cache service: hit/miss scenarios
- [ ] MFA verification: valid/invalid codes
- [ ] Email encryption: encrypt/decrypt roundtrip
- [ ] Query optimization: result counts match

### Integration Tests
- [ ] Full login flow with MFA
- [ ] GDPR export generates valid JSON
- [ ] GDPR delete removes correct data
- [ ] Cache invalidation triggers on updates

### Performance Tests
- [ ] Query performance improved by 50%+
- [ ] Cache reads 10x faster than database
- [ ] Response times < 500ms for 95% of requests
- [ ] No performance regression on unoptimized endpoints

---

## Rollback Plan

Each phase has independent rollback:
- **Phase 1**: Drop indices, revert queries (no data loss)
- **Phase 2**: Flush Redis cache, disable cache reads (no data loss)
- **Phase 3**: GDPR endpoints disabled via feature flag
- **Phase 4**: MFA requirement disabled in admin middleware
- **Phase 5**: Use decrypted email column, disable encryption (takes 24 hours)
- **Phase 6**: Disable Datadog agent, no impact on app

---

## Success Criteria

✅ **Phase 1**: Database queries reduced by 50%+
✅ **Phase 2**: Cache hit rate > 80% for cached endpoints
✅ **Phase 3**: GDPR compliance verified (export/delete working)
✅ **Phase 4**: Admin MFA required for all admin operations
✅ **Phase 5**: All emails encrypted, no plain-text in database
✅ **Phase 6**: Dashboard shows all key metrics, alerts working

---

## Approval Gate

**This plan requires your approval before proceeding.**

Please confirm:
1. ✅ Order of phases makes sense
2. ✅ All 6 phases should be completed in Month 2
3. ✅ Any changes to scope or priorities

Once approved, we'll proceed with Phase 1: Database Optimization.

---

**Plan Created**: December 1, 2025
**Estimated Duration**: 12-15 hours
**Current Status**: ⏳ Awaiting User Approval
