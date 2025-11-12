import { PrismaClient } from '@prisma/client';

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
