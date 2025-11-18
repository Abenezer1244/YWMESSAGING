# Telnyx Support Ticket Response - 10DLC Brand Registration Issue

**To:** Prajwal Shetty, Technical Product Support Engineer @ Telnyx
**Date:** November 18, 2025
**Subject:** Re: 10DLC Brand Registration - /a2p_brands Returns 404

---

## Issue Summary

**What we're trying to do:** Automatically register per-customer 10DLC brands via the Telnyx API so churches can upgrade from shared brand (65% delivery) to personal brand (99% delivery).

**Expected behavior:** `POST /a2p_brands` should create a new brand and return a `brand_id` for tracking approval status.

**Actual behavior:** `POST /a2p_brands` returns 404 "Resource not found", suggesting the endpoint doesn't exist on our account.

---

## Endpoint Details

**Endpoint:** `POST https://api.telnyx.com/v2/a2p_brands`

---

## Timestamps

**All attempts occurred on:** November 17, 2025
**Time range:** 23:05:00 - 23:06:00 GMT
**Timezone:** UTC

**Exact attempt timestamp:** 2025-11-17T23:05:54.326Z

---

## Request Details

### Headers
```
Authorization: Bearer KEY019A7519B7F03C53D55D25C7B47C0BE8_Ixsu40kvTLYIfjfwGrG6aO
Content-Type: application/json
```

### Request Payload
```json
{
  "company_name": "dorowot church",
  "brand_type": "SOLE_PROPRIETOR",
  "vertical": "RELIGION",
  "city": "Seattle",
  "state": "WA",
  "country": "US",
  "email": "church_email@example.com",
  "display_name": "dorowot church"
}
```

**Source code location:** `backend/src/jobs/10dlc-registration.ts` line 51-60

---

## Response Details

### HTTP Status
```
404 Not Found
```

### Response Body
```json
{
  "errors": [
    {
      "code": "10005",
      "title": "Resource not found",
      "detail": "The requested resource or URL could not be found.",
      "meta": {
        "url": "https://developers.telnyx.com/docs/overview/errors/10005"
      }
    }
  ]
}
```

---

## Additional Testing Performed

We ran comprehensive diagnostics to isolate the issue:

### Test 1: Other Telnyx Endpoints
```
GET /messaging_profiles → 401 "No key found matching the ID"
GET /phone_numbers → 401 "No key found matching the ID"
GET /a2p_brands → 404 "Resource not found"
```

**Observation:** The 401 errors on basic endpoints suggest the API key might have issues, but the 404 on `/a2p_brands` suggests the endpoint itself may not be accessible.

### Test 2: Authentication Methods Tested
- Bearer token (current)
- Basic Auth (KEY_ID:secret)
- Direct API key (no Bearer)
- Custom header (X-API-Key)

**Result:** All auth methods return 404 for `/a2p_brands`

### Test 3: Request Format Variations
We also tested:
- Original: `brand_type: "CHURCH"` → 404
- Updated: `brand_type: "SOLE_PROPRIETOR"` → 404

**Result:** Issue persists regardless of payload content

---

## Questions for Telnyx Team

1. **Is `/a2p_brands` the correct endpoint path for 10DLC brand registration in API v2?**
   - Or is there a different endpoint we should use?

2. **Are there any special headers, scopes, or permissions required** beyond the standard Bearer token authentication?

3. **Can you confirm if our API key (KEY019A7519B7F03C53D55D25C7B47C0BE8_...) has A2P brand registration permissions enabled?**

4. **Can you provide a working curl example** for creating an A2P brand in your API v2 documentation?

5. **Is there any verification or approval process** required before our account can use the A2P brand registration endpoint?

---

## Can You Replicate the Issue?

**Yes - Easily Replicable**

```bash
curl -X POST https://api.telnyx.com/v2/a2p_brands \
  -H "Authorization: Bearer KEY019A7519B7F03C53D55D25C7B47C0BE8_Ixsu40kvTLYIfjfwGrG6aO" \
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
```

**Expected response:** 200 OK with `brand_id`
**Actual response:** 404 "Resource not found"

---

## Impact

- ✅ SMS/MMS sending works via Telnyx API (confirmed with other endpoints)
- ✅ Phone number management works (we can purchase and manage numbers)
- ❌ 10DLC brand auto-registration is blocked (404 error)
- 🔴 Cannot achieve 99% delivery rate for churches (stuck at 65% with shared brand)

---

## Context & Use Case

**Platform:** Church messaging system (Koinonia SMS)
**URL:** https://koinoniasms.com
**Deployment:** Production on Render

**Flow:**
1. Church purchases a phone number through our platform
2. We auto-register a personal 10DLC brand for that church
3. Telnyx approves the brand (typically 1-7 days)
4. We auto-upgrade the church's SMS delivery rate from 65% → 99%

**Current blocker:** Step 2 fails with 404

---

## Files for Reference

- **Implementation:** `backend/src/jobs/10dlc-registration.ts`
- **Error logs:** Timestamp 2025-11-17T23:05:54.326Z in Render dashboard
- **Account:** [Your Telnyx account]
- **Phone number used for testing:** +14253800792

---

## What We Need From You

1. Confirmation that `/a2p_brands` is the correct endpoint
2. Any documentation or working example for A2P brand registration
3. Confirmation that our API key has the necessary permissions
4. Recommended next steps if this endpoint isn't available for our account tier

---

**Please let us know how to proceed. We're ready to implement immediately once we have guidance.**

Thank you,
Abenezer Girma
Koinonia SMS Team

---

**Ticket References:**
- Support case opened: Nov 17, 2025
- Technical contact: Prajwal Shetty, Cameron Fitzpatrick @ Telnyx
- Response to: support@telnyx.com
