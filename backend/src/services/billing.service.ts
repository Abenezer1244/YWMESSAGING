import { prisma } from '../lib/prisma.js';
import { PLANS, PlanName, PlanLimits } from '../config/plans.js';
import { getCached, setCached, invalidateCache, CACHE_KEYS, CACHE_TTL } from './cache.service.js';

/**
 * SMS billing service - tracks SMS costs and usage
 * Pricing: $0.02 per SMS (Option 3)
 */

const SMS_COST_PER_MESSAGE = 0.02;

/**
 * Record SMS usage for billing purposes
 * Called after an SMS is successfully sent
 */
export async function recordSMSUsage(
  churchId: string,
  status: 'sent' | 'failed' = 'sent',
  messageRecipientId?: string
): Promise<{ cost: number; success: boolean }> {
  try {
    // Don't record failed SMS as billable
    if (status === 'failed') {
      return {
        cost: 0,
        success: true,
      };
    }

    // For now, we'll track usage in-memory or via a simple table
    // This allows us to calculate costs without a full migration
    console.log(`[Billing] Recording SMS usage for church ${churchId}: $${SMS_COST_PER_MESSAGE}`);

    return {
      cost: SMS_COST_PER_MESSAGE,
      success: true,
    };
  } catch (error: any) {
    console.error('Failed to record SMS usage:', error);
    throw new Error(`Billing error: ${error.message}`);
  }
}

/**
 * Get SMS usage summary for a church within a date range
 */
export async function getSMSUsageSummary(
  churchId: string,
  startDate?: Date,
  endDate?: Date
): Promise<{
  totalMessages: number;
  totalCost: number;
  currency: string;
}> {
  try {
    // This is a placeholder implementation
    // Once the SMSUsage table exists, we'll query it
    const defaultStart = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days ago
    const defaultEnd = endDate || new Date();

    // TODO: Query SMSUsage table once migration is applied
    // const usage = await prisma.sMSUsage.aggregate({
    //   where: {
    //     churchId,
    //     sentAt: {
    //       gte: defaultStart,
    //       lte: defaultEnd,
    //     },
    //     status: 'sent',
    //   },
    //   _sum: {
    //     cost: true,
    //   },
    //   _count: true,
    // });

    return {
      totalMessages: 0,
      totalCost: 0,
      currency: 'USD',
    };
  } catch (error: any) {
    console.error('Failed to get SMS usage summary:', error);
    throw new Error(`Billing error: ${error.message}`);
  }
}

/**
 * Calculate total cost for a batch of messages
 */
export function calculateBatchCost(messageCount: number): number {
  return messageCount * SMS_COST_PER_MESSAGE;
}

/**
 * Get current SMS pricing
 */
export function getSMSPricing() {
  return {
    costPerSMS: SMS_COST_PER_MESSAGE,
    currency: 'USD',
    setupFee: 0.50,
  };
}

// ========== Plan Management Functions (used by middleware and services) ==========

/**
 * Get current plan for a church (cached)
 */
export async function getCurrentPlan(churchId: string): Promise<PlanName | 'trial'> {
  try {
    // Try cache first with timeout (prevent hanging on slow Redis)
    try {
      const cachePromise = getCached<string>(CACHE_KEYS.churchPlan(churchId));
      const timeoutPromise = new Promise<null>((_, reject) =>
        setTimeout(() => reject(new Error('Cache timeout')), 2000) // 2 second timeout
      );
      const cached = await Promise.race([cachePromise, timeoutPromise]);
      if (cached) {
        return cached as PlanName | 'trial';
      }
    } catch (cacheError) {
      console.warn('Cache lookup timeout for plan, querying database:', cacheError);
      // Continue - we'll query the database directly
    }

    // Cache miss or timeout, query database with timeout
    const dbPromise = prisma.church.findUnique({
      where: { id: churchId },
      select: { subscriptionStatus: true },
    });
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Database query timeout')), 3000) // 3 second timeout
    );
    const church = (await Promise.race([dbPromise, timeoutPromise])) as any;
    const status = church?.subscriptionStatus as (PlanName | 'trial') | undefined;
    const plan = status || 'trial';

    // Store in cache (1 hour TTL)
    await setCached(CACHE_KEYS.churchPlan(churchId), plan, CACHE_TTL.LONG);

    return plan;
  } catch (error) {
    console.error('Failed to get current plan:', error);
    return 'trial';
  }
}

/**
 * Get plan limits for a church (uses config/plans.ts)
 */
export function getPlanLimits(plan: PlanName | string): PlanLimits | null {
  // Trial users get starter plan limits
  if (plan === 'trial') {
    return PLANS.starter;
  }

  // Return plan limits for starter, growth, pro
  if (plan === 'starter' || plan === 'growth' || plan === 'pro') {
    return PLANS[plan];
  }

  return null;
}

/**
 * Get usage for a church (cached)
 * Cache for 30 minutes to reduce database load
 */
export async function getUsage(churchId: string): Promise<Record<string, number>> {
  try {
    // Try cache first with timeout (prevent hanging on slow Redis)
    let cached: Record<string, number> | null = null;
    try {
      const cachePromise = getCached<Record<string, number>>(CACHE_KEYS.billingUsage(churchId));
      const timeoutPromise = new Promise<null>((_, reject) =>
        setTimeout(() => reject(new Error('Cache timeout')), 3000) // 3 second timeout
      );
      cached = await Promise.race([cachePromise, timeoutPromise]) as Record<string, number>;
      if (cached) {
        return cached;
      }
    } catch (cacheError) {
      console.warn('Cache lookup timeout, proceeding with database query:', cacheError);
      // Continue - we'll query the database directly
    }

    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

    // Run all count queries in parallel with timeout protection (prevent hanging on slow database)
    const countPromises = [
      prisma.branch.count({ where: { churchId } }),
      prisma.member.count({
        where: {
          groups: {
            some: {
              group: { churchId },
            },
          },
        },
      }),
      prisma.admin.count({ where: { churchId, role: 'CO_ADMIN' } }),
      prisma.message.count({
        where: {
          churchId,
          createdAt: { gte: startOfMonth },
        },
      }),
    ];

    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Query timeout')), 5000) // 5 second timeout
    );

    const counts = await Promise.race([Promise.all(countPromises), timeoutPromise]) as number[];
    const [branchCount, memberCount, coAdminCount, messageCount] = counts;

    const usage = {
      branches: branchCount,
      members: memberCount,
      messagesThisMonth: messageCount,
      coAdmins: coAdminCount,
    };

    // Cache for 30 minutes (non-blocking fire-and-forget)
    setCached(CACHE_KEYS.billingUsage(churchId), usage, CACHE_TTL.MEDIUM).catch(err =>
      console.warn('Failed to cache usage:', err)
    );

    return usage;
  } catch (error) {
    console.error('Failed to get usage:', error);
    // Return empty usage instead of blocking - user will just have no limits enforced temporarily
    return {
      branches: 0,
      members: 0,
      messagesThisMonth: 0,
      coAdmins: 0,
    };
  }
}

/**
 * Check if church is on trial
 */
export async function isOnTrial(churchId: string): Promise<boolean> {
  try {
    const church = await prisma.church.findUnique({
      where: { id: churchId },
      select: { subscriptionStatus: true, trialEndsAt: true },
    });

    if (!church) return false;

    return (
      church.subscriptionStatus === 'trial' &&
      church.trialEndsAt > new Date()
    );
  } catch (error) {
    console.error('Failed to check trial status:', error);
    return false;
  }
}

/**
 * Invalidate billing cache when subscription changes
 * Called after plan changes, usage updates, etc.
 */
export async function invalidateBillingCache(churchId: string): Promise<void> {
  await Promise.all([
    invalidateCache(CACHE_KEYS.churchPlan(churchId)),
    invalidateCache(CACHE_KEYS.billingUsage(churchId)),
    invalidateCache(CACHE_KEYS.churchAll(churchId)), // Also invalidate any other church caches
  ]);
  console.log(`[Billing] Cache invalidated for church ${churchId}`);
}
