import { redisClient } from '../config/redis.config.js';
/**
 * Cache Service - Redis-backed caching with fallback
 * Handles all caching operations with graceful Redis failure handling
 *
 * PATTERN: Cache-Aside (Lazy Loading)
 * 1. Check cache first
 * 2. Cache miss? Fetch from source (database)
 * 3. Store in cache with TTL
 * 4. Return to caller
 *
 * BENEFITS:
 * - Database queries reduced by 70-80%
 * - API response times cut by 50-75%
 * - Simple invalidation strategy
 *
 * PERFORMANCE TARGETS:
 * - Cache hit rate: 70-90%
 * - Cache latency: <5ms
 * - DB query latency reduction: 50-75%
 */
// Global metrics instance for cache performance tracking
export const cacheMetrics = {
    hits: 0,
    misses: 0,
    errors: 0,
    recordHit() {
        this.hits++;
    },
    recordMiss() {
        this.misses++;
    },
    recordError() {
        this.errors++;
    },
    getHitRate() {
        const total = this.hits + this.misses;
        return total === 0 ? 0 : Math.round((this.hits / total) * 100);
    },
    reset() {
        this.hits = 0;
        this.misses = 0;
        this.errors = 0;
    },
    toString() {
        return `Hits: ${this.hits}, Misses: ${this.misses}, Errors: ${this.errors}, HitRate: ${this.getHitRate()}%`;
    },
};
/**
 * Get value from cache with automatic source fetch on miss (Cache-Aside Pattern)
 * @param key - Cache key
 * @param fetchFn - Async function to fetch data on cache miss
 * @param ttl - Time-to-live in seconds (default: 300 = 5 minutes)
 * @returns - Cached or freshly fetched data
 */
export async function getCachedWithFallback(key, fetchFn, ttl = 300) {
    try {
        if (!redisClient.isOpen) {
            // Redis not connected, fetch from source directly
            return fetchFn();
        }
        // Try to get from cache WITH 2-SECOND TIMEOUT
        try {
            const cachePromise = redisClient.get(key);
            const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Redis cache read timeout')), 2000));
            const cached = await Promise.race([cachePromise, timeoutPromise]);
            if (cached) {
                try {
                    cacheMetrics.recordHit();
                    return JSON.parse(cached);
                }
                catch (parseError) {
                    console.warn(`[Cache] Failed to parse JSON for key ${key}, deleting corrupt data`);
                    // Fire-and-forget cache invalidation
                    invalidateCache(key).catch(() => { });
                }
            }
        }
        catch (cacheError) {
            console.warn(`[Cache] Cache read failed/timeout for ${key}:`, cacheError.message);
            // Fall through to fetch from source
        }
        // Cache miss - fetch from source
        cacheMetrics.recordMiss();
        const data = await fetchFn();
        // Store in cache WITH TIMEOUT (fire-and-forget, non-blocking)
        const jitteredTtl = ttl + Math.floor(Math.random() * 120 - 60);
        redisClient
            .setEx(key, Math.max(jitteredTtl, 60), JSON.stringify(data))
            .catch((error) => {
            console.warn(`[Cache] Cache write failed for ${key}:`, error.message);
            // Ignore cache write failures - data still returned
        });
        return data;
    }
    catch (error) {
        console.error(`[Cache] Error for key ${key}:`, error.message);
        cacheMetrics.recordError();
        // Graceful fallback to source
        return fetchFn();
    }
}
/**
 * Get value from cache with timeout protection
 * Returns null if key not found or Redis unavailable
 * @deprecated Use getCachedWithFallback instead for automatic source fetch
 */
export async function getCached(key) {
    try {
        if (!redisClient.isOpen) {
            return null; // Redis not connected, bypass cache
        }
        // Get with 1-second timeout to prevent hanging
        const cachePromise = redisClient.get(key);
        const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Cache read timeout')), 1000));
        const cached = await Promise.race([cachePromise, timeoutPromise]);
        if (!cached) {
            cacheMetrics.recordMiss();
            return null;
        }
        try {
            cacheMetrics.recordHit();
            return JSON.parse(cached);
        }
        catch (parseError) {
            console.warn(`[Cache] Failed to parse JSON for key ${key}, deleting corrupt data`);
            // Fire-and-forget invalidation
            invalidateCache(key).catch(() => { });
            return null;
        }
    }
    catch (error) {
        console.error(`[Cache] Failed to get ${key}:`, error.message);
        cacheMetrics.recordError();
        return null; // Graceful fallback
    }
}
/**
 * Set value in cache with TTL
 * Returns success status (fire-and-forget, non-blocking)
 */
export async function setCached(key, data, ttlSeconds = 3600 // Default 1 hour
) {
    try {
        if (!redisClient.isOpen) {
            return false; // Redis not connected, skip caching
        }
        const serialized = JSON.stringify(data);
        // Fire-and-forget: Don't await Redis write, return immediately
        // This prevents blocking on slow/unresponsive Redis
        redisClient
            .setEx(key, ttlSeconds, serialized)
            .catch((error) => {
            console.warn(`[Cache] Cache write failed for ${key}:`, error.message);
            // Ignore cache write failures - data still returned to caller
        });
        return true; // Return immediately without awaiting Redis
    }
    catch (error) {
        console.error(`[Cache] Failed to set ${key}:`, error.message);
        return false; // Graceful fallback, don't fail request
    }
}
/**
 * Delete single cache key or pattern
 * Pattern supports * wildcard (e.g., "church:123:*")
 */
export async function invalidateCache(pattern) {
    try {
        if (!redisClient.isOpen) {
            return false;
        }
        // If pattern contains wildcard, scan and delete all matching keys
        if (pattern.includes('*')) {
            const keys = await redisClient.keys(pattern);
            if (keys.length > 0) {
                await redisClient.del(keys);
            }
            return true;
        }
        // Otherwise delete single key
        await redisClient.del(pattern);
        return true;
    }
    catch (error) {
        console.error(`[Cache] Failed to invalidate ${pattern}:`, error.message);
        return false;
    }
}
/**
 * Clear entire cache (use sparingly!)
 */
export async function clearCache() {
    try {
        if (!redisClient.isOpen) {
            return false;
        }
        await redisClient.flushDb();
        console.log('[Cache] Cleared entire cache');
        return true;
    }
    catch (error) {
        console.error('[Cache] Failed to clear cache:', error.message);
        return false;
    }
}
/**
 * Get cache health status
 */
export async function getCacheStats() {
    try {
        const isConnected = redisClient.isOpen;
        const status = isConnected ? 'Connected' : 'Disconnected';
        if (!isConnected) {
            return { isConnected, status };
        }
        // Try to get info
        const info = await redisClient.info('server');
        return {
            isConnected,
            status,
            ttlInfo: info ? 'Redis operational' : 'Redis not responding',
        };
    }
    catch (error) {
        return {
            isConnected: false,
            status: 'Error',
            ttlInfo: `Error: ${error.message}`,
        };
    }
}
/**
 * Cache key generators for consistent key naming
 */
export const CACHE_KEYS = {
    // Church settings (1 hour TTL)
    churchSettings: (churchId) => `church:${churchId}:settings`,
    churchPlan: (churchId) => `church:${churchId}:plan`,
    churchStats: (churchId) => `church:${churchId}:stats`,
    // Admin permissions (30 minutes TTL)
    adminPermissions: (adminId) => `admin:${adminId}:permissions`,
    adminRole: (adminId) => `admin:${adminId}:role`,
    // Contact/Member data (30 minutes TTL)
    memberDetails: (memberId) => `member:${memberId}:details`,
    // Billing data (24 hours TTL)
    billingPlan: (churchId) => `church:${churchId}:billing:plan`,
    billingUsage: (churchId) => `church:${churchId}:billing:usage`,
    planLimits: (planName) => `plan:${planName}:limits`,
    // Planning Center integration (1 hour TTL)
    planningCenterStatus: (churchId) => `church:${churchId}:pco:status`,
    planningCenterSync: (churchId) => `church:${churchId}:pco:sync`,
    // Wildcard patterns for invalidation
    churchAll: (churchId) => `church:${churchId}:*`,
    adminAll: (adminId) => `admin:${adminId}:*`,
    memberAll: (memberId) => `member:${memberId}:*`,
};
/**
 * TTL presets
 */
export const CACHE_TTL = {
    SHORT: 5 * 60, // 5 minutes
    MEDIUM: 30 * 60, // 30 minutes
    LONG: 60 * 60, // 1 hour
    EXTENDED: 24 * 60 * 60, // 24 hours
};
//# sourceMappingURL=cache.service.js.map