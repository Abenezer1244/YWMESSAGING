import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import { handleTelnyx10DLCWebhook } from '../jobs/10dlc-webhooks';

const router = Router();

/**
 * Verify Telnyx webhook signature
 * CRITICAL: Verifies the webhook is actually from Telnyx
 * Prevents attackers from sending fake webhooks
 *
 * Telnyx uses HMAC-SHA256 with the webhook secret
 * See: https://developers.telnyx.com/docs/api/webhooks#authentication
 */
function verifyTelnyxSignature(
  payload: Buffer,
  signature: string
): boolean {
  const secret = process.env.TELNYX_WEBHOOK_SECRET;

  if (!secret) {
    console.error('❌ TELNYX_WEBHOOK_SECRET environment variable not configured');
    console.error('   Webhook signature verification cannot be performed');
    console.error('   This is a CRITICAL security issue - webhooks are UNVERIFIED');
    return false;
  }

  if (!signature) {
    console.warn('⚠️ Webhook missing signature header (x-telnyx-signature-mac)');
    return false;
  }

  try {
    // Telnyx uses HMAC-SHA256 with base64 encoding
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('base64');

    // Use timing-safe comparison to prevent timing attacks
    const signatureMatches = crypto.timingSafeEqual(
      Buffer.from(signature, 'base64'),
      Buffer.from(expectedSignature, 'base64')
    );

    return signatureMatches;
  } catch (error: any) {
    console.error('❌ Webhook signature verification error:', error.message);
    return false;
  }
}

/**
 * Webhook endpoint for Telnyx 10DLC status updates
 * ✅ VERIFIED: Signature validation enabled
 *
 * Telnyx will POST to this endpoint when:
 * - Brand status changes
 * - Campaign status changes
 * - Phone number assignment completes
 */
router.post('/10dlc/status', async (req: Request, res: Response) => {
  try {
    // Get the raw payload and signature
    const payload = req.body;
    const signature = req.headers['x-telnyx-signature-mac'] as string;

    // Log the webhook for debugging (BEFORE signature check)
    console.log(`\n📨 Received Telnyx webhook`);
    console.log(`   Event Type: ${payload.data?.event_type}`);
    console.log(`   Timestamp: ${payload.data?.occurred_at}`);
    console.log(`   Request ID: ${payload.data?.id}`);

    // ✅ CRITICAL SECURITY FIX: Verify webhook signature
    // This ensures the webhook is actually from Telnyx
    const isValidSignature = verifyTelnyxSignature(
      Buffer.from(JSON.stringify(payload)),
      signature
    );

    if (!isValidSignature) {
      console.error('❌ WEBHOOK SIGNATURE VERIFICATION FAILED');
      console.error('   Webhook may be from an attacker - rejecting');
      console.error(`   Event Type: ${payload.data?.event_type}`);
      console.error(`   Request ID: ${payload.data?.id}`);

      // Return 401 Unauthorized
      // Telnyx will retry with valid signature later
      return res.status(401).json({
        error: 'Invalid webhook signature - access denied',
      });
    }

    console.log(`✅ Webhook signature verified - signature valid`);

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
 * ✅ VERIFIED: Signature validation enabled
 * Telnyx will try this if the primary endpoint fails
 */
router.post('/10dlc/status-failover', async (req: Request, res: Response) => {
  try {
    const payload = req.body;
    const signature = req.headers['x-telnyx-signature-mac'] as string;

    console.log(`\n📨 Received Telnyx webhook (FAILOVER)`);
    console.log(`   Event Type: ${payload.data?.event_type}`);
    console.log(`   (Attempting failover endpoint)`);

    // ✅ Verify signature on failover endpoint too
    const isValidSignature = verifyTelnyxSignature(
      Buffer.from(JSON.stringify(payload)),
      signature
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
