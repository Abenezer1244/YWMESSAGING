# Shared Brand Setup Guide - Telnyx Platform Configuration

**Status:** Code implementation complete, manual Telnyx setup required
**Date:** November 20, 2025
**Impact:** Enables shared brand SMS delivery (65%) for all non-premium churches

---

## Overview

The optional 10DLC system now supports two delivery paths:

1. **Shared Brand** (Default) - Uses platform's pre-registered Telnyx brand
   - ✅ No EIN required
   - ✅ Instant activation
   - ✅ 65% delivery rate
   - ❌ Requires platform brand to be created in Telnyx

2. **Premium 10DLC** - Uses church's own brand
   - ✅ 99% delivery rate
   - ❌ Requires EIN
   - ❌ 1-2 day approval

This guide covers creating and configuring the platform shared brand in Telnyx.

---

## Part 1: Create Platform Brand in Telnyx Dashboard

### Step 1: Access Telnyx Dashboard

1. Go to https://portal.telnyx.com
2. Log in with your Telnyx account
3. Navigate to **Messaging** → **Phone Numbers & Campaigns**

### Step 2: Create a New Brand

1. Click **"Create Brand"** button
2. Fill in the following information:

**Basic Information:**
```
Brand Name: "Koinonia SMS Platform"
Display Name: "Koinonia"
Company Name: "Koinonia SMS, Inc."
```

**Business Information:**
```
Entity Type: "NON_PROFIT" or "PRIVATE_CORPORATION" (your choice)
Vertical: "RELIGION" (for church focus) or "NON_PROFIT"

Address:
- Street: [Your company address]
- City: [Your city]
- State: [Your state code, e.g., WA]
- Postal Code: [Your ZIP]
- Country: "United States"

Phone: [Your business phone]
Email: [Your business email]
Website: [Your website, e.g., koinoniasms.com]
```

**EIN/Tax Information:**
```
EIN: [Your company EIN]
Note: Use your platform's EIN, not individual churches
```

### Step 3: Submit Brand for TCR Registration

1. Click **"Submit"** after filling all information
2. Telnyx automatically submits to The Campaign Registry (TCR)
3. You'll see status: **"PENDING_TCR_VERIFICATION"**
4. Wait for email confirmation from Telnyx

### Step 4: Get Your Brand ID

Once brand is created, it will have a **Brand ID**. Copy this ID.

Example: `brand_01arwz60q6jy57ydp2gzh8e5m0`

---

## Part 2: Store Brand ID in Environment Variables

### For Development (`.env` file)

```bash
# backend/.env

# Telnyx API Configuration
TELNYX_API_KEY="your_api_key_here"

# Platform Shared Brand (for 65% delivery SMS)
TELNYX_PLATFORM_BRAND_ID="brand_01arwz60q6jy57ydp2gzh8e5m0"
```

### For Production (Environment Variables)

Set this as an environment variable on your deployment platform:

**Heroku:**
```bash
heroku config:set TELNYX_PLATFORM_BRAND_ID="brand_01arwz60q6jy57ydp2gzh8e5m0"
```

**Render:**
```
Environment Variables section:
TELNYX_PLATFORM_BRAND_ID = brand_01arwz60q6jy57ydp2gzh8e5m0
```

**AWS/Other:**
Set the environment variable `TELNYX_PLATFORM_BRAND_ID` to the brand ID value.

---

## Part 3: Verify Configuration

### Check Environment Variable is Set

```bash
# On your deployed server
echo $TELNYX_PLATFORM_BRAND_ID

# Should output: brand_01arwz60q6jy57ydp2gzh8e5m0
```

### Test SMS Sending with Shared Brand

1. Create a test church and set it to "Standard Delivery" (shared brand)
2. Purchase a phone number
3. Send a test SMS
4. Check backend logs:

```
📤 Sending SMS: from +1-555-XXXX to +1-555-YYYY
   Brand: shared (65% delivery rate)
   Using shared platform brand: brand_01arwz60q6jy57ydp2gzh8e5m0
   Message: "Test message..."
✅ SMS accepted by Telnyx: msg_xxxxx
```

If you see this log message:
```
⚠️ Platform brand ID not configured. Sending without brand ID.
```

**It means:** Environment variable `TELNYX_PLATFORM_BRAND_ID` is not set. Go back to Part 2.

---

## Part 4: Monitor Brand Status

### Brand Verification Timeline

```
1. Submit Brand (Day 0)
   Status: PENDING_TCR_VERIFICATION

2. TCR Reviews (Day 1-2)
   Status: PENDING_TCR_VERIFICATION

3. Approval Received (Day 2-3)
   Status: VERIFIED
   ✅ Ready to use for SMS

4. (Optional) Create Campaign
   Once brand is VERIFIED, SMS is ready
```

### Check Brand Status in Telnyx Dashboard

1. Go to **Messaging** → **Phone Numbers & Campaigns**
2. Click on your brand name
3. Look for status badge:
   - 🔴 **PENDING_TCR_VERIFICATION** - Not ready yet
   - 🟡 **ACTIVE** - Brand verified, campaign auto-created
   - 🟢 **VERIFIED** - Ready to use

### Receiving Status Emails

Telnyx sends emails to your registered email when:
- Brand is approved ✅
- Brand is rejected ❌ (rare, usually formatting issues)
- Campaign is approved ✅
- Campaign has issues ⚠️

---

## Part 5: Troubleshooting

### Brand Still "Pending" After 3 Days

**Action:** Contact Telnyx support at https://telnyx.com/support
- Provide brand ID: `brand_01arwz60q6jy57ydp2gzh8e5m0`
- Include company EIN
- Mention shared platform brand

### SMS Delivery Still Low (Below 65%)

**Check:**
1. ✅ Brand ID environment variable is set
2. ✅ Brand status is "VERIFIED" in Telnyx dashboard
3. ✅ Backend logs show correct brand ID is being used
4. ✅ Phone numbers are linked to messaging profile

**If all checks pass:**
- Delivery rate depends on sender reputation with carriers
- Monitor first 100 SMS to establish reputation
- After 100+ SMS, delivery should stabilize at 65%

### SMS Being Rejected with "Invalid brand ID"

**Cause:** Brand ID format is wrong or doesn't exist
**Fix:**
1. Copy brand ID directly from Telnyx dashboard (no typos)
2. Make sure it starts with `brand_`
3. Verify environment variable matches exactly

---

## Part 6: Code Changes Summary

The following code files were updated to support shared brand:

### `backend/src/services/telnyx.service.ts`

**Function:** `sendSMS()`

**Change:** Added platform brand ID to SMS payload for shared brand churches

```typescript
if (church.usingSharedBrand) {
  // Using platform's shared brand (65% delivery)
  const platformBrandId = process.env.TELNYX_PLATFORM_BRAND_ID;
  if (platformBrandId) {
    payload.brand_id = platformBrandId;
    console.log(`   Using shared platform brand: ${platformBrandId}`);
  } else {
    console.warn(`   ⚠️ Platform brand ID not configured. Sending without brand ID.`);
  }
} else if (!church.usingSharedBrand && church.dlcBrandId) {
  // Using church's personal 10DLC brand (99% delivery)
  payload.brand_id = church.dlcBrandId;
  console.log(`   Using personal 10DLC brand: ${church.dlcBrandId}`);
}
```

### `backend/src/services/telnyx-mms.service.ts`

**Function:** `sendMMS()`

**Change:** Added platform brand ID to MMS payload for shared brand churches

```typescript
if (church.usingSharedBrand) {
  // Using platform's shared brand (65% delivery)
  const platformBrandId = process.env.TELNYX_PLATFORM_BRAND_ID;
  if (platformBrandId) {
    payload.brand_id = platformBrandId;
  }
} else if (!church.usingSharedBrand && church.dlcBrandId) {
  // Using church's personal 10DLC brand (99% delivery)
  payload.brand_id = church.dlcBrandId;
}
```

---

## Part 7: Architecture - What Happens After Setup

### Shared Brand Church - SMS Flow

```
1. Church selects "Standard Delivery" in Settings
   → wantsPremiumDelivery = false
   → dlcStatus = "shared_brand"
   → deliveryRate = 0.65

2. Church purchases phone number
   → Phone linked to platform's messaging profile
   → No Telnyx brand registration triggered
   → Ready immediately

3. Church sends SMS
   → Backend checks: usingSharedBrand = true
   → Reads: TELNYX_PLATFORM_BRAND_ID from env
   → Adds brand_id to SMS payload
   → Sends to Telnyx
   → Telnyx routes through shared brand
   → ~65% delivery rate

4. Carriers receive SMS
   → Check: Is this from TCR-verified brand?
   → Yes: Koinonia SMS Platform (brand_xxxxx)
   → Brand verified ✅
   → Some filtering but mostly delivered
   → Result: 65% delivery
```

### Premium 10DLC Church - SMS Flow

```
1. Church selects "Premium 10DLC" in Settings
   → wantsPremiumDelivery = true
   → Enters EIN + business info
   → dlcStatus = "pending"

2. 10DLC registration job runs
   → Submits brand to Telnyx
   → Brand gets unique ID (church's own)
   → Wait 1-2 days for TCR approval

3. Brand approved
   → dlcStatus = "approved"
   → Campaign auto-created
   → deliveryRate = 0.99

4. Church sends SMS
   → Backend checks: usingSharedBrand = false
   → Reads: church.dlcBrandId (their own)
   → Adds brand_id to SMS payload
   → Sends to Telnyx
   → Telnyx routes through church's brand
   → ~99% delivery rate

5. Carriers receive SMS
   → Check: Is this from TCR-verified brand?
   → Yes: [Church Name] (brand_yyyyy)
   → Brand individually verified ✅
   → No filtering, high trust
   → Result: 99% delivery
```

---

## Deployment Checklist

- [ ] Platform brand created in Telnyx dashboard
- [ ] Brand status is "VERIFIED"
- [ ] Brand ID copied
- [ ] Environment variable `TELNYX_PLATFORM_BRAND_ID` set in:
  - [ ] Development (`.env`)
  - [ ] Staging (if applicable)
  - [ ] Production
- [ ] Backend code deployed (commits d698d20 + SMS updates)
- [ ] Test SMS sent from shared brand church
- [ ] Backend logs show correct brand ID
- [ ] SMS delivery verified

---

## Summary

**What's Done:**
✅ Code updated to use platform brand ID for shared brand SMS
✅ Environment variable support added
✅ Error handling for missing brand ID
✅ Logging to verify brand is being used

**What You Need to Do:**
❌ Create brand in Telnyx dashboard
❌ Get brand ID
❌ Set environment variable
❌ Test SMS delivery

**Timeline:**
- Create brand: 5 minutes
- Telnyx verification: 1-3 days
- Set environment variable: 2 minutes
- Deploy: Immediate
- Test: 5 minutes

**Support:**
If brand verification takes longer than 3 days, contact Telnyx support with:
- Brand ID
- Company EIN
- Mention it's for a multi-tenant SMS platform

---

**Next Steps:**
1. Create the Telnyx brand using Part 1
2. Get the brand ID
3. Set `TELNYX_PLATFORM_BRAND_ID` environment variable
4. Deploy code (if not already done)
5. Test SMS from shared brand church
6. Monitor delivery metrics

Let me know when brand is created and I can help verify the setup!
