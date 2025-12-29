import { PLANS } from '../config/plans.js';
import { getCached, setCached, invalidateCache, CACHE_KEYS, CACHE_TTL } from './cache.service.js';
import { getRegistryPrisma } from '../lib/tenant-prisma.js';
/**
 * SMS billing service - tracks SMS costs and usage
 * Pricing: $0.02 per SMS (Option 3)
 */
const SMS_COST_PER_MESSAGE = 0.02;
/**
 * Record SMS usage for billing purposes
 * Called after an SMS is successfully sent
 */
export async function recordSMSUsage(tenantId, status = 'sent', messageRecipientId) {
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
        console.log(`[Billing] Recording SMS usage for tenant ${tenantId}: $${SMS_COST_PER_MESSAGE}`);
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
 * Get SMS usage summary for a tenant within a date range
 */
export async function getSMSUsageSummary(tenantId, startDate, endDate) {
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
 * Get current plan for a tenant (cached)
 */
export async function getCurrentPlan(tenantId) {
    try {
        // Try cache first with AGGRESSIVE timeout (1 second)
        try {
            const cachePromise = getCached(CACHE_KEYS.churchPlan(tenantId));
            const timeoutPromise = new Promise((_, reject) => setTimeout(() => {
                console.error('[BILLING] getCurrentPlan cache timeout');
                reject(new Error('Cache timeout'));
            }, 1000) // 1 second timeout (AGGRESSIVE)
            );
            const cached = await Promise.race([cachePromise, timeoutPromise]);
            if (cached) {
                return cached;
            }
        }
        catch (cacheError) {
            console.error('[BILLING] Cache error in getCurrentPlan, returning trial immediately:', cacheError);
            // Return trial immediately - don't try database
            return 'trial';
        }
        // Cache miss or timeout, query registry database with AGGRESSIVE timeout (2 seconds)
        const registryPrisma = getRegistryPrisma();
        const dbPromise = registryPrisma.church.findUnique({
            where: { id: tenantId },
            select: { subscriptionStatus: true },
        });
        const timeoutPromise = new Promise((_, reject) => setTimeout(() => {
            console.error('[BILLING] getCurrentPlan database query timeout');
            reject(new Error('Database query timeout'));
        }, 2000) // 2 second timeout (AGGRESSIVE)
        );
        const tenant = (await Promise.race([dbPromise, timeoutPromise]));
        const status = tenant?.subscriptionStatus;
        const plan = status || 'trial';
        // Store in cache (1 hour TTL) - non-blocking
        setCached(CACHE_KEYS.churchPlan(tenantId), plan, CACHE_TTL.LONG).catch(err => console.warn('[BILLING] Failed to cache plan:', err));
        return plan;
    }
    catch (error) {
        console.error('[BILLING] getCurrentPlan failed, returning trial:', error);
        return 'trial';
    }
}
/**
 * Get plan limits for a tenant (uses config/plans.ts)
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
 * Get usage for a tenant (cached)
 * Cache for 30 minutes to reduce database load
 */
export async function getUsage(tenantId, tenantPrisma) {
    try {
        // Try cache first with AGGRESSIVE timeout (1 second)
        let cached = null;
        try {
            const cachePromise = getCached(CACHE_KEYS.billingUsage(tenantId));
            const timeoutPromise = new Promise((_, reject) => setTimeout(() => {
                console.error('[BILLING] getUsage cache timeout');
                reject(new Error('Cache timeout'));
            }, 1000) // 1 second timeout (AGGRESSIVE)
            );
            cached = await Promise.race([cachePromise, timeoutPromise]);
            if (cached) {
                return cached;
            }
        }
        catch (cacheError) {
            console.error('[BILLING] Cache error in getUsage, returning defaults immediately:', cacheError);
            // Return defaults immediately - don't try database
            return {
                branches: 0,
                members: 0,
                messagesThisMonth: 0,
                coAdmins: 0,
            };
        }
        const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
        // Run all count queries in parallel with AGGRESSIVE timeout (2 seconds)
        // No churchId filters - database isolation handles tenant separation
        const countPromises = [
            tenantPrisma.branch.count({}),
            tenantPrisma.admin.count({ where: { role: 'CO_ADMIN' } }),
            tenantPrisma.message.count({
                where: {
                    createdAt: { gte: startOfMonth },
                },
            }),
        ];
        const timeoutPromise = new Promise((_, reject) => setTimeout(() => {
            console.error('[BILLING] getUsage database query timeout');
            reject(new Error('Query timeout'));
        }, 2000) // 2 second timeout (AGGRESSIVE)
        );
        const counts = await Promise.race([Promise.all(countPromises), timeoutPromise]);
        const [branchCount, coAdminCount, messageCount] = counts;
        const usage = {
            branches: branchCount,
            members: 0, // Member count - members in tenant database
            messagesThisMonth: messageCount,
            coAdmins: coAdminCount,
        };
        // Cache for 30 minutes (non-blocking fire-and-forget)
        setCached(CACHE_KEYS.billingUsage(tenantId), usage, CACHE_TTL.MEDIUM).catch(err => console.warn('Failed to cache usage:', err));
        return usage;
    }
    catch (error) {
        console.error('[BILLING] getUsage failed, returning defaults:', error);
        // Return empty usage instead of blocking - plan limits won't be enforced, but member add will work
        return {
            branches: 0,
            members: 0,
            messagesThisMonth: 0,
            coAdmins: 0,
        };
    }
}
/**
 * Check if tenant is on trial
 */
export async function isOnTrial(tenantId) {
    try {
        const registryPrisma = getRegistryPrisma();
        const tenant = await registryPrisma.church.findUnique({
            where: { id: tenantId },
            select: { subscriptionStatus: true, trialEndsAt: true },
        });
        if (!tenant)
            return false;
        return (tenant.subscriptionStatus === 'trial' &&
            tenant.trialEndsAt > new Date());
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
export async function invalidateBillingCache(tenantId) {
    await Promise.all([
        invalidateCache(CACHE_KEYS.churchPlan(tenantId)),
        invalidateCache(CACHE_KEYS.billingUsage(tenantId)),
        invalidateCache(CACHE_KEYS.churchAll(tenantId)), // Also invalidate any other tenant caches
    ]);
    console.log(`[Billing] Cache invalidated for tenant ${tenantId}`);
}
//# sourceMappingURL=billing.service.js.map