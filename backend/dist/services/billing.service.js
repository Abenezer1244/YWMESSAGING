import { prisma } from '../lib/prisma.js';
import { PLANS } from '../config/plans.js';
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
export async function recordSMSUsage(churchId, status = 'sent', messageRecipientId) {
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
    }
    catch (error) {
        console.error('Failed to record SMS usage:', error);
        throw new Error(`Billing error: ${error.message}`);
    }
}
/**
 * Get SMS usage summary for a church within a date range
 */
export async function getSMSUsageSummary(churchId, startDate, endDate) {
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
    }
    catch (error) {
        console.error('Failed to get SMS usage summary:', error);
        throw new Error(`Billing error: ${error.message}`);
    }
}
/**
 * Calculate total cost for a batch of messages
 */
export function calculateBatchCost(messageCount) {
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
export async function getCurrentPlan(churchId) {
    try {
        // Try cache first
        const cached = await getCached(CACHE_KEYS.churchPlan(churchId));
        if (cached) {
            return cached;
        }
        // Cache miss, query database
        const church = await prisma.church.findUnique({
            where: { id: churchId },
            select: { subscriptionStatus: true },
        });
        const status = church?.subscriptionStatus;
        const plan = status || 'trial';
        // Store in cache (1 hour TTL)
        await setCached(CACHE_KEYS.churchPlan(churchId), plan, CACHE_TTL.LONG);
        return plan;
    }
    catch (error) {
        console.error('Failed to get current plan:', error);
        return 'trial';
    }
}
/**
 * Get plan limits for a church (uses config/plans.ts)
 */
export function getPlanLimits(plan) {
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
export async function getUsage(churchId) {
    try {
        // Try cache first
        const cached = await getCached(CACHE_KEYS.billingUsage(churchId));
        if (cached) {
            return cached;
        }
        const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
        // Run all count queries in parallel (instead of sequentially)
        const [branchCount, memberCount, coAdminCount, messageCount] = await Promise.all([
            prisma.branch.count({
                where: { churchId },
            }),
            prisma.member.count({
                where: {
                    groups: {
                        some: {
                            group: { churchId },
                        },
                    },
                },
            }),
            prisma.admin.count({
                where: { churchId, role: 'CO_ADMIN' },
            }),
            prisma.message.count({
                where: {
                    churchId,
                    createdAt: { gte: startOfMonth },
                },
            }),
        ]);
        const usage = {
            branches: branchCount,
            members: memberCount,
            messagesThisMonth: messageCount,
            coAdmins: coAdminCount,
        };
        // Cache for 30 minutes
        await setCached(CACHE_KEYS.billingUsage(churchId), usage, CACHE_TTL.MEDIUM);
        return usage;
    }
    catch (error) {
        console.error('Failed to get usage:', error);
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
export async function isOnTrial(churchId) {
    try {
        const church = await prisma.church.findUnique({
            where: { id: churchId },
            select: { subscriptionStatus: true, trialEndsAt: true },
        });
        if (!church)
            return false;
        return (church.subscriptionStatus === 'trial' &&
            church.trialEndsAt > new Date());
    }
    catch (error) {
        console.error('Failed to check trial status:', error);
        return false;
    }
}
/**
 * Invalidate billing cache when subscription changes
 * Called after plan changes, usage updates, etc.
 */
export async function invalidateBillingCache(churchId) {
    await Promise.all([
        invalidateCache(CACHE_KEYS.churchPlan(churchId)),
        invalidateCache(CACHE_KEYS.billingUsage(churchId)),
        invalidateCache(CACHE_KEYS.churchAll(churchId)), // Also invalidate any other church caches
    ]);
    console.log(`[Billing] Cache invalidated for church ${churchId}`);
}
//# sourceMappingURL=billing.service.js.map