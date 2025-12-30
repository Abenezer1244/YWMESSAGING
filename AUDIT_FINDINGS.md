# 🔍 Complete Multi-Tenant Security Audit - FINDINGS

**Date**: 2025-12-29
**Auditor**: Claude Code
**Files Audited**: 7 critical files
**Severity Levels**: 1 HIGH, 0 MEDIUM, 0 LOW

---

## CRITICAL SECURITY FINDING: HIGH SEVERITY ❌

### Issue #1: Unauthenticated Phone Number Details Enumeration
**File**: `backend/src/services/telnyx.service.ts` (Lines 409-418)
**Severity**: HIGH - Information Disclosure Vulnerability
**Function**: `getPhoneNumberDetails(numberSid: string)`

**Problem**:
```typescript
export async function getPhoneNumberDetails(numberSid: string): Promise<any> {
  const client = getTelnyxClient();
  const response = await client.get(`/phone_numbers/${numberSid}`);
  return response.data?.data;
}
```

**Vulnerability**:
- Takes only `numberSid` parameter (no churchId validation)
- Does NOT verify the phone number belongs to the calling church
- An authenticated admin could enumerate phone number IDs and query details about ANY number in the system
- Currently imported but UNUSED in numbers.controller.ts (imported but never called)

**Attack Scenario**:
1. Attacker authenticates as Admin A from Church A
2. Attacker calls `getPhoneNumberDetails(numberSid)` with a guessed Church B phone number ID
3. Attacker sees Church B's phone number details (routing info, messaging profile, status, etc.)
4. Leads to information disclosure about competing churches' SMS numbers

**Fix**: Add churchId validation to ensure phone number belongs to authenticated user's church

---

## COMPLETE AUDIT RESULTS

### ✅ telnyx.service.ts - FINDINGS
**Status**: 1 ISSUE FOUND

| Function | Parameter Validation | Status |
|----------|-------------------|--------|
| `sendSMS()` | churchId ✅ | Secure |
| `validateTelnyxApiKey()` | N/A (global) ✅ | Secure |
| `searchAvailableNumbers()` | N/A (global) ✅ | Secure |
| `purchasePhoneNumber()` | churchId ✅ | Secure |
| `getPhoneNumberDetails()` | ❌ NO churchId | **VULNERABLE** |
| `releasePhoneNumber()` | churchId ✅ | Secure |
| `createWebhook()` | N/A (global) ✅ | Secure |
| `deleteWebhook()` | N/A (global) ✅ | Secure |
| `linkPhoneNumberToMessagingProfile()` | churchId ✅ | Secure |

---

### ✅ telnyx-mms.service.ts - FINDINGS
**Status**: ALL SECURE ✅

| Function | Validation | Status |
|----------|-----------|--------|
| `findOrCreateMemberByPhone()` | churchId ✅ | Secure |
| `sendMMS()` | churchId ✅ | Secure |
| `handleInboundMMS()` | churchId ✅ | Secure |
| `broadcastInboundToMembers()` | churchId ✅ | Secure |
| `getMemberByPhone()` | churchId ✅ | Secure |
| `validateMMSSetup()` | N/A (global) ✅ | Secure |

---

### ✅ Job Files Audit
**Status**: ALL SECURE ✅

#### 10dlc-registration.ts
| Function | Validation | Status |
|----------|-----------|--------|
| `registerPersonal10DLCAsync()` | churchId ✅ | Secure |
| `createCampaignAsync()` | churchId ✅ | Secure |
| `checkAndMigrateToPer10DLC()` | N/A (finds churches via prisma) ✅ | Secure |

#### 10dlc-webhooks.ts
| Function | Validation | Status |
|----------|-----------|--------|
| `handleTelnyx10DLCWebhook()` | brandId → churchId ✅ | Secure |
| `handleBrandUpdate()` | brandId → churchId ✅ | Secure |

#### recurringMessages.job.ts
| Function | Validation | Status |
|----------|-----------|--------|
| `processRecurringMessages()` | Uses getTenantPrisma(churchId) ✅ | Secure |
| `startRecurringMessageScheduler()` | Job scheduler ✅ | Secure |

#### welcomeMessage.job.ts
| Function | Validation | Status |
|----------|-----------|--------|
| `sendWelcomeMessage()` | churchId ✅ | Secure |
| `queueWelcomeMessage()` | churchId ✅ | Secure |

#### queue.ts
**Status**: Uses singleton prisma with churchId in all operations ✅ Secure

---

## Summary of Findings

| Category | Count | Severity |
|----------|-------|----------|
| Functions Audited | 21+ | - |
| Secure Functions | 20+ | - |
| Vulnerable Functions | 1 | HIGH |
| Unknown Usage | 1 (getPhoneNumberDetails) | - |

---

## Remediation Status

### Priority 1: CRITICAL ✅ FIXED
- [x] Fixed `getPhoneNumberDetails()` to validate churchId
  - **Change**: Added `churchId` parameter
  - **Validation**: Verifies phone number belongs to the authenticated church
  - **Error Handling**: Throws error if number doesn't match church's numberSid
  - **File**: `backend/src/services/telnyx.service.ts` (Lines 410-434)

### Priority 2: Clean Up ✅ FIXED
- [x] Removed unused import of `getPhoneNumberDetails()` from numbers.controller.ts
  - **File**: `backend/src/controllers/numbers.controller.ts` (Line 8)
  - **Reason**: Function was imported but never called

---

## Recommendations

1. **Implement churchId validation** in getPhoneNumberDetails
2. **Code audit**: Search for other exported functions that might not validate tenant context
3. **Security testing**: Test each Telnyx service function with cross-tenant churchIds
4. **Remove unused exports**: Clean up imported but unused functions

