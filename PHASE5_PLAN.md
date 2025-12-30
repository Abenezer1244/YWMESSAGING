# PHASE 5: REFACTOR SERVICES TO USE TENANTPRISMA - IMPLEMENTATION PLAN

## Phase 5 Objective

Refactor all services to use `tenantPrisma` (tenant-scoped database client) instead of global `prisma` (registry-only client). This completes the database-per-tenant architecture by enabling services to query the correct tenant database.

**Goal**: When a service is called with tenantId, it should query that tenant's database, not the shared registry.

---

## Current State (Before Phase 5)

### What's Working ✅

**Phase 4 Completed**:
- Database provisioning on signup
- Each church gets isolated database
- Registry knows which tenant uses which database
- Auth middleware injects tenantPrisma for authenticated requests

**6 Services Already Refactored**:
1. conversation.service.ts ✅
2. message.service.ts ✅
3. member.service.ts ✅
4. branch.service.ts ✅
5. template.service.ts ✅
6. recurring.service.ts ✅

These accept `tenantPrisma: PrismaClient` parameter and query tenant database.

### What's Broken ❌

**13 Services Still Using Global Prisma**:
- auth.service.ts (login function - uses global `prisma`)
- admin.service.ts
- mfa.service.ts
- onboarding.service.ts
- gdpr.service.ts
- planning-center.service.ts
- phone-linking-recovery.service.ts
- chat.service.ts
- billing.service.ts
- github-results.service.ts
- invoice.service.ts
- nps.service.ts
- agent-invocation.service.ts

**4 Jobs Still Using Global Prisma**:
- queue.ts (handles 3 message types)
- welcomeMessage.job.ts
- 10dlc-registration.ts
- 10dlc-webhooks.ts

**Result**: 198 TypeScript errors (all Phase 5)

---

## Phase 5 Scope

### Services: 13 to Refactor

| Service | Priority | Models | Exports | Complexity |
|---------|----------|--------|---------|------------|
| **onboarding.service.ts** | HIGH | branch, conversation, message | 5 | Medium |
| **gdpr.service.ts** | HIGH | multiple (all data deletion) | 3+ | Complex |
| **admin.service.ts** | MEDIUM | admin, church | 10+ | Complex |
| **auth.service.ts** | MEDIUM | admin (login only) | 8+ | Complex |
| **mfa.service.ts** | MEDIUM | admin, adminMFA | 3+ | Medium |
| **phone-linking-recovery.service.ts** | MEDIUM | - | - | Medium |
| **planning-center.service.ts** | MEDIUM | member, conversation | - | Medium |
| **welcomeMessage.job.ts** | LOW | member | - | Simple |
| **10dlc-registration.ts** | LOW | church | - | Simple |
| **10dlc-webhooks.ts** | LOW | church | - | Simple |
| **chat.service.ts** | LOW | chatConversation, chatMessage | 3 | Simple |
| **billing.service.ts** | LOW | church (registry) | - | Simple |
| **nps.service.ts** | LOW | nPSSurvey | 3+ | Simple |

### Jobs: 4 to Refactor

| Job | Models | Complexity | Priority |
|-----|--------|-----------|----------|
| **queue.ts** | messageRecipient, conversationMessage, messageQueue | Complex | HIGH |
| **welcomeMessage.job.ts** | member | Simple | MEDIUM |
| **10dlc-registration.ts** | church | Simple | LOW |
| **10dlc-webhooks.ts** | church | Simple | LOW |

### Utilities: 1 to Update

| Utility | Scope | Priority |
|---------|-------|----------|
| **transactions.ts** | Add tenantPrisma parameter | LOW |

---

## Phase 5 Implementation Pattern

### Pattern: Convert Service to Tenant-Scoped

**BEFORE** (Phase 4 state):
```typescript
import { prisma } from '../lib/prisma.js';

export async function getMembers(tenantId: string) {
  // ❌ WRONG: Uses global prisma (registry only)
  // Fails because 'member' doesn't exist on registry schema
  return prisma.member.findMany();
}
```

**AFTER** (Phase 5 goal):
```typescript
import { PrismaClient } from '@prisma/client-tenant';

export async function getMembers(tenantId: string, tenantPrisma: PrismaClient) {
  // ✅ CORRECT: Uses tenant-scoped client
  // Queries tenant's isolated database
  return tenantPrisma.member.findMany();
}
```

### Key Changes for Each Service

1. **Update Imports**:
   - Remove: `import { prisma } from '../lib/prisma.js'`
   - Add: `import { PrismaClient } from '@prisma/client-tenant'` (if not already present)

2. **Update Function Signatures**:
   - Add `tenantPrisma: PrismaClient` parameter to functions using tenant models
   - Keep `tenantId: string` for logging/context
   - Keep `registryPrisma: PrismaClient` for registry operations (if needed)

3. **Replace All Calls**:
   - `prisma.member.findMany()` → `tenantPrisma.member.findMany()`
   - `prisma.message.create()` → `tenantPrisma.message.create()`
   - etc.

4. **Update Callers**:
   - Controllers must pass `req.prisma` (from auth middleware)
   - Controllers must pass `req.tenantId` (from JWT)
   - Services call each other with same parameters

### Special Cases

#### Case 1: Services Using Both Registry + Tenant
Examples: admin.service, auth.service (login), billing.service

```typescript
export async function someFunction(
  tenantId: string,
  registryPrisma: PrismaClient,      // For Church lookups
  tenantPrisma: PrismaClient         // For Member queries
) {
  // Use registryPrisma for Church, Tenant, PhoneNumberRegistry
  const church = await registryPrisma.church.findUnique({ where: { id: tenantId } });

  // Use tenantPrisma for Member, Message, etc.
  const members = await tenantPrisma.member.findMany();
}
```

#### Case 2: Job Processing (No HTTP Request Context)
Examples: welcomeMessage.job, queue.ts

```typescript
// Jobs don't have req context, must fetch tenantPrisma from cache
import { getTenantPrisma } from '../lib/tenant-prisma.js';

export async function processQueueJob(job: Job) {
  const { tenantId } = job.data;
  const tenantPrisma = await getTenantPrisma(tenantId);  // Get from cache

  // Now use tenantPrisma for queries
  const message = await tenantPrisma.message.findUnique({ where: { id } });
}
```

#### Case 3: Registry-Only Services (No Changes Needed)
Examples: billing.service (subscription management), github-results

```typescript
// Leave as-is if only queries registry models
export async function getChurchSubscription(churchId: string) {
  const church = await registryPrisma.church.findUnique({ where: { id: churchId } });
  return church.subscriptionStatus;
}
```

---

## Phase 5 Work Breakdown

### PRIORITY 1: Simple Services (Quick Wins)

#### Task 1.1: welcomeMessage.job.ts (15 min)
- Use getTenantPrisma(tenantId) to get client
- Replace `prisma.member` → `tenantPrisma.member`
- Minimal refactoring

#### Task 1.2: 10dlc-registration.ts (15 min)
- Use getRegistryPrisma() for church lookups
- Already registry-only, minimal changes

#### Task 1.3: 10dlc-webhooks.ts (15 min)
- Use getRegistryPrisma() for church lookups
- Already registry-only, minimal changes

**Subtotal: 45 minutes**

---

### PRIORITY 2: Medium-Complexity Services (1-2 hours each)

#### Task 2.1: onboarding.service.ts (1 hour)
**Models**: branch, conversation, message
**Changes**:
- Add `tenantPrisma: PrismaClient` parameter to all exports
- Replace all `prisma.branch` → `tenantPrisma.branch`
- Replace all `prisma.conversation` → `tenantPrisma.conversation`
- Replace all `prisma.message` → `tenantPrisma.message`
- Update controller to pass tenantPrisma

**Exports to update**: 5 functions
**Error count to fix**: ~8 TypeScript errors

#### Task 2.2: mfa.service.ts (45 min)
**Models**: admin, adminMFA, mFARecoveryCode
**Changes**:
- Add `tenantPrisma: PrismaClient` parameter
- Replace `prisma.adminMFA` → `tenantPrisma.adminMFA`
- Replace `prisma.mFARecoveryCode` → `tenantPrisma.mFARecoveryCode`
- Keep admin operations (might be registry + tenant)

**Exports to update**: 3+ functions
**Error count to fix**: ~15 TypeScript errors

#### Task 2.3: phone-linking-recovery.service.ts (45 min)
**Models**: TBD (based on exploration)
**Changes**: Similar pattern

#### Task 2.4: planning-center.service.ts (1 hour)
**Models**: member, conversation, planningCenterIntegration
**Changes**:
- Add `tenantPrisma: PrismaClient` parameter
- Replace `prisma.member` → `tenantPrisma.member`
- Replace `prisma.conversation` → `tenantPrisma.conversation`
- Replace `prisma.planningCenterIntegration` → `tenantPrisma.planningCenterIntegration`

**Error count to fix**: ~12 TypeScript errors

**Subtotal: 3.5 hours**

---

### PRIORITY 3: Complex Services (2-3 hours each)

#### Task 3.1: admin.service.ts (2 hours)
**Models**: admin, adminMFA, mFARecoveryCode, Church (registry)
**Complexity**: Mixed registry + tenant operations
**Changes**:
- Accept both `registryPrisma` and `tenantPrisma` parameters
- Use registryPrisma for Church lookups
- Use tenantPrisma for Admin/AdminMFA queries
- Update all 10+ exports

**Error count to fix**: ~25 TypeScript errors

#### Task 3.2: auth.service.ts (2 hours)
**Models**: admin (tenant), church (registry), adminEmailIndex (registry)
**Complexity**: Mixed registry + tenant
**Note**: registerChurch() already done, login() needs updates
**Changes**:
- login() function: Add tenantPrisma parameter
- Replace `prisma.admin` → `tenantPrisma.admin` for tenant admin lookup
- Keep registryPrisma for church/email lookups
- Update token generation (already uses registryAdmin.id)

**Error count to fix**: ~4 TypeScript errors (all in login function)

#### Task 3.3: gdpr.service.ts (2.5 hours)
**Models**: Multiple (full data deletion across all models)
**Complexity**: Most complex - cascading deletes
**Changes**:
- Accept `tenantPrisma: PrismaClient` parameter
- Must delete in correct order (foreign key constraints):
  1. ConversationMessage (FK → Conversation)
  2. Conversation (FK → Member)
  3. MessageRecipient (FK → Message/Member)
  4. Message (no FKs to tenant models)
  5. Member
  6. Other models (Branch, etc.)
- Handle cascading deletes properly
- Verify no data leaks between tenants

**Error count to fix**: ~15 TypeScript errors

#### Task 3.4: queue.ts (3 hours)
**Models**: messageRecipient, conversationMessage, messageQueue, message
**Complexity**: Handles 3 background job types
**Changes**:
- Use `getTenantPrisma(tenantId)` for each job
- Three job handlers need updates:
  1. SMS/MMS queue processing
  2. Analytics event processing
  3. Webhook event processing
- Pass tenantPrisma to service calls (telnyxService, etc.)

**Error count to fix**: ~20 TypeScript errors

**Subtotal: 9.5 hours**

---

### PRIORITY 4: Low-Priority Services (No/Minimal Changes)

These can stay registry-only or don't need changes:
- **chat.service.ts** - chatConversation/chatMessage (not critical, simple)
- **billing.service.ts** - Church only (registry)
- **github-results.service.ts** - External API
- **invoice.service.ts** - External API
- **nps.service.ts** - NPSSurvey (registry? TBD)
- **agent-invocation.service.ts** - External API

**These are Phase 5 optional work**

---

### PRIORITY 5: Utilities (30 min)

#### Task 5.1: transactions.ts (30 min)
**Changes**:
- Add optional `tenantPrisma?: PrismaClient` parameter
- Update transaction wrapper to use tenantPrisma if provided
- Maintains backward compatibility with registry-only calls

---

## Phase 5 Timeline Estimate

| Priority | Tasks | Estimated Time |
|----------|-------|-----------------|
| **1 (Simple)** | 3 jobs | 45 min |
| **2 (Medium)** | 4 services | 3.5 hours |
| **3 (Complex)** | 4 services + jobs | 9.5 hours |
| **4 (Optional)** | 6 services | 2 hours (optional) |
| **5 (Utilities)** | transactions.ts | 30 min |
| **Buffer** (Testing, debugging, review) | | 4 hours |
| **TOTAL** | 18 tasks | **17.5 hours + 4 hour buffer = 21.5 hours** |

---

## Success Criteria for Phase 5

### ✅ TypeScript Compilation

After Phase 5:
- All Phase 5 TypeScript errors must be fixed
- Current 198 errors → 0 errors (for Phase 5 code)
- May have Phase 6+ errors (controllers not updated yet)

### ✅ Service Function Signatures

Every service function using tenant models must:
- Accept `tenantPrisma: PrismaClient` parameter
- Accept `tenantId: string` for logging
- Accept `registryPrisma: PrismaClient` if using registry models

### ✅ Database Isolation

Services must:
- Only access tenant-scoped data via tenantPrisma
- Only access registry data via registryPrisma
- Not mix operations incorrectly

### ✅ Error Handling

Services must:
- Handle tenant database errors correctly
- Not leak data between tenants
- Log which tenant experienced errors

### ✅ No Regressions

- All existing functionality must work
- Auth flow must work with new signatures
- Background jobs must work with tenantPrisma

---

## Phase 5 Implementation Order

### Recommended Sequence (by dependency):

```
1. PRIORITY 1 - Simple jobs (45 min)
   ├─ welcomeMessage.job.ts
   ├─ 10dlc-registration.ts
   └─ 10dlc-webhooks.ts

2. PRIORITY 2A - onboarding.service (1 hr)
   └─ Needed by: controllers, possibly other services

3. PRIORITY 2B - mfa.service (45 min)
   └─ Needed by: auth workflows

4. PRIORITY 2C - phone-linking-recovery + planning-center (1.5 hrs)
   └─ Lower dependency

5. PRIORITY 3A - auth.service login() (2 hrs)
   └─ Critical: Blocks user login

6. PRIORITY 3B - admin.service (2 hrs)
   └─ Needed by: most controllers

7. PRIORITY 3C - gdpr.service (2.5 hrs)
   └─ Data integrity critical

8. PRIORITY 3D - queue.ts (3 hrs)
   └─ Background job processing

9. PRIORITY 4 - Optional services (2 hrs)
10. PRIORITY 5 - utilities (30 min)
```

**Total: 17.5 hours focused work**

---

## Important Notes

### Multiple Service Updates Per File

Some files contain multiple services:
- `billing.service.ts` - Multiple functions, some registry-only

### Controller Updates (Phase 6)

Controllers must be updated to pass `tenantPrisma` to services:
- **Phase 6 responsibility** - Not Phase 5
- Currently: `await service.getMembers(tenantId)`
- Will be: `await service.getMembers(tenantId, req.prisma)`

### Testing Strategy

After each service:
1. Verify TypeScript compilation
2. Test the affected endpoint manually
3. Check no data leaks between test tenants

### Rollback Plan

If something breaks:
- Service-level rollback is easy (revert one file)
- No database changes in Phase 5 (only code)
- Can test incrementally

---

## Next Steps

1. ✅ Understand Phase 5 scope (done)
2. ⏳ Execute Phase 5 refactoring (in order above)
3. ⏳ Verify TypeScript compilation after each task
4. ⏳ Test affected services manually
5. ⏳ Move to Phase 6 (controller updates)

---

## Summary

**Phase 5 refactors services to use tenant-scoped databases.**

- **13 services** to update (6 already done, 13 remaining)
- **4 jobs** to update
- **~60+ functions** to modify
- **Estimated effort**: 17.5 hours focused work + 4 hour buffer
- **Risk level**: LOW (patterns proven in Phase 4)
- **Critical for**: Multi-database isolation to actually work

---

## Ready to Proceed?

Phase 5 implementation can start immediately. Recommended approach:

1. ✅ Start with PRIORITY 1 (simple jobs - quick wins)
2. ✅ Then PRIORITY 2 (medium services - sets patterns)
3. ✅ Then PRIORITY 3 (complex services - careful testing)
4. ✅ Optionally PRIORITY 4 (polish)

**Estimated completion**: 2-3 days of focused work

