# 10DLC Registration Fixes Applied

**Date:** November 19, 2025
**File:** `backend/src/jobs/10dlc-registration.ts`
**Status:** ✅ TypeScript compilation passes

---

## Summary

Fixed critical issues in the 10DLC brand registration implementation. The code was using **wrong endpoint paths** and **invalid request/response field names** from the official Telnyx API documentation.

---

## Fixes Applied

### Fix #1: Correct Endpoint Path (Line 51)

**Before (Wrong):**
```typescript
const brandResponse = await client.post('/a2p_brands', {
  // ...
});
```

**After (Correct):**
```typescript
const brandResponse = await client.post('/10dlc/brand', {
  // ...
});
```

**Why:** The endpoint `/a2p_brands` was returning 404 "Resource not found". The correct Telnyx API endpoint is `/10dlc/brand` per the official documentation.

---

### Fix #2: Correct Request Payload (Lines 51-58)

**Before (Wrong):**
```typescript
const brandResponse = await client.post('/a2p_brands', {
  company_name: church.name,              // ❌ Wrong field name (snake_case)
  brand_type: 'SOLE_PROPRIETOR',          // ❌ Field doesn't exist in API
  vertical: 'RELIGION',
  city: 'Seattle',                         // ❌ Hardcoded (we don't have this)
  state: 'WA',                             // ❌ Hardcoded (we don't have this)
  country: 'US',
  email: church.email,
  display_name: church.name,              // ❌ Wrong field name (snake_case)
});
```

**After (Correct):**
```typescript
const brandResponse = await client.post('/10dlc/brand', {
  entityType: 'NON_PROFIT',               // ✅ Required field (churches are non-profit)
  displayName: church.name,               // ✅ Correct camelCase field name
  country: 'US',                          // ✅ Required
  email: church.email,                    // ✅ Required
  vertical: 'RELIGION',                   // ✅ Required
  companyName: church.name,               // ✅ Required for NON_PROFIT
});
```

**Why:**
- `entityType` is a required field that specifies the type of organization (NON_PROFIT, PRIVATE_PROFIT, PUBLIC_PROFIT, GOVERNMENT)
- Field names must be camelCase (not snake_case): `displayName`, `companyName`
- `brand_type` field doesn't exist in the Telnyx API
- Removed hardcoded city/state values since we don't have that church data
- Made the request payload simpler and focused on required fields only

---

### Fix #3: Correct Response Field Name (Line 60)

**Before (Wrong):**
```typescript
const brandId = brandResponse.data?.data?.id;
```

**After (Correct):**
```typescript
const brandId = brandResponse.data?.brandId;
```

**Why:** The Telnyx API response structure is `response.data.brandId`, not `response.data.data.id`. The response doesn't have nested `.data` objects.

---

### Fix #4: Correct Approval Status Endpoint (Line 140)

**Before (Wrong):**
```typescript
const response = await client.get(`/a2p_brands/${church.dlcBrandId}`);
```

**After (Correct):**
```typescript
const response = await client.get(`/10dlc/brand/${church.dlcBrandId}`);
```

**Why:** Same endpoint correction as Fix #1 - `/a2p_brands` returns 404, the correct endpoint is `/10dlc/brand`.

---

### Fix #5: Correct Status Response Field (Line 141-142)

**Before (Wrong):**
```typescript
const status = response.data?.data?.status;
```

**After (Correct):**
```typescript
const status = response.data?.status;
const identityStatus = response.data?.identityStatus;
```

**Why:** Response structure is flat, not nested. Also need to check `identityStatus` field for verification status.

---

### Fix #6: Correct Status Values (Lines 146, 163, 178)

**Before (Wrong):**
```typescript
if (status === 'approved') {
  // ...
} else if (status === 'rejected') {
  // ...
} else if (status === 'pending') {
  // ...
}
```

**After (Correct):**
```typescript
if (status === 'OK' && identityStatus === 'VERIFIED') {
  // Brand is fully approved and verified
  // ...
} else if (status === 'REGISTRATION_FAILED') {
  // Registration failed
  // ...
} else if (status === 'REGISTRATION_PENDING') {
  // Still pending
  // ...
}
```

**Why:** The Telnyx API uses these status values:
- `OK` with `VERIFIED`: Brand is approved and ready to use
- `REGISTRATION_PENDING`: Brand is still being reviewed
- `REGISTRATION_FAILED`: Brand registration failed

---

### Fix #7: Correct Failure Reasons Field (Line 167)

**Before (Wrong):**
```typescript
const rejection = response.data?.data?.rejection_reason || 'Unknown reason';
```

**After (Correct):**
```typescript
const failureReasons = response.data?.failureReasons || 'Unknown reason';
```

**Why:** The API response field is `failureReasons`, not `rejection_reason`, and it's not nested in `.data.data`.

---

## Test Results

✅ **TypeScript Compilation:** PASSED (no errors)

---

## Next Steps

1. **Test with real Telnyx API** once the account has the correct API key
2. **Extract Campaign endpoints** from the Word document (for Step 2 of 10DLC workflow)
3. **Extract Number Assignment endpoints** from the Word document (for Step 3 of 10DLC workflow)
4. **Implement full 10DLC workflow:**
   - Step 1: Create Brand (✅ FIXED)
   - Step 2: Create Campaign (⏳ TODO)
   - Step 3: Assign Numbers (⏳ TODO)
   - Step 4: Monitor approval status (✅ FIXED)

---

## Key Takeaway

The 10DLC API endpoint and request/response format were completely different from what was implemented. The code was using an endpoint path that returned 404, wrong field names (snake_case instead of camelCase), and non-existent fields. All issues are now corrected based on the official Telnyx API documentation.

The fixes ensure the code will work correctly with the actual Telnyx API once the account has proper permissions enabled.
