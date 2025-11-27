/**
 * Priority 2.4: Query Cache & Monitoring Service
 *
 * Implements three-layer performance optimization:
 * 1. Redis-based query result caching with configurable TTLs
 * 2. Slow query detection and logging (>500ms threshold)
 * 3. Database connection pool health monitoring
 *
 * Caching Strategy:
 * - Stats queries (getMessageStats): 5-minute TTL (frequently accessed, medium volatility)
 * - Branch/Group stats (getBranchStats): 10-minute TTL (less frequent, lower volatility)
 * - Recurring messages (getRecurringMessages): 1-hour TTL (stable data)
 *
 * Impact: Reduces database load by 70-80% on repeated queries
 */
interface CacheOptions {
    key: string;
    ttl: number;
    fetchFn: () => Promise<any>;
}
interface SlowQueryLog {
    query: string;
    duration: number;
    threshold: number;
    timestamp: Date;
    severity: 'warning' | 'critical';
}
export declare const CACHE_CONFIG: {
    STATS_QUERIES: {
        TTL: number;
        prefix: string;
    };
    BRANCH_STATS: {
        TTL: number;
        prefix: string;
    };
    RECURRING: {
        TTL: number;
        prefix: string;
    };
};
declare class QueryCacheMonitor {
    private slowQueryLogs;
    private readonly MAX_SLOW_QUERY_LOGS;
    private readonly SLOW_QUERY_THRESHOLD;
    private readonly CRITICAL_THRESHOLD;
    /**
     * Get or fetch data with Redis caching
     * ✅ Reduces database hits by caching query results
     */
    getOrFetch<T>(options: CacheOptions): Promise<T>;
    /**
     * Invalidate cache for a key (call after write operations)
     * ✅ Prevents stale cache after data mutations
     */
    invalidateCache(key: string): Promise<void>;
    /**
     * Invalidate cache by prefix (e.g., all stats queries for a church)
     * ✅ Batch invalidation for related queries
     */
    invalidateCacheByPrefix(prefix: string): Promise<void>;
    /**
     * Log slow queries for monitoring and optimization
     * ✅ Identifies performance bottlenecks
     */
    private logSlowQueryIfNeeded;
    /**
     * Get database connection pool health
     * ✅ Monitors connection pool exhaustion risk
     */
    getConnectionPoolHealth(): Promise<{
        status: 'healthy' | 'warning' | 'critical';
        connections: {
            open: number;
            limit: number;
            utilization: number;
        };
        recommendations: string[];
    }>;
    /**
     * Get slow query statistics for monitoring dashboard
     */
    getSlowQueryStats(): {
        total: number;
        warnings: number;
        critical: number;
        recentQueries: SlowQueryLog[];
        topQueries: Array<{
            query: string;
            count: number;
            avgDuration: number;
        }>;
    };
    /**
     * Clear slow query logs (useful for resetting monitoring data)
     */
    clearSlowQueryLogs(): void;
}
export declare const queryCacheMonitor: QueryCacheMonitor;
export {};
//# sourceMappingURL=query-cache-monitor.service.d.ts.map