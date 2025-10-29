/**
 * Plan configuration with limits for each tier
 */
export const PLAN_LIMITS = {
    STARTER: {
        branches: 1,
        members: 500,
        messagesPerMonth: 1000,
        coAdmins: 1,
    },
    GROWTH: {
        branches: 5,
        members: 2000,
        messagesPerMonth: 5000,
        coAdmins: 3,
    },
    PRO: {
        branches: 10,
        members: -1, // unlimited
        messagesPerMonth: -1, // unlimited
        coAdmins: 5,
    },
};
/**
 * Get plan limits for a given tier (default to STARTER if not found)
 */
export function getPlanLimits(plan) {
    const tier = plan || 'STARTER';
    return PLAN_LIMITS[tier] || PLAN_LIMITS.STARTER;
}
//# sourceMappingURL=plans.js.map