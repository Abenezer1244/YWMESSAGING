import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import Stripe from 'stripe';
import { handleTelnyxInboundMMS, handleTelnyxWebhook } from '../controllers/conversation.controller.js';
import { handleTelnyx10DLCWebhook } from '../jobs/10dlc-webhooks.js';

const router = Router();
const prisma = new PrismaClient();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2022-11-15' as any,
});

/**
 * POST /api/webhooks/stripe
 * Handle Stripe webhook events
 * SECURITY: Validates webhook signature using Stripe signing secret
 */
export async function handleStripeWebhook(req: Request, res: Response) {
  try {
    const signature = req.headers['stripe-signature'] as string;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!signature || !webhookSecret) {
      console.warn('⚠️ Missing Stripe signature or webhook secret');
      return res.status(400).json({ error: 'Invalid webhook configuration' });
    }

    // Verify webhook signature - CRITICAL SECURITY CHECK
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(
        req.body as string,
        signature,
        webhookSecret
      );
    } catch (err) {
      console.warn(`⚠️ Webhook signature verification failed: ${(err as Error).message}`);
      return res.status(400).json({ error: 'Invalid signature' });
    }

    const eventType = event.type;

    console.log(`📨 Stripe webhook: ${eventType}`);

    switch (eventType) {
      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;

      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.Invoice);
        break;

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
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
  } catch (error) {
    console.error('Webhook processing error');
    // Return 400 to signal error (Stripe will retry)
    res.status(400).json({ error: 'Webhook processing failed' });
  }
}

/**
 * Handle successful invoice payment
 */
async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  try {
    const stripeCustomerId = invoice.customer as string;

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
  } catch (error) {
    console.error('Failed to handle payment succeeded');
  }
}

/**
 * Handle failed invoice payment
 */
async function handlePaymentFailed(invoice: Stripe.Invoice) {
  try {
    const stripeCustomerId = invoice.customer as string;

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
  } catch (error) {
    console.error('Failed to handle payment failed');
  }
}

/**
 * Handle subscription update
 */
async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  try {
    const stripeCustomerId = subscription.customer as string;
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
  } catch (error) {
    console.error('Failed to handle subscription updated');
  }
}

/**
 * Handle subscription deletion
 */
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  try {
    const stripeCustomerId = subscription.customer as string;

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
  } catch (error) {
    console.error('Failed to handle subscription deleted');
  }
}

/**
 * Handle Telnyx 10DLC status webhooks
 * Called when brand/campaign approval status changes
 */
async function handleTelnyx10DLCStatus(req: Request, res: Response) {
  try {
    const payload = req.body;

    // Log the webhook for debugging
    console.log(`\n📨 Received Telnyx 10DLC webhook`);
    console.log(`   Event Type: ${payload.data?.event_type}`);
    console.log(`   Timestamp: ${payload.data?.occurred_at}`);
    console.log(`   Request ID: ${payload.data?.id}`);

    // Validate webhook payload structure
    if (!payload.data) {
      console.warn('⚠️ 10DLC webhook missing data field');
      return res.status(400).json({
        error: 'Invalid webhook payload: missing data field',
      });
    }

    const eventType = payload.data.event_type;
    if (!eventType) {
      console.warn('⚠️ 10DLC webhook missing event_type');
      return res.status(400).json({
        error: 'Invalid webhook payload: missing event_type',
      });
    }

    // TODO: Validate webhook signature for security
    // const isValid = verifyTelnyxSignature(req.headers, payload);
    // if (!isValid) {
    //   return res.status(401).json({ error: 'Invalid signature' });
    // }

    // Process the webhook asynchronously (don't block response)
    handleTelnyx10DLCWebhook(payload).catch((error) => {
      console.error('⚠️ Error processing 10DLC webhook:', error.message);
    });

    // Return 202 Accepted immediately
    // This tells Telnyx we received it and will process it
    console.log(`✅ 10DLC webhook accepted for processing`);
    return res.status(202).json({
      success: true,
      message: 'Webhook accepted for processing',
      eventType,
    });
  } catch (error: any) {
    console.error('❌ 10DLC webhook endpoint error:', error.message);
    // Return 5xx to trigger Telnyx retry
    return res.status(500).json({
      error: 'Internal server error processing webhook',
    });
  }
}

/**
 * Failover webhook endpoint for Telnyx 10DLC
 * Used if primary endpoint fails
 */
async function handleTelnyx10DLCStatusFailover(req: Request, res: Response) {
  try {
    console.log(`\n📨 Received Telnyx 10DLC webhook (FAILOVER)`);
    const payload = req.body;

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
  } catch (error: any) {
    console.error('❌ 10DLC failover webhook error:', error.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Health check for 10DLC webhook endpoint
 */
async function checkTelnyx10DLCHealth(req: Request, res: Response) {
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

// 10DLC Webhook routes
router.post('/webhooks/10dlc/status', handleTelnyx10DLCStatus);
router.post('/webhooks/10dlc/status-failover', handleTelnyx10DLCStatusFailover);
router.get('/webhooks/10dlc/status', checkTelnyx10DLCHealth);

export default router;
