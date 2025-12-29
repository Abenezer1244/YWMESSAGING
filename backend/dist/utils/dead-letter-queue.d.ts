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
export type DLQCategory = 'SMS_SEND' | 'WEBHOOK_INBOUND' | 'SUBSCRIPTION_UPDATE' | 'PAYMENT_PROCESS';
interface DLQEntry {
    category: DLQCategory;
    externalId?: string;
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
export declare function addToDLQ(entry: DLQEntry): Promise<string>;
/**
 * List pending dead letter queue items
 */
export declare function listPendingDLQ(options?: {
    category?: DLQCategory;
    limit?: number;
    offset?: number;
}): Promise<{
    items: {
        id: string;
        category: string;
        churchId: string | null;
        externalId: string | null;
        originalPayload: import(".prisma/client").Prisma.JsonValue;
        errorMessage: string;
        errorStack: string | null;
        metadata: import(".prisma/client").Prisma.JsonValue | null;
        status: string;
        retryCount: number;
        firstAttemptAt: Date;
        lastAttemptAt: Date;
        createdAt: Date;
        updatedAt: Date;
    }[];
    pagination: {
        total: number;
        limit: number;
        offset: number;
        pages: number;
    };
}>;
/**
 * Get a specific DLQ item
 */
export declare function getDLQItem(id: string): Promise<{
    id: string;
    category: string;
    churchId: string | null;
    externalId: string | null;
    originalPayload: import(".prisma/client").Prisma.JsonValue;
    errorMessage: string;
    errorStack: string | null;
    metadata: import(".prisma/client").Prisma.JsonValue | null;
    status: string;
    retryCount: number;
    firstAttemptAt: Date;
    lastAttemptAt: Date;
    createdAt: Date;
    updatedAt: Date;
} | null>;
/**
 * Mark a DLQ item as resolved (successful replay)
 */
export declare function resolveDLQItem(id: string, metadata?: Record<string, any>): Promise<{
    id: string;
    category: string;
    churchId: string | null;
    externalId: string | null;
    originalPayload: import(".prisma/client").Prisma.JsonValue;
    errorMessage: string;
    errorStack: string | null;
    metadata: import(".prisma/client").Prisma.JsonValue | null;
    status: string;
    retryCount: number;
    firstAttemptAt: Date;
    lastAttemptAt: Date;
    createdAt: Date;
    updatedAt: Date;
}>;
/**
 * Mark a DLQ item as dead (permanently failed)
 */
export declare function deadLetterDLQItem(id: string, reason: string): Promise<{
    id: string;
    category: string;
    churchId: string | null;
    externalId: string | null;
    originalPayload: import(".prisma/client").Prisma.JsonValue;
    errorMessage: string;
    errorStack: string | null;
    metadata: import(".prisma/client").Prisma.JsonValue | null;
    status: string;
    retryCount: number;
    firstAttemptAt: Date;
    lastAttemptAt: Date;
    createdAt: Date;
    updatedAt: Date;
}>;
/**
 * Increment retry count for a DLQ item
 */
export declare function incrementDLQRetryCount(id: string): Promise<{
    id: string;
    category: string;
    churchId: string | null;
    externalId: string | null;
    originalPayload: import(".prisma/client").Prisma.JsonValue;
    errorMessage: string;
    errorStack: string | null;
    metadata: import(".prisma/client").Prisma.JsonValue | null;
    status: string;
    retryCount: number;
    firstAttemptAt: Date;
    lastAttemptAt: Date;
    createdAt: Date;
    updatedAt: Date;
}>;
/**
 * Delete a DLQ item
 */
export declare function deleteDLQItem(id: string): Promise<{
    id: string;
    category: string;
    churchId: string | null;
    externalId: string | null;
    originalPayload: import(".prisma/client").Prisma.JsonValue;
    errorMessage: string;
    errorStack: string | null;
    metadata: import(".prisma/client").Prisma.JsonValue | null;
    status: string;
    retryCount: number;
    firstAttemptAt: Date;
    lastAttemptAt: Date;
    createdAt: Date;
    updatedAt: Date;
}>;
/**
 * Get DLQ statistics
 */
export declare function getDLQStats(): Promise<{
    total: number;
    pending: number;
    resolved: number;
    deadLetter: number;
    byCategory: any;
}>;
/**
 * Clear old DLQ items (older than specified days)
 */
export declare function clearOldDLQItems(olderThanDays: number): Promise<import(".prisma/client").Prisma.BatchPayload>;
export {};
//# sourceMappingURL=dead-letter-queue.d.ts.map