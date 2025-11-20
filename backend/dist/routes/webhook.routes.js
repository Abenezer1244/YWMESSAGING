import { Router, raw } from 'express';
import crypto from 'crypto';
import { PrismaClient } from '@prisma/client';
import Stripe from 'stripe';
import { handleTelnyxInboundMMS, handleTelnyxWebhook } from '../controllers/conversation.controller.js';
import { handleTelnyx10DLCWebhook } from '../jobs/10dlc-webhooks.js';
const router = Router();
const prisma = new PrismaClient();
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
    try {
        const publicKeyBuffer = Buffer.from(publicKeyBase64, 'base64');
        const publicKey = crypto.createPublicKey({
            key: publicKeyBuffer,
            format: 'raw',
            type: 'ed25519',
        });
        const signedMessage = `${timestampHeader}|${payload}`;
        const signatureBuffer = Buffer.from(signatureHeader, 'base64');
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
        // Find church by Stripe customer ID
        const church = await prisma.church.findFirst({
            where: { stripeCustomerId },
        });
        if (!church) {
            console.log('⚠️ Church not found for Stripe customer');
            return;
        }
        // Update church subscription status
        await prisma.church.update({
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
        // Find church by Stripe customer ID
        const church = await prisma.church.findFirst({
            where: { stripeCustomerId },
        });
        if (!church) {
            console.log('⚠️ Church not found for Stripe customer');
            return;
        }
        // Update church subscription status
        await prisma.church.update({
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
        // Find church by Stripe customer ID
        const church = await prisma.church.findFirst({
            where: { stripeCustomerId },
        });
        if (!church) {
            console.log('⚠️ Church not found for Stripe customer');
            return;
        }
        // Update subscription record
        await prisma.subscription.update({
            where: { churchId: church.id },
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
        // Find church by Stripe customer ID
        const church = await prisma.church.findFirst({
            where: { stripeCustomerId },
        });
        if (!church) {
            console.log('⚠️ Church not found for Stripe customer');
            return;
        }
        // Update subscription record
        await prisma.subscription.update({
            where: { churchId: church.id },
            data: {
                status: 'cancelled',
                cancelledAt: new Date(),
                updatedAt: new Date(),
            },
        });
        // Update church status back to trial
        await prisma.church.update({
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
        const rawBody = req.body.toString('utf-8');
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
        // Log the webhook for debugging
        console.log(`\n📨 Received Telnyx 10DLC webhook`);
        console.log(`   Event Type: ${payload.eventType}`);
        console.log(`   Brand Name: ${payload.brandName}`);
        console.log(`   Request ID: ${payload.brandId}`);
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
            console.error(`   Event Type: ${payload.eventType}`);
            console.error(`   Brand ID: ${payload.brandId}`);
            return res.status(401).json({
                error: 'Invalid webhook signature - access denied',
            });
        }
        // Signature verified - safe to process
        console.log(`✅ Webhook signature verified (ED25519) - processing`);
        // Validate webhook payload structure
        if (!payload.brandId) {
            console.warn('⚠️ 10DLC webhook missing brandId field');
            return res.status(400).json({
                error: 'Invalid webhook payload: missing brandId field',
            });
        }
        const eventType = payload.eventType;
        if (!eventType) {
            console.warn('⚠️ 10DLC webhook missing eventType');
            return res.status(400).json({
                error: 'Invalid webhook payload: missing eventType',
            });
        }
        // Process the webhook asynchronously (don't block response)
        handleTelnyx10DLCWebhook(payload).catch((error) => {
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
        const rawBody = req.body.toString('utf-8');
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
        console.log(`\n📨 Received Telnyx 10DLC webhook (FAILOVER)`);
        console.log(`   Event Type: ${payload.eventType}`);
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
        if (!payload.data) {
            return res.status(400).json({ error: 'Invalid webhook payload' });
        }
        // Process same as primary
        handleTelnyx10DLCWebhook(payload).catch((error) => {
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
// 10DLC Webhook routes - use express.raw() to capture raw body for ED25519 signature verification
router.post('/webhooks/10dlc/status', raw({ type: 'application/json' }), handleTelnyx10DLCStatus);
router.post('/webhooks/10dlc/status-failover', raw({ type: 'application/json' }), handleTelnyx10DLCStatusFailover);
router.get('/webhooks/10dlc/status', checkTelnyx10DLCHealth);
export default router;
//# sourceMappingURL=webhook.routes.js.map