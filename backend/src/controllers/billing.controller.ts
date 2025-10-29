import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AccessTokenPayload } from '../utils/jwt.utils.js';
import {
  getUsage,
  getCurrentPlan,
  getPlanLimits,
  getRemainingLimits,
  isOnTrial,
  getTrialDaysRemaining,
} from '../services/billing.service.js';
import {
  createSubscription,
  updateSubscription,
  cancelSubscription,
} from '../services/stripe.service.js';
import { PLANS } from '../config/plans.js';

const prisma = new PrismaClient();

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: AccessTokenPayload;
    }
  }
}

/**
 * GET /api/billing/usage
 * Get current usage for the church
 */
export async function getUsageHandler(req: Request, res: Response) {
  try {
    const churchId = req.user?.churchId;
    if (!churchId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const usage = await getUsage(churchId);
    res.json(usage);
  } catch (error) {
    console.error('Failed to get usage:', error);
    res.status(500).json({ error: 'Failed to get usage' });
  }
}

/**
 * GET /api/billing/plan
 * Get current plan, limits, and remaining capacity
 */
export async function getPlanHandler(req: Request, res: Response) {
  try {
    const churchId = req.user?.churchId;
    if (!churchId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const plan = await getCurrentPlan(churchId);
    const limits = getPlanLimits(plan);
    const usage = await getUsage(churchId);
    const remaining = await getRemainingLimits(churchId);

    res.json({
      plan,
      limits,
      usage,
      remaining,
    });
  } catch (error) {
    console.error('Failed to get plan:', error);
    res.status(500).json({ error: 'Failed to get plan' });
  }
}

/**
 * GET /api/billing/trial
 * Get trial status and days remaining
 */
export async function getTrialHandler(req: Request, res: Response) {
  try {
    const churchId = req.user?.churchId;
    if (!churchId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const onTrial = await isOnTrial(churchId);
    const daysRemaining = await getTrialDaysRemaining(churchId);

    res.json({
      onTrial,
      daysRemaining,
    });
  } catch (error) {
    console.error('Failed to get trial status:', error);
    res.status(500).json({ error: 'Failed to get trial status' });
  }
}

/**
 * POST /api/billing/subscribe
 * Subscribe to a plan with payment method
 * Body: { planName: 'starter' | 'growth' | 'pro', paymentMethodId?: string }
 */
export async function subscribeHandler(req: Request, res: Response) {
  try {
    const churchId = req.user?.churchId;
    if (!churchId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { planName, paymentMethodId } = req.body;

    // Validate plan name
    if (!planName || !(planName in PLANS)) {
      return res.status(400).json({ error: 'Invalid plan name' });
    }

    // Get or create Stripe customer
    const church = await prisma.church.findUnique({
      where: { id: churchId },
    });

    if (!church) {
      return res.status(404).json({ error: 'Church not found' });
    }

    if (!church.stripeCustomerId) {
      return res.status(400).json({
        error: 'Stripe customer not initialized. Please contact support.',
      });
    }

    // TODO: Use actual Stripe price IDs from environment
    // For now, we'll use placeholder IDs
    const priceIds: Record<string, string> = {
      starter: process.env.STRIPE_PRICE_STARTER || 'price_starter',
      growth: process.env.STRIPE_PRICE_GROWTH || 'price_growth',
      pro: process.env.STRIPE_PRICE_PRO || 'price_pro',
    };

    // Create Stripe subscription
    const stripeSubId = await createSubscription(
      church.stripeCustomerId,
      priceIds[planName],
      paymentMethodId
    );

    // Update or create subscription record
    await prisma.subscription.upsert({
      where: { churchId },
      create: {
        churchId,
        stripeSubId,
        plan: planName,
        status: 'active',
      },
      update: {
        stripeSubId,
        plan: planName,
        status: 'active',
        updatedAt: new Date(),
      },
    });

    // Update church subscription status
    await prisma.church.update({
      where: { id: churchId },
      data: {
        subscriptionStatus: 'active',
      },
    });

    res.json({
      success: true,
      plan: planName,
      subscriptionId: stripeSubId,
    });
  } catch (error) {
    console.error('Failed to subscribe:', error);
    res.status(500).json({ error: 'Failed to subscribe' });
  }
}

/**
 * PUT /api/billing/upgrade
 * Upgrade or downgrade to a different plan
 * Body: { newPlan: 'starter' | 'growth' | 'pro' }
 */
export async function upgradeHandler(req: Request, res: Response) {
  try {
    const churchId = req.user?.churchId;
    if (!churchId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { newPlan } = req.body;

    if (!newPlan || !(newPlan in PLANS)) {
      return res.status(400).json({ error: 'Invalid plan name' });
    }

    // Get current subscription
    const subscription = await prisma.subscription.findUnique({
      where: { churchId },
    });

    if (!subscription || !subscription.stripeSubId) {
      return res.status(400).json({ error: 'No active subscription found' });
    }

    // TODO: Use actual Stripe price IDs
    const priceIds: Record<string, string> = {
      starter: process.env.STRIPE_PRICE_STARTER || 'price_starter',
      growth: process.env.STRIPE_PRICE_GROWTH || 'price_growth',
      pro: process.env.STRIPE_PRICE_PRO || 'price_pro',
    };

    // Update Stripe subscription
    await updateSubscription(subscription.stripeSubId, priceIds[newPlan]);

    // Update subscription record
    await prisma.subscription.update({
      where: { churchId },
      data: {
        plan: newPlan,
        updatedAt: new Date(),
      },
    });

    res.json({
      success: true,
      plan: newPlan,
    });
  } catch (error) {
    console.error('Failed to upgrade:', error);
    res.status(500).json({ error: 'Failed to upgrade' });
  }
}

/**
 * DELETE /api/billing/cancel
 * Cancel subscription
 */
export async function cancelHandler(req: Request, res: Response) {
  try {
    const churchId = req.user?.churchId;
    if (!churchId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Get current subscription
    const subscription = await prisma.subscription.findUnique({
      where: { churchId },
    });

    if (!subscription || !subscription.stripeSubId) {
      return res.status(400).json({ error: 'No active subscription found' });
    }

    // Cancel Stripe subscription
    await cancelSubscription(subscription.stripeSubId);

    // Update subscription record
    await prisma.subscription.update({
      where: { churchId },
      data: {
        status: 'cancelled',
        cancelledAt: new Date(),
        updatedAt: new Date(),
      },
    });

    // Update church status
    await prisma.church.update({
      where: { id: churchId },
      data: {
        subscriptionStatus: 'cancelled',
      },
    });

    res.json({
      success: true,
      message: 'Subscription cancelled',
    });
  } catch (error) {
    console.error('Failed to cancel:', error);
    res.status(500).json({ error: 'Failed to cancel subscription' });
  }
}
