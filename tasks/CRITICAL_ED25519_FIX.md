# 🚨 CRITICAL SECURITY FIX: ED25519 Webhook Signature Verification

**Date:** November 19, 2025
**Commit:** 5a57186
**Status:** ✅ DEPLOYED TO PRODUCTION
**Severity:** 🔴 CRITICAL

---

## Summary

**A critical security bug was discovered and fixed in webhook signature verification.**

Previous implementation used **HMAC-SHA256** (WRONG)
Correct implementation uses **ED25519 public key cryptography** (FIXED)

This fix ensures webhooks are properly authenticated using Telnyx's official signing method.

---

## The Problem

During security review, I discovered the webhook signature verification was using the **WRONG algorithm**.

### What Was Implemented (INCORRECT)
```typescript
❌ Algorithm: HMAC-SHA256
❌ Header: x-telnyx-signature-mac
❌ Input: webhook secret (shared key)
❌ Method: Hash-based Message Authentication Code
```

### What Telnyx Actually Uses (OFFICIAL)
```
✅ Algorithm: ED25519 (Public Key Cryptography)
✅ Header: telnyx-signature-ed25519
✅ Header: telnyx-timestamp
✅ Input: Public key (from Telnyx dashboard)
✅ Method: Digital Signature Verification
✅ Format: Base64(timestamp|payload)
```

---

## Impact

### Before Fix (Security Risk)
- ❌ Webhook signature verification was using wrong algorithm
- ❌ Could potentially accept invalid signatures
- ❌ Not following Telnyx's documented security standards
- ⚠️ Public key from Telnyx dashboard was unused

### After Fix (Secure)
- ✅ Proper ED25519 signature verification
- ✅ Only accepts cryptographically valid signatures from Telnyx
- ✅ Follows Telnyx's official security specifications
- ✅ Includes replay attack prevention (5-minute timestamp window)
- ✅ Deployed immediately to production

---

## Technical Details

### ED25519 Verification Process

1. **Get Signature Header**
   ```
   telnyx-signature-ed25519: Base64-encoded signature
   ```

2. **Get Timestamp Header**
   ```
   telnyx-timestamp: Unix timestamp when webhook was created
   ```

3. **Build Signed Message**
   ```
   signedMessage = timestamp | payload
   ```

4. **Verify Signature**
   ```typescript
   const publicKey = crypto.createPublicKey({
     key: publicKeyBuffer,
     format: 'raw',
     type: 'ed25519',
   });

   const isValid = crypto.verify(
     null, // ED25519
     Buffer.from(signedMessage, 'utf-8'),
     publicKey,
     signatureBuffer
   );
   ```

5. **Check Timestamp is Recent**
   - Rejects timestamps older than 5 minutes
   - Prevents replay attacks

---

## Configuration Required

### Set Public Key in Render

```
TELNYX_WEBHOOK_PUBLIC_KEY = ed+eUTZxpqkpY6ySkZYKcvhMuCkWgYQniDA8QMVD0UM=
```

**How to get your public key:**
1. Log into Telnyx Mission Control Portal
2. Go to Webhooks section
3. Find your webhook configuration
4. Copy the ED25519 public key
5. Set it as `TELNYX_WEBHOOK_PUBLIC_KEY` in Render environment

---

## Code Changes

### Location
`backend/src/routes/webhooks.ts`

### Key Changes

**Old Function (REMOVED):**
```typescript
// ❌ WRONG - HMAC-SHA256
function verifyTelnyxSignature(payload: Buffer, signature: string): boolean {
  const secret = process.env.TELNYX_WEBHOOK_SECRET;
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('base64');
  // ...
}
```

**New Function (CORRECT):**
```typescript
// ✅ RIGHT - ED25519
function verifyTelnyxWebhookSignature(
  payload: string,
  signatureHeader: string,
  timestampHeader: string,
  publicKeyBase64: string
): boolean {
  // Decode public key
  const publicKeyBuffer = Buffer.from(publicKeyBase64, 'base64');
  const publicKey = crypto.createPublicKey({
    key: publicKeyBuffer,
    format: 'raw',
    type: 'ed25519',
  } as any);

  // Build signed message: timestamp|payload
  const signedMessage = `${timestampHeader}|${payload}`;
  const signatureBuffer = Buffer.from(signatureHeader, 'base64');

  // Verify using ED25519
  const isValid = crypto.verify(
    null,
    Buffer.from(signedMessage, 'utf-8'),
    publicKey,
    signatureBuffer
  );

  // Check timestamp is recent (prevent replay attacks)
  // ...
}
```

### Applied To
- ✅ Primary endpoint: `/api/webhooks/10dlc/status`
- ✅ Failover endpoint: `/api/webhooks/10dlc/status-failover`

---

## Headers Changed

### Before
```
Header: x-telnyx-signature-mac
Content: HMAC-SHA256 hash
```

### After
```
Header: telnyx-signature-ed25519
Content: ED25519 signature (base64)

Header: telnyx-timestamp
Content: Unix timestamp (seconds)
```

---

## Response Codes

### Valid Webhook
- Status: `202 Accepted`
- Signature: Valid ED25519 signature
- Timestamp: Within 5 minutes of current time
- Action: Webhook is processed

### Invalid Signature
- Status: `401 Unauthorized`
- Reason: Signature verification failed
- Action: Webhook is rejected

### Invalid Timestamp
- Status: `401 Unauthorized`
- Reason: Timestamp is older than 5 minutes
- Action: Webhook is rejected (prevents replay attacks)

### Missing Headers
- Status: `401 Unauthorized`
- Reason: Missing `telnyx-signature-ed25519` or `telnyx-timestamp` header
- Action: Webhook is rejected

### No Public Key Configured
- Status: `500 Internal Server Error`
- Reason: `TELNYX_WEBHOOK_PUBLIC_KEY` environment variable not set
- Action: Webhook is rejected, configuration error logged

---

## Security Improvements

### ED25519 vs HMAC-SHA256

| Aspect | HMAC-SHA256 (Old) | ED25519 (New) |
|--------|-------------------|---------------|
| **Algorithm** | Symmetric key (shared secret) | Asymmetric public/private keys |
| **Key Management** | Secret needs to be stored | Only public key needed |
| **Security** | Lower (shared key leak = compromised) | Higher (private key never shared) |
| **Standard** | Not Telnyx official | ✅ Telnyx official |
| **Verification** | Hash-based | Digital signature |
| **Replay Attack** | No protection | ✅ Timestamp window |

---

## Testing

### Test Valid Signature
```bash
# Telnyx sends webhook with valid ED25519 signature
curl -X POST https://connect-yw-backend.onrender.com/api/webhooks/10dlc/status \
  -H "telnyx-signature-ed25519: <valid-signature>" \
  -H "telnyx-timestamp: $(date +%s)" \
  -d '{...payload...}'

# Response: 202 Accepted
```

### Test Invalid Signature
```bash
# Attacker sends webhook with invalid signature
curl -X POST https://connect-yw-backend.onrender.com/api/webhooks/10dlc/status \
  -H "telnyx-signature-ed25519: invalid" \
  -H "telnyx-timestamp: 1234567890" \
  -d '{...payload...}'

# Response: 401 Unauthorized
```

### Test Old Timestamp
```bash
# Webhook with timestamp older than 5 minutes
curl -X POST https://connect-yw-backend.onrender.com/api/webhooks/10dlc/status \
  -H "telnyx-signature-ed25519: <signature>" \
  -H "telnyx-timestamp: 1000000000" \  # Old timestamp
  -d '{...payload...}'

# Response: 401 Unauthorized - "Webhook timestamp is Xs old"
```

---

## Deployment Status

| Component | Status | Details |
|-----------|--------|---------|
| **Code** | ✅ FIXED | Commit 5a57186 |
| **TypeScript** | ✅ COMPILES | Zero errors |
| **Render Deployment** | ✅ DEPLOYED | Live in production |
| **Configuration** | ⏳ REQUIRED | Need to set `TELNYX_WEBHOOK_PUBLIC_KEY` |

---

## What You Need To Do NOW

### 1. Set Environment Variable in Render

```
TELNYX_WEBHOOK_PUBLIC_KEY = ed+eUTZxpqkpY6ySkZYKcvhMuCkWgYQniDA8QMVD0UM=
```

Steps:
1. Go to Render Dashboard
2. Select `connect-yw-backend` service
3. Click `Settings → Environment`
4. Add new environment variable with your public key
5. Redeploy or restart the service

### 2. Verify in Logs

After setting the variable, check Render logs:
```
✅ ED25519 signature verified successfully
```

If you see this, webhook verification is working!

### 3. If You See Errors

If logs show:
```
❌ CRITICAL: TELNYX_WEBHOOK_PUBLIC_KEY environment variable not configured
```

Your public key is not set. Follow step 1 above.

---

## Rollback (If Needed)

If there are issues with ED25519 verification:

```bash
# Revert to previous version
git revert 5a57186
git push origin main
```

But this is NOT recommended as HMAC-SHA256 was wrong implementation.

---

## References

**Telnyx Official Documentation:**
- https://developers.telnyx.com/docs/api/webhooks#webhook-signature-verification

**What Changed:**
- Algorithm: HMAC-SHA256 → ED25519
- Header: x-telnyx-signature-mac → telnyx-signature-ed25519
- Environment: TELNYX_WEBHOOK_SECRET → TELNYX_WEBHOOK_PUBLIC_KEY
- Added: telnyx-timestamp header validation
- Added: Replay attack prevention (5-minute window)

---

## Summary

✅ **CRITICAL SECURITY BUG FIXED**
✅ **NOW USING CORRECT ED25519 ALGORITHM**
✅ **DEPLOYED TO PRODUCTION**
⏳ **AWAITING ENVIRONMENT VARIABLE CONFIGURATION**

### Next Step
Set `TELNYX_WEBHOOK_PUBLIC_KEY` in Render dashboard with your Telnyx public key.

Webhooks will be properly secured once this is configured.

---

**Commit:** 5a57186
**Date:** November 19, 2025
**Status:** 🔒 PRODUCTION SECURE (pending env config)
