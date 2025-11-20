# Phase 5: Phone Number Assignment & Campaign Suspension
**Status:** ✅ Complete & Deployed
**Latest Commit:** 80dd9c4
**Date:** November 20, 2025

---

## Overview

Phase 5 completes the 10DLC workflow by implementing:
1. **Phone Number Assignment** - Link phone number to campaign
2. **Campaign Suspension Monitoring** - Prevent T-Mobile inactivity fines
3. **Reactivation Handling** - Auto-recovery from suspension

---

## Complete 10DLC Workflow (Phase 1-5)

```
Phase 1: Brand Registration
  Church submits 10DLC form
  ↓
Phase 2: Brand Verification
  Telnyx webhook: BRAND_ADD, BRAND_IDENTITY_STATUS_UPDATE
  Church dlcStatus → "brand_verified"
  ↓
Phase 3: Campaign Auto-Creation
  Automatic campaign creation
  Opt-in/out keywords configured
  dlcStatus → "campaign_pending"
  ↓
Phase 4: Campaign Approval
  Telnyx/TCR/MNO webhooks
  Final status: MNO_PROVISIONED
  dlcStatus → "approved", deliveryRate → 0.99
  ↓
Phase 5: Phone Assignment (NEW)
  Phone number linked to campaign
  dlcNumberAssignedAt set
  🎉 Ready to send SMS at 99% rate
  ↓
[Ongoing] Suspension Monitoring
  If no activity for 15+ days
  Campaign marked DORMANT
  Must re-assign number to reactivate
```

---

## What's New in Phase 5

### Database Schema Updates

**4 New Fields Added to Church Model:**

```typescript
// When phone number successfully assigned to campaign
dlcNumberAssignedAt: DateTime?

// Campaign suspension tracking
dlcCampaignSuspended: Boolean @default(false)
dlcCampaignSuspendedAt: DateTime?
dlcCampaignSuspendedReason: String?
```

### Phone Number Assignment Webhook Handler

**Event Type**: `TCR_PHONE_NUMBER_UPDATE`

**Handles 3 Event Types:**

#### 1. ASSIGNMENT (Success)
```
Webhook: { eventType: "ASSIGNMENT", status: "success", phoneNumber: "+1...", campaignId: "..." }

Actions:
- Set dlcNumberAssignedAt = now()
- Store dlcCampaignId (if not already stored)
- Clear suspension flags (dlcCampaignSuspended = false)
- Log: "🎉 Phone number ready for messaging!"

Result: Church can now send SMS at 99% delivery rate
```

#### 2. ASSIGNMENT (Failure)
```
Webhook: { eventType: "ASSIGNMENT", status: "failed", phoneNumber: "+1...", reason: "..." }

Actions:
- Store failure reason in dlcRejectionReason
- Log error details
- Do NOT update dlcNumberAssignedAt

Next Steps: Admin needs to troubleshoot and retry
```

#### 3. DELETION
```
Webhook: { eventType: "DELETION", phoneNumber: "+1...", campaignId: "..." }

Actions:
- Clear dlcNumberAssignedAt
- Log: "Phone number removed from campaign"

Impact: Church can no longer send SMS from this number
```

#### 4. STATUS_UPDATE
```
Webhook: { eventType: "STATUS_UPDATE", phoneNumber: "+1...", status: "..." }

Actions:
- Just log the update
- No database changes needed

Purpose: Informational, track number status changes
```

### Campaign Suspension Webhook Handler

**Event Type**: `TELNYX_EVENT` with `status: "DORMANT"`

**What Triggers Suspension:**
1. ✅ No SMS activity for 15 consecutive days
2. ✅ No active phone numbers assigned to campaign
3. ✅ Campaign deployed with T-Mobile

**Why?** T-Mobile charges $250/month for inactive campaigns. Telnyx suspends proactively to protect you.

**Webhook Received:**
```json
{
  "type": "TELNYX_EVENT",
  "status": "DORMANT",
  "campaignId": "...",
  "description": "Campaign has been marked as dormant"
}
```

**Actions Taken:**
- Set dlcCampaignSuspended = true
- Set dlcCampaignSuspendedAt = now()
- Set dlcCampaignSuspendedReason = "DORMANT"
- Log: "⚠️ Campaign marked as DORMANT"
- Suggest: "Re-assign phone number to reactivate"

**Reactivation Process:**
1. Assign phone number to campaign (first attempt)
   - May fail with "campaign dormant" error
2. Assign phone number to campaign (second attempt)
   - Should succeed
   - Campaign automatically reactivated
   - dlcNumberAssignedAt set
   - Suspension flags cleared

**Timeline:**
- System checks for inactive campaigns daily
- Campaign suspended after 15 days inactivity
- Takes 1-5 minutes to reactivate after number assignment
- First assignment retry: 1 minute delay
- Second retry: 10 minutes delay
- Third retry: 1 hour delay

---

## Database Migration

### Schema Changes Required

```sql
ALTER TABLE "Church" ADD COLUMN "dlcNumberAssignedAt" TIMESTAMP;
ALTER TABLE "Church" ADD COLUMN "dlcCampaignSuspended" BOOLEAN DEFAULT false;
ALTER TABLE "Church" ADD COLUMN "dlcCampaignSuspendedAt" TIMESTAMP;
ALTER TABLE "Church" ADD COLUMN "dlcCampaignSuspendedReason" TEXT;
```

**Status**: ✅ Ready in Prisma schema (will auto-migrate on next deployment)

---

## Testing Phase 5

### Test Case 5.1: Phone Number Assignment Success

**Prerequisite**: Campaign approved (dlcStatus = "approved")

**Simulate Webhook**:
```json
{
  "data": {
    "event_type": "10dlc.phoneNumberUpdate",
    "payload": {
      "eventType": "ASSIGNMENT",
      "status": "success",
      "phoneNumber": "+18352140020",
      "campaignId": "<your-campaign-id>"
    }
  }
}
```

**Expected Results**:
- [ ] Webhook received (202 status)
- [ ] Render logs show:
  ```
  ✅ Phone number +18352140020 successfully assigned to campaign
  📊 Database updated: dlcNumberAssignedAt
  🎉 Phone number ready for messaging!
  ```
- [ ] Database verification:
  - [ ] dlcNumberAssignedAt = current time
  - [ ] dlcCampaignId = campaign ID
  - [ ] dlcCampaignSuspended = false

**Pass/Fail**: [ ] PASS [ ] FAIL

---

### Test Case 5.2: Phone Number Assignment Failure

**Simulate Webhook**:
```json
{
  "data": {
    "event_type": "10dlc.phoneNumberUpdate",
    "payload": {
      "eventType": "ASSIGNMENT",
      "status": "failed",
      "phoneNumber": "+18352140020",
      "campaignId": "<campaign-id>",
      "reason": "Campaign in dormant state, try again"
    }
  }
}
```

**Expected Results**:
- [ ] Webhook received (202 status)
- [ ] Render logs show:
  ```
  ❌ Phone number assignment failed
  Reason: Campaign in dormant state, try again
  ```
- [ ] Database: dlcRejectionReason contains failure reason
- [ ] dlcNumberAssignedAt remains null (not updated)

**Pass/Fail**: [ ] PASS [ ] FAIL

---

### Test Case 5.3: Campaign Suspension (Dormant)

**Simulate Webhook**:
```json
{
  "type": "TELNYX_EVENT",
  "status": "DORMANT",
  "campaignId": "<your-campaign-id>",
  "description": "Campaign has been marked as dormant"
}
```

**Expected Results**:
- [ ] Webhook received (202 status)
- [ ] Render logs show:
  ```
  ⚠️ Campaign Suspension Alert: DORMANT
  ⚠️ Campaign marked as DORMANT due to inactivity
  Action needed: Re-assign phone number to reactivate
  Note: First assignment might fail, second will succeed
  📊 Database updated: dlcCampaignSuspended=true
  ```
- [ ] Database verification:
  - [ ] dlcCampaignSuspended = true
  - [ ] dlcCampaignSuspendedAt = current time
  - [ ] dlcCampaignSuspendedReason = "DORMANT"

**Pass/Fail**: [ ] PASS [ ] FAIL

---

### Test Case 5.4: Campaign Reactivation

**Process**:
1. Receive suspension webhook (Test 5.3)
2. Attempt phone number assignment (first time)
3. Expected: Might fail (try again)
4. Attempt phone number assignment (second time)
5. Expected: Should succeed

**Simulate Assignment (First Attempt - May Fail)**:
```json
{
  "data": {
    "event_type": "10dlc.phoneNumberUpdate",
    "payload": {
      "eventType": "ASSIGNMENT",
      "status": "failed",
      "phoneNumber": "+18352140020",
      "reason": "Campaign dormant"
    }
  }
}
```

**Simulate Assignment (Second Attempt - Should Succeed)**:
```json
{
  "data": {
    "event_type": "10dlc.phoneNumberUpdate",
    "payload": {
      "eventType": "ASSIGNMENT",
      "status": "success",
      "phoneNumber": "+18352140020",
      "campaignId": "<campaign-id>"
    }
  }
}
```

**Expected Results**:
- [ ] First attempt logged as failure
- [ ] Second attempt succeeds
- [ ] dlcNumberAssignedAt set
- [ ] dlcCampaignSuspended = false
- [ ] dlcCampaignSuspendedAt = null
- [ ] dlcCampaignSuspendedReason = null

**Pass/Fail**: [ ] PASS [ ] FAIL

---

### Test Case 5.5: Phone Number Deletion

**Simulate Webhook**:
```json
{
  "data": {
    "event_type": "10dlc.phoneNumberUpdate",
    "payload": {
      "eventType": "DELETION",
      "phoneNumber": "+18352140020",
      "campaignId": "<campaign-id>"
    }
  }
}
```

**Expected Results**:
- [ ] Webhook received (202 status)
- [ ] Render logs show:
  ```
  🗑️ Phone number +18352140020 removed from campaign
  Phone number unassigned from campaign
  ```
- [ ] Database: dlcNumberAssignedAt = null

**Pass/Fail**: [ ] PASS [ ] FAIL

---

### Test Case 5.6: End-to-End Campaign Lifecycle

**Complete Flow**:
1. ✅ Submit brand registration (Phase 1)
2. ✅ Brand verified (Phase 2)
3. ✅ Campaign auto-created (Phase 3)
4. ✅ Campaign approved (Phase 4)
5. **→ Assign phone number (Phase 5)**
6. Send test SMS
7. Verify 99% delivery

**Expected Progression**:
- [ ] dlcStatus: pending → brand_verified → campaign_pending → approved
- [ ] deliveryRate: 0.65 → 0.99 (at approval)
- [ ] dlcNumberAssignedAt: null → datetime (at assignment)
- [ ] SMS sends successfully

**Pass/Fail**: [ ] PASS [ ] FAIL

---

## Logging Reference

### Phone Assignment Logs

**Success**:
```
✅ Phone number +18352140020 successfully assigned to campaign <id>
✅ Database updated: dlcNumberAssignedAt, dlcCampaignId=<id>
🎉 Phone number ready for messaging!
```

**Failure**:
```
❌ Phone number assignment failed
Reason: <detailed reason>
```

**Deletion**:
```
🗑️ Phone number +18352140020 removed from campaign
Phone number unassigned from campaign
```

### Campaign Suspension Logs

**Suspension Alert**:
```
⚠️ Campaign Suspension Alert: DORMANT
Campaign: <campaign-id>
Reason: Campaign has been marked as dormant
⚠️ Campaign marked as DORMANT due to inactivity
Action needed: Re-assign phone number to reactivate
Note: First assignment might fail, second will succeed
📊 Database updated: dlcCampaignSuspended=true
```

---

## Key Metrics & Constraints

### Telnyx Limits
- **Max 49 numbers per campaign** (T-Mobile limit)
- **Inactivity threshold**: 15 days
- **Reactivation time**: 1-5 minutes
- **Retry delays**: 1 min → 10 min → 1 hour

### System Requirements
- Phone number purchased in advance
- Campaign must be approved (MNO_PROVISIONED)
- Phone must be in same Messaging Profile
- Campaign must be deployed with carriers

---

## Deployment Status

| Component | Status | Commit |
|-----------|--------|--------|
| **Database Schema** | ✅ Updated | 80dd9c4 |
| **Phone Handler** | ✅ Complete | 80dd9c4 |
| **Suspension Handler** | ✅ Complete | 80dd9c4 |
| **Webhook Dispatcher** | ✅ Updated | 80dd9c4 |
| **Build** | ✅ 0 errors | 80dd9c4 |
| **Deployed** | ✅ Live | 80dd9c4 |

---

## Known Limitations & Future Work

### Current Behavior
- ✅ Phone assignment triggers are processed
- ✅ Suspension alerts are monitored
- ✅ Reactivation process is supported
- ⏳ Automatic reactivation not implemented (manual retry needed)

### Future Enhancements
1. **Auto-Reactivation**: Automatically retry phone assignment if suspension detected
2. **Email Notifications**: Notify church when campaign suspended
3. **Admin Dashboard**: Visual status for phone linking
4. **Bulk Assignment**: Assign multiple numbers at once (up to 49)
5. **Usage Monitoring**: Track SMS activity to prevent suspension

---

## Checklist for Production

- [ ] Database migration applied
- [ ] Webhook handler tested with real data
- [ ] Phone number assignment verified
- [ ] Suspension detection working
- [ ] Reactivation process documented
- [ ] Admin trained on reactivation steps
- [ ] Monitoring alerts configured
- [ ] Support runbook created

---

## Quick Reference: Campaign Status Transitions

```
PENDING
  ↓ (after brand verified)
brand_verified
  ↓ (campaign auto-created)
campaign_pending
  ↓ (TCR → TELNYX → MNO approval)
  └→ (intermediate states: TCR_ACCEPTED, TELNYX_ACCEPTED, MNO_PENDING)
  ↓
approved (MNO_PROVISIONED)
  ↓ (phone assigned)
  └→ dlcNumberAssignedAt = datetime
  ↓
[OPTIONAL] Suspension detected
  ↓ (no activity for 15+ days)
  └→ dlcCampaignSuspended = true
  ↓
[RECOVERY] Phone re-assigned
  ↓ (first attempt might fail)
  ↓ (second attempt succeeds)
  └→ dlcCampaignSuspended = false
  ↓
✅ Ready to send SMS
```

---

## Files Modified

| File | Changes | Size |
|------|---------|------|
| backend/prisma/schema.prisma | +4 fields | 4 lines |
| backend/src/jobs/10dlc-webhooks.ts | +2 handlers, +50 lines | 132 lines added |

---

## Next Steps

### Immediate (This Week)
- [ ] Get real phone assignment webhooks from Telnyx
- [ ] Test with actual phone numbers
- [ ] Verify SMS delivery works

### Short Term (Next Week)
- [ ] Verify 99% delivery rate in production
- [ ] Monitor for any suspension alerts
- [ ] Get user feedback on workflow

### Long Term
- [ ] Implement auto-reactivation
- [ ] Add email notifications
- [ ] Create admin dashboard for monitoring
- [ ] Build suspension prevention mechanism

---

**Status**: 🟢 PHASE 5 COMPLETE & DEPLOYED

All phone assignment and suspension handling code is live and ready for testing.

Next: Monitor real Telnyx webhooks for phone assignment events.
