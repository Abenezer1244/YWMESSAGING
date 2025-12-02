/**
 * Table Partitioning Utility
 *
 * Manages table partitioning operations, monitoring, and maintenance.
 * Supports range-based partitioning by date with automatic cleanup.
 *
 * Partitioned Tables:
 * - ConversationMessage (by month, critical)
 * - Message (by month, high)
 * - MessageRecipient (by month, high)
 * - Conversation (by quarter, medium)
 * - MessageQueue (by week, optional)
 *
 * Usage:
 * ```typescript
 * import { getPartitionInfo, archiveOldPartitions, validatePartitions } from '../utils/table-partitioning.js';
 *
 * // Monitor partitions
 * const info = await getPartitionInfo('conversation_message');
 * console.log(`Partitions: ${info.partitionCount}, Size: ${info.totalSize}`);
 *
 * // Archive old data
 * await archiveOldPartitions('conversation_message', { months: 12 });
 *
 * // Validate partition health
 * const health = await validatePartitions('conversation_message');
 * ```
 */
interface PartitionInfo {
    tableName: string;
    partitionCount: number;
    partitions: {
        name: string;
        sizeBytes: number;
        rowCount: number;
        createdAt: Date;
    }[];
    totalSize: number;
    totalRows: number;
    oldestPartition: string | null;
    newestPartition: string | null;
}
interface ArchiveConfig {
    months?: number;
    keepMonths?: number;
    outputBucket?: string;
    compressionLevel?: number;
}
interface PartitionHealth {
    status: 'healthy' | 'degraded' | 'unhealthy';
    message: string;
    recommendations: string[];
    details: {
        hasGaps: boolean;
        largestPartition: {
            name: string;
            sizeBytes: number;
        };
        smallestPartition: {
            name: string;
            sizeBytes: number;
        };
        sizeVariance: number;
    };
}
interface PartitionMetrics {
    timestamp: number;
    tableName: string;
    partitionCount: number;
    totalSize: number;
    avgPartitionSize: number;
    oldestData: Date | null;
    newestData: Date | null;
    dataAge: number;
}
/**
 * Get information about table partitions
 *
 * @param tableName - Name of partitioned table
 * @returns Partition information and statistics
 *
 * @example
 * const info = await getPartitionInfo('conversation_message');
 * console.log(`Total size: ${(info.totalSize / 1024 / 1024).toFixed(2)}MB`);
 * console.log(`Partitions: ${info.partitionCount}`);
 */
export declare function getPartitionInfo(tableName: string): Promise<PartitionInfo>;
/**
 * Get health status of table partitions
 *
 * @param tableName - Name of partitioned table
 * @returns Health status with recommendations
 *
 * @example
 * const health = await validatePartitions('conversation_message');
 * if (health.status === 'unhealthy') {
 *   console.warn(health.recommendations.join('\n'));
 * }
 */
export declare function validatePartitions(tableName: string): Promise<PartitionHealth>;
/**
 * Archive old partitions to S3 and optionally delete them
 *
 * @param tableName - Name of partitioned table
 * @param config - Archive configuration
 * @returns Archive operation result
 *
 * @example
 * const result = await archiveOldPartitions('conversation_message', {
 *   months: 12,
 *   outputBucket: 'my-archive-bucket'
 * });
 */
export declare function archiveOldPartitions(tableName: string, config?: ArchiveConfig): Promise<{
    archivedPartitions: string[];
    archivedSize: number;
    deletedPartitions: string[];
    message: string;
}>;
/**
 * Create missing partitions for table
 *
 * @param tableName - Name of partitioned table
 * @param futureMonths - Number of future months to pre-create
 * @returns Created partition names
 *
 * @example
 * const created = await ensurePartitions('conversation_message', 3);
 * console.log(`Created partitions: ${created.join(', ')}`);
 */
export declare function ensurePartitions(tableName: string, futureMonths?: number): Promise<string[]>;
/**
 * Get partition metrics for monitoring
 *
 * @param tableName - Name of partitioned table
 * @returns Partition metrics
 *
 * @example
 * const metrics = await getPartitionMetrics('conversation_message');
 * console.log(`Oldest data: ${metrics.oldestData?.toISOString()}`);
 */
export declare function getPartitionMetrics(tableName: string): Promise<PartitionMetrics>;
/**
 * Cleanup strategy for maintenance
 * Determines which partitions should be archived or deleted
 *
 * @param tableName - Name of partitioned table
 * @param retentionMonths - How many months to keep live
 * @returns Cleanup recommendations
 *
 * @example
 * const cleanup = await planCleanup('conversation_message', 24);
 * if (cleanup.archiveCount > 0) {
 *   await archiveOldPartitions(tableName, { months: 24 });
 * }
 */
export declare function planCleanup(tableName: string, retentionMonths?: number): Promise<{
    archiveCount: number;
    archiveSize: number;
    deleteCount: number;
    deleteSize: number;
    recommendations: string[];
}>;
/**
 * Generate SQL for creating range-partitioned table
 * Useful for manual partitioning setup
 *
 * @param tableName - Original table name
 * @param partitioningKeyColumn - Column to partition by (usually createdAt)
 * @param columnDefinitions - Table column definitions
 * @returns SQL script
 *
 * @example
 * const sql = generatePartitioningSQL('conversation_message', 'createdAt', {...});
 */
export declare function generatePartitioningSQL(tableName: string, partitioningKeyColumn: string, columnDefinitions: Record<string, string>): string;
/**
 * Estimate space savings from partitioning
 *
 * @param tableName - Name of table
 * @param currentIndexSizeMb - Current index size in MB
 * @returns Estimated savings
 *
 * @example
 * const savings = estimatePartitioningSavings('conversation_message', 2048);
 * console.log(`Index size reduction: ${savings.indexReductionPercent}%`);
 */
export declare function estimatePartitioningSavings(tableName: string, currentIndexSizeMb: number): {
    indexReductionPercent: number;
    estimatedIndexSizeMb: number;
    querySavingsPercent: number;
    estimatedQueryTimeMs: number;
};
/**
 * Log partition statistics for monitoring
 *
 * @param tableName - Name of partitioned table
 */
export declare function logPartitionStats(tableName: string): Promise<void>;
declare const _default: {
    getPartitionInfo: typeof getPartitionInfo;
    validatePartitions: typeof validatePartitions;
    archiveOldPartitions: typeof archiveOldPartitions;
    ensurePartitions: typeof ensurePartitions;
    getPartitionMetrics: typeof getPartitionMetrics;
    planCleanup: typeof planCleanup;
    generatePartitioningSQL: typeof generatePartitioningSQL;
    estimatePartitioningSavings: typeof estimatePartitioningSavings;
    logPartitionStats: typeof logPartitionStats;
};
export default _default;
//# sourceMappingURL=table-partitioning.d.ts.map