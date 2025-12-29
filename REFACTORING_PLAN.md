# Multi-Tenant Architecture Refactoring Plan

**Status:** Ready for Execution
**Objective:** Complete systematic refactoring of remaining services and controllers to support database-per-tenant architecture
**Scope:** 11 services + 15 controllers
**Approach:** Systematic refactoring by dependency order (critical path first, then supporting services)

---

## Current Status Summary

### Already Refactored (9/20 services complete)
- ✅ branch.service.ts
- ✅ member.service.ts
- ✅ message.service.ts
- ✅ template.service.ts
- ✅ recurring.service.ts
- ✅ conversation.service.ts
- ✅ admin.service.ts (partially - has 7 churchId references remaining)
- ✅ billing.service.ts (partially - has 2 churchId references remaining)
- ✅ stripe.service.ts

### Controllers Refactored (3/18 complete)
- ✅ member.controller.ts
- ✅ branch.controller.ts
- ✅ conversation.controller.ts (partially)

### Still Require Full Refactoring (11 services)
1. **auth.service.ts** (7 churchId refs) - CRITICAL
2. **admin.service.ts** (finish 7 refs) - CRITICAL
3. **billing.service.ts** (finish 2 refs) - CRITICAL
4. stats.service.ts (19 refs)
5. gdpr.service.ts (46 refs)
6. invoice.service.ts (13 refs)
7. nps.service.ts (16 refs)
8. onboarding.service.ts (16 refs)
9. planning-center.service.ts (26 refs)
10. telnyx-mms.service.ts (19 refs)
11. telnyx.service.ts (28 refs)

### Controllers Requiring Refactoring (15 controllers)
**Critical Path (for build passing + basic E2E):**
- auth.controller.ts - registration/login flow
- admin.controller.ts - admin management
- billing.controller.ts - subscription management
- conversation.controller.ts - complete refactoring

**Secondary (other features):**
- analytics.controller.ts
- gdpr.controller.ts
- mfa.controller.ts
- nps.controller.ts
- numbers.controller.ts
- planning-center.controller.ts
- recurring.controller.ts
- scheduler.controller.ts
- template.controller.ts
- message.controller.ts
- chat.controller.ts

---

## Refactoring Pattern

All services follow the same pattern.

**OLD PATTERN (using global prisma + churchId):**
```typescript
import { prisma } from '../lib/prisma.js';

export async function getMembers(churchId: string, options) {
  const members = await prisma.member.findMany({
    where: { churchId }
  });
}
```

**NEW PATTERN (using tenantPrisma + tenantId):**
```typescript
import { PrismaClient } from '@prisma/client';

export async function getMembers(
  tenantId: string,
  tenantPrisma: PrismaClient,
  options
) {
  const members = await tenantPrisma.member.findMany();
  // No churchId/tenantId filtering needed - isolation at database level
}
```

**Controller changes:**
- Replace `req.user?.churchId` or `req.body.churchId` with `req.tenantId`
- Pass `req.prisma` (tenant-specific client) to service calls
- Remove authorization checks that filter by churchId (not needed - database isolation)

---

## Execution Plan

### Phase A: Critical Path (HIGH PRIORITY)
These are required to get the build passing and enable core E2E testing.

#### Task A1: Refactor auth.service.ts
**Files affected:** src/services/auth.service.ts
**Scope:** Remove 7 churchId references, add tenantId + tenantPrisma parameters
**Approach:**
- Replace function signatures: `(email, password)` → `(tenantId, tenantPrisma, email, password)`
- Remove all `where: { churchId }` filters from queries
- Use `tenantPrisma` instead of global `prisma`
- Update registry database interactions (keep using registryPrisma for Tenant/AdminEmailIndex)

**Functions to refactor:**
- `registerChurch()` - creates admin + tenant database
- `loginAdmin()` - finds admin in tenant database
- `validateToken()` - validates JWT
- `refreshToken()` - refreshes JWT
- `inviteCoAdmin()` - invites new admin
- `acceptInvitation()` - accepts invitation
- `resetPassword()` - resets password

#### Task A2: Refactor auth.controller.ts
**Files affected:** src/controllers/auth.controller.ts
**Scope:** Update all endpoints to use new auth.service signatures
**Approach:**
- Replace `req.user?.churchId` with `req.tenantId`
- Pass `req.prisma` to service calls
- No other changes needed

**Endpoints to update:**
- POST /register (new registration)
- POST /login
- POST /logout
- GET /profile
- POST /invite-coAdmin
- POST /accept-invitation
- POST /reset-password

#### Task A3: Complete admin.service.ts refactoring
**Files affected:** src/services/admin.service.ts
**Scope:** Remove remaining 7 churchId references
**Functions to refactor:**
- `getCoAdmins()` - list admins for tenant
- `updateCoAdmin()` - update admin profile
- `removeCoAdmin()` - remove admin
- `getAdminStats()` - admin activity stats
- `getAdminWithChurch()` - get admin with church data

#### Task A4: Refactor admin.controller.ts
**Files affected:** src/controllers/admin.controller.ts
**Scope:** Update all endpoints to use new service signatures

#### Task A5: Complete billing.service.ts refactoring
**Files affected:** src/services/billing.service.ts
**Scope:** Remove remaining 2 churchId references
**Functions to refactor:**
- Subscription queries (find by churchId)

#### Task A6: Refactor billing.controller.ts
**Files affected:** src/controllers/billing.controller.ts
**Scope:** Update payment/subscription endpoints

#### Task A7: Complete conversation.controller.ts refactoring
**Files affected:** src/controllers/conversation.controller.ts
**Scope:** Update remaining functions for multi-tenant context

---

### Phase B: Secondary Services (MEDIUM PRIORITY)
Complete refactoring of remaining services for full feature completeness.

#### Task B1: Refactor stats.service.ts (19 churchId refs)
#### Task B2: Refactor analytics.controller.ts
#### Task B3: Refactor message.controller.ts
#### Task B4: Refactor template.controller.ts
#### Task B5: Refactor recurring.controller.ts

---

### Phase C: Tertiary Services (LOWER PRIORITY)
Can be done after MVP testing or in parallel.

#### Task C1: Refactor gdpr.service.ts (46 churchId refs)
#### Task C2: Refactor gdpr.controller.ts
#### Task C3: Refactor invoice.service.ts (13 refs)
#### Task C4: Refactor nps.service.ts (16 refs)
#### Task C5: Refactor nps.controller.ts
#### Task C6: Refactor onboarding.service.ts (16 refs)
#### Task C7: Refactor planning-center.service.ts (26 refs)
#### Task C8: Refactor telnyx-mms.service.ts (19 refs)
#### Task C9: Refactor telnyx.service.ts (28 refs)
#### Task C10: Refactor other controllers (mfa, numbers, scheduler, chat)

---

## Order of Execution

1. **Phase A (Critical - MUST COMPLETE FIRST)**
   - A1 auth.service.ts
   - A2 auth.controller.ts
   - A3 admin.service.ts (finish)
   - A4 admin.controller.ts
   - A5 billing.service.ts (finish)
   - A6 billing.controller.ts
   - A7 conversation.controller.ts (finish)
   - **Then: Test build passes with no errors**

2. **Phase B (Secondary - needed for full features)**
   - B1-B5: Remaining high-usage services
   - **Then: Test build passes + basic E2E tests**

3. **Phase C (Tertiary - lower priority)**
   - C1-C10: Remaining services
   - **Then: Full test suite + prepare for production**

---

## Success Criteria

- [ ] npm run build completes with 0 TypeScript errors
- [ ] No temporary code or stubs (all services fully implemented)
- [ ] No churchId references in tenant schema queries
- [ ] All services use tenantPrisma for tenant-isolated database access
- [ ] All controllers use req.tenantId and req.prisma
- [ ] Basic E2E tests pass (registration → login → create member → send message)
- [ ] No cross-tenant data leakage possible

---

## Key Principles

1. **Simplicity First**: Each change impacts only the service/controller being modified
2. **Pattern Consistency**: All refactored code follows the same tenantId + tenantPrisma pattern
3. **No Shortcuts**: No stubs, mocks, or temporary workarounds
4. **Root Cause Fixes**: Fix the actual issue (tenant isolation), not symptoms
5. **Systematic**: Work through by dependency order to maintain code integrity
6. **Test After Each Phase**: Verify build passes before moving to next phase

---

## Estimated Effort

- **Phase A (Critical):** 2-3 hours (7 services/controllers)
- **Phase B (Secondary):** 2-3 hours (5 services/controllers)
- **Phase C (Tertiary):** 2-3 hours (remaining services/controllers)
- **Total:** 6-9 hours of focused, systematic refactoring

---

## Notes

- Registry database interactions (Tenant, AdminEmailIndex, PhoneNumberRegistry) stay the same
- No schema changes needed - churchId already removed from schema
- No controller route changes needed - only parameter passing
- All functions should be production-ready with no stubs or TODOs
