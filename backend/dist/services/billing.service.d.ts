import { PlanName, PlanLimits } from '../config/plans.js';
/**
 * Record SMS usage for billing purposes
 * Called after an SMS is successfully sent
 */
export declare function recordSMSUsage(churchId: string, status?: 'sent' | 'failed', messageRecipientId?: string): Promise<{
    cost: number;
    success: boolean;
}>;
/**
 * Get SMS usage summary for a church within a date range
 */
export declare function getSMSUsageSummary(churchId: string, startDate?: Date, endDate?: Date): Promise<{
    totalMessages: number;
    totalCost: number;
    currency: string;
}>;
/**
 * Calculate total cost for a batch of messages
 */
export declare function calculateBatchCost(messageCount: number): number;
/**
 * Get current SMS pricing
 */
export declare function getSMSPricing(): {
    costPerSMS: number;
    currency: string;
    setupFee: number;
};
/**
 * Get current plan for a church (cached)
 */
export declare function getCurrentPlan(churchId: string): Promise<PlanName | 'trial'>;
/**
 * Get plan limits for a church (uses config/plans.ts)
 */
export declare function getPlanLimits(plan: PlanName | string): PlanLimits | null;
/**
 * Get usage for a church (cached)
 * Cache for 30 minutes to reduce database load
 */
export declare function getUsage(churchId: string): Promise<Record<string, number>>;
/**
 * Check if church is on trial
 */
export declare function isOnTrial(churchId: string): Promise<boolean>;
/**
 * Invalidate billing cache when subscription changes
 * Called after plan changes, usage updates, etc.
 */
export declare function invalidateBillingCache(churchId: string): Promise<void>;
//# sourceMappingURL=billing.service.d.ts.map