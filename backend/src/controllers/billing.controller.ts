import { Request, Response } from 'express';
import * as billingService from '../services/billing.service.js';
import { BillingCycle, getPlanPrice } from '../config/plans.js';
import { getTenantPrisma, getRegistryPrisma } from '../lib/tenant-prisma.js';

/**
 * GET /api/billing/usage
 * Get current usage for the tenant
 */
export async function getUsageHandler(req: Request, res: Response) {
  try {
    const tenantId = (req as any).tenantId;

    if (!tenantId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
      });
    }

    // For now, return placeholder usage data
    // This will be populated from SMSUsage table once migration is applied
    const usage = await billingService.getSMSUsageSummary(tenantId);

    res.json({
      success: true,
      data: {
        smsUsage: {
          messagesSent: usage.totalMessages,
          totalCost: usage.totalCost,
          costPerMessage: 0.02,
          currency: usage.currency,
        },
      },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: (error as Error).message,
    });
  }
}

/**
 * GET /api/billing/plan
 * Get current plan and limits
 */
export async function getPlanHandler(req: Request, res: Response) {
  try {
    const tenantId = (req as any).tenantId;

    if (!tenantId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
      });
    }

    const plan = await billingService.getCurrentPlan(tenantId);
    const limits = billingService.getPlanLimits(plan);

    if (!limits) {
      return res.status(400).json({
        success: false,
        error: 'Invalid plan type',
      });
    }

    const tenantPrisma = await getTenantPrisma(tenantId);
    const usage = await billingService.getUsage(tenantId, tenantPrisma);

    // Calculate remaining capacity
    const getRemainingCapacity = (limit: number, used: number): number => {
      if (limit > 100000) return 999999; // unlimited
      return Math.max(0, limit - used);
    };

    res.json({
      success: true,
      data: {
        plan,
        limits: {
          name: limits.name,
          monthlyPrice: limits.monthlyPrice,
          annualPrice: limits.annualPrice,
          currency: limits.currency,
          branches: limits.branches,
          members: limits.members,
          messagesPerMonth: limits.messagesPerMonth,
          coAdmins: limits.coAdmins,
          features: limits.features,
        },
        usage: {
          branches: usage.branches,
          members: usage.members,
          messagesThisMonth: usage.messagesThisMonth,
          coAdmins: usage.coAdmins,
        },
        remaining: {
          branches: getRemainingCapacity(limits.branches, usage.branches),
          members: getRemainingCapacity(limits.members, usage.members),
          messagesPerMonth: getRemainingCapacity(
            limits.messagesPerMonth,
            usage.messagesThisMonth
          ),
          coAdmins: getRemainingCapacity(limits.coAdmins, usage.coAdmins),
        },
      },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: (error as Error).message,
    });
  }
}

/**
 * GET /api/billing/trial
 * Get trial status
 */
export async function getTrialHandler(req: Request, res: Response) {
  try {
    const tenantId = (req as any).tenantId;

    if (!tenantId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
      });
    }

    res.json({
      success: true,
      data: {
        trialStatus: 'active',
        daysRemaining: 14,
      },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: (error as Error).message,
    });
  }
}

/**
 * POST /api/billing/subscribe
 * Subscribe to a plan after payment succeeds
 */
export async function subscribeHandler(req: Request, res: Response) {
  try {
    const tenantId = (req as any).tenantId;

    if (!tenantId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
      });
    }

    const { planName, billingCycle = 'monthly', paymentIntentId } = req.body;

    if (!planName || !['starter', 'growth', 'pro'].includes(planName)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid plan name',
      });
    }

    if (!['monthly', 'annual'].includes(billingCycle)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid billing cycle (must be monthly or annual)',
      });
    }

    // Update tenant subscription status in registry database
    const registryPrisma = getRegistryPrisma();
    const result = await registryPrisma.church.update({
      where: { id: tenantId },
      data: {
        subscriptionStatus: planName,
      },
      select: { id: true, subscriptionStatus: true },
    });

    // Create or update subscription record with billing cycle (in registry)
    // Note: This assumes Subscription model is in registry, not tenant-specific
    // If Subscription should be in tenant database, update this accordingly

    // Invalidate billing cache
    await billingService.invalidateBillingCache(tenantId);

    res.json({
      success: true,
      data: {
        plan: result.subscriptionStatus,
        billingCycle,
        subscriptionId: result.id,
      },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: (error as Error).message,
    });
  }
}

/**
 * PUT /api/billing/upgrade
 * Upgrade/downgrade plan
 */
export async function upgradeHandler(req: Request, res: Response) {
  try {
    res.status(501).json({
      success: false,
      error: 'Not implemented',
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: (error as Error).message,
    });
  }
}

/**
 * DELETE /api/billing/cancel
 * Cancel subscription
 */
export async function cancelHandler(req: Request, res: Response) {
  try {
    res.status(501).json({
      success: false,
      error: 'Not implemented',
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: (error as Error).message,
    });
  }
}

/**
 * POST /api/billing/payment-intent
 * Create payment intent for subscription
 */
export async function createPaymentIntentHandler(req: Request, res: Response) {
  try {
    const tenantId = (req as any).tenantId;

    if (!tenantId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
      });
    }

    const { planName, billingCycle = 'monthly' } = req.body;

    if (!planName || !['starter', 'growth', 'pro'].includes(planName)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid plan name',
      });
    }

    if (!['monthly', 'annual'].includes(billingCycle)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid billing cycle (must be monthly or annual)',
      });
    }

    // Get plan limits which includes price
    const planLimits = billingService.getPlanLimits(planName);
    if (!planLimits) {
      return res.status(400).json({
        success: false,
        error: 'Plan not found',
      });
    }

    // Get price based on billing cycle
    const amount = getPlanPrice(planName as any, billingCycle as BillingCycle);

    // Get tenant with Stripe customer ID from registry database
    const registryPrisma = getRegistryPrisma();
    const tenant = await registryPrisma.church.findUnique({
      where: { id: tenantId },
      select: { stripeCustomerId: true },
    });

    if (!tenant?.stripeCustomerId) {
      return res.status(400).json({
        success: false,
        error: 'Stripe customer not configured',
      });
    }

    // Return payment intent details
    // The actual payment intent will be created client-side using Stripe.js
    res.json({
      success: true,
      data: {
        clientSecret: null, // Will be created by frontend via Stripe.js
        amount,
        currency: planLimits.currency,
        plan: planName,
        billingCycle,
        savings: billingCycle === 'annual' ? Math.round((planLimits.monthlyPrice * 12 - amount) / 100) : 0,
      },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: (error as Error).message,
    });
  }
}

// ========== SMS-Specific Billing Endpoints ==========

/**
 * GET /api/billing/sms-pricing
 * Get current SMS pricing for the tenant
 */
export async function getSMSPricing(req: Request, res: Response) {
  try {
    const tenantId = (req as any).tenantId;

    if (!tenantId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
      });
    }

    const pricing = billingService.getSMSPricing();

    res.json({
      success: true,
      data: {
        smsPrice: pricing.costPerSMS,
        setupFee: pricing.setupFee,
        currency: pricing.currency,
        pricePerSMS: `$${pricing.costPerSMS.toFixed(4)}`,
        description: 'Option 3 pricing model for Telnyx SMS',
      },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: (error as Error).message,
    });
  }
}

/**
 * GET /api/billing/sms-usage
 * Get SMS usage and costs for the tenant (30-day default)
 */
export async function getSMSUsage(req: Request, res: Response) {
  try {
    const tenantId = (req as any).tenantId;
    const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
    const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;

    if (!tenantId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
      });
    }

    const usage = await billingService.getSMSUsageSummary(tenantId, startDate, endDate);

    res.json({
      success: true,
      data: {
        period: {
          startDate: startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          endDate: endDate || new Date(),
        },
        totalMessagesSent: usage.totalMessages,
        totalCost: usage.totalCost,
        formattedCost: `$${usage.totalCost.toFixed(2)}`,
        costPerMessage: 0.02,
        currency: usage.currency,
      },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: (error as Error).message,
    });
  }
}

/**
 * POST /api/billing/calculate-batch
 * Calculate cost for a batch of messages
 */
export async function calculateBatchCost(req: Request, res: Response) {
  try {
    const tenantId = (req as any).tenantId;
    const { messageCount } = req.body;

    if (!tenantId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
      });
    }

    if (!messageCount || typeof messageCount !== 'number' || messageCount <= 0) {
      return res.status(400).json({
        success: false,
        error: 'messageCount must be a positive number',
      });
    }

    const totalCost = billingService.calculateBatchCost(messageCount);

    res.json({
      success: true,
      data: {
        messageCount,
        costPerMessage: 0.02,
        totalCost,
        formattedTotalCost: `$${totalCost.toFixed(2)}`,
        currency: 'USD',
      },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: (error as Error).message,
    });
  }
}
