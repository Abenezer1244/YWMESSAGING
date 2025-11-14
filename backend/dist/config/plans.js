/**
 * Plan Limits Configuration
 * Defines features and limits for each pricing tier
 */
export const PLANS = {
    starter: {
        name: 'Starter',
        price: 4900, // $49.00
        currency: 'usd',
        branches: 1,
        members: 500,
        messagesPerMonth: 1000,
        coAdmins: 1,
        features: [
            'Up to 1 branch',
            'Up to 500 members',
            '1,000 messages/month',
            '1 co-admin',
            'Basic analytics',
            'Email support',
        ],
    },
    growth: {
        name: 'Growth',
        price: 7900, // $79.00
        currency: 'usd',
        branches: 5,
        members: 2000,
        messagesPerMonth: 5000,
        coAdmins: 3,
        features: [
            'Up to 5 branches',
            'Up to 2,000 members',
            '5,000 messages/month',
            '3 co-admins',
            'Advanced analytics',
            'Priority support',
            'Message templates',
            'Recurring messages',
        ],
    },
    pro: {
        name: 'Pro',
        price: 12900, // $129.00
        currency: 'usd',
        branches: 10,
        members: 999999, // unlimited
        messagesPerMonth: 999999, // unlimited
        coAdmins: 3,
        features: [
            'Up to 10 branches',
            'Unlimited members',
            'Unlimited messages',
            '3 co-admins',
            'Advanced analytics',
            'Premium support (24/7)',
            'Message templates',
            'Recurring messages',
            'Custom integrations',
            'API access',
        ],
    },
};
/**
 * Get plan by name
 */
export function getPlan(planName) {
    return PLANS[planName];
}
/**
 * Get all available plans with pricing
 */
export function getAllPlans() {
    return Object.entries(PLANS).map(([id, plan]) => ({
        id: id,
        ...plan,
    }));
}
/**
 * Check if a value is within plan limit (or unlimited if limit > 100000)
 */
export function checkLimit(planName, limitType, currentCount) {
    const plan = getPlan(planName);
    const limit = plan[limitType];
    // Treat anything > 100000 as unlimited
    if (limit > 100000)
        return true;
    return currentCount < limit;
}
/**
 * Get remaining capacity for a plan limit
 */
export function getRemainingCapacity(planName, limitType, currentCount) {
    const plan = getPlan(planName);
    const limit = plan[limitType];
    if (limit > 100000)
        return 999999; // unlimited
    return Math.max(0, limit - currentCount);
}
/**
 * Get plan name from subscription status
 * Default to 'starter' for new trials
 */
export function getPlanFromSubscription(subscriptionPlan) {
    if (subscriptionPlan && subscriptionPlan in PLANS) {
        return subscriptionPlan;
    }
    return 'starter';
}
/**
 * Monthly SMS cost: $0.0075 per segment (160 chars)
 * This is used for cost estimation
 */
export const SMS_COST_PER_SEGMENT = 0.0075;
/**
 * Trial duration in days
 */
export const TRIAL_DAYS = 14;
//# sourceMappingURL=plans.js.map