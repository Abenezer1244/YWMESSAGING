import { PrismaClient } from '@prisma/client';
import { PlanName, PLANS, checkLimit, getRemainingCapacity } from '../config/plans.js';

const prisma = new PrismaClient();

export interface UsageData {
  branches: number;
  members: number;
  messagesThisMonth: number;
  coAdmins: number;
}

/**
 * Get current usage for a church
 */
export async function getUsage(churchId: string): Promise<UsageData> {
  try {
    // Count branches
    const branchCount = await prisma.branch.count({
      where: { churchId, isActive: true },
    });

    // Count unique members across all groups
    const memberCount = await prisma.member.count({
      where: {
        groups: {
          some: {
            group: {
              churchId,
            },
          },
        },
      },
    });

    // Count co-admins
    const coAdminCount = await prisma.admin.count({
      where: { churchId, role: 'CO_ADMIN' },
    });

    // Count messages sent this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const messagesThisMonth = await prisma.message.count({
      where: {
        churchId,
        status: { in: ['sent', 'pending'] },
        sentAt: {
          gte: startOfMonth,
        },
      },
    });

    return {
      branches: branchCount,
      members: memberCount,
      messagesThisMonth,
      coAdmins: coAdminCount,
    };
  } catch (error) {
    console.error('❌ Failed to get usage:', error);
    throw error;
  }
}

/**
 * Get current plan for a church
 */
export async function getCurrentPlan(churchId: string): Promise<PlanName> {
  try {
    const subscription = await prisma.subscription.findUnique({
      where: { churchId },
    });

    if (!subscription) {
      return 'starter'; // Default to starter if no subscription
    }

    return subscription.plan as PlanName;
  } catch (error) {
    console.error('❌ Failed to get current plan:', error);
    throw error;
  }
}

/**
 * Get plan limits for a plan
 */
export function getPlanLimits(planName: PlanName) {
  return PLANS[planName];
}

/**
 * Check if usage is within plan limits
 */
export async function isWithinLimits(churchId: string): Promise<boolean> {
  try {
    const usage = await getUsage(churchId);
    const plan = await getCurrentPlan(churchId);

    // Check each limit
    if (!checkLimit(plan, 'branches', usage.branches)) return false;
    if (!checkLimit(plan, 'members', usage.members)) return false;
    if (!checkLimit(plan, 'messagesPerMonth', usage.messagesThisMonth))
      return false;
    if (!checkLimit(plan, 'coAdmins', usage.coAdmins)) return false;

    return true;
  } catch (error) {
    console.error('❌ Failed to check limits:', error);
    throw error;
  }
}

/**
 * Get remaining capacity for each limit
 */
export async function getRemainingLimits(churchId: string) {
  try {
    const usage = await getUsage(churchId);
    const plan = await getCurrentPlan(churchId);

    return {
      branches: getRemainingCapacity(plan, 'branches', usage.branches),
      members: getRemainingCapacity(plan, 'members', usage.members),
      messagesPerMonth: getRemainingCapacity(
        plan,
        'messagesPerMonth',
        usage.messagesThisMonth
      ),
      coAdmins: getRemainingCapacity(plan, 'coAdmins', usage.coAdmins),
    };
  } catch (error) {
    console.error('❌ Failed to get remaining limits:', error);
    throw error;
  }
}

/**
 * Check if a church is on trial
 */
export async function isOnTrial(churchId: string): Promise<boolean> {
  try {
    const church = await prisma.church.findUnique({
      where: { id: churchId },
    });

    if (!church) return false;

    return (
      church.subscriptionStatus === 'trial' &&
      church.trialEndsAt > new Date()
    );
  } catch (error) {
    console.error('❌ Failed to check trial status:', error);
    throw error;
  }
}

/**
 * Get days remaining in trial
 */
export async function getTrialDaysRemaining(
  churchId: string
): Promise<number> {
  try {
    const church = await prisma.church.findUnique({
      where: { id: churchId },
    });

    if (!church) return 0;

    const now = new Date();
    const daysRemaining = Math.ceil(
      (church.trialEndsAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );

    return Math.max(0, daysRemaining);
  } catch (error) {
    console.error('❌ Failed to get trial days remaining:', error);
    throw error;
  }
}
