import { Router } from 'express';
import crypto from 'crypto';
import { getRegistryPrisma, getTenantPrisma } from '../lib/tenant-prisma.js';
import Stripe from 'stripe';
import { handleTelnyxInboundMMS, handleTelnyxWebhook } from '../controllers/conversation.controller.js';
import { handleTelnyx10DLCWebhook } from '../jobs/10dlc-webhooks.js';
const router = Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2022-11-15',
});
/**
 * ✅ CRITICAL SECURITY: Verify Telnyx webhook signature using ED25519
 * Telnyx uses public key cryptography (ED25519) to sign webhooks
 * See: https://developers.telnyx.com/docs/api/webhooks#webhook-signature-verification
 */
function verifyTelnyxWebhookSignature(payload, signatureHeader, timestampHeader, publicKeyBase64) {
    if (!signatureHeader || !timestampHeader) {
        console.warn('⚠️ Webhook missing signature or timestamp header');
        return false;
    }
    // Safety check: validate public key is provided and not empty
    if (!publicKeyBase64 || typeof publicKeyBase64 !== 'string' || publicKeyBase64.trim().length === 0) {
        console.error('❌ CRITICAL: Webhook verification failed - public key not configured or empty');
        return false;
    }
    try {
        // CRITICAL FIX: Trim whitespace from public key (environment variables can have trailing newlines)
        const trimmedKey = publicKeyBase64.trim();
        const publicKeyBuffer = Buffer.from(trimmedKey, 'base64');
        // Safety check: ensure decoded key is not empty
        if (publicKeyBuffer.length === 0) {
            console.error('❌ CRITICAL: Decoded public key is empty - base64 decoding produced no bytes');
            return false;
        }
        const signedMessage = `${timestampHeader}|${payload}`;
        const signatureBuffer = Buffer.from(signatureHeader, 'base64');
        // DEBUG: Log signature details for troubleshooting
        console.log(`📋 Webhook Signature Debug:
   Timestamp: ${timestampHeader}
   Payload length: ${payload.length}
   Public key (trimmed): ${trimmedKey.substring(0, 20)}...${trimmedKey.substring(trimmedKey.length - 20)}
   Public key hex length: ${publicKeyBuffer.length}
   Signature hex length: ${signatureBuffer.length}
   Signed message length: ${signedMessage.length}`);
        // Create DER-encoded ED25519 public key (SPKI format per RFC 8410)
        // RFC 8410: "For all algorithms in this document, the parameters field
        // in the algorithmIdentifier MUST be absent, not NULL."
        // Structure: SEQUENCE { AlgorithmIdentifier { OID only }, BIT STRING with key }
        // Total length: 42 bytes (0x2a)
        // - Inner SEQUENCE (AlgorithmIdentifier): 30 05 06 03 2b 65 70 = 7 bytes
        // - BIT STRING: 03 21 00 + 32 bytes = 35 bytes
        // - Total: 7 + 35 = 42 bytes
        // OID for Ed25519 is 1.3.101.112 = 2b 65 70
        const derKey = Buffer.concat([
            Buffer.from('302a', 'hex'), // SEQUENCE, length 42 (was 0x28=40, CRITICAL FIX)
            Buffer.from('3005', 'hex'), // AlgorithmIdentifier SEQUENCE, length 5 (OID only, no NULL)
            Buffer.from('06032b6570', 'hex'), // OBJECT IDENTIFIER for Ed25519
            Buffer.from('0321', 'hex'), // BIT STRING, length 33
            Buffer.from('00', 'hex'), // No unused bits
            publicKeyBuffer, // 32-byte public key
        ]);
        // Create a proper KeyObject for crypto.verify()
        const publicKey = crypto.createPublicKey({
            key: derKey,
            format: 'der',
            type: 'spki', // Subject Public Key Info format
        });
        const isValid = crypto.verify(null, Buffer.from(signedMessage, 'utf-8'), publicKey, signatureBuffer);
        if (!isValid) {
            console.error('❌ ED25519 Signature verification failed');
            return false;
        }
        // Verify timestamp is recent (within 5 minutes) - prevents replay attacks
        const webhookTimestamp = parseInt(timestampHeader, 10);
        const currentTimestamp = Math.floor(Date.now() / 1000);
        const timeDifferenceSeconds = Math.abs(currentTimestamp - webhookTimestamp);
        const MAX_AGE_SECONDS = 5 * 60;
        if (timeDifferenceSeconds > MAX_AGE_SECONDS) {
            console.warn(`⚠️ Webhook timestamp is ${timeDifferenceSeconds}s old (max: ${MAX_AGE_SECONDS}s) - possible replay attack`);
            return false;
        }
        console.log('✅ ED25519 signature verified successfully');
        return true;
    }
    catch (error) {
        console.error('❌ Webhook signature verification error:', error.message);
        return false;
    }
}
/**
 * POST /api/webhooks/stripe
 * Handle Stripe webhook events
 * SECURITY: Validates webhook signature using Stripe signing secret
 */
export async function handleStripeWebhook(req, res) {
    try {
        const signature = req.headers['stripe-signature'];
        const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
        if (!signature || !webhookSecret) {
            console.warn('⚠️ Missing Stripe signature or webhook secret');
            return res.status(400).json({ error: 'Invalid webhook configuration' });
        }
        // Verify webhook signature - CRITICAL SECURITY CHECK
        let event;
        try {
            event = stripe.webhooks.constructEvent(req.body, signature, webhookSecret);
        }
        catch (err) {
            console.warn(`⚠️ Webhook signature verification failed: ${err.message}`);
            return res.status(400).json({ error: 'Invalid signature' });
        }
        const eventType = event.type;
        console.log(`📨 Stripe webhook: ${eventType}`);
        switch (eventType) {
            case 'invoice.payment_succeeded':
                await handlePaymentSucceeded(event.data.object);
                break;
            case 'invoice.payment_failed':
                await handlePaymentFailed(event.data.object);
                break;
            case 'customer.subscription.updated':
                await handleSubscriptionUpdated(event.data.object);
                break;
            case 'customer.subscription.deleted':
                await handleSubscriptionDeleted(event.data.object);
                break;
            case 'payment_intent.succeeded':
                console.log('✅ Payment intent succeeded');
                break;
            case 'payment_intent.payment_failed':
                console.log('❌ Payment intent failed');
                break;
            default:
                console.log(`⚠️ Unhandled event type: ${eventType}`);
        }
        // Always return 200 to acknowledge receipt
        res.json({ received: true });
    }
    catch (error) {
        console.error('Webhook processing error');
        // Return 400 to signal error (Stripe will retry)
        res.status(400).json({ error: 'Webhook processing failed' });
    }
}
/**
 * Handle successful invoice payment
 */
async function handlePaymentSucceeded(invoice) {
    try {
        const stripeCustomerId = invoice.customer;
        const registryPrisma = getRegistryPrisma();
        // Find church by Stripe customer ID
        const church = await registryPrisma.church.findFirst({
            where: { stripeCustomerId },
        });
        if (!church) {
            console.log('⚠️ Church not found for Stripe customer');
            return;
        }
        // Update church subscription status
        await registryPrisma.church.update({
            where: { id: church.id },
            data: {
                subscriptionStatus: 'active',
            },
        });
        console.log('✅ Payment succeeded');
    }
    catch (error) {
        console.error('Failed to handle payment succeeded');
    }
}
/**
 * Handle failed invoice payment
 */
async function handlePaymentFailed(invoice) {
    try {
        const stripeCustomerId = invoice.customer;
        const registryPrisma = getRegistryPrisma();
        // Find church by Stripe customer ID
        const church = await registryPrisma.church.findFirst({
            where: { stripeCustomerId },
        });
        if (!church) {
            console.log('⚠️ Church not found for Stripe customer');
            return;
        }
        // Update church subscription status
        await registryPrisma.church.update({
            where: { id: church.id },
            data: {
                subscriptionStatus: 'past_due',
            },
        });
        console.log('❌ Payment failed');
    }
    catch (error) {
        console.error('Failed to handle payment failed');
    }
}
/**
 * Handle subscription update
 */
async function handleSubscriptionUpdated(subscription) {
    try {
        const stripeCustomerId = subscription.customer;
        const stripeSubId = subscription.id;
        const registryPrisma = getRegistryPrisma();
        // Find church by Stripe customer ID
        const church = await registryPrisma.church.findFirst({
            where: { stripeCustomerId },
        });
        if (!church) {
            console.log('⚠️ Church not found for Stripe customer');
            return;
        }
        // Get tenant-scoped database client for subscription update
        const tenantPrisma = await getTenantPrisma(church.id);
        // Update subscription record (subscription is in tenant schema, one per tenant)
        await tenantPrisma.subscription.updateMany({
            data: {
                stripeSubId,
                status: subscription.status,
                updatedAt: new Date(),
            },
        });
        console.log('✅ Subscription updated');
    }
    catch (error) {
        console.error('Failed to handle subscription updated');
    }
}
/**
 * Handle subscription deletion
 */
async function handleSubscriptionDeleted(subscription) {
    try {
        const stripeCustomerId = subscription.customer;
        const registryPrisma = getRegistryPrisma();
        // Find church by Stripe customer ID
        const church = await registryPrisma.church.findFirst({
            where: { stripeCustomerId },
        });
        if (!church) {
            console.log('⚠️ Church not found for Stripe customer');
            return;
        }
        // Get tenant-scoped database client for subscription update
        const tenantPrisma = await getTenantPrisma(church.id);
        // Update subscription record (subscription is in tenant schema, one per tenant)
        await tenantPrisma.subscription.updateMany({
            data: {
                status: 'cancelled',
                cancelledAt: new Date(),
                updatedAt: new Date(),
            },
        });
        // Update church status back to cancelled
        await registryPrisma.church.update({
            where: { id: church.id },
            data: {
                subscriptionStatus: 'cancelled',
            },
        });
        console.log('✅ Subscription cancelled');
    }
    catch (error) {
        console.error('Failed to handle subscription deleted');
    }
}
/**
 * Handle Telnyx 10DLC status webhooks
 * ✅ VERIFIED: ED25519 signature validation enabled
 * Called when brand/campaign approval status changes
 */
async function handleTelnyx10DLCStatus(req, res) {
    try {
        const signature = req.headers['telnyx-signature-ed25519'];
        const timestamp = req.headers['telnyx-timestamp'];
        // Get raw body from express.raw() middleware (required for ED25519 signature verification)
        // req.body is a Buffer when express.raw() is used as middleware
        // Safety check: ensure req.body is actually a Buffer before calling toString()
        let rawBody;
        if (Buffer.isBuffer(req.body)) {
            rawBody = req.body.toString('utf-8');
        }
        else if (typeof req.body === 'string') {
            rawBody = req.body;
        }
        else {
            console.error('❌ Webhook req.body is neither Buffer nor string:', typeof req.body);
            return res.status(400).json({ error: 'Invalid request format - expected raw JSON' });
        }
        if (!rawBody || !signature || !timestamp) {
            console.error('❌ Missing required webhook data:', {
                hasRawBody: !!rawBody,
                hasSignature: !!signature,
                hasTimestamp: !!timestamp,
            });
            return res.status(400).json({ error: 'Missing required webhook headers or body' });
        }
        let payload;
        try {
            payload = JSON.parse(rawBody);
        }
        catch (parseError) {
            console.error('❌ Invalid JSON in webhook payload:', parseError);
            return res.status(400).json({ error: 'Invalid JSON payload' });
        }
        // Extract the nested payload from Telnyx webhook structure
        // Telnyx sends: { data: { payload: { brandId, eventType, ... } } }
        const innerPayload = payload.data?.payload;
        if (!innerPayload) {
            console.error('❌ Webhook missing data.payload structure');
            return res.status(400).json({
                error: 'Invalid webhook structure: missing data.payload',
            });
        }
        // Log the webhook for debugging
        console.log(`\n📨 Received Telnyx 10DLC webhook`);
        console.log(`   Event Type: ${innerPayload.eventType}`);
        console.log(`   Brand Name: ${innerPayload.brandName}`);
        console.log(`   Brand ID: ${innerPayload.brandId}`);
        // Get public key from environment
        const publicKey = process.env.TELNYX_WEBHOOK_PUBLIC_KEY;
        if (!publicKey) {
            console.error('❌ CRITICAL: TELNYX_WEBHOOK_PUBLIC_KEY environment variable not configured');
            return res.status(500).json({
                error: 'Server configuration error - webhook verification disabled',
            });
        }
        // ✅ CRITICAL SECURITY: Verify webhook signature using ED25519 with raw body
        const isValidSignature = verifyTelnyxWebhookSignature(rawBody, signature, timestamp, publicKey);
        if (!isValidSignature) {
            console.error('❌ WEBHOOK SIGNATURE VERIFICATION FAILED - REJECTING');
            console.error(`   Event Type: ${innerPayload.eventType}`);
            console.error(`   Brand ID: ${innerPayload.brandId}`);
            return res.status(401).json({
                error: 'Invalid webhook signature - access denied',
            });
        }
        // Signature verified - safe to process
        console.log(`✅ Webhook signature verified (ED25519) - processing`);
        // Validate webhook payload structure
        if (!innerPayload.brandId) {
            console.warn('⚠️ 10DLC webhook missing brandId field');
            return res.status(400).json({
                error: 'Invalid webhook payload: missing brandId field',
            });
        }
        const eventType = innerPayload.eventType;
        if (!eventType) {
            console.warn('⚠️ 10DLC webhook missing eventType');
            return res.status(400).json({
                error: 'Invalid webhook payload: missing eventType',
            });
        }
        // Process the webhook asynchronously (don't block response)
        handleTelnyx10DLCWebhook(innerPayload).catch((error) => {
            console.error('⚠️ Error processing 10DLC webhook:', error.message);
        });
        // Return 202 Accepted immediately
        console.log(`✅ 10DLC webhook accepted for processing`);
        return res.status(202).json({
            success: true,
            message: 'Webhook accepted for processing',
            eventType,
        });
    }
    catch (error) {
        console.error('❌ 10DLC webhook endpoint error:', error.message);
        // Return 5xx to trigger Telnyx retry
        return res.status(500).json({
            error: 'Internal server error processing webhook',
        });
    }
}
/**
 * Failover webhook endpoint for Telnyx 10DLC
 * ✅ VERIFIED: ED25519 signature validation enabled
 * Used if primary endpoint fails
 */
async function handleTelnyx10DLCStatusFailover(req, res) {
    try {
        const signature = req.headers['telnyx-signature-ed25519'];
        const timestamp = req.headers['telnyx-timestamp'];
        // Get raw body from express.raw() middleware (required for ED25519 signature verification)
        // req.body is a Buffer when express.raw() is used as middleware
        // Safety check: ensure req.body is actually a Buffer before calling toString()
        let rawBody;
        if (Buffer.isBuffer(req.body)) {
            rawBody = req.body.toString('utf-8');
        }
        else if (typeof req.body === 'string') {
            rawBody = req.body;
        }
        else {
            console.error('❌ [FAILOVER] Webhook req.body is neither Buffer nor string:', typeof req.body);
            return res.status(400).json({ error: 'Invalid request format - expected raw JSON' });
        }
        if (!rawBody || !signature || !timestamp) {
            console.error('❌ [FAILOVER] Missing required webhook data:', {
                hasRawBody: !!rawBody,
                hasSignature: !!signature,
                hasTimestamp: !!timestamp,
            });
            return res.status(400).json({ error: 'Missing required webhook headers or body' });
        }
        let payload;
        try {
            payload = JSON.parse(rawBody);
        }
        catch (parseError) {
            console.error('❌ [FAILOVER] Invalid JSON in webhook payload:', parseError);
            return res.status(400).json({ error: 'Invalid JSON payload' });
        }
        // Extract the nested payload from Telnyx webhook structure
        // Telnyx sends: { data: { payload: { brandId, eventType, ... } } }
        const innerPayload = payload.data?.payload;
        if (!innerPayload) {
            console.error('❌ [FAILOVER] Webhook missing data.payload structure');
            return res.status(400).json({
                error: 'Invalid webhook structure: missing data.payload',
            });
        }
        console.log(`\n📨 Received Telnyx 10DLC webhook (FAILOVER)`);
        console.log(`   Event Type: ${innerPayload.eventType}`);
        console.log(`   Brand ID: ${innerPayload.brandId}`);
        console.log(`   Brand Name: ${innerPayload.brandName}`);
        const publicKey = process.env.TELNYX_WEBHOOK_PUBLIC_KEY;
        if (!publicKey) {
            console.error('❌ TELNYX_WEBHOOK_PUBLIC_KEY not configured');
            return res.status(500).json({ error: 'Server configuration error' });
        }
        // ✅ Verify signature on failover endpoint too (using raw body)
        const isValidSignature = verifyTelnyxWebhookSignature(rawBody, signature, timestamp, publicKey);
        if (!isValidSignature) {
            console.error('❌ FAILOVER WEBHOOK SIGNATURE VERIFICATION FAILED - REJECTING');
            return res.status(401).json({
                error: 'Invalid webhook signature',
            });
        }
        console.log(`✅ Failover webhook signature verified`);
        // Validate payload structure (same as primary endpoint)
        if (!innerPayload.brandId) {
            console.warn('⚠️ [FAILOVER] 10DLC webhook missing brandId field');
            return res.status(400).json({
                error: 'Invalid webhook payload: missing brandId field',
            });
        }
        const eventType = innerPayload.eventType;
        if (!eventType) {
            console.warn('⚠️ [FAILOVER] 10DLC webhook missing eventType');
            return res.status(400).json({
                error: 'Invalid webhook payload: missing eventType',
            });
        }
        // Process same as primary
        handleTelnyx10DLCWebhook(innerPayload).catch((error) => {
            console.error('⚠️ Error processing 10DLC failover webhook:', error.message);
        });
        console.log(`✅ 10DLC failover webhook accepted for processing`);
        return res.status(202).json({
            success: true,
            message: 'Failover webhook accepted',
        });
    }
    catch (error) {
        console.error('❌ 10DLC failover webhook error:', error.message);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
/**
 * Health check for 10DLC webhook endpoint
 */
async function checkTelnyx10DLCHealth(req, res) {
    return res.status(200).json({
        status: 'ok',
        message: 'Telnyx 10DLC webhook endpoint is healthy',
        timestamp: new Date().toISOString(),
    });
}
// Route handlers
router.post('/webhooks/stripe', handleStripeWebhook);
router.post('/webhooks/telnyx/mms', handleTelnyxInboundMMS);
router.post('/webhooks/telnyx/status', handleTelnyxWebhook);
// 10DLC Webhook routes (raw body is captured by app-level middleware before express.json())
router.post('/webhooks/10dlc/status', handleTelnyx10DLCStatus);
router.post('/webhooks/10dlc/status-failover', handleTelnyx10DLCStatusFailover);
router.get('/webhooks/10dlc/status', checkTelnyx10DLCHealth);
export default router;
//# sourceMappingURL=webhook.routes.js.map