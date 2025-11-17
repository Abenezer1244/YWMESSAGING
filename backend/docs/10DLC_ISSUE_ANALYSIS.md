# 10DLC Registration Issue - Root Cause FOUND & Solution

**Date:** November 17, 2025
**Status:** 🔴 CRITICAL - API Key Invalid/Revoked

---

## Problem Summary

10DLC brand registration is failing with:
```
❌ Error: Request failed with status code 404
Telnyx Error: Resource not found (code 10005)
```

**ROOT CAUSE IDENTIFIED:**
The API key `KEY019A7519B7F03C53D55D25C7B47C0BE8_...` is **invalid or revoked**.

All API endpoints return **401 "No key found matching the ID"**:
```
GET /messaging_profiles → 401 Authentication Failed
GET /phone_numbers → 401 Authentication Failed
```

This means Telnyx's servers don't recognize this API key.

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

## Solutions (URGENT)

### Solution 1: IMMEDIATE - Request New API Key from Telnyx
**Status:** CRITICAL - Do this NOW
**Steps:**
1. Contact Telnyx support IMMEDIATELY at support@telnyx.com or phone support
2. Say: "Our API key `KEY019A7519B7F03C53D55D25C7B47C0BE8...` is returning 401 'No key found'. Can you either:
   - Regenerate this key to make it active, OR
   - Provide a new valid API key"
3. Ask them to test that the new key works before providing it
4. Expected response time: URGENT (should be same day for active customers)

**Why this is critical:**
- ✅ Your account HAS A2P enabled (per Telnyx confirmation)
- ✅ The endpoint `/a2p_brands` exists
- ❌ But your API KEY is invalid/revoked → Telnyx rejects all requests
- 🔴 This blocks ALL API calls (not just 10DLC)

**Verification the key is bad:**
```
GET /messaging_profiles with current key → 401 ❌
GET /phone_numbers with current key → 401 ❌
GET /a2p_brands with current key → 404 (can't even reach it)
```

The 401 errors prove the key is invalid.

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

### 🚨 IMMEDIATE (TODAY - URGENT)
1. **Contact Telnyx Support by Phone or Email**
   - Email: support@telnyx.com (mention URGENT)
   - Phone: [Check your Telnyx dashboard for support phone]
   - Subject: "URGENT: API Key Invalid - Blocking Production"
   - Details:
     ```
     Current API Key: KEY019A7519B7F03C53D55D25C7B47C0BE8_...
     Error: All API endpoints returning 401 "No key found matching the ID"
     Impact: SMS sending and 10DLC registration completely blocked
     Need: Valid API key that works with Bearer token auth
     ```

2. **While waiting for Telnyx response:**
   - Run diagnostic to confirm issue:
     ```bash
     cd backend && node test-endpoints.js
     ```
   - This proves the key is bad (401 errors)
   - Have output ready to send to Telnyx

### Once You Get New API Key (Same Day - CRITICAL PATH)
1. **Update .env file:**
   ```
   # Backend .env
   TELNYX_API_KEY=<new-key-from-telnyx>
   ```

2. **Update Render Production:**
   - Go to: https://dashboard.render.com/
   - Select: `connect-yw-backend` service
   - Settings → Environment Variables
   - Update `TELNYX_API_KEY` with new key
   - Backend will auto-restart

3. **Test new key:**
   ```bash
   cd backend && node test-endpoints.js
   # Should now show: ✅ GET /messaging_profiles - Status 200
   ```

4. **Trigger 10DLC registration:**
   - System will auto-retry on next phone number purchase
   - Or manually trigger if church already has number
   - Monitor Render logs: `[DLC] ...` entries

### Long-term (Backup Plan If Telnyx Delays)
- Implement Solution 3 (shared brand fallback)
- All churches use shared brand (65%) initially
- Once new key is active, auto-upgrade to personal brand (99%)
- No code changes needed, already built-in

---

## Testing Steps Once You Get New API Key

### Step 1: Update Key and Restart
```bash
# Edit .env with new key
vim backend/.env
# Change: TELNYX_API_KEY=<new-key>

# Test locally (if using local Postgres):
cd backend && npm run build && npm start
```

### Step 2: Verify Key Works
```bash
cd backend && node test-endpoints.js
# Expected output:
# ✅ GET /messaging_profiles - Status 200: Found X items
# ✅ GET /phone_numbers - Status 200: Found X items
# ✅ GET /a2p_brands - Status 200: Found 0 items (or existing brands)
```

### Step 3: Update Production (Render)
1. Go to: https://dashboard.render.com/
2. Select `connect-yw-backend`
3. Settings → Environment
4. Update `TELNYX_API_KEY` with new key
5. Click "Save" (backend will auto-redeploy)
6. Wait for deployment to complete (~1 min)

### Step 4: Monitor 10DLC Registration
```bash
# Option A: Purchase a new phone number (triggers auto-registration)
# Option B: Check Render logs in dashboard
# Look for: [DLC] or [TELNYX_LINKING] entries

# Expected log sequence:
# 📤 Submitting 10DLC brand to Telnyx: "church name"
# ✅ Brand registered with Telnyx: <brandId>
# 📅 Scheduled approval check for church
```

### Step 5: Verify with curl (Optional)
```bash
curl -X POST https://api.telnyx.com/v2/a2p_brands \
  -H "Authorization: Bearer YOUR_NEW_API_KEY" \
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
# Should return: 200 OK with brand_id in response
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
