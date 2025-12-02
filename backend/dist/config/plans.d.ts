/**
 * Plan Limits Configuration
 * Defines features and limits for each pricing tier
 */
export type PlanName = 'starter' | 'growth' | 'pro';
export type BillingCycle = 'monthly' | 'annual';
export interface PlanLimits {
    name: string;
    monthlyPrice: number;
    annualPrice: number;
    currency: string;
    branches: number;
    members: number;
    messagesPerMonth: number;
    coAdmins: number;
    features: string[];
}
/**
 * Get price for a plan based on billing cycle
 * Annual billing offers 20% discount ($49 * 12 = $588 monthly total vs $470.40 annual = $39.2/month)
 */
export declare function getPlanPrice(plan: PlanName, billingCycle: BillingCycle): number;
export declare const PLANS: Record<PlanName, PlanLimits>;
/**
 * Get plan by name
 */
export declare function getPlan(planName: PlanName): PlanLimits;
/**
 * Get all available plans with pricing
 */
export declare function getAllPlans(): Array<PlanLimits & {
    id: PlanName;
}>;
/**
 * Check if a value is within plan limit (or unlimited if limit > 100000)
 */
export declare function checkLimit(planName: PlanName, limitType: 'branches' | 'members' | 'messagesPerMonth' | 'coAdmins', currentCount: number): boolean;
/**
 * Get remaining capacity for a plan limit
 */
export declare function getRemainingCapacity(planName: PlanName, limitType: 'branches' | 'members' | 'messagesPerMonth' | 'coAdmins', currentCount: number): number;
/**
 * Get plan name from subscription status
 * Default to 'starter' for new trials
 */
export declare function getPlanFromSubscription(subscriptionPlan?: string): PlanName;
/**
 * Monthly SMS cost: $0.0075 per segment (160 chars)
 * This is used for cost estimation
 */
export declare const SMS_COST_PER_SEGMENT = 0.0075;
/**
 * Trial duration in days
 */
export declare const TRIAL_DAYS = 14;
//# sourceMappingURL=plans.d.ts.map