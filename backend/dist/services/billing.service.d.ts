import { PlanName } from '../config/plans.js';
export interface UsageData {
    branches: number;
    members: number;
    messagesThisMonth: number;
    coAdmins: number;
}
/**
 * Get current usage for a church
 */
export declare function getUsage(churchId: string): Promise<UsageData>;
/**
 * Get current plan for a church
 */
export declare function getCurrentPlan(churchId: string): Promise<PlanName>;
/**
 * Get plan limits for a plan
 */
export declare function getPlanLimits(planName: PlanName): import("../config/plans.js").PlanLimits;
/**
 * Check if usage is within plan limits
 */
export declare function isWithinLimits(churchId: string): Promise<boolean>;
/**
 * Get remaining capacity for each limit
 */
export declare function getRemainingLimits(churchId: string): Promise<{
    branches: number;
    members: number;
    messagesPerMonth: number;
    coAdmins: number;
}>;
/**
 * Check if a church is on trial
 */
export declare function isOnTrial(churchId: string): Promise<boolean>;
/**
 * Get days remaining in trial
 */
export declare function getTrialDaysRemaining(churchId: string): Promise<number>;
//# sourceMappingURL=billing.service.d.ts.map