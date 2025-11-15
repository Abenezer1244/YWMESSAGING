import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import Stripe from 'stripe';
import { handleTelnyxInboundMMS, handleTelnyxWebhook } from '../controllers/conversation.controller.js';
const router = Router();
const prisma = new PrismaClient();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2022-11-15',
});
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
router.post('/webhooks/stripe', handleStripeWebhook);
router.post('/webhooks/telnyx/mms', handleTelnyxInboundMMS);
router.post('/webhooks/telnyx/status', handleTelnyxWebhook);
export default router;
//# sourceMappingURL=webhook.routes.js.map