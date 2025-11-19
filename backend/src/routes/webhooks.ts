import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import { handleTelnyx10DLCWebhook } from '../jobs/10dlc-webhooks';

const router = Router();

/**
 * ✅ CRITICAL FIX: Verify Telnyx webhook signature using ED25519
 * Telnyx uses public key cryptography (ED25519) to sign webhooks
 *
 * Signature is created as: Base64(timestamp|payload)
 * Headers provided:
 * - telnyx-signature-ed25519: Base64-encoded ED25519 signature
 * - telnyx-timestamp: Unix timestamp when webhook was created
 *
 * See: https://developers.telnyx.com/docs/api/webhooks#webhook-signature-verification
 */
function verifyTelnyxWebhookSignature(
  payload: string,
  signatureHeader: string,
  timestampHeader: string,
  publicKeyBase64: string
): boolean {
  if (!signatureHeader || !timestampHeader) {
    console.warn('⚠️ Webhook missing signature or timestamp header');
    console.warn(`   Signature header: ${signatureHeader ? 'present' : 'MISSING'}`);
    console.warn(`   Timestamp header: ${timestampHeader ? 'present' : 'MISSING'}`);
    return false;
  }

  try {
    // Decode the public key from base64
    const publicKeyBuffer = Buffer.from(publicKeyBase64, 'base64');

    // Create ED25519 public key from raw buffer
    // ED25519 keys are always 32 bytes
    const publicKey = crypto.createPublicKey({
      key: publicKeyBuffer,
      format: 'raw',
      type: 'ed25519',
    } as any); // Using 'any' to avoid TypeScript strictness for older Node.js versions

    // Build the signed message: timestamp|payload
    const signedMessage = `${timestampHeader}|${payload}`;

    // Decode the signature from base64
    const signatureBuffer = Buffer.from(signatureHeader, 'base64');

    // Verify the signature using ED25519
    const isValid = crypto.verify(
      null, // algorithm is null for ED25519
      Buffer.from(signedMessage, 'utf-8'),
      publicKey,
      signatureBuffer
    );

    if (!isValid) {
      console.error('❌ ED25519 Signature verification failed');
      return false;
    }

    // ✅ Optional: Verify timestamp is recent (within 5 minutes)
    // This prevents replay attacks where old webhooks are resent
    const webhookTimestamp = parseInt(timestampHeader, 10);
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const timeDifferenceSeconds = Math.abs(currentTimestamp - webhookTimestamp);
    const MAX_AGE_SECONDS = 5 * 60; // 5 minutes

    if (timeDifferenceSeconds > MAX_AGE_SECONDS) {
      console.warn(
        `⚠️ Webhook timestamp is ${timeDifferenceSeconds}s old (max: ${MAX_AGE_SECONDS}s)`
      );
      console.warn('   This could be a replay attack - rejecting webhook');
      return false;
    }

    console.log('✅ ED25519 signature verified successfully');
    return true;
  } catch (error: any) {
    console.error('❌ Webhook signature verification error:', error.message);
    return false;
  }
}

/**
 * Webhook endpoint for Telnyx 10DLC status updates
 * ✅ VERIFIED: ED25519 signature validation enabled
 *
 * Telnyx will POST to this endpoint when:
 * - Brand status changes
 * - Campaign status changes
 * - Phone number assignment completes
 */
router.post('/10dlc/status', async (req: Request, res: Response) => {
  try {
    // Get headers
    const signature = req.headers['telnyx-signature-ed25519'] as string;
    const timestamp = req.headers['telnyx-timestamp'] as string;
    const payload = req.body;

    // Get public key from environment
    const publicKey = process.env.TELNYX_WEBHOOK_PUBLIC_KEY;

    if (!publicKey) {
      console.error('❌ CRITICAL: TELNYX_WEBHOOK_PUBLIC_KEY environment variable not configured');
      console.error('   Webhook signature verification cannot be performed');
      return res.status(500).json({
        error: 'Server configuration error - webhook verification disabled',
      });
    }

    // Log the webhook for debugging
    console.log(`\n📨 Received Telnyx webhook`);
    console.log(`   Event Type: ${payload.data?.event_type}`);
    console.log(`   Occurred At: ${payload.data?.occurred_at}`);
    console.log(`   Request ID: ${payload.data?.id}`);

    // ✅ CRITICAL SECURITY: Verify webhook signature using ED25519
    const payloadString = JSON.stringify(payload);
    const isValidSignature = verifyTelnyxWebhookSignature(
      payloadString,
      signature,
      timestamp,
      publicKey
    );

    if (!isValidSignature) {
      console.error('❌ WEBHOOK SIGNATURE VERIFICATION FAILED - REJECTING');
      console.error('   Webhook may be from an attacker or tampered with');
      console.error(`   Event Type: ${payload.data?.event_type}`);
      console.error(`   Request ID: ${payload.data?.id}`);

      // Return 401 Unauthorized
      // Telnyx will retry with valid signature if this was legitimate
      return res.status(401).json({
        error: 'Invalid webhook signature - access denied',
      });
    }

    // Signature verified - safe to process
    console.log(`✅ Webhook signature verified (ED25519) - processing`);

    // Validate webhook payload structure
    if (!payload.data) {
      console.warn('⚠️ Webhook missing data field');
      return res.status(400).json({
        error: 'Invalid webhook payload: missing data field',
      });
    }

    const eventType = payload.data.event_type;
    if (!eventType) {
      console.warn('⚠️ Webhook missing event_type');
      return res.status(400).json({
        error: 'Invalid webhook payload: missing event_type',
      });
    }

    // Process the webhook asynchronously
    // Don't wait for it to complete - return 202 immediately
    handleTelnyx10DLCWebhook(payload).catch((error) => {
      console.error('⚠️ Error processing webhook:', error.message);
      // Don't re-throw - webhook handling errors shouldn't cause HTTP errors
      // Telnyx will retry if we don't respond quickly
    });

    // Return 202 Accepted immediately
    // (Telnyx will retry if we don't respond quickly)
    console.log(`✅ Webhook accepted for processing`);
    return res.status(202).json({
      success: true,
      message: 'Webhook accepted for processing',
      eventType,
    });
  } catch (error: any) {
    console.error('❌ Webhook endpoint error:', error.message);

    // Return 5xx to trigger Telnyx retry
    return res.status(500).json({
      error: 'Internal server error processing webhook',
    });
  }
});

/**
 * Failover webhook endpoint
 * ✅ VERIFIED: ED25519 signature validation enabled
 * Telnyx will try this if the primary endpoint fails
 */
router.post('/10dlc/status-failover', async (req: Request, res: Response) => {
  try {
    const signature = req.headers['telnyx-signature-ed25519'] as string;
    const timestamp = req.headers['telnyx-timestamp'] as string;
    const payload = req.body;

    console.log(`\n📨 Received Telnyx webhook (FAILOVER)`);
    console.log(`   Event Type: ${payload.data?.event_type}`);
    console.log(`   (Attempting failover endpoint)`);

    const publicKey = process.env.TELNYX_WEBHOOK_PUBLIC_KEY;
    if (!publicKey) {
      console.error('❌ TELNYX_WEBHOOK_PUBLIC_KEY not configured');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    // ✅ Verify signature on failover endpoint too
    const payloadString = JSON.stringify(payload);
    const isValidSignature = verifyTelnyxWebhookSignature(
      payloadString,
      signature,
      timestamp,
      publicKey
    );

    if (!isValidSignature) {
      console.error('❌ FAILOVER WEBHOOK SIGNATURE VERIFICATION FAILED - REJECTING');
      return res.status(401).json({
        error: 'Invalid webhook signature',
      });
    }

    console.log(`✅ Failover webhook signature verified`);

    if (!payload.data) {
      return res.status(400).json({ error: 'Invalid webhook payload' });
    }

    // Process same as primary endpoint
    handleTelnyx10DLCWebhook(payload).catch((error) => {
      console.error('⚠️ Error processing failover webhook:', error.message);
    });

    console.log(`✅ Failover webhook accepted for processing`);
    return res.status(202).json({
      success: true,
      message: 'Failover webhook accepted',
    });
  } catch (error: any) {
    console.error('❌ Failover webhook endpoint error:', error.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Health check endpoint for webhooks
 * Use this to test if the webhook URL is accessible
 */
router.get('/10dlc/status', (req: Request, res: Response) => {
  return res.status(200).json({
    status: 'ok',
    message: 'Webhook endpoint is healthy',
    timestamp: new Date().toISOString(),
  });
});

export default router;
