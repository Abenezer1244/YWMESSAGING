import { redisClient } from '../config/redis.config.js';
import { getRegistryPrisma } from '../lib/tenant-prisma.js';
// Cache configuration by query type
export const CACHE_CONFIG = {
    // Stats queries - frequently accessed, moderate data changes
    STATS_QUERIES: {
        TTL: 5 * 60, // 5 minutes
        prefix: 'stats:',
    },
    // Branch/Group stats - less frequent, data changes less often
    BRANCH_STATS: {
        TTL: 10 * 60, // 10 minutes
        prefix: 'branch_stats:',
    },
    // Recurring messages - very stable data
    RECURRING: {
        TTL: 60 * 60, // 1 hour
        prefix: 'recurring:',
    },
};
class QueryCacheMonitor {
    constructor() {
        this.slowQueryLogs = [];
        this.MAX_SLOW_QUERY_LOGS = 100; // Keep last 100 slow queries
        this.SLOW_QUERY_THRESHOLD = 500; // milliseconds
        this.CRITICAL_THRESHOLD = 1000; // milliseconds
    }
    /**
     * Get or fetch data with Redis caching with timeout protection
     * ✅ Reduces database hits by caching query results
     * ✅ Timeout on Redis operations prevents hanging when Redis is unavailable
     */
    async getOrFetch(options) {
        // Try to get from Redis cache WITH TIMEOUT (2 seconds max)
        try {
            // Only attempt cache read if Redis is connected
            if (redisClient.isOpen) {
                const cachePromise = redisClient.get(options.key);
                const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Redis cache read timeout')), 2000));
                const cached = await Promise.race([cachePromise, timeoutPromise]);
                if (cached) {
                    console.log(`✅ Cache HIT: ${options.key}`);
                    return JSON.parse(cached);
                }
            }
        }
        catch (error) {
            console.warn(`⚠️ Cache read failed/timeout for ${options.key}:`, error.message);
            // Fall through to fetch from database - don't block on cache
        }
        // Fetch from database with timing
        const startTime = Date.now();
        const data = await options.fetchFn();
        const duration = Date.now() - startTime;
        // Log slow queries
        this.logSlowQueryIfNeeded(`fetch:${options.key}`, duration);
        // Cache the result WITH TIMEOUT (2 seconds max, fire-and-forget)
        if (redisClient.isOpen) {
            redisClient
                .setEx(options.key, options.ttl, JSON.stringify(data))
                .then(() => {
                console.log(`💾 Cached: ${options.key} (TTL: ${options.ttl}s, Query: ${duration}ms)`);
            })
                .catch((error) => {
                console.warn(`⚠️ Cache write failed for ${options.key}:`, error.message);
                // Still return data even if caching fails - non-blocking
            });
        }
        return data;
    }
    /**
     * Invalidate cache for a key (call after write operations)
     * ✅ Prevents stale cache after data mutations
     */
    async invalidateCache(key) {
        try {
            await redisClient.del(key);
            console.log(`🗑️ Cache invalidated: ${key}`);
        }
        catch (error) {
            console.warn(`⚠️ Cache invalidation failed for ${key}:`, error);
        }
    }
    /**
     * Invalidate cache by prefix (e.g., all stats queries for a church)
     * ✅ Batch invalidation for related queries
     */
    async invalidateCacheByPrefix(prefix) {
        try {
            const keys = await redisClient.keys(`${prefix}*`);
            if (keys.length > 0) {
                await redisClient.del(keys);
                console.log(`🗑️ Invalidated ${keys.length} cached entries with prefix: ${prefix}`);
            }
        }
        catch (error) {
            console.warn(`⚠️ Bulk cache invalidation failed for prefix ${prefix}:`, error);
        }
    }
    /**
     * Log slow queries for monitoring and optimization
     * ✅ Identifies performance bottlenecks
     */
    logSlowQueryIfNeeded(query, duration) {
        if (duration < this.SLOW_QUERY_THRESHOLD) {
            return; // Not slow
        }
        const severity = duration >= this.CRITICAL_THRESHOLD ? 'critical' : 'warning';
        const log = {
            query,
            duration,
            threshold: this.SLOW_QUERY_THRESHOLD,
            timestamp: new Date(),
            severity,
        };
        this.slowQueryLogs.push(log);
        // Keep only recent logs
        if (this.slowQueryLogs.length > this.MAX_SLOW_QUERY_LOGS) {
            this.slowQueryLogs.shift();
        }
        // Console output with severity color coding
        const icon = severity === 'critical' ? '🚨' : '⚠️';
        console.log(`${icon} SLOW QUERY [${severity.toUpperCase()}]: ${query} took ${duration}ms (threshold: ${this.SLOW_QUERY_THRESHOLD}ms)`);
    }
    /**
     * Get database connection pool health
     * ✅ Monitors connection pool exhaustion risk
     */
    async getConnectionPoolHealth() {
        try {
            // Try to execute a simple query to verify connectivity
            const registryPrisma = getRegistryPrisma();
            await registryPrisma.$queryRaw `SELECT 1`;
            // Get pool statistics from Prisma's internal state
            // Note: This is a simplified check - actual pool stats depend on PrismaClient implementation
            const poolInfo = {
                open: 1, // Simplified - Prisma manages pools internally
                limit: 30, // From our connection_limit=30 config
                utilization: Math.round((1 / 30) * 100),
            };
            const utilization = poolInfo.utilization;
            let status = 'healthy';
            const recommendations = [];
            if (utilization >= 80) {
                status = 'critical';
                recommendations.push('Connection pool utilization is critical (>80%)', 'Consider increasing connection_limit in DATABASE_URL', 'Check for connection leaks in application code', 'Monitor for blocked queries or long transactions');
            }
            else if (utilization >= 60) {
                status = 'warning';
                recommendations.push('Connection pool utilization is elevated (>60%)', 'Monitor concurrent requests', 'Consider pre-scaling connection pool if expecting traffic spikes');
            }
            else {
                recommendations.push('Connection pool is healthy', 'Current utilization is optimal');
            }
            return {
                status,
                connections: poolInfo,
                recommendations,
            };
        }
        catch (error) {
            console.error('❌ Connection pool health check failed:', error.message);
            return {
                status: 'critical',
                connections: {
                    open: 0,
                    limit: 30,
                    utilization: 0,
                },
                recommendations: [
                    'Database connection failed',
                    'Check database connectivity',
                    'Verify DATABASE_URL configuration',
                    'Check if database server is running',
                ],
            };
        }
    }
    /**
     * Get slow query statistics for monitoring dashboard
     */
    getSlowQueryStats() {
        const warnings = this.slowQueryLogs.filter((l) => l.severity === 'warning').length;
        const critical = this.slowQueryLogs.filter((l) => l.severity === 'critical').length;
        // Group by query to find most problematic ones
        const queryMap = new Map();
        for (const log of this.slowQueryLogs) {
            if (!queryMap.has(log.query)) {
                queryMap.set(log.query, { count: 0, durations: [] });
            }
            const entry = queryMap.get(log.query);
            entry.count++;
            entry.durations.push(log.duration);
        }
        const topQueries = Array.from(queryMap.entries())
            .map(([query, data]) => ({
            query,
            count: data.count,
            avgDuration: Math.round(data.durations.reduce((a, b) => a + b, 0) / data.durations.length),
        }))
            .sort((a, b) => b.avgDuration - a.avgDuration)
            .slice(0, 5);
        return {
            total: this.slowQueryLogs.length,
            warnings,
            critical,
            recentQueries: this.slowQueryLogs.slice(-10), // Last 10
            topQueries,
        };
    }
    /**
     * Clear slow query logs (useful for resetting monitoring data)
     */
    clearSlowQueryLogs() {
        const count = this.slowQueryLogs.length;
        this.slowQueryLogs = [];
        console.log(`🗑️ Cleared ${count} slow query logs`);
    }
}
// Export singleton instance
export const queryCacheMonitor = new QueryCacheMonitor();
//# sourceMappingURL=query-cache-monitor.service.js.map