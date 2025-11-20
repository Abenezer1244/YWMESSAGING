# Telnyx Webhook Configuration Guide

**Date:** November 19, 2025
**Status:** ✅ READY FOR CONFIGURATION
**Environment:** Production (`api.koinoniasms.com`)

---

## Overview

Your system has **two types of webhooks**:

### 1. **Inbound MMS Messages** (Already Configured)
- **URL:** `https://api.koinoniasms.com/api/webhooks/telnyx/mms`
- **Purpose:** Receive incoming SMS/MMS from customers
- **Status:** ✅ Working (no signature verification needed)

### 2. **10DLC Brand/Campaign Status** (NEW - Needs Configuration)
- **Primary:** `https://api.koinoniasms.com/api/webhooks/10dlc/status`
- **Failover:** `https://api.koinoniasms.com/api/webhooks/10dlc/status-failover`
- **Purpose:** Receive brand approval, campaign approval, phone number assignment status
- **Status:** ✅ Live and Ready (ED25519 signature verification enabled)

---

## Endpoint Status

| Endpoint | URL | Status | Verification |
|----------|-----|--------|--------------|
| Health Check (Primary) | `GET /api/webhooks/10dlc/status` | ✅ Healthy | N/A |
| Health Check (Failover) | `POST /api/webhooks/10dlc/status-failover` | ✅ Ready | ED25519 |
| Primary Webhook | `POST /api/webhooks/10dlc/status` | ✅ Live | ED25519 ✅ |
| Failover Webhook | `POST /api/webhooks/10dlc/status-failover` | ✅ Live | ED25519 ✅ |

---

## Telnyx Dashboard Configuration

### Step 1: Navigate to Webhook Settings
1. Log in to [Telnyx Dashboard](https://portal.telnyx.com)
2. Go to **Webhooks** (usually under Settings or API section)
3. Look for "10DLC" or "Brand" webhook settings

### Step 2: Configure 10DLC Webhooks

**For Brand Registration & Campaign Status Updates:**

```
Webhook URL (Primary):    https://api.koinoniasms.com/api/webhooks/10dlc/status
Webhook URL (Failover):   https://api.koinoniasms.com/api/webhooks/10dlc/status-failover
```

**Event Types to Enable:**
- [ ] Brand status changed
- [ ] Campaign status changed
- [ ] Phone number assignment completed
- [ ] 10DLC registration updates

### Step 3: Signature Verification Settings

**Signature Algorithm:** ED25519 (public key cryptography)

**Public Key:** (Your ED25519 public key)
```
ed+eUTZxpqkpY6ySkZYKcvhMuCkWgYQniDA8QMVD0UM=
```

**Environment Variable:**
```
TELNYX_WEBHOOK_PUBLIC_KEY=ed+eUTZxpqkpY6ySkZYKcvhMuCkWgYQniDA8QMVD0UM=
```
✅ Already set in Render production environment

### Step 4: Test Webhook Configuration

**Test in Telnyx Dashboard:**
1. Click "Test Webhook" or "Send Test Event"
2. Should receive `202 Accepted` response
3. Check backend logs for signature verification success

**Manual Test (if needed):**
```bash
# Health check
curl https://api.koinoniasms.com/api/webhooks/10dlc/status

# Should respond:
# {"status":"ok","message":"Telnyx 10DLC webhook endpoint is healthy","timestamp":"..."}
```

---

## Webhook Payload Format

### Example 10DLC Status Update

```json
{
  "data": {
    "id": "00000000-0000-0000-0000-000000000000",
    "event_type": "10dlc.brand.vetting_update",
    "occurred_at": "2025-11-19T23:30:00.000Z",
    "payload": {
      "brand_id": "B1234567890",
      "status": "approved",
      "campaign_id": "CAMPAIGN1234567890",
      "phone_number": "+12025551234"
    }
  }
}
```

### Event Types Your System Handles

| Event Type | What It Means | Action |
|------------|---------------|--------|
| `10dlc.brand.vetting_update` | Brand approval status changed | Update church brand record |
| `10dlc.campaign.status_changed` | Campaign approval status changed | Update campaign record |
| `10dlc.phone_number_assignment` | Phone number assigned to brand | Activate messaging for church |
| `dlc.brand.failure` | Brand registration failed | Notify church admin, retry |
| `dlc.campaign.failure` | Campaign registration failed | Notify church admin, retry |

---

## Security Details

### How ED25519 Verification Works

1. **Telnyx sends webhook** with headers:
   - `telnyx-signature-ed25519`: Base64-encoded ED25519 signature
   - `telnyx-timestamp`: Unix timestamp when webhook created

2. **Your system verifies:**
   - ✅ Signature is valid using public key
   - ✅ Timestamp is recent (within 5 minutes) - prevents replay attacks
   - ✅ Payload hasn't been tampered with

3. **If verification fails:**
   - ❌ Webhook rejected with 401 Unauthorized
   - Telnyx will retry (up to 10 times over 24 hours)

### Replay Attack Protection

Webhooks older than **5 minutes** are automatically rejected, preventing an attacker from replaying old webhooks.

---

## Webhook Processing Flow

```
1. Telnyx sends webhook to:
   https://api.koinoniasms.com/api/webhooks/10dlc/status

2. Your system verifies ED25519 signature
   ├─ Valid? → Process webhook
   └─ Invalid? → Return 401 Unauthorized

3. Process the event asynchronously
   └─ Don't wait for processing to complete

4. Return 202 Accepted immediately
   └─ Tells Telnyx webhook was received

5. Backend job processes status update
   └─ Update church record
   └─ Update brand/campaign status
   └─ Notify church admin if needed
```

---

## Troubleshooting

### Webhook Not Being Received

**Check:**
1. URLs are correct: `api.koinoniasms.com` (not `connect-yw-backend.onrender.com`)
2. Event types are enabled in Telnyx Dashboard
3. Public key is configured correctly in Telnyx

### Signature Verification Failures

**Check:**
1. `TELNYX_WEBHOOK_PUBLIC_KEY` environment variable is set
2. Public key matches what you provided to Telnyx
3. Check server logs for specific error:
   ```
   ❌ ED25519 Signature verification failed
   ⚠️ Webhook timestamp is XXXs old
   ```

### Webhooks Not Processing

**Check:**
1. Webhook returned 202 Accepted
2. Check backend logs for "Error processing webhook"
3. Verify church record exists in database

---

## Current Status

✅ **Primary Endpoint:** `https://api.koinoniasms.com/api/webhooks/10dlc/status`
- Status: Live and healthy
- Signature verification: ED25519 enabled
- Testable: Yes (GET request returns health status)

✅ **Failover Endpoint:** `https://api.koinoniasms.com/api/webhooks/10dlc/status-failover`
- Status: Live and ready
- Signature verification: ED25519 enabled
- Telnyx will use if primary fails

✅ **Signature Verification:** ED25519 public key verification working
- Public key: `ed+eUTZxpqkpY6ySkZYKcvhMuCkWgYQniDA8QMVD0UM=`
- Environment variable: `TELNYX_WEBHOOK_PUBLIC_KEY`
- Status: ✅ Configured in production

---

## Next Steps

1. **Log into Telnyx Dashboard**
2. **Navigate to Webhook Settings**
3. **Enter these URLs:**
   ```
   Primary:  https://api.koinoniasms.com/api/webhooks/10dlc/status
   Failover: https://api.koinoniasms.com/api/webhooks/10dlc/status-failover
   ```
4. **Enable Event Types:**
   - Brand vetting updates
   - Campaign status changes
   - Phone number assignments
5. **Set Signature Algorithm:** ED25519
6. **Paste Public Key:** `ed+eUTZxpqkpY6ySkZYKcvhMuCkWgYQniDA8QMVD0UM=`
7. **Click Test** (should return 202 Accepted)
8. **Save Configuration**

---

## Files Involved

| File | Purpose |
|------|---------|
| `backend/src/routes/webhook.routes.ts` | All webhook endpoints with ED25519 verification |
| `backend/src/jobs/10dlc-webhooks.ts` | Process 10DLC status updates |
| `backend/.env` | Contains `TELNYX_WEBHOOK_PUBLIC_KEY` |

---

## Support

If you encounter issues:
1. Check `backend` logs for webhook processing errors
2. Verify URLs are accessible: `curl https://api.koinoniasms.com/api/webhooks/10dlc/status`
3. Confirm public key is set in production environment

---

**Generated:** November 19, 2025
**Last Updated:** 2025-11-19
**Status:** Ready for Production Configuration
