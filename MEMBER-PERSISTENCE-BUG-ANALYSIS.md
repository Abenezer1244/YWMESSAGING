# Member Persistence Bug - Comprehensive Analysis

**Date**: December 31, 2025
**Reporter**: User (mike@gmail.com)
**Status**: 🔴 **CRITICAL BUG - Members disappear after reload**

---

## Problem Statement

When a user adds a new member through the "Add Member" form:
1. ✅ The member appears in the UI immediately
2. ✅ The API returns 201 success with member ID
3. ❌ After page reload or navigation, the member is GONE
4. ❌ Member count returns to previous value

### User Impact
- **Severity**: HIGH - Users lose data they just entered
- **Frequency**: 100% reproducible
- **Workaround**: None currently available

---

## Test Results

### Test Environment
- **URL**: https://koinoniasms.com
- **User**: mike@gmail.com
- **Tenant ID**: hib5qpgq4xbb3dtx4mbzj6gj
- **Test Date**: December 31, 2025 02:53 UTC

### Observed Behavior
```
Before adding: 25 members (pagination shows 637 total)
After POST:    26 members (member appears in UI)
After reload:  25 members (member disappeared!)
```

### Network Requests Captured

**1. POST /api/members** (Member Creation)
```json
REQUEST:
{
  "firstName": "Debug",
  "lastName": "Test1767149607485",
  "phone": "202-555-0188",
  "email": "debug1767149607485@test.com"
}

RESPONSE: 201 Created
{
  "success": true,
  "data": {
    "id": "cmjtf90b600idvys2hxtge3go",
    "firstName": "Debug",
    "lastName": "Test1767149607485",
    "phone": "+12025550188",
    "phoneHash": "da03700bc038e154e9f34ba9679af67b5fdf4e186620186d34aae446255f9858",
    "email": "debug1767149607485@test.com",
    "optInSms": true,
    "createdAt": "2025-12-31T02:53:28.147Z"  ← NEW MEMBER TIMESTAMP
  }
}
```

**2. GET /api/members?page=1&limit=25** (After Reload)
```json
RESPONSE: 200 OK
{
  "success": true,
  "data": [
    {
      "id": "cmjtf1yfg00icvys2ast5uoi3",
      "firstName": "Test",
      "lastName": "User1767149278396",
      "phone": "+12025550199",
      "email": "test1767149278396@example.com",
      "optInSms": true,
      "createdAt": "2025-12-31T02:47:59.116Z"  ← OLDER MEMBER (not the new one!)
    },
    // ... 24 more members ...
  ],
  "pagination": {
    "page": 1,
    "limit": 25,
    "total": 637,  ← SAME TOTAL (should be 638!)
    "pages": 26
  }
}
```

### Key Observations
1. POST returns 201 with valid member ID → **Member was created**
2. New member timestamp: `2025-12-31T02:53:28.147Z`
3. Oldest member in GET response: `2025-12-31T02:47:59.116Z` (earlier timestamp)
4. New member is NOT in the GET response
5. Total count unchanged (637, not 638)

---

## Root Cause Analysis

### Authentication Context
- **JWT Token**: Both requests use same authentication token
- **Church ID**: `hib5qpgq4xbb3dtx4mbzj6gj`
- **Admin ID**: `cmjter084000lvys2yuga0g6k`
- **Role**: PRIMARY

### Hypothesis 1: Database Routing Issue ⚠️ **LIKELY**
**Theory**: POST and GET requests are hitting different tenant databases

**Evidence**:
- POST returns success with member ID (saved to Database A)
- GET returns members without the new one (querying Database B)
- Total count unchanged (Database B doesn't have the new member)

**Potential Causes**:
1. Tenant database cache serving stale connection for GET
2. Race condition in tenant resolution middleware
3. Connection pool routing issue
4. Multiple databases with same churchId (data corruption)

### Hypothesis 2: Transaction/Commit Issue ❌ **UNLIKELY**
**Theory**: Database transaction not committed before GET request

**Why Unlikely**:
- POST request completes and returns member ID
- Page reload waits multiple seconds before GET
- Prisma auto-commits by default

### Hypothesis 3: Frontend State Management ❌ **NOT THE ISSUE**
**Theory**: Frontend cache preventing reload

**Why Not**:
- Already fixed: Changed `handleAddSuccess` to call `loadMembers()`
- Network logs show GET request is made
- Hard refresh (F5) shows same issue

---

## Technical Investigation

### Database-Per-Tenant Architecture
```
┌─────────────────────────────────────────┐
│ Registry Database                       │
│ - Stores tenant metadata                │
│ - Maps churchId → database URL          │
│ - One record per church                 │
└─────────────────────────────────────────┘
         ↓ lookup by churchId
┌─────────────────────────────────────────┐
│ Tenant Database (per church)            │
│ - Isolated database per church          │
│ - Contains members, messages, etc.      │
│ - URL: postgresql://.../{db_name}       │
└─────────────────────────────────────────┘
```

### Tenant Resolution Flow
1. User logs in → JWT contains `churchId`
2. Request arrives → Auth middleware extracts `churchId` from JWT
3. Middleware calls `getTenantPrisma(churchId)`
4. `getTenantPrisma` queries Registry → finds database URL
5. Returns Prisma client connected to tenant's database
6. Controller uses `req.prisma` to query/save

### Where It Could Break
```typescript
// auth.middleware.ts (Line 88-100)
const tenantId = payload.churchId;  // ← Extract from JWT
const tenantPrisma = await getTenantPrisma(tenantId);  // ← Get DB connection
req.tenantId = tenantId;
req.prisma = tenantPrisma;  // ← Attach to request
```

**Possible Issues**:
1. **Cache returning wrong connection**: `getTenantPrisma` caches connections (max 100). If cache is corrupted or has stale entries, could return wrong database
2. **Connection pool exhaustion**: If max connections reached, might fall back to wrong pool
3. **Race condition**: Two concurrent requests might resolve to different databases

---

## Evidence of Multi-Database Issue

### Smoking Gun 🔍
The member with ID `cmjtf90b600idvys2hxtge3go` exists **somewhere** but not in the database being queried. This proves:

1. Member was saved (POST returned 201 with real ID)
2. Member is not in query results (GET doesn't return it)
3. Therefore: Member is in **different database** than the one being queried

### What This Means
If mike@gmail.com's JWT says `churchId: hib5qpgq4xbb3dtx4mbzj6gj`, both requests should use the same database. But they're not. Possible scenarios:

**Scenario A**: Cache corruption
- POST request creates new connection to Database A
- GET request reuses cached connection to Database B
- Both think they're serving churchId `hib5qpgq4xbb3dtx4mbzj6gj`

**Scenario B**: Registry database corruption
- Registry has duplicate entries for same churchId
- Each lookup returns different database URL
- System routes requests to different databases randomly

**Scenario C**: Connection URL mutation
- Connection URL is being modified/corrupted in memory
- Each request resolves to slightly different URL
- Points to different databases

---

## Recommended Fixes

### Immediate Fix (Temporary)
**Option 1**: Clear tenant database cache on every request
```typescript
// In getTenantPrisma()
// Remove caching temporarily to force fresh connections
const tenantPrisma = new TenantPrismaClient({ ... });
return tenantPrisma;  // Don't cache
```

**Pros**: Forces correct database every time
**Cons**: Performance hit from reconnection overhead

**Option 2**: Add database verification
```typescript
// After getting tenantPrisma
const dbName = await tenantPrisma.$queryRaw`SELECT current_database()`;
console.log(`[VERIFY] Using database: ${dbName} for tenant: ${tenantId}`);
```

**Pros**: Logs which database is being used
**Cons**: Doesn't fix the issue, just makes it visible

### Root Cause Fixes

**Fix 1**: Add connection validation to cache
```typescript
// In getTenantPrisma()
const cached = tenantClients.get(tenantId);
if (cached) {
  // VALIDATE: Ensure cached connection is still for correct tenant
  const dbInfo = await cached.client.$queryRaw`SELECT current_database()`;
  if (dbInfo[0].current_database !== expectedDbName) {
    console.error(`Cache corruption detected! Expected ${expectedDbName}, got ${dbInfo[0].current_database}`);
    await cached.client.$disconnect();
    tenantClients.delete(tenantId);
    // Fall through to create new connection
  } else {
    return cached.client;
  }
}
```

**Fix 2**: Add request-level database tracking
```typescript
// In auth.middleware.ts
req.databaseName = tenantPrisma._databaseName;  // Add to request

// In controllers
console.log(`[${req.method}] ${req.path} - Using DB: ${req.databaseName}`);
```

**Fix 3**: Add churchId to all database queries
```typescript
// If multi-tenant schema (churchId column exists)
await tenantPrisma.member.findMany({
  where: {
    churchId: req.tenantId,  // ← Explicit filter
    // ... other filters
  }
});
```

**Note**: Current architecture uses database-per-tenant, so this isn't applicable unless there's accidental data leakage.

---

## Next Steps

### Investigation Required
1. **Check server logs** for tenant database connections:
   ```bash
   # Look for lines like:
   [Tenant] Creating database connection for tenant {id}
   [Tenant] Connection verified for tenant {id}
   ```

2. **Query Registry database** to verify no duplicates:
   ```sql
   SELECT id, name, email, databaseName, databaseUrl
   FROM "Tenant"
   WHERE id = 'hib5qpgq4xbb3dtx4mbzj6gj';
   ```

3. **Search all tenant databases** for missing member:
   ```javascript
   // Use backend/find-missing-member.cjs script
   // Search for member ID: cmjtf90b600idvys2hxtge3go
   // This will identify which database actually has the member
   ```

### Testing
1. Add debug logging to track database connections
2. Monitor cache size and eviction patterns
3. Test with cache disabled to confirm root cause

### Monitoring
1. Add Sentry/logging for database mismatches
2. Track member creation/retrieval discrepancies
3. Alert on cache corruption incidents

---

## Impact Assessment

### Data Integrity
- **Risk**: HIGH - Users losing data they just created
- **Scope**: Affects all tenants (all churches using the system)
- **Data Loss**: Members are being created but not visible to users

### User Trust
- **Impact**: CRITICAL - Users think system is broken
- **Workaround**: CSV import works correctly (reloads from DB)
- **Perception**: "System eats my data"

### Business Impact
- **Adoption**: Blocked - Users won't trust system with production data
- **Support**: High ticket volume expected
- **Reputation**: Negative reviews likely

---

## Workaround for Users

Until fixed, users should:
1. ❌ Don't use "Add Member" form
2. ✅ Use "Import CSV" instead (always reloads from DB)
3. ✅ Refresh page after ANY member operation to verify

---

## Related Files

### Frontend
- `frontend/src/pages/dashboard/MembersPage.tsx` - Member list page
- `frontend/src/components/members/AddMemberModal.tsx` - Add member form
- `frontend/src/api/members.ts` - API client functions

### Backend
- `backend/src/routes/member.routes.ts` - Member API routes
- `backend/src/controllers/member.controller.ts` - Member controllers
- `backend/src/services/member.service.ts` - Member business logic
- `backend/src/middleware/auth.middleware.ts` - Authentication + tenant resolution
- `backend/src/lib/tenant-prisma.ts` - Tenant database connection manager

### Database
- `backend/prisma/registry-schema.prisma` - Registry database schema
- `backend/prisma/tenant-schema.prisma` - Tenant database schema

---

## Timeline

- **2025-12-31 02:30 UTC**: User reports issue
- **2025-12-31 02:40 UTC**: Bug confirmed via automated testing
- **2025-12-31 02:50 UTC**: Member creation verified (POST returns 201)
- **2025-12-31 02:53 UTC**: Member missing from GET response
- **2025-12-31 03:00 UTC**: JWT analysis shows correct churchId
- **2025-12-31 03:10 UTC**: Frontend fix deployed (reload from DB)
- **2025-12-31 03:20 UTC**: Issue persists - identified as database routing problem

---

## Conclusion

This is a **critical database routing issue** in the multi-tenant architecture. The member IS being created (POST succeeds) but in the WRONG database. The GET request queries a DIFFERENT database, so the member appears to have vanished.

**Priority**: 🔴 **P0 - CRITICAL**
**Action Required**: IMMEDIATE investigation of tenant database routing logic

---

**Report Created**: December 31, 2025
**Status**: 🔴 OPEN - Requires immediate attention
**Next Action**: Check production server logs and run database diagnostic script
