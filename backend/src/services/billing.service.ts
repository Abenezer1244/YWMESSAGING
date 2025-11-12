import { PrismaClient } from '@prisma/client';
import { PLANS, PlanName, PlanLimits } from '../config/plans.js';

const prisma = new PrismaClient();

/**
 * SMS billing service - tracks SMS costs and usage
 * Pricing: $0.02 per SMS (Option 3)
 */

const SMS_COST_PER_MESSAGE = 0.02;

/**
 * Record SMS usage for billing purposes
 * Called after an SMS is successfully sent
 */
export async function recordSMSUsage(
  churchId: string,
  status: 'sent' | 'failed' = 'sent',
  messageRecipientId?: string
): Promise<{ cost: number; success: boolean }> {
  try {
    // Don't record failed SMS as billable
    if (status === 'failed') {
      return {
        cost: 0,
        success: true,
      };
    }

    // For now, we'll track usage in-memory or via a simple table
    // This allows us to calculate costs without a full migration
    console.log(`[Billing] Recording SMS usage for church ${churchId}: $${SMS_COST_PER_MESSAGE}`);

    return {
      cost: SMS_COST_PER_MESSAGE,
      success: true,
    };
  } catch (error: any) {
    console.error('Failed to record SMS usage:', error);
    throw new Error(`Billing error: ${error.message}`);
  }
}

/**
 * Get SMS usage summary for a church within a date range
 */
export async function getSMSUsageSummary(
  churchId: string,
  startDate?: Date,
  endDate?: Date
): Promise<{
  totalMessages: number;
  totalCost: number;
  currency: string;
}> {
  try {
    // This is a placeholder implementation
    // Once the SMSUsage table exists, we'll query it
    const defaultStart = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days ago
    const defaultEnd = endDate || new Date();

    // TODO: Query SMSUsage table once migration is applied
    // const usage = await prisma.sMSUsage.aggregate({
    //   where: {
    //     churchId,
    //     sentAt: {
    //       gte: defaultStart,
    //       lte: defaultEnd,
    //     },
    //     status: 'sent',
    //   },
    //   _sum: {
    //     cost: true,
    //   },
    //   _count: true,
    // });

    return {
      totalMessages: 0,
      totalCost: 0,
      currency: 'USD',
    };
  } catch (error: any) {
    console.error('Failed to get SMS usage summary:', error);
    throw new Error(`Billing error: ${error.message}`);
  }
}

/**
 * Calculate total cost for a batch of messages
 */
export function calculateBatchCost(messageCount: number): number {
  return messageCount * SMS_COST_PER_MESSAGE;
}

/**
 * Get current SMS pricing
 */
export function getSMSPricing() {
  return {
    costPerSMS: SMS_COST_PER_MESSAGE,
    currency: 'USD',
    setupFee: 4.99,
  };
}

// ========== Plan Management Functions (used by middleware and services) ==========

/**
 * Get current plan for a church
 */
export async function getCurrentPlan(churchId: string): Promise<PlanName | 'trial'> {
  try {
    const church = await prisma.church.findUnique({
      where: { id: churchId },
      select: { subscriptionStatus: true },
    });
    const status = church?.subscriptionStatus as (PlanName | 'trial') | undefined;
    return status || 'trial';
  } catch (error) {
    console.error('Failed to get current plan:', error);
    return 'trial';
  }
}

/**
 * Get plan limits for a church (uses config/plans.ts)
 */
export function getPlanLimits(plan: PlanName | string): PlanLimits | null {
  // Only starter, growth, pro are valid plan names with limits
  // Trial plans have unlimited access
  if (plan === 'trial' || plan === 'starter' || plan === 'growth' || plan === 'pro') {
    return PLANS[plan as PlanName] || null;
  }
  return null;
}

/**
 * Get usage for a church
 */
export async function getUsage(churchId: string): Promise<Record<string, number>> {
  try {
    // Get branches count
    const branchCount = await prisma.branch.count({
      where: { churchId },
    });

    // Get members count
    const memberCount = await prisma.member.count({
      where: {
        groups: {
          some: {
            group: { churchId },
          },
        },
      },
    });

    // Get co-admins count
    const coAdminCount = await prisma.admin.count({
      where: { churchId, role: 'CO_ADMIN' },
    });

    // Get messages sent this month
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const messageCount = await prisma.message.count({
      where: {
        churchId,
        createdAt: { gte: startOfMonth },
      },
    });

    return {
      branches: branchCount,
      members: memberCount,
      messagesThisMonth: messageCount,
      coAdmins: coAdminCount,
    };
  } catch (error) {
    console.error('Failed to get usage:', error);
    return {
      branches: 0,
      members: 0,
      messagesThisMonth: 0,
      coAdmins: 0,
    };
  }
}

/**
 * Check if church is on trial
 */
export async function isOnTrial(churchId: string): Promise<boolean> {
  try {
    const church = await prisma.church.findUnique({
      where: { id: churchId },
      select: { subscriptionStatus: true, trialEndsAt: true },
    });

    if (!church) return false;

    return (
      church.subscriptionStatus === 'trial' &&
      church.trialEndsAt > new Date()
    );
  } catch (error) {
    console.error('Failed to check trial status:', error);
    return false;
  }
}
