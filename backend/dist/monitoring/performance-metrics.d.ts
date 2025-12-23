/**
 * Performance Metrics Module
 *
 * Phase 2 Task 2.2: Custom performance metrics tracking
 * Records critical metrics for:
 * - Database query latency
 * - API endpoint performance
 * - Message delivery success rates
 * - Billing operation metrics
 */
export declare class PerformanceMetrics {
    /**
     * Record database query performance
     * @param duration - Query execution time in milliseconds
     * @param query - Query name/identifier
     * @param success - Whether the query succeeded
     */
    static recordDatabaseQuery(duration: number, query: string, success?: boolean): void;
    /**
     * Record API endpoint performance
     * @param endpoint - API route (e.g., POST /api/auth/login)
     * @param duration - Request duration in milliseconds
     * @param statusCode - HTTP status code
     */
    static recordApiEndpoint(endpoint: string, duration: number, statusCode: number): void;
    /**
     * Record message delivery metrics
     * @param count - Number of messages processed
     * @param successCount - Number of successful deliveries
     * @param failureCount - Number of failed deliveries
     * @param averageLatency - Average delivery latency in seconds
     */
    static recordMessageDelivery(count: number, successCount: number, failureCount: number, averageLatency: number): void;
    /**
     * Record billing metrics
     * @param planName - Subscription plan (starter, growth, pro)
     * @param smsCost - Total SMS cost in cents
     * @param usage - Usage object with messagesThisMonth, etc.
     */
    static recordBillingMetrics(planName: string, smsCost: number, usage: {
        messagesThisMonth?: number;
        membersThisMonth?: number;
    }): void;
    /**
     * Record subscription metrics
     * @param activeCount - Count of active paid subscriptions
     * @param trialCount - Count of active trials
     * @param expiringSoonCount - Count of trials expiring within 7 days
     */
    static recordSubscriptionMetrics(activeCount: number, trialCount: number, expiringSoonCount: number): void;
    /**
     * Record cache performance
     * @param cacheKey - Cache key identifier
     * @param hit - true if cache hit, false if miss
     * @param duration - Operation duration in milliseconds
     */
    static recordCacheMetric(cacheKey: string, hit: boolean, duration: number): void;
    /**
     * Record error metrics
     * @param errorType - Type of error (Database, Payment, MessageDelivery, etc.)
     * @param errorCode - Error code or name
     */
    static recordError(errorType: string, errorCode: string): void;
    /**
     * Middleware to track API endpoint performance
     * @returns Express middleware function
     */
    static expressMiddleware(): (req: any, res: any, next: any) => void;
    /**
     * Timer utility for async operations
     * @param name - Operation name for logging
     * @param fn - Async function to time
     * @returns Result of the function
     */
    static timeAsync<T>(name: string, fn: () => Promise<T>): Promise<T>;
    /**
     * Timer utility for sync operations
     * @param name - Operation name for logging
     * @param fn - Sync function to time
     * @returns Result of the function
     */
    static timeSync<T>(name: string, fn: () => T): T;
}
/**
 * Helper function to track database operations
 * Usage: await trackDatabaseOperation('getUserById', () => prisma.user.findUnique(...))
 */
export declare function trackDatabaseOperation<T>(operationName: string, operation: () => Promise<T>): Promise<T>;
//# sourceMappingURL=performance-metrics.d.ts.map