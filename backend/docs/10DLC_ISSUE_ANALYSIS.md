# 10DLC Registration Issue - Analysis & Solutions

**Date:** November 17, 2025
**Status:** 🔴 Blocking Issue - Requires Telnyx Account Configuration

---

## Problem Summary

10DLC brand registration is failing with:
```
❌ Error: Request failed with status code 404
Telnyx Error: Resource not found (code 10005)
```

The `/a2p_brands` endpoint returns 404, indicating either:
1. The endpoint doesn't exist on this Telnyx account
2. A2P brand registration feature is not enabled
3. The API key doesn't have permissions for this feature

---

## Root Cause Analysis

### What We Fixed
✅ Changed endpoint from `/10dlc_brands` (wrong) to `/a2p_brands` (correct Telnyx path)
✅ Updated request payload to match Telnyx A2P brand format
✅ TypeScript compiles successfully

### What's Still Broken
❌ `/a2p_brands` endpoint returns 404 "Resource not found"
❌ Indicates account/API key issue, not code issue

### Test Results

```
1️⃣ API Key Validation: ❌ FAILED
   - Error: "No key found matching the ID 'KEY019A7519B7F03C53D55D25C7B47C0BE8'"
   - This suggests the API key format might be incorrect or the key is revoked

2️⃣ A2P Brands Endpoint: ❌ FAILED (404)
   - Endpoint: /a2p_brands
   - Response: "The requested resource or URL could not be found."
   - Likely cause: A2P not enabled on this account

3️⃣ Messaging Profiles: ✅ PASSED (for reference)
   - We can create and manage messaging profiles
   - Phone linking works correctly

4️⃣ Phone Numbers: ✅ PASSED (for reference)
   - We can purchase, manage, and link phone numbers
```

---

## Solutions (In Priority Order)

### Solution 1: Contact Telnyx Support (RECOMMENDED)
**Status:** Requires Action
**Steps:**
1. Contact Telnyx support at support@telnyx.com
2. Request: "Enable A2P brand registration for organization [ORG_ID]"
3. Mention: "Need access to /a2p_brands endpoint for 10DLC registration"
4. Expected response time: 24-48 hours

**Indicators you need this:**
- ✅ We have valid messaging profiles and phone numbers
- ✅ SMS sending works (via synchronous Telnyx API)
- ❌ But 10DLC brand registration endpoint returns 404
- ❌ API key authentication seems to fail on /organization endpoint

---

### Solution 2: Verify/Update API Key
**Status:** May Help
**Steps:**
1. Log in to Telnyx dashboard: https://telnyx.com/signin
2. Navigate to: Account Settings → API Keys
3. Check if your current API key is:
   - Active (not revoked)
   - Has correct permissions
   - Is in correct format (Bearer token, not old KEY_ID format)
4. Generate a new API key if needed
5. Update `TELNYX_API_KEY` in:
   - `.env` (local)
   - Render dashboard (production)
   - Restart backend

**Current API Key Format:**
```
KEY019A7519B7F03C53D55D25C7B47C0BE8_Ixsu40kvTLYIfjfwGrG6aO
```
This looks like an older format (KEY_ID_secret). Telnyx v2 API typically uses Bearer tokens.

---

### Solution 3: Use Shared Brand as Fallback
**Status:** Partial Workaround (Already Implemented)
**Current behavior:**
- Churches start with `usingSharedBrand: true` (65% delivery)
- Once 10DLC approved, they upgrade to `usingSharedBrand: false` (99%)
- If 10DLC registration fails, they stay on shared brand

**Limitations:**
- 65% delivery rate instead of 99%
- No per-church brand registration
- Still dependent on Telnyx approving the shared brand

---

### Solution 4: Alternative 10DLC Registration Method
**Status:** Requires Research
**Possible approaches:**
1. **Telnyx Dashboard Upload:** Manually register brands via Telnyx dashboard
   - Not API-automated
   - Manual per-brand process
   - Not scalable

2. **Pre-made Brand ID:** If Telnyx provides a generic church brand ID
   - Use existing approved 10DLC brand
   - No per-church registration
   - Limited customization

3. **Telnyx Business Contact:** Request enterprise integration
   - Direct Telnyx support
   - Custom API endpoints
   - SLA and dedicated support

---

## Recommended Action Plan

### Immediate (Next 24 hours)
1. **Contact Telnyx Support**
   - Email: support@telnyx.com
   - Subject: "Enable A2P Brand Registration API"
   - Details:
     ```
     Organization: [Your Org ID from /organization endpoint if working]
     Current issue: /a2p_brands endpoint returns 404
     Use case: Automatic per-church 10DLC brand registration for SMS platform
     API Key: [First 10 chars of your key, NOT full key]
     ```

2. **Verify API Key** (While waiting for support)
   ```bash
   # Run test script to verify current key works
   cd backend && node test-a2p-setup.js
   ```

### Short-term (24-48 hours)
- Wait for Telnyx support response
- May need to generate new API key
- Apply changes and test

### Long-term (If A2P still not available)
- Implement Solution 3 (shared brand fallback)
- All churches use shared brand initially
- Manual upgrade path once Telnyx enables A2P
- Monitor Telnyx documentation for updates

---

## Testing the Fix

Once Telnyx enables A2P:

```bash
# 1. Run diagnostic test
cd backend && node test-a2p-setup.js

# 2. Try creating a test brand manually via Telnyx dashboard

# 3. Test API call with corrected endpoint
curl -X POST https://api.telnyx.com/v2/a2p_brands \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "company_name": "Test Church",
    "brand_type": "SOLE_PROPRIETOR",
    "vertical": "RELIGION",
    "city": "Seattle",
    "state": "WA",
    "country": "US",
    "email": "test@example.com",
    "display_name": "Test Church"
  }'

# 4. If successful, trigger 10DLC registration
# (System will automatically retry on next phone number purchase)
```

---

## Code Changes Made

### File: `backend/src/jobs/10dlc-registration.ts`

**Change 1:** Fixed endpoint path
```typescript
// Before (WRONG)
const brandResponse = await client.post('/10dlc_brands', { ... })

// After (CORRECT)
const brandResponse = await client.post('/a2p_brands', { ... })
```

**Change 2:** Fixed request payload
```typescript
// Before (INCOMPLETE/WRONG)
{
  company_name: church.name,
  brand_type: 'CHURCH',
  phone_number: phoneNumber,
  vertical: 'RELIGION',
  city: 'USA',
  state: 'US',
}

// After (CORRECT A2P FORMAT)
{
  company_name: church.name,
  brand_type: 'SOLE_PROPRIETOR',
  vertical: 'RELIGION',
  city: 'Seattle',
  state: 'WA',
  country: 'US',
  email: church.email,
  display_name: church.name,
}
```

**Change 3:** Fixed approval check endpoint
```typescript
// Before (WRONG)
const response = await client.get(`/10dlc_brands/${church.dlcBrandId}`)

// After (CORRECT)
const response = await client.get(`/a2p_brands/${church.dlcBrandId}`)
```

---

## Files Modified
- `backend/src/jobs/10dlc-registration.ts` - Endpoint and payload fixes
- `backend/dist/jobs/10dlc-registration.js` - Compiled changes
- `backend/test-a2p-setup.js` - NEW: Diagnostic test script

---

## Support Resources

- **Telnyx API Docs:** https://developers.telnyx.com/docs/api
- **10DLC/A2P Docs:** https://developers.telnyx.com/docs/messaging-products/10dlc-brand-registration
- **Support Contact:** support@telnyx.com
- **Status Page:** https://status.telnyx.com/

---

## Next Steps

1. ⏳ Contact Telnyx support immediately
2. 🔄 Update API key if needed
3. ✅ Once A2P is enabled, test with diagnostic script
4. 🚀 Restart backend to apply 10DLC registration
5. 📊 Monitor 10DLC status in Render logs

**Estimated time to resolution:** 1-3 business days (pending Telnyx support)
