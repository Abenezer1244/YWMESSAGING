export interface UsageData {
    branches: number;
    members: number;
    messagesThisMonth: number;
    coAdmins: number;
}
export interface PlanLimits {
    name: string;
    price: number;
    currency: string;
    branches: number;
    members: number;
    messagesPerMonth: number;
    coAdmins: number;
    features: string[];
}
export interface PlanInfo {
    plan: 'starter' | 'growth' | 'pro';
    limits: PlanLimits;
    usage: UsageData;
    remaining: {
        branches: number;
        members: number;
        messagesPerMonth: number;
        coAdmins: number;
    };
}
export interface TrialStatus {
    onTrial: boolean;
    daysRemaining: number;
}
export interface SubscribeResponse {
    success: boolean;
    plan: string;
    subscriptionId: string;
}
/**
 * Get current usage
 */
export declare function getUsage(): Promise<UsageData>;
/**
 * Get current plan and limits
 */
export declare function getPlan(): Promise<PlanInfo>;
/**
 * Get trial status
 */
export declare function getTrial(): Promise<TrialStatus>;
/**
 * Subscribe to a plan
 */
export declare function subscribe(planName: 'starter' | 'growth' | 'pro', paymentMethodId?: string): Promise<SubscribeResponse>;
/**
 * Upgrade/downgrade plan
 */
export declare function upgradePlan(newPlan: 'starter' | 'growth' | 'pro'): Promise<SubscribeResponse>;
/**
 * Cancel subscription
 */
export declare function cancelSubscription(): Promise<{
    success: boolean;
    message: string;
}>;
/**
 * Create payment intent for subscription
 */
export declare function createPaymentIntent(planName: 'starter' | 'growth' | 'pro'): Promise<{
    clientSecret: string;
    amount: number;
    currency: string;
    plan: string;
}>;
//# sourceMappingURL=billing.d.ts.map