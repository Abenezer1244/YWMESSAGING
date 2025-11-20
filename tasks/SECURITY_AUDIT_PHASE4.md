# Security Audit - Phase 4 Enhancements

**Date:** November 19, 2025
**Status:** ⚠️ CRITICAL ISSUES FOUND
**Files Reviewed:**
- backend/src/jobs/10dlc-registration.ts (523 lines)
- backend/src/jobs/10dlc-webhooks.ts (300+ lines)

---

## Executive Summary

**Result:** ❌ **DO NOT DEPLOY** - Critical security issues found

**Issues Found:**
- 🔴 **1 CRITICAL** - Webhook signature verification missing
- 🟠 **1 HIGH** - Information disclosure in error logs
- 🟡 **1 MEDIUM** - Potential error message leakage

**Security Best Practices Followed:**
- ✅ No hardcoded secrets
- ✅ No SQL injection vulnerabilities (Prisma ORM used correctly)
- ✅ No command injection vectors
- ✅ Input validation implemented
- ✅ Proper error handling (non-blocking)

---

## Critical Issues

### 🔴 CRITICAL: Missing Webhook Signature Verification

**Severity:** CRITICAL
**File:** `backend/src/jobs/10dlc-webhooks.ts`
**Function:** `handleTelnyx10DLCWebhook()` (line 11)
**Risk Level:** PRODUCTION BREAKING

#### The Problem

The webhook endpoint accepts and processes Telnyx webhooks **WITHOUT verifying the signature**. This means:

**An attacker can:**
1. Send fake webhooks to your endpoint
2. Approve non-existent 10DLC brands
3. Reject legitimate campaigns
4. Manipulate church approval status
5. Trigger unauthorized campaign creation
6. Downgrade delivery rates

**Attack Example:**
```bash
# Attacker sends fake webhook
curl -X POST https://connect-yw-backend.onrender.com/api/webhooks/10dlc/status \
  -H "Content-Type: application/json" \
  -d '{
    "data": {
      "event_type": "10dlc.campaign.update",
      "payload": {
        "campaignId": "fake-campaign-123",
        "brandId": "any-brand-id",
        "campaignStatus": "MNO_PROVISIONED"
      }
    }
  }'

# Result: Church record updated to "approved" without real approval!
```

#### Why This Is Critical

Churches rely on the approval status to determine:
- Whether they can send at 99% delivery rate vs 65%
- Whether their campaigns are actually ready
- Compliance status with regulations

**False approvals could:**
- Violate FCC regulations (sending without real approval)
- Damage reputation (bounced messages)
- Cause legal liability

#### The Fix

Add webhook signature verification using HMAC-SHA256:

```typescript
import crypto from 'crypto';

/**
 * Verify that webhook actually came from Telnyx
 * CRITICAL: Do this BEFORE processing any webhook data
 */
function verifyTelnyxWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');

  return signature === expectedSignature;
}

export async function handleTelnyx10DLCWebhook(
  payload: any,
  signature: string
): Promise<void> {
  // Get webhook secret from environment
  const webhookSecret = process.env.TELNYX_WEBHOOK_SECRET;
  if (!webhookSecret) {
    throw new Error('TELNYX_WEBHOOK_SECRET not configured');
  }

  // Verify signature BEFORE processing
  const payloadString = JSON.stringify(payload);
  if (!verifyTelnyxWebhookSignature(payloadString, signature, webhookSecret)) {
    console.error('❌ Webhook signature verification failed - rejecting webhook');
    throw new Error('Invalid webhook signature');
  }

  console.log('✅ Webhook signature verified - processing');

  // NOW safe to process webhook
  try {
    const eventType = payload.data?.event_type;
    // ... rest of handler
  } catch (error: any) {
    console.error('❌ Error processing Telnyx webhook:', error.message);
    throw error;
  }
}
```

#### Implementation Steps

1. **Add webhook secret to environment:**
   ```bash
   # Get secret from Telnyx dashboard
   export TELNYX_WEBHOOK_SECRET="your-webhook-signing-secret-from-telnyx"
   ```

2. **Update webhook route to pass signature:**
   ```typescript
   // In your webhook route handler
   app.post('/api/webhooks/10dlc/status', async (req, res) => {
     const signature = req.headers['x-telnyx-signature-ed25519'] as string;
     try {
       await handleTelnyx10DLCWebhook(req.body, signature);
       res.status(202).json({ success: true });
     } catch (error) {
       res.status(400).json({ error: 'Invalid webhook' });
     }
   });
   ```

3. **Test webhook verification:**
   - Generate valid signature from Telnyx
   - Attempt request with invalid signature (should fail)
   - Attempt request with modified payload (should fail)

---

### 🟠 HIGH: Information Disclosure in Error Logs

**Severity:** HIGH
**Files:**
- `backend/src/jobs/10dlc-registration.ts` (lines 327, 403)
**Functions:**
- `registerPersonal10DLCAsync()` (line 327)
- `createCampaignAsync()` (line 403)

#### The Problem

Full Telnyx API responses are logged to console:

```typescript
catch (error: any) {
  const userFriendlyError = mapTelnyxError(error);
  console.error(`❌ Error creating campaign for church ${churchId}:`, userFriendlyError);

  if (error.response?.data) {
    // ❌ THIS LOGS EVERYTHING - DANGEROUS!
    console.error('Full Telnyx response:', JSON.stringify(error.response.data, null, 2));
  }
  // ...
}
```

**What could be exposed:**
- API error messages with internal details
- HTTP headers (could contain authorization tokens in some cases)
- Request data echoed back (email addresses, phone numbers)
- Database field names or internal structure
- Rate limit headers (gives attacker info about API)

**Where logs appear:**
- Render dashboard logs (visible to developers)
- Application monitoring services (if you use any)
- Log aggregation services (if configured)
- Potentially sent to error tracking (Sentry, etc.)

#### Example Leaked Data

```javascript
// This might be in the error.response.data:
{
  "error": "Invalid configuration",
  "detail": [
    {
      "loc": ["body", "email"],
      "msg": "Invalid email format",
      "type": "value_error.email"
    }
  ],
  "requestId": "req_12345abc",  // Could be tracked
  "timestamp": "2025-11-19T12:00:00Z"
}
```

#### The Fix

Only log safe, non-sensitive information:

```typescript
catch (error: any) {
  const userFriendlyError = mapTelnyxError(error);
  console.error(`❌ Error creating campaign for church ${churchId}:`, userFriendlyError);

  // ✅ SAFE: Only log the error code and status code, not full response
  if (error.response?.status) {
    console.error(`   HTTP Status: ${error.response.status}`);
  }

  // ✅ SAFE: Log that error was mapped to user-friendly message
  console.error(`   Mapped Error: ${userFriendlyError}`);

  // ❌ REMOVE THIS: console.error('Full Telnyx response:', JSON.stringify(error.response.data, null, 2));

  // Mark as failed but don't crash the system
  await prisma.church.update({
    where: { id: churchId },
    data: {
      dlcStatus: 'rejected',
      dlcRejectionReason: userFriendlyError,
    },
  }).catch(err => {
    console.error('Failed to update church error status:', err.message);
  });
}
```

#### Locations to Fix

**File: `backend/src/jobs/10dlc-registration.ts`**

1. Line 327 (registerPersonal10DLCAsync error handler):
```typescript
// REMOVE:
if (error.response?.data) {
  console.error('Full Telnyx response:', JSON.stringify(error.response.data, null, 2));
}
```

2. Line 403 (createCampaignAsync error handler):
```typescript
// REMOVE:
if (error.response?.data) {
  console.error('Full Telnyx response:', JSON.stringify(error.response.data, null, 2));
}
```

---

### 🟡 MEDIUM: Potential Error Message Information Leakage

**Severity:** MEDIUM
**File:** `backend/src/jobs/10dlc-registration.ts`
**Function:** `mapTelnyxError()` (line 127)

#### The Problem

The fallback error message uses the raw error:

```typescript
function mapTelnyxError(error: any): string {
  // ... handle known errors ...

  // ⚠️ FALLBACK - Could leak info
  return error.message || 'Unknown error occurred';
}
```

**Risk:** If Telnyx returns an error message like:
- `"PostgreSQL connection timeout on 192.168.1.100:5432"`
- `"JWT token expired: eyJhbGciOiJIUzI1NiIs..."`
- `"Credential validation failed for user admin_12345"`

This information would be stored in the church record and visible in database/logs.

#### The Current Code Analysis

**GOOD NEWS:** This is actually LESS risky than it seems because:

1. Telnyx error messages are typically already sanitized
2. The code has multiple layers of protection:
   - `mapTelnyxError()` tries to handle known statuses first (line 95-112)
   - Falls back to mapping error codes (line 118-121)
   - Only uses error.message as last resort (line 127)

3. The mapped error is stored in database, which is fine:
   ```typescript
   dlcRejectionReason: userFriendlyError,  // This is the mapped message
   ```

#### Recommendation

While the current fallback is acceptable, strengthen it:

```typescript
function mapTelnyxError(error: any): string {
  // ... existing code ...

  // Check for known error codes in response
  if (error.response?.data?.code) {
    const errorCode = parseInt(error.response.data.code);
    return TELNYX_ERROR_CODES[errorCode] || `Telnyx error code ${errorCode}`;
  }

  // ✅ IMPROVED: More generic fallback
  if (error.response?.status) {
    const status = error.response.status;
    if (status >= 500) {
      return 'Telnyx API server error - please try again later';
    }
    if (status >= 400) {
      return 'Invalid request to Telnyx API - please check your information';
    }
  }

  // ✅ SAFE: Generic fallback
  return 'Unable to connect to Telnyx API - please try again later';
}
```

This avoids leaking error.message entirely.

---

## Security Best Practices - PASSED ✅

### 1. SQL Injection Protection ✅
**Status:** PASSED
**Evidence:** Using Prisma ORM throughout, no raw SQL queries

```typescript
// ✅ SAFE - Prisma handles parameterization
const church = await prisma.church.findUnique({
  where: { id: churchId },  // ID is parameterized
  select: { name: true, email: true, id: true }
});

// ✅ SAFE - No raw SQL
await prisma.church.update({
  where: { id: churchId },
  data: { dlcStatus: 'approved' }
});
```

### 2. No Hardcoded Secrets ✅
**Status:** PASSED
**Evidence:** API keys come from environment variables

```typescript
// ✅ SAFE - From environment
const apiKey = process.env.TELNYX_API_KEY;

// ✅ SAFE - Axios Bearer token from env
headers: {
  Authorization: `Bearer ${apiKey}`,
}
```

### 3. Input Validation ✅
**Status:** PASSED
**Evidence:** All user inputs validated before use

```typescript
// ✅ GOOD - Validation before API call
function validateBrandData(church: any): void {
  if (!church.name || church.name.length === 0) {
    throw new Error('Church name is required and cannot be empty');
  }
  if (church.name.length > rules.displayName.max) {
    throw new Error(`Church name cannot exceed ${rules.displayName.max} characters`);
  }
  if (!rules.email.pattern?.test(church.email)) {
    throw new Error(`Email "${church.email}" is not a valid email address`);
  }
}
```

### 4. No Command Injection ✅
**Status:** PASSED
**Evidence:** No system commands executed

**Code Review Result:** No `exec()`, `spawn()`, `shell()` calls found

### 5. HTTPS Only ✅
**Status:** PASSED
**Evidence:** API calls use HTTPS

```typescript
// ✅ SAFE - HTTPS only
baseURL: 'https://api.telnyx.com/v2',
```

### 6. Proper Error Handling ✅
**Status:** PASSED (mostly - see HIGH issue above)
**Evidence:** Errors caught and handled gracefully

```typescript
// ✅ GOOD - Error caught, system doesn't crash
} catch (error: any) {
  const userFriendlyError = mapTelnyxError(error);
  // ... update database with error ...
  // Function returns gracefully
}
```

### 7. No XXS Vulnerabilities ✅
**Status:** PASSED
**Evidence:** Backend code only - no HTML rendering

All data is stored in database or logged as strings. No template rendering or HTML generation in reviewed code.

### 8. Async Operations Non-Blocking ✅
**Status:** PASSED
**Evidence:** Fire-and-forget pattern for long operations

```typescript
// ✅ SAFE - Non-blocking async
createCampaignAsync(church.id).catch((error) => {
  console.error(`⚠️ Error auto-creating campaign:`, error.message);
});
```

### 9. Rate Limiting Resilience ✅
**Status:** PASSED
**Evidence:** Retry logic handles rate limiting

```typescript
// ✅ GOOD - Retries on 429
const isTemporary = statusCode === 429 || (statusCode >= 500 && statusCode < 600);
if (!isTemporary || attempt === maxRetries - 1) {
  throw error; // Don't retry permanent errors
}
```

---

## Summary of Findings

| Issue | Severity | Status | Location | Fix Required |
|-------|----------|--------|----------|--------------|
| Missing Webhook Signature Verification | 🔴 CRITICAL | Not Implemented | 10dlc-webhooks.ts:11 | MUST FIX |
| Information Disclosure in Error Logs | 🟠 HIGH | Present | 10dlc-registration.ts:327,403 | MUST FIX |
| Generic Error Message Fallback | 🟡 MEDIUM | Present | 10dlc-registration.ts:127 | SHOULD FIX |
| SQL Injection Protection | ✅ PASSED | Implemented | All files | No action |
| Hardcoded Secrets | ✅ PASSED | None found | All files | No action |
| Input Validation | ✅ PASSED | Implemented | 10dlc-registration.ts | No action |
| Command Injection | ✅ PASSED | None found | All files | No action |
| HTTPS/TLS | ✅ PASSED | Configured | 10dlc-registration.ts | No action |

---

## Deployment Recommendation

**⛔ DO NOT DEPLOY** until these issues are fixed:

1. **IMMEDIATELY FIX (CRITICAL):**
   - Add webhook signature verification to `10dlc-webhooks.ts`
   - This is a production-breaking security issue

2. **FIX BEFORE DEPLOYMENT (HIGH):**
   - Remove full error response logging from `registerPersonal10DLCAsync()`
   - Remove full error response logging from `createCampaignAsync()`

3. **IMPROVE AFTER DEPLOYMENT (MEDIUM):**
   - Enhance error message fallback in `mapTelnyxError()`
   - Add request/response logging to monitoring system (separate from console logs)

---

## Implementation Priority

```
PRIORITY 1 (Today) - CRITICAL
├─ Webhook signature verification
└─ Get TELNYX_WEBHOOK_SECRET from Telnyx dashboard

PRIORITY 2 (Before Deploy) - HIGH
├─ Remove line 327: console.error('Full Telnyx response:...')
└─ Remove line 403: console.error('Full Telnyx response:...')

PRIORITY 3 (After Deploy) - MEDIUM
├─ Improve mapTelnyxError() fallback
└─ Update test documentation
```

---

## Testing Recommendations

After fixes are applied:

1. **Test Webhook Signature Verification:**
   ```bash
   # Valid signature - should succeed
   curl -X POST https://...com/api/webhooks/10dlc/status \
     -H "x-telnyx-signature-ed25519: valid-signature" \
     -d '{...payload...}'
   # Expected: 202 Accepted

   # Invalid signature - should fail
   curl -X POST https://...com/api/webhooks/10dlc/status \
     -H "x-telnyx-signature-ed25519: invalid-signature" \
     -d '{...payload...}'
   # Expected: 400 Bad Request or 401 Unauthorized
   ```

2. **Test Error Logging:**
   - Trigger API error
   - Check Render logs - should NOT contain full response
   - Should only show user-friendly message

3. **Test Input Validation:**
   - Try registering with invalid email
   - Try registering with name > 100 characters
   - Should fail gracefully

---

## Reference Documentation

- [OWASP Top 10 - 2021](https://owasp.org/Top10/)
- [API Security Best Practices](https://cheatsheetseries.owasp.org/cheatsheets/REST_Security_Cheat_Sheet.html)
- [Webhook Security](https://docs.telnyx.com/development/api/webhooks#webhook-signature-verification)
- [Information Disclosure Risks](https://owasp.org/www-community/Information_Exposure_Through_Error_Messages)

---

**Audit Completed:** November 19, 2025
**Auditor:** AI Security Review
**Status:** ⚠️ CRITICAL ISSUES REQUIRE FIX BEFORE DEPLOYMENT
