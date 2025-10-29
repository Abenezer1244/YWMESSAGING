import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
const router = Router();
const prisma = new PrismaClient();
/**
 * POST /api/webhooks/stripe
 * Handle Stripe webhook events
 */
export async function handleStripeWebhook(req, res) {
    try {
        const event = req.body;
        const eventType = event.type;
        console.log(`📨 Received Stripe webhook: ${eventType}`);
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
                console.log('✅ Payment intent succeeded:', event.data.object.id);
                break;
            case 'payment_intent.payment_failed':
                console.log('❌ Payment intent failed:', event.data.object.id);
                break;
            default:
                console.log(`⚠️ Unhandled event type: ${eventType}`);
        }
        // Always return 200 to acknowledge receipt
        res.json({ received: true });
    }
    catch (error) {
        console.error('❌ Webhook processing error:', error);
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
            console.log(`⚠️ Church not found for customer: ${stripeCustomerId}`);
            return;
        }
        // Update church subscription status
        await prisma.church.update({
            where: { id: church.id },
            data: {
                subscriptionStatus: 'active',
            },
        });
        console.log(`✅ Payment succeeded for church: ${church.id}`);
    }
    catch (error) {
        console.error('Failed to handle payment succeeded:', error);
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
            console.log(`⚠️ Church not found for customer: ${stripeCustomerId}`);
            return;
        }
        // Update church subscription status
        await prisma.church.update({
            where: { id: church.id },
            data: {
                subscriptionStatus: 'past_due',
            },
        });
        console.log(`❌ Payment failed for church: ${church.id}`);
    }
    catch (error) {
        console.error('Failed to handle payment failed:', error);
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
            console.log(`⚠️ Church not found for customer: ${stripeCustomerId}`);
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
        console.log(`✅ Subscription updated for church: ${church.id}`);
    }
    catch (error) {
        console.error('Failed to handle subscription updated:', error);
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
            console.log(`⚠️ Church not found for customer: ${stripeCustomerId}`);
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
        console.log(`✅ Subscription cancelled for church: ${church.id}`);
    }
    catch (error) {
        console.error('Failed to handle subscription deleted:', error);
    }
}
router.post('/webhooks/stripe', handleStripeWebhook);
export default router;
//# sourceMappingURL=webhook.routes.js.map