/**
 * Plan configuration with limits for each tier
 */
export type PlanTier = 'STARTER' | 'GROWTH' | 'PRO';
export interface PlanLimits {
    branches: number;
    members: number;
    messagesPerMonth: number;
    coAdmins: number;
}
export declare const PLAN_LIMITS: Record<PlanTier, PlanLimits>;
/**
 * Get plan limits for a given tier (default to STARTER if not found)
 */
export declare function getPlanLimits(plan: string | null | undefined): PlanLimits;
//# sourceMappingURL=plans.d.ts.map