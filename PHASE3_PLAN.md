# PHASE 3: Database-Per-Tenant Architecture - Implementation Plan

## Current State Analysis

### Current Architecture (Single Database)
```
Shared PostgreSQL Database (one for all churches)
├── Church (1 per church)
├── Admin (N per church)
├── Member (N per church)
├── Branch (N per church)
├── Message (N per church)  ← has churchId
├── Conversation (N per church)  ← has churchId
├── ConversationMessage (N per church)
├── MessageQueue (N per church)  ← has churchId
├── MessageTemplate (N per church)  ← has churchId
├── RecurringMessage (N per church)  ← has churchId
├── MessageRecipient (N per church)
├── Subscription (N per church)  ← has churchId
├── DeadLetterQueue (N per church)  ← has churchId
├── ConsentLog (N per church)  ← has churchId
└── ... (20+ more models with churchId)

REGISTRY Database (same as above)
├── Tenant (1 per church)
├── PhoneNumberRegistry (1 per church)
└── AdminEmailIndex (N per admin)
```

## New Architecture (Database-Per-Tenant)

```
REGISTRY Database (MAIN_DATABASE_URL)
├── Church (1 per church)
├── Tenant (1 per church)
├── PhoneNumberRegistry (1 per church)
└── AdminEmailIndex (N per admin)

Church A Database (ISOLATED)
├── Admin
├── Member
├── Branch
├── Message (NO churchId)
├── Conversation (NO churchId)
├── ConversationMessage
├── MessageQueue (NO churchId)
├── ... (all without churchId)

Church B Database (ISOLATED)
├── Admin
├── Member
├── Branch
├── Message (NO churchId)
├── ...

Church N Database (ISOLATED)
├── ...
```

---

## PHASE 3 Tasks: Create Tenant Schema

### Task 3.1: Create tenant-schema.prisma
**File**: `backend/prisma/tenant-schema.prisma`
**Action**: Create new Prisma schema with:
- All non-registry models from current schema
- REMOVE ALL churchId fields
- REMOVE Church model entirely
- REMOVE Tenant/PhoneNumberRegistry/AdminEmailIndex models
- Keep Admin model (but it won't reference Church anymore in tenant DB)

**Models to include (without churchId)**:
```typescript
// Models IN tenant database (one copy per tenant)
model Admin                    // Authentication happens at registry level
model Member
model Branch
model Message                  // Remove churchId
model MessageRecipient
model Conversation            // Remove churchId
model ConversationMessage
model MessageTemplate         // Remove churchId
model RecurringMessage        // Remove churchId
model MessageQueue            // Remove churchId
model AnalyticsEvent          // Remove churchId
model ChatConversation        // Remove churchId (only local chats)
model ChatMessage
model ConsentLog              // Remove churchId
model DeadLetterQueue         // Remove churchId
model OnboardingProgress      // Remove churchId
model AdminMFA
model MFARecoveryCode
model NPSSurvey               // Remove churchId
model Subscription            // Remove churchId
model PlanningCenterIntegration  // Remove churchId
model AccountDeletionRequest  // Remove churchId
model DataExport              // Remove churchId

// DO NOT include:
// - Church (only in registry)
// - Tenant (only in registry)
// - PhoneNumberRegistry (only in registry)
// - AdminEmailIndex (only in registry)
```

**Key Changes**:
- All models lose `churchId` field
- All relations to Church removed
- All indexes adjusted (remove churchId from composite indexes)
- Keep unique constraints but remove churchId component

### Task 3.2: Update main schema.prisma
**File**: `backend/prisma/schema.prisma`
**Action**: Keep ONLY registry models:
```typescript
model Church              // Main registry
model Tenant              // Tenant metadata
model PhoneNumberRegistry // SMS/MMS routing
model AdminEmailIndex     // Login lookup
```

Remove from main schema:
- All tenant-specific models (Member, Branch, Message, etc.)
- Only keep models that are registry/shared

### Task 3.3: Verify Schemas
- ✅ tenant-schema.prisma generates correctly
- ✅ main schema.prisma generates correctly
- ✅ No duplicate model names
- ✅ All relationships are valid
- ✅ npm run build succeeds with 0 errors

---

## What Gets Generated

### After Phase 3:
```
backend/
├── prisma/
│   ├── schema.prisma              // Registry database (main)
│   ├── tenant-schema.prisma       // Tenant database template (NEW)
│   ├── migrations/
│   │   ├── migration_001.sql      // Main database migrations
│   │   └── ...
│   └── migrations-tenant/         // NEW: Tenant database migrations
│       ├── migration_001.sql
│       └── ...
├── node_modules/@prisma/
│   ├── client/                    // Main database client
│   └── client-tenant/             // NEW: Tenant database client
└── lib/
    ├── prisma.ts                  // Singleton for registry
    ├── tenant-prisma.ts           // Already exists - creates tenant clients
    └── ...
```

---

## Implementation Steps

1. ✅ Read full current schema
2. ⬜ Create tenant-schema.prisma (copy from current, remove churchId)
3. ⬜ Update main schema.prisma (keep only registry models)
4. ⬜ Run `prisma generate` for both schemas
5. ⬜ Fix any TypeScript errors
6. ⬜ Update lib/tenant-prisma.ts to use tenant-schema client
7. ⬜ npm run build - verify 0 errors
8. ⬜ Test schema generation

---

## Models to Remove churchId From

| Model | Current Has churchId | Action |
|-------|------|--------|
| Admin | Yes | Remove (tenant DB owns this) |
| Member | No | Leave as-is |
| Branch | Yes | Remove |
| Message | Yes | Remove |
| MessageRecipient | No | Leave as-is |
| Conversation | Yes | Remove |
| ConversationMessage | No | Leave as-is |
| MessageTemplate | Yes | Remove |
| RecurringMessage | Yes | Remove |
| MessageQueue | Yes | Remove |
| AnalyticsEvent | Yes | Remove |
| ChatConversation | Yes | Remove (churchId becomes null/unused) |
| ConsentLog | Yes | Remove |
| DeadLetterQueue | Yes | Remove |
| OnboardingProgress | Yes | Remove |
| Subscription | Yes | Remove |
| PlanningCenterIntegration | Yes | Remove |
| AdminMFA | No | Leave as-is |
| MFARecoveryCode | No | Leave as-is |
| NPSSurvey | Yes | Remove |
| AccountDeletionRequest | Yes | Remove |
| DataExport | Yes | Remove |

---

## After Phase 3 Complete

- ✅ Two separate schemas (main + tenant)
- ✅ Tenant schema has NO churchId in any model
- ✅ Registry schema has only Church, Tenant, PhoneNumberRegistry, AdminEmailIndex
- ✅ Each tenant database is isolated at schema level
- ✅ Build succeeds with 0 TypeScript errors
- ✅ Ready for Phase 4 (Database Provisioning)

---

## Risk Assessment

| Risk | Mitigation |
|------|-----------|
| Breaking existing queries | Phase 5-6 will update all services/controllers |
| TypeScript errors | Will fix all types when refactoring services |
| Migration complexity | Will handle in separate migration strategy |
| Backward compatibility | Breaking change intentional - for architecture upgrade |

**Ready to proceed?** (y/n)
