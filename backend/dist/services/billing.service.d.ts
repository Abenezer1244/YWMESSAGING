import { PrismaClient } from '@prisma/client';
import { PlanName, PlanLimits } from '../config/plans.js';
/**
 * Record SMS usage for billing purposes
 * Called after an SMS is successfully sent
 */
export declare function recordSMSUsage(tenantId: string, status?: 'sent' | 'failed', messageRecipientId?: string): Promise<{
    cost: number;
    success: boolean;
}>;
/**
 * Get SMS usage summary for a tenant within a date range
 */
export declare function getSMSUsageSummary(tenantId: string, startDate?: Date, endDate?: Date): Promise<{
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
 * Get current plan for a tenant (cached)
 */
export declare function getCurrentPlan(tenantId: string): Promise<PlanName | 'trial'>;
/**
 * Get plan limits for a tenant (uses config/plans.ts)
 */
export declare function getPlanLimits(plan: PlanName | string): PlanLimits | null;
/**
 * Get usage for a tenant (cached)
 * Cache for 30 minutes to reduce database load
 */
export declare function getUsage(tenantId: string, tenantPrisma: PrismaClient): Promise<Record<string, number>>;
/**
 * Check if tenant is on trial
 */
export declare function isOnTrial(tenantId: string): Promise<boolean>;
/**
 * Invalidate billing cache when subscription changes
 * Called after plan changes, usage updates, etc.
 */
export declare function invalidateBillingCache(tenantId: string): Promise<void>;
//# sourceMappingURL=billing.service.d.ts.map