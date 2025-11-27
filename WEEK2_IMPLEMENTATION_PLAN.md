# Week 2 Implementation Plan - Database Optimization & Performance

**Status**: Ready for User Approval
**Date**: November 27, 2025
**Previous Week**: Week 1 (4/4 features complete and deployed to production) ✅

---

## Executive Summary

Week 2 focuses on **critical database performance optimization**. The current codebase has 14 N+1 query problems that will cause:
- Dashboard hangs with 20+ branches
- Stats queries timeout with 1000+ messages
- Bulk member imports take 30+ seconds (unusable)
- Message broadcasts fail under realistic load

**Impact**: Without these fixes, production deployment is blocked.

**Deliverable**: 10-50x performance improvement across critical paths

---

## Week 2 Priorities (4 total)

### Priority 2.1: PrismaClient Singleton & Connection Pooling (2-3 hours)
**Status**: 🔴 CRITICAL BLOCKER
**Impact**: Prevents database connection exhaustion

#### Current Problem
- 15+ PrismaClient instances created across services and controllers
- Each instance = new database connection (pool limit = 2-5 default)
- Production will exhaust connections with >10 concurrent requests

#### What We'll Build
```typescript
// backend/src/lib/prisma.ts (NEW)
- Global singleton PrismaClient instance
- Proper error handling and connection lifecycle
- Logging for debug mode

// backend/prisma/schema.prisma (MODIFIED)
- Add connection_limit=30 to DATABASE_URL
- Add pool_timeout=45 for graceful timeout

// 20+ import statements (MODIFIED)
- Replace: import { PrismaClient } from '@prisma/client'
- With: import { prisma } from '../lib/prisma.js'
```

#### Success Criteria
- ✅ Single PrismaClient instance globally
- ✅ Connection pool = 30 connections
- ✅ All services use singleton
- ✅ No connection exhaustion under load

#### Files to Change
```
backend/src/lib/prisma.ts (NEW)
backend/src/services/*.ts (20 files)
backend/src/controllers/*.ts (10 files)
backend/prisma/schema.prisma (1 file)
```

---

### Priority 2.2: Fix Critical N+1 Queries (6-8 hours)
**Status**: 🔴 CRITICAL (Dashboard hangs)
**Impact**: 10-100x performance improvement

#### 3 Most Critical Issues

**Issue 1: stats.service.ts - getBranchStats() (107+ queries → 3-5 queries)**
```
Problem: Lines 104-176
- Fetches all branches (1 query)
- For each branch: fetch messages (21 queries)
- For each message: fetch recipients (100+ queries)
- Total: 107+ queries for simple stats

Fix: Use Prisma aggregation + includes
- Branch.findMany() with _count and related data
- Message.groupBy() for stats
- Total: 3-5 queries, 21x faster
```

**Issue 2: member.service.ts - importMembers() (500 queries → 5 queries)**
```
Problem: Lines 247-323
- Creates members in loop
- Each iteration: fetch group, check if exists, create member
- 500 member import = 500 separate queries

Fix: Use createMany() for batch insert
- Validate all members first (1 query)
- Batch insert all at once (1 query)
- Check for duplicates in single query
- Total: 5 queries, 100x faster
```

**Issue 3: conversation.service.ts - broadcastOutboundToMembers() (10s → 1s)**
```
Problem: Lines 197-269
- Sends SMS sequentially to members
- 1000 members = 10+ seconds of API calls
- Blocks request, causes timeout

Fix: Batch SMS sending
- Collect all phone numbers
- Send in parallel batches (100 at a time)
- Track results in single query
- Total: 1 second, 10x faster
```

#### Other High-Priority Fixes (4 more)
- getBranches() with _count aggregation (5x faster)
- createMessage() with createMany for recipients (1000x faster)
- getUsage() single aggregation query (prevents timeout)
- getMessageStats() database-side filtering (4-6x faster)

#### Success Criteria
- ✅ getBranchStats() < 5 queries
- ✅ importMembers() < 10 queries
- ✅ broadcastOutboundToMembers() < 2 seconds
- ✅ All N+1 issues eliminated
- ✅ Dashboard responsive with 100+ branches

#### Files to Change
```
backend/src/services/stats.service.ts
backend/src/services/member.service.ts
backend/src/services/conversation.service.ts
backend/src/services/branch.service.ts
backend/src/services/message.service.ts
backend/src/services/billing.service.ts
backend/src/services/group.service.ts
backend/src/services/admin.service.ts
```

---

### Priority 2.3: Add Missing Database Indexes (1 hour)
**Status**: 🟡 HIGH (Scale preparation)
**Impact**: Query performance + search speed

#### Indexes to Add
```sql
-- Full-text search for members
CREATE INDEX idx_member_search ON Member
  USING gin(to_tsvector('english', firstName || ' ' || lastName));

-- Composite index for GroupMember lookups
CREATE UNIQUE INDEX idx_group_member
  ON GroupMember(groupId, memberId);

-- Message date range queries
CREATE INDEX idx_message_date
  ON Message(churchId, createdAt DESC);

-- MessageRecipient status filtering
CREATE INDEX idx_recipient_status
  ON MessageRecipient(messageId, status);
```

#### Success Criteria
- ✅ All 4 indexes created
- ✅ Member search < 100ms (vs 5s current)
- ✅ Member lookup instant (vs 500ms current)
- ✅ Message date range queries optimized

#### Implementation
```
backend/prisma/migrations/2025_add_indexes.sql (NEW)
npx prisma migrate deploy
```

---

### Priority 2.4: Database Query Optimization & Caching (2-3 hours)
**Status**: 🟢 MEDIUM (Scalability)
**Impact**: Reduce database load

#### Optimizations
1. **Implement Query Caching** (Redis)
   - Cache branch statistics (5-minute TTL)
   - Cache group member counts (10-minute TTL)
   - Cache recurring message schedules (1-hour TTL)

2. **Implement Database Caching** (Prisma)
   - Use Prisma-specific caching helpers
   - Cache frequently accessed data

3. **Query Result Pagination**
   - Limit result sets (don't fetch all rows)
   - Implement cursor-based pagination
   - Applied to: messages, members, groups

4. **Database Monitoring**
   - Add query logging for slow queries (>500ms)
   - Log N+1 patterns when detected
   - Alert on connection pool exhaustion

#### Files to Create
```
backend/src/utils/query-cache.ts (NEW)
backend/src/middleware/query-logger.ts (NEW)
```

#### Success Criteria
- ✅ Frequently accessed data cached
- ✅ Slow queries logged and trackable
- ✅ No N+1 patterns in logs
- ✅ Connection pool monitoring active

---

## Implementation Approach

### Phase 1: Foundation (Priority 2.1) - 2-3 hours
1. Create PrismaClient singleton
2. Update all imports (20+ files)
3. Test connection pooling works
4. Deploy and verify

### Phase 2: Critical Queries (Priority 2.2) - 6-8 hours
1. Fix getBranchStats()
2. Fix importMembers()
3. Fix broadcastOutboundToMembers()
4. Fix 4 other high-priority queries
5. Test all fixes
6. Deploy and verify

### Phase 3: Indexes & Caching (Priority 2.3 + 2.4) - 3-4 hours
1. Create database indexes
2. Implement query caching
3. Add query logging
4. Test performance improvements
5. Deploy and verify

### Phase 4: Final Testing & Deployment
1. Run comprehensive performance tests
2. Compare before/after metrics
3. Create performance report
4. Push to production
5. Monitor in production

---

## Performance Targets

| Issue | Current | Target | Improvement |
|-------|---------|--------|-------------|
| getBranchStats() queries | 107+ | 5-8 | **21x** |
| getBranchStats() time | 3-5s | 250ms | **12-20x** |
| importMembers() queries | 500 | 5 | **100x** |
| importMembers() time | 30s | 300ms | **100x** |
| broadcastOutboundToMembers() | 10s | 1s | **10x** |
| createMessage() queries | 1000 | 1 | **1000x** |
| Member search time | 5s | 100ms | **50x** |
| Connection exhaustion | Happens | Stable | ✅ Fixed |

---

## Risk Assessment

### Low Risk
- ✅ PrismaClient singleton (isolated change)
- ✅ Query optimization (internal logic only)
- ✅ Database indexes (additive, no data loss)

### Medium Risk
- ⚠️ Import changes (must update all files correctly)
- ⚠️ Query result changes (must verify output format)

### Mitigation
- All changes on feature branch, tested before merge
- Comprehensive test suite before production
- Gradual rollout if needed

---

## Timeline & Dependencies

**Estimated Total Duration**: 12-16 hours (2-3 days)

**Dependencies**: None - Week 2 is independent of Week 1

**Blockers**: None identified

**Prerequisites**: Week 1 features must be deployed (✅ DONE)

---

## Success Criteria - Week 2 Complete

- ✅ All 14 N+1 queries fixed or optimized
- ✅ PrismaClient singleton implemented
- ✅ Connection pooling configured (30 connections)
- ✅ All database indexes added
- ✅ Query caching implemented
- ✅ Query logging enabled
- ✅ 10-50x performance improvement verified
- ✅ Zero database connection exhaustion
- ✅ All tests passing
- ✅ Deployed to production

---

## Files Summary

### New Files (3)
- `backend/src/lib/prisma.ts` - Singleton instance
- `backend/src/utils/query-cache.ts` - Caching utilities
- `backend/src/middleware/query-logger.ts` - Query monitoring

### Modified Files (10-12)
- `backend/src/services/stats.service.ts` - Fix getBranchStats()
- `backend/src/services/member.service.ts` - Fix importMembers()
- `backend/src/services/conversation.service.ts` - Fix broadcast
- `backend/src/services/branch.service.ts` - Optimize queries
- `backend/src/services/message.service.ts` - Batch operations
- `backend/src/services/billing.service.ts` - Optimize stats
- `backend/src/services/group.service.ts` - Eager loading
- `backend/src/services/admin.service.ts` - Query optimization
- `backend/prisma/schema.prisma` - Connection pool config
- 20+ `backend/src/services/*.ts` - Update imports
- 10+ `backend/src/controllers/*.ts` - Update imports

### Migration Files (1)
- `backend/prisma/migrations/2025_add_indexes.sql` - Database indexes

---

## Week 2 vs Week 1 Comparison

| Aspect | Week 1 | Week 2 |
|--------|--------|--------|
| **Type** | Security Features | Performance |
| **Risk Level** | Low | Low-Medium |
| **Duration** | 4 hours | 12-16 hours |
| **Impact** | System hardening | 10-50x faster |
| **Complexity** | Low (new code) | Medium (refactor) |
| **Testing** | Unit tests | Load tests |
| **Deployment** | Immediate | Gradual |

---

## Questions for User

1. ✅ Proceed with Week 2 implementation as planned?
2. ✅ Start with Priority 2.1 (PrismaClient singleton)?
3. ✅ Should I skip any low-impact optimizations?
4. ✅ Any performance targets you'd like to adjust?

---

**READY FOR APPROVAL** ✅

Once you confirm, I will:
1. Break down each priority into detailed todo items
2. Implement Priority 2.1 (PrismaClient singleton)
3. Get your approval before moving to Priority 2.2
4. Continue sequentially until all Week 2 features deployed

---

*Generated: November 27, 2025*
*Koinonia YW Platform - Week 2 Planning*
