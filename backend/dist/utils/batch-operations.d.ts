/**
 * Batch Operations Optimization
 *
 * Provides efficient batch processing utilities for database operations:
 * - Automatic chunking for large datasets (prevents memory exhaustion)
 * - Transaction support for data consistency
 * - Circuit breaker integration for fault tolerance
 * - Performance monitoring and metrics
 * - Partial failure handling with retry capability
 *
 * Features:
 * - Configurable chunk sizes (default: 1000 items)
 * - Automatic transaction isolation level selection
 * - APM span tracing for performance analysis
 * - Error accumulation with detailed reporting
 * - Graceful degradation on partial failures
 *
 * Usage:
 * ```typescript
 * import { batchCreate, batchDelete, batchUpdate } from '../utils/batch-operations.js';
 *
 * // Create many records with automatic chunking
 * const result = await batchCreate(
 *   prisma.user,
 *   users,
 *   { chunkSize: 500 }
 * );
 *
 * // Delete with optional circuit breaker
 * await batchDelete(
 *   prisma.session,
 *   sessionIds,
 *   { useCircuitBreaker: true }
 * );
 * ```
 */
interface BatchOperationConfig {
    chunkSize?: number;
    useCircuitBreaker?: boolean;
    isolationLevel?: 'SERIALIZABLE' | 'REPEATABLE_READ' | 'READ_COMMITTED';
    shouldLog?: boolean;
    ignoreErrors?: boolean;
}
interface BatchOperationResult<T> {
    successful: number;
    failed: number;
    total: number;
    errors: Array<{
        chunkIndex: number;
        error: string;
    }>;
    totalDuration: number;
    averageDurationPerChunk: number;
}
/**
 * Batch create operation with chunking
 *
 * @param model - Prisma model (e.g., prisma.user)
 * @param data - Array of objects to create
 * @param config - Configuration options
 * @returns Result with statistics and error information
 *
 * @example
 * const users = Array(5000).fill({ email: 'user@example.com' });
 * const result = await batchCreate(prisma.user, users, { chunkSize: 500 });
 * console.log(`Created ${result.successful} users in ${result.totalDuration}ms`);
 */
export declare function batchCreate<T>(model: any, data: T[], config?: BatchOperationConfig): Promise<BatchOperationResult<T>>;
/**
 * Batch delete operation with chunking
 *
 * @param model - Prisma model
 * @param whereConditions - Array of where conditions or IDs
 * @param config - Configuration options
 * @returns Result with statistics
 *
 * @example
 * const ids = Array(10000).fill(0).map((_, i) => `id-${i}`);
 * const result = await batchDelete(prisma.session, ids);
 * console.log(`Deleted ${result.successful} records`);
 */
export declare function batchDelete(model: any, whereConditions: any[], config?: BatchOperationConfig): Promise<BatchOperationResult<any>>;
/**
 * Batch update operation with chunking
 *
 * @param model - Prisma model
 * @param data - Array of { where, data } objects to update
 * @param config - Configuration options
 * @returns Result with statistics
 *
 * @example
 * const updates = users.map(user => ({
 *   where: { id: user.id },
 *   data: { lastSeen: new Date() }
 * }));
 * await batchUpdate(prisma.user, updates);
 */
export declare function batchUpdate<T>(model: any, data: Array<{
    where: any;
    data: any;
}>, config?: BatchOperationConfig): Promise<BatchOperationResult<T>>;
/**
 * Process items in parallel batches for improved throughput
 * Useful for I/O-bound operations
 *
 * @param items - Array of items to process
 * @param processor - Async function to process each batch
 * @param config - Configuration options
 * @returns Array of results
 *
 * @example
 * const results = await parallelBatchProcess(
 *   users,
 *   async (batch) => sendEmailBatch(batch),
 *   { chunkSize: 100, parallelChunks: 5 }
 * );
 */
export declare function parallelBatchProcess<T, R>(items: T[], processor: (batch: T[]) => Promise<R>, config?: {
    chunkSize?: number;
    parallelChunks?: number;
}): Promise<R[]>;
/**
 * Stream-based processing for very large datasets
 * Prevents memory exhaustion for operations on millions of records
 *
 * @param queryFn - Function that returns Prisma query
 * @param processor - Function to process each batch
 * @param config - Configuration options
 *
 * @example
 * await streamBatchProcess(
 *   () => prisma.user.findMany({ take: 1000 }),
 *   async (batch) => {
 *     await processUserBatch(batch);
 *   },
 *   { chunkSize: 1000 }
 * );
 */
export declare function streamBatchProcess<T>(queryFn: (take: number, skip: number) => Promise<T[]>, processor: (batch: T[]) => Promise<void>, config?: {
    chunkSize?: number;
    totalCount?: number;
}): Promise<void>;
/**
 * Utility function to chunk an array
 *
 * @param array - Array to chunk
 * @param size - Size of each chunk
 * @returns Array of chunks
 *
 * @example
 * const chunks = chunk([1,2,3,4,5], 2);
 * // [[1,2], [3,4], [5]]
 */
export declare function chunk<T>(array: T[], size: number): T[][];
declare const _default: {
    batchCreate: typeof batchCreate;
    batchDelete: typeof batchDelete;
    batchUpdate: typeof batchUpdate;
    parallelBatchProcess: typeof parallelBatchProcess;
    streamBatchProcess: typeof streamBatchProcess;
    chunk: typeof chunk;
};
export default _default;
//# sourceMappingURL=batch-operations.d.ts.map