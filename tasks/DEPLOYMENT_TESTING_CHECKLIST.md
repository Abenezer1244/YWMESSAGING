# 10DLC Deployment & Testing Checklist
**Status**: All code deployed and live
**Target**: Verify end-to-end 10DLC workflow

---

## Pre-Deployment Verification ✅

- [x] All TypeScript errors resolved (0 errors)
- [x] All commits pushed to main branch
- [x] All code deployed to Render
- [x] Database schema migrations complete
- [x] Environment variables configured:
  - [x] TELNYX_API_KEY (set)
  - [x] TELNYX_WEBHOOK_PUBLIC_KEY (set)
  - [x] WEBHOOK_BASE_URL (set to https://connect-yw-backend.onrender.com)

---

## Phase 1: Brand Registration Testing

### Test Case 1.1: Submit Brand Registration
**Prerequisite**: Church with complete profile (name, email, EIN, address, state, postal code)

**Steps**:
1. Log into dashboard as admin
2. Go to Settings → 10DLC
3. Click "Register for 10DLC"
4. Select entity type (should be NON_PROFIT)
5. Submit form

**Expected Results**:
- [ ] Form submits successfully
- [ ] No errors in Render logs
- [ ] Brand submitted to Telnyx API
- [ ] Check Render logs for:
  ```
  ✅ Brand registered with Telnyx: <brand-id>
  ```
- [ ] Database updated:
  - [ ] dlcBrandId populated
  - [ ] dlcStatus = "pending"
  - [ ] dlcRegisteredAt = current time

**Actual Results**:
```
[Log results here]
```

**Pass/Fail**: [ ] PASS [ ] FAIL

---

### Test Case 1.2: Verify Telnyx Received Brand
**Steps**:
1. Log into Telnyx Mission Control Portal
2. Navigate to 10DLC > Brands
3. Look for church brand name

**Expected Results**:
- [ ] Brand appears in Telnyx dashboard
- [ ] Status shows as "Pending" or similar
- [ ] Brand ID matches dlcBrandId in your database

**Actual Results**:
```
[Log results here]
```

**Pass/Fail**: [ ] PASS [ ] FAIL

---

## Phase 2: Brand Verification Webhook Testing

### Test Case 2.1: Simulate Brand Verification Webhook
**Prerequisite**: Brand submitted and shows in Telnyx dashboard

**Option A: Wait for Real Webhook** (1-7 business days)
- Telnyx processes brand automatically
- You'll see webhook in Render logs

**Option B: Use Telnyx Test Mode**
1. Go to Telnyx Webhooks settings
2. Find 10DLC webhook endpoint
3. Send test webhook with:
   ```json
   {
     "data": {
       "event_type": "10dlc.brand.update",
       "payload": {
         "brandId": "<your-brand-id>",
         "tcrBrandId": "TEST123",
         "brandName": "<church-name>",
         "eventType": "BRAND_IDENTITY_STATUS_UPDATE",
         "status": "success",
         "brandIdentityStatus": "VERIFIED"
       }
     }
   }
   ```

**Expected Results**:
- [ ] Webhook received (check Render logs):
  ```
  ✅ ED25519 signature verified successfully
  📨 Received Telnyx 10DLC webhook
     Event Type: BRAND_IDENTITY_STATUS_UPDATE
     Brand Name: <church-name>
     Brand ID: <brand-id>
  ✅ Brand verified and ready! Setting up campaign...
  ```

- [ ] Database updated:
  - [ ] dlcStatus = "brand_verified"
  - [ ] tcrBrandId populated

- [ ] Campaign auto-creation triggered:
  ```
  📤 Creating campaign for <church-name>
  ```

**Actual Results**:
```
[Log results here]
```

**Pass/Fail**: [ ] PASS [ ] FAIL

---

## Phase 3: Campaign Auto-Creation Testing

### Test Case 3.1: Verify Campaign Created in Telnyx
**Prerequisite**: Brand verification webhook received and processed

**Steps**:
1. Check Render logs for campaign creation success:
   ```
   ✅ Campaign created: <campaign-id>
   ```

2. Log into Telnyx Mission Control
3. Navigate to 10DLC > Campaigns
4. Look for campaign with church name

**Expected Results**:
- [ ] Campaign appears in Telnyx dashboard
- [ ] Campaign status shows "Pending" or similar
- [ ] Campaign ID matches dlcCampaignId in database

**Database Check**:
- [ ] dlcCampaignId populated
- [ ] dlcCampaignStatus = "TCR_PENDING"
- [ ] dlcStatus = "campaign_pending"

**Actual Results**:
```
[Log results here]
```

**Pass/Fail**: [ ] PASS [ ] FAIL

---

### Test Case 3.2: Verify Campaign Settings
**Steps**:
1. In Telnyx dashboard, view campaign details
2. Check the following settings:

**Expected Campaign Configuration**:
- [ ] Use Case: NOTIFICATIONS
- [ ] Opt-in Keywords: START, JOIN
- [ ] Opt-out Keywords: STOP, UNSUBSCRIBE
- [ ] Help Keywords: HELP, INFO
- [ ] Sample Messages: 5 messages provided
- [ ] Description: `<Church Name> Notification Campaign`

**Actual Results**:
```
[Log results here]
```

**Pass/Fail**: [ ] PASS [ ] FAIL

---

## Phase 4: Campaign Approval Webhook Testing

### Test Case 4.1: Simulate Campaign Approval Webhook
**Prerequisite**: Campaign created and visible in Telnyx dashboard

**Option A: Wait for Real Webhook** (1-3 business days)
- Telnyx/TCR/MNO processes campaign
- You'll see webhook in Render logs

**Option B: Use Telnyx Test Mode**
1. Send test webhook with MNO_PROVISIONED status:
   ```json
   {
     "data": {
       "event_type": "10dlc.campaign.update",
       "payload": {
         "campaignId": "<your-campaign-id>",
         "brandId": "<your-brand-id>",
         "eventType": "TCR_CAMPAIGN_UPDATE",
         "campaignStatus": "MNO_PROVISIONED",
         "type": "TCR_CAMPAIGN_UPDATE"
       }
     }
   }
   ```

**Expected Results**:
- [ ] Webhook received (check Render logs):
  ```
  ✅ ED25519 signature verified successfully
  📢 Campaign Update: campaignId=<id>, status=MNO_PROVISIONED
  ✅ Campaign APPROVED and PROVISIONED! Ready to send messages!
  🎉 <church-name> is now approved for 99% delivery rate!
  ```

- [ ] Database updated:
  - [ ] dlcStatus = "approved"
  - [ ] dlcApprovedAt = current time
  - [ ] deliveryRate = 0.99
  - [ ] usingSharedBrand = false

**Actual Results**:
```
[Log results here]
```

**Pass/Fail**: [ ] PASS [ ] FAIL

---

### Test Case 4.2: Verify Phone Number Ready
**Prerequisite**: Campaign approved (dlcStatus = "approved")

**Steps**:
1. Check if phone number was already purchased
2. Verify it's linked to the approved campaign
3. Test sending an SMS

**Expected Results**:
- [ ] Phone number shows in church profile
- [ ] Phone number is "active"
- [ ] SMS can be sent (check chat/messaging interface)
- [ ] Delivery rate shows as 99%

**Test SMS**:
- [ ] Send test message from dashboard
- [ ] Verify it delivers successfully
- [ ] Check delivery status

**Actual Results**:
```
[Log results here]
```

**Pass/Fail**: [ ] PASS [ ] FAIL

---

## Phase 5: Rejection Handling Testing

### Test Case 5.1: Simulate Campaign Rejection
**Purpose**: Verify system handles rejections gracefully

**Steps**:
1. Send test webhook with rejection status:
   ```json
   {
     "data": {
       "event_type": "10dlc.campaign.update",
       "payload": {
         "campaignId": "<campaign-id>",
         "brandId": "<brand-id>",
         "eventType": "TCR_CAMPAIGN_UPDATE",
         "campaignStatus": "TCR_FAILED",
         "failureReasons": "Campaign content violates TCPA guidelines"
       }
     }
   }
   ```

**Expected Results**:
- [ ] Webhook processed
- [ ] Render logs show:
  ```
  ❌ Campaign rejected at TCR_FAILED stage
  ```

- [ ] Database updated:
  - [ ] dlcStatus = "rejected"
  - [ ] dlcRejectionReason populated
  - [ ] dlcCampaignStatus = "TCR_FAILED"

**Actual Results**:
```
[Log results here]
```

**Pass/Fail**: [ ] PASS [ ] FAIL

---

## System Integration Tests

### Test Case 6.1: End-to-End Workflow
**Purpose**: Verify complete workflow from registration to approval

**Steps**:
1. Complete Test Case 1.1 (Brand Registration)
2. Complete Test Case 2.1 (Brand Verification)
3. Complete Test Case 3.1 (Campaign Creation)
4. Complete Test Case 4.1 (Campaign Approval)
5. Complete Test Case 4.2 (Send SMS)

**Expected Results**:
- [ ] All steps complete without errors
- [ ] No gaps in data flow
- [ ] All webhooks processed correctly
- [ ] SMS sends at 99% delivery rate

**Actual Results**:
```
[Summary of all steps and results]
```

**Pass/Fail**: [ ] PASS [ ] FAIL

---

### Test Case 6.2: Error Recovery
**Purpose**: Verify system handles errors gracefully

**Steps**:
1. Verify error logging works
2. Check that errors don't crash the system
3. Verify partial data updates don't break things

**Expected Results**:
- [ ] Errors are logged with full context
- [ ] System continues running after errors
- [ ] Databases remain consistent
- [ ] No orphaned records

**Actual Results**:
```
[Log results here]
```

**Pass/Fail**: [ ] PASS [ ] FAIL

---

## Log Analysis Checklist

### Brand Registration Logs
Check for:
- [ ] No "❌ Missing required field" errors
- [ ] Brand ID returned from Telnyx
- [ ] dlcStatus updated to "pending"

### Webhook Processing Logs
Check for:
- [ ] "✅ ED25519 signature verified successfully"
- [ ] Correct event type (BRAND_ADD, BRAND_IDENTITY_STATUS_UPDATE, etc.)
- [ ] No "❌ Webhook missing" errors
- [ ] Brand/Campaign ID extracted correctly

### Campaign Creation Logs
Check for:
- [ ] "✅ Campaign created:" message
- [ ] Campaign ID populated
- [ ] dlcCampaignStatus = "TCR_PENDING"

### Campaign Approval Logs
Check for:
- [ ] "✅ Campaign APPROVED" message
- [ ] "🎉 99% delivery rate!" message
- [ ] deliveryRate updated to 0.99

---

## Issues Found & Resolutions

| Issue | Severity | Status | Resolution |
|-------|----------|--------|-----------|
| ED25519 crypto.verify() wrong param | 🔴 CRITICAL | ✅ Fixed | Changed 'ed25519' to null |
| Webhook payload nested too deep | 🔴 CRITICAL | ✅ Fixed | Extract data.payload |
| Brand webhook requires brandIdentityStatus | 🟠 HIGH | ✅ Fixed | Make optional, handle event types |
| Campaign response parsing | 🟠 HIGH | ✅ Fixed | Try multiple paths for campaignId |

---

## Final Sign-Off

| Item | Status | Date | Notes |
|------|--------|------|-------|
| Code deployed | ✅ | Nov 20, 2025 | Commit d3af978 |
| TypeScript build | ✅ | Nov 20, 2025 | 0 errors |
| Webhooks live | ✅ | Nov 20, 2025 | Public key configured |
| Ready for testing | ✅ | Nov 20, 2025 | Awaiting real webhooks |

---

## Next Session Tasks

### Immediate
- [ ] Review this checklist with real Telnyx webhooks
- [ ] Mark test cases PASS/FAIL with actual results
- [ ] Log any issues found

### Short Term
- [ ] Verify 99% delivery rate works
- [ ] Test SMS with actual phone numbers
- [ ] Get admin feedback on workflow

### Long Term
- [ ] Add email notifications
- [ ] Create admin dashboard
- [ ] Make sample messages customizable
- [ ] Add phone number auto-assignment

---

**Prepared By**: Claude Code
**Prepared Date**: November 20, 2025
**Status**: 🟢 READY FOR TESTING

All systems deployed and ready. Awaiting real Telnyx webhooks to verify end-to-end workflow.
