# PHASE 4: DATABASE PROVISIONING ON SIGNUP - IMPLEMENTATION PLAN

## Phase 4 Objective

Integrate database provisioning into the signup flow so that each new church gets their own isolated PostgreSQL database with the complete tenant schema.

**Goal**: When a user signs up → New database created + populated with schema + Registered in registry.

---

## Current State (Before Phase 4)

### What Exists ✅

**Database Provisioning Service**
- File: `backend/src/services/database-provisioning.service.ts`
- Functions ready:
  - `provisionTenantDatabase(tenantId)` - Creates new PostgreSQL database
  - `runTenantMigrations(tenantDatabaseUrl)` - Runs migrations (partial implementation)
  - `tenantDatabaseExists(tenantId)` - Checks if database exists
  - `deleteTenantDatabase(tenantId)` - Deletes database

**Multi-Tenant Infrastructure**
- `tenant-prisma.ts` - Client manager (getTenantPrisma, cache, lifecycle)
- `auth.middleware.ts` - Already passes tenantPrisma to all requests
- `registry-schema.prisma` - Tenant registry model defined
- `AdminEmailIndex` model - For fast email → tenant lookup

**Current Signup Flow**
- `auth.controller.ts` POST `/api/auth/register`
- `auth.service.ts` registerChurch() function
- Creates: Church record + Admin record (in MAIN database only)
- Returns: JWT tokens with churchId/tenantId

### What's Missing ❌

1. **Database Creation on Signup** - `provisionTenantDatabase()` not called
2. **Tenant Registry Record** - `registryPrisma.tenant.create()` not called
3. **AdminEmailIndex Entry** - Fast email lookup not created
4. **Schema Migrations** - `runTenantMigrations()` needs proper implementation
5. **Error Handling** - No rollback if provisioning fails
6. **Connection Security** - Database URLs not encrypted in registry

---

## Phase 4 Implementation Tasks

### Task 1: Prepare Database Provisioning Service (Incomplete)

**File**: `backend/src/services/database-provisioning.service.ts`

**Current Issues**:
- `runTenantMigrations()` has TODO comment - needs implementation
- Currently just tries to connect, doesn't actually migrate schema
- Needs to populate tenant database with schema from `tenant-schema.prisma`

**What to Fix**:
```typescript
// CURRENT (incomplete):
export async function runTenantMigrations(tenantDatabaseUrl: string): Promise<void> {
  // TODO: Implement proper migration strategy
  const testPrisma = new PrismaClient({ datasources: { db: { url: tenantDatabaseUrl } } });
  await testPrisma.$queryRaw`SELECT 1`;
  await testPrisma.$disconnect();
}

// NEEDED: Execute actual migrations
// Option A: Run 'prisma migrate deploy' on tenant database
// Option B: Execute SQL script that creates all tables
// Option C: Use Prisma's raw SQL execution
```

**Implementation Approach**:
- Create Prisma client for tenant database (use tenant-schema.prisma)
- Execute SQL that initializes all 24 tenant tables
- Could use: `prisma db push --schema=prisma/tenant-schema.prisma` with dynamic DATABASE_URL

---

### Task 2: Update Auth Service Signup Flow

**File**: `backend/src/services/auth.service.ts` - `registerChurch()` function (Lines 56-144)

**Current Flow**:
```typescript
1. Generate tenantId = createId()
2. Create Church record in main DB
3. Create Admin record in main DB
4. Return tokens + data
```

**New Flow**:
```typescript
1. Generate tenantId = createId()
2. Validate email not exists (already done)
3. Provision tenant database ← NEW
4. Run schema migrations on tenant DB ← NEW
5. Create Church record in main DB
6. Create Tenant registry record in main DB ← NEW
7. Create Admin record in MAIN DB (registry)
8. Create AdminEmailIndex entry in main DB ← NEW
9. Return tokens + data
```

**New Code to Add**:
```typescript
export async function registerChurch(data: RegisterChurchInput): Promise<{...}> {
  const tenantId = createId();

  // Step 1: Provision database
  let tenantDatabaseUrl: string;
  try {
    tenantDatabaseUrl = await provisionTenantDatabase(tenantId);
    console.log(`[Auth] Provisioned database for tenant ${tenantId}`);
  } catch (error) {
    throw new Error(`Failed to provision tenant database: ${error.message}`);
  }

  // Step 2: Run migrations on new database
  try {
    await runTenantMigrations(tenantDatabaseUrl);
    console.log(`[Auth] Completed migrations for tenant ${tenantId}`);
  } catch (error) {
    // ROLLBACK: Delete database if migrations fail
    await deleteTenantDatabase(tenantId).catch(() => {});
    throw new Error(`Failed to initialize tenant database: ${error.message}`);
  }

  // Step 3: Extract connection info from databaseUrl
  const dbUrlObj = new URL(tenantDatabaseUrl);
  const databaseHost = dbUrlObj.hostname;
  const databasePort = parseInt(dbUrlObj.port || '5432');
  const databaseName = dbUrlObj.pathname.slice(1);

  // Step 4: Create Church record (existing code)
  const church = await registryPrisma.church.create({
    data: {
      id: tenantId,
      name: data.churchName,
      email: data.email,
      subscriptionStatus: 'trial',
      trialEndsAt: addDays(new Date(), 14),
    }
  });

  // Step 5: Create Tenant registry record ← NEW
  const tenant = await registryPrisma.tenant.create({
    data: {
      id: tenantId,
      churchId: tenantId,
      name: data.churchName,
      email: data.email,
      databaseUrl: tenantDatabaseUrl,
      databaseHost,
      databasePort,
      databaseName,
      status: 'active',
      subscriptionStatus: 'trial',
      subscriptionPlan: 'starter',
    }
  });

  // Step 6: Create Admin in registry DB (existing code)
  const admin = await registryPrisma.admin.create({...});

  // Step 7: Create AdminEmailIndex ← NEW
  const emailHash = hashEmail(data.email);
  await registryPrisma.adminEmailIndex.create({
    data: {
      emailHash,
      email: data.email,
      tenantId,
      adminId: admin.id,
    }
  });

  // Return tokens + data
  return {...}
}
```

---

### Task 3: Update Auth Middleware for Multi-Database Routing

**File**: `backend/src/middleware/auth.middleware.ts`

**Current**: Already calls `getTenantPrisma(tenantId)` which looks up database URL from registry

**Check**: Verify that the middleware properly:
1. Retrieves tenantId from JWT
2. Calls `getTenantPrisma(tenantId)`
3. Passes tenantPrisma to all routes
4. Falls back to registryPrisma for auth operations

**No changes needed** - infrastructure already in place

---

### Task 4: Implement Schema Migrations for Tenant Database

**File**: `backend/src/services/database-provisioning.service.ts` - `runTenantMigrations()`

**Problem**: How to run `tenant-schema.prisma` migrations on a dynamically created database?

**Solution Options**:

**Option A: Use Prisma DB Push** (Recommended for MVP)
```typescript
export async function runTenantMigrations(tenantDatabaseUrl: string): Promise<void> {
  // Create temporary Prisma client for tenant database
  const tenantPrisma = new PrismaClient({
    datasources: { db: { url: tenantDatabaseUrl } },
  });

  try {
    // Push schema from tenant-schema.prisma to database
    // Note: This requires prisma db push which isn't exposed via API
    // Alternative: Use child_process to run prisma db push

    const { execSync } = require('child_process');
    const env = {
      ...process.env,
      TENANT_DATABASE_URL: tenantDatabaseUrl
    };

    execSync('npx prisma db push --schema=prisma/tenant-schema.prisma --skip-generate', {
      env,
      stdio: 'inherit'
    });

    console.log(`[Migrations] Completed for ${tenantDatabaseUrl}`);
  } finally {
    await tenantPrisma.$disconnect();
  }
}
```

**Option B: Use SQL Script** (More control)
- Create `backend/prisma/tenant-init.sql` - SQL DDL to create all tables
- Execute SQL file on new database
- More control, easier to version, doesn't depend on Prisma CLI

**Option C: Use Prisma Generative SQL** (Most reliable)
- Create Prisma migration: `npx prisma migrate dev --create-only --name init_tenant_schema`
- Use migration engine to apply to dynamic database

**Recommendation**: Use Option A (db push) for simplicity in Phase 4

---

### Task 5: Error Handling & Rollback

**File**: `backend/src/services/auth.service.ts` - Wrap in transaction-like error handling

**Error Scenarios**:
1. **Database creation fails** → Don't create Church/Admin
2. **Migrations fail** → Delete database + don't create Church/Admin
3. **Registry record creation fails** → Delete database + don't create anything
4. **Database URL encryption fails** → Don't store unencrypted URL

**Implementation**:
```typescript
export async function registerChurch(data: RegisterChurchInput): Promise<{...}> {
  const tenantId = createId();

  try {
    // Step 1: Provision database
    const tenantDatabaseUrl = await provisionTenantDatabase(tenantId);

    try {
      // Step 2: Run migrations
      await runTenantMigrations(tenantDatabaseUrl);
    } catch (error) {
      // Rollback: Delete database on migration failure
      await deleteTenantDatabase(tenantId).catch((err) => {
        console.error(`[Auth] Failed to rollback database ${tenantId}: ${err.message}`);
      });
      throw error;
    }

    // Steps 3-7: Create all records
    // If any of these fail, the database exists but no records point to it
    // This is okay - database will be cleaned up by background job later

  } catch (error) {
    // Re-throw with clear error message
    throw new Error(`Church registration failed: ${error.message}`);
  }
}
```

**Background Cleanup Job** (for orphaned databases):
- Find databases with no corresponding Tenant record in registry
- Schedule for deletion after 7 days
- Implement in Phase 9+

---

### Task 6: Create Initial Admin Record in Tenant Database

**Important**: Each tenant database needs its own Admin record!

Currently: Admin created in MAIN database only

New requirement:
- Create Admin record in REGISTRY database (for login)
- Also create Admin record in TENANT database (for message sending, conversation management)

**Implementation**:
```typescript
// After tenant database is ready
const tenantPrisma = await getTenantPrisma(tenantId);

await tenantPrisma.admin.create({
  data: {
    email: data.email,
    encryptedEmail: encryptEmail(data.email),
    emailHash: hashEmail(data.email),
    passwordHash: await bcrypt.hash(data.password, 10),
    firstName: data.firstName,
    lastName: data.lastName,
    role: 'PRIMARY',
    welcomeCompleted: false,
  }
});
```

---

## Phase 4 Implementation Tasks Breakdown

### Task A: Implement runTenantMigrations() Properly
- **File**: `backend/src/services/database-provisioning.service.ts`
- **Time**: 30 minutes
- **Complexity**: Medium (executing external Prisma command)
- **Test**: Manually create database, run function, verify schema exists

### Task B: Update registerChurch() Signup Flow
- **File**: `backend/src/services/auth.service.ts`
- **Time**: 1 hour
- **Complexity**: Medium (new database operations, error handling)
- **Changes**: ~60 lines added to existing function
- **Test**: Sign up new church, verify database created in PostgreSQL

### Task C: Create Tenant Registry Record
- **File**: `backend/src/services/auth.service.ts`
- **Time**: 20 minutes
- **Complexity**: Low (Prisma create call)
- **Test**: Sign up, verify Tenant record exists in registry

### Task D: Populate AdminEmailIndex
- **File**: `backend/src/services/auth.service.ts`
- **Time**: 20 minutes
- **Complexity**: Low (email hash + Prisma create)
- **Test**: Sign up, query registry for email, verify tenantId returned

### Task E: Create Admin in Tenant Database
- **File**: `backend/src/services/auth.service.ts`
- **Time**: 20 minutes
- **Complexity**: Low (use tenantPrisma to create)
- **Test**: Sign up, connect to tenant DB, verify Admin exists

### Task F: Add Error Handling & Rollback
- **File**: `backend/src/services/auth.service.ts`
- **Time**: 30 minutes
- **Complexity**: Medium (transaction-like logic)
- **Test**: Simulate failures, verify databases deleted on rollback

### Task G: Update .env Configuration
- **File**: `backend/.env.example`, `backend/.env`
- **Time**: 15 minutes
- **Complexity**: Low (documentation)
- **Changes**: Already done in Phase 3 ✅

---

## Phase 4 Success Criteria

After Phase 4 is complete, the following must be true:

✅ New church signup creates:
1. Church record in registry database
2. **New PostgreSQL database** `tenant_{tenantId}`
3. Schema initialized in new database (all 24 tables created)
4. Tenant registry record pointing to new database
5. AdminEmailIndex entry for fast email lookup
6. Admin record in registry database
7. Admin record in tenant database
8. JWT tokens issued

✅ Auth workflow must work:
1. User logs in with email
2. AdminEmailIndex lookup finds tenant
3. Tenant database URL retrieved from registry
4. getTenantPrisma() connects to tenant database
5. Auth middleware injects tenantPrisma into requests
6. All operations use tenant-scoped database

✅ Error handling must work:
1. Database creation failure → No Church/Admin created
2. Migration failure → Database deleted, no records created
3. Registry creation failure → Database exists but orphaned (cleanup later)

✅ Multi-database isolation verified:
1. Church A data only in Church A database
2. Church B data only in Church B database
3. No churchId filtering needed (database isolation instead)

---

## Estimated Timeline

| Task | Duration | Dependency |
|------|----------|-----------|
| A: Implement runTenantMigrations() | 30 min | None |
| B: Update registerChurch() | 1 hour | Task A |
| C: Create Tenant registry record | 20 min | Task B |
| D: Populate AdminEmailIndex | 20 min | Task C |
| E: Create Admin in tenant DB | 20 min | Task D |
| F: Add error handling | 30 min | Task E |
| G: Update .env docs | 15 min | Task F |
| **Total** | **3.5 hours** | |
| **Buffer** (testing, debugging) | **1.5 hours** | |
| **Grand Total** | **5 hours** | |

---

## Files to Modify

| File | Task | Scope |
|------|------|-------|
| `backend/src/services/database-provisioning.service.ts` | A | ~30 lines (implement migration function) |
| `backend/src/services/auth.service.ts` | B-F | ~120 lines (new provisioning logic + error handling) |
| `backend/.env.example` | G | Already done ✅ |

---

## Phase 5 Dependency Warning

**Phase 5** requires that all services use `tenantPrisma` instead of global `prisma`.

Phase 4 does NOT require Phase 5 work, but it ENABLES Phase 5.

After Phase 4 completes:
- Each church has isolated database ✅
- Services can query tenant database ✅
- But services STILL use global `prisma` (Phase 5 fix) ❌

---

## Next Steps After Phase 4

1. **Phase 5**: Refactor 15+ services to use `tenantPrisma`
2. **Phase 6**: Refactor controllers to pass `tenantPrisma` to services
3. **Phase 7**: Implement phone number routing to correct tenant database
4. **Phase 8**: Create physical databases on Render (not localhost)
5. **Phase 9**: Enforce subscription plan limits per tenant
6. **Phase 10**: Add pagination

---

## Summary

Phase 4 integrates database provisioning into the signup flow.

**Before**: Sign up → Church created in shared database
**After**: Sign up → Church created + New database created + Schema initialized + Registry updated

The infrastructure is 95% ready. Phase 4 is primarily about **wiring together** existing components with error handling.

---

## Proceed with Phase 4 Implementation?

Would you like me to:
1. ✅ Execute Phase 4 as planned above
2. ⚠️ Modify the plan based on your feedback
3. ❌ Hold and review specific sections first

**Recommendation**: Proceed with implementation.

