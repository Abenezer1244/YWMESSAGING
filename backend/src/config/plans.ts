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

export const PLAN_LIMITS: Record<PlanTier, PlanLimits> = {
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
export function getPlanLimits(plan: string | null | undefined): PlanLimits {
  const tier = (plan as PlanTier) || 'STARTER';
  return PLAN_LIMITS[tier] || PLAN_LIMITS.STARTER;
}
