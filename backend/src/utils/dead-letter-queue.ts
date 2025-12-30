/**
 * Dead Letter Queue (DLQ) Utility
 *
 * Captures failed operations for later inspection and manual replay.
 * Prevents data loss from transient failures and enables debugging of stuck messages.
 *
 * DLQ Categories:
 * - SMS_SEND: Failed SMS/MMS sending
 * - WEBHOOK_INBOUND: Failed inbound message processing
 * - SUBSCRIPTION_UPDATE: Failed subscription status changes
 * - PAYMENT_PROCESS: Failed payment operations
 */

import { TenantPrismaClient, getRegistryPrisma, getTenantPrisma } from '../lib/tenant-prisma.js';

export type DLQCategory = 'SMS_SEND' | 'WEBHOOK_INBOUND' | 'SUBSCRIPTION_UPDATE' | 'PAYMENT_PROCESS';

interface DLQEntry {
  category: DLQCategory;
  externalId?: string; // Message ID, webhook ID, etc.
  originalPayload: Record<string, any>;
  errorMessage: string;
  errorStack?: string;
  metadata?: Record<string, any>;
}

/**
 * Add a failed operation to the dead letter queue
 *
 * Example:
 * ```typescript
 * try {
 *   await sendSMS(phone, message, churchId);
 * } catch (error) {
 *   await addToDLQ({
 *     category: 'SMS_SEND',
 *     churchId,
 *     originalPayload: { phone, message, churchId },
 *     errorMessage: error.message,
 *     errorStack: error.stack,
 *     metadata: { recipientId, messageId }
 *   });
 * }
 * ```
 */
export async function addToDLQ(tenantPrisma: TenantPrismaClient, entry: DLQEntry): Promise<string> {
  try {
    const dlqRecord = await tenantPrisma.deadLetterQueue.create({
      data: {
        category: entry.category,
        externalId: entry.externalId,
        originalPayload: entry.originalPayload as any,
        errorMessage: entry.errorMessage,
        errorStack: entry.errorStack,
        metadata: entry.metadata as any,
        retryCount: 0,
        status: 'PENDING',
        firstAttemptAt: new Date(),
        lastAttemptAt: new Date(),
      },
    });

    console.warn(
      `⚠️ [DLQ] Added to dead letter queue: ${entry.category} (ID: ${dlqRecord.id})`
    );
    return dlqRecord.id;
  } catch (error) {
    console.error('❌ [DLQ] Failed to add to dead letter queue:', error);
    throw error;
  }
}

/**
 * List pending dead letter queue items
 */
export async function listPendingDLQ(
  tenantPrisma: TenantPrismaClient,
  options?: {
    category?: DLQCategory;
    limit?: number;
    offset?: number;
  }
) {
  const limit = options?.limit || 20;
  const offset = options?.offset || 0;

  const [items, total] = await Promise.all([
    tenantPrisma.deadLetterQueue.findMany({
      where: {
        status: 'PENDING',
        ...(options?.category && { category: options.category }),
      },
      orderBy: { createdAt: 'asc' },
      take: limit,
      skip: offset,
    }),
    tenantPrisma.deadLetterQueue.count({
      where: {
        status: 'PENDING',
        ...(options?.category && { category: options.category }),
      },
    }),
  ]);

  return {
    items,
    pagination: {
      total,
      limit,
      offset,
      pages: Math.ceil(total / limit),
    },
  };
}

/**
 * Get a specific DLQ item
 */
export async function getDLQItem(tenantPrisma: TenantPrismaClient, id: string) {
  return tenantPrisma.deadLetterQueue.findUnique({
    where: { id },
  });
}

/**
 * Mark a DLQ item as resolved (successful replay)
 */
export async function resolveDLQItem(
  tenantPrisma: TenantPrismaClient,
  id: string,
  metadata?: Record<string, any>
) {
  const item = await getDLQItem(tenantPrisma, id);
  const currentMetadata = (item?.metadata as any) || {};

  return tenantPrisma.deadLetterQueue.update({
    where: { id },
    data: {
      status: 'RESOLVED',
      metadata: {
        ...currentMetadata,
        ...(metadata || {}),
        resolvedAt: new Date().toISOString(),
      },
    },
  });
}

/**
 * Mark a DLQ item as dead (permanently failed)
 */
export async function deadLetterDLQItem(
  tenantPrisma: TenantPrismaClient,
  id: string,
  reason: string
) {
  const item = await getDLQItem(tenantPrisma, id);
  const currentMetadata = (item?.metadata as any) || {};

  return tenantPrisma.deadLetterQueue.update({
    where: { id },
    data: {
      status: 'DEAD_LETTER',
      metadata: {
        ...currentMetadata,
        deadLetterReason: reason,
        deadLetteredAt: new Date().toISOString(),
      },
    },
  });
}

/**
 * Increment retry count for a DLQ item
 */
export async function incrementDLQRetryCount(tenantPrisma: TenantPrismaClient, id: string) {
  return tenantPrisma.deadLetterQueue.update({
    where: { id },
    data: {
      retryCount: {
        increment: 1,
      },
      lastAttemptAt: new Date(),
    },
  });
}

/**
 * Delete a DLQ item
 */
export async function deleteDLQItem(tenantPrisma: TenantPrismaClient, id: string) {
  return tenantPrisma.deadLetterQueue.delete({
    where: { id },
  });
}

/**
 * Get DLQ statistics
 */
export async function getDLQStats(tenantPrisma: TenantPrismaClient) {
  const [total, pending, resolved, deadLetter] = await Promise.all([
    tenantPrisma.deadLetterQueue.count(),
    tenantPrisma.deadLetterQueue.count({ where: { status: 'PENDING' } }),
    tenantPrisma.deadLetterQueue.count({ where: { status: 'RESOLVED' } }),
    tenantPrisma.deadLetterQueue.count({ where: { status: 'DEAD_LETTER' } }),
  ]);

  // Count by category
  const byCategory = await tenantPrisma.deadLetterQueue.groupBy({
    by: ['category'],
    _count: true,
  });

  return {
    total,
    pending,
    resolved,
    deadLetter,
    byCategory: Object.fromEntries(
      byCategory.map((item: any) => [item.category, item._count])
    ),
  };
}

/**
 * Clear old DLQ items (older than specified days) for a specific church/tenant
 */
export async function clearOldDLQItems(churchId: string, olderThanDays: number) {
  const tenantPrisma = await getTenantPrisma(churchId);
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

  const result = await tenantPrisma.deadLetterQueue.deleteMany({
    where: {
      createdAt: {
        lt: cutoffDate,
      },
      status: 'RESOLVED', // Only clear resolved items
    },
  });

  console.log(`🧹 [DLQ] Cleared ${result.count} resolved items older than ${olderThanDays} days`);
  return result;
}
