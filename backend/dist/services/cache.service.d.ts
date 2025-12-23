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
export declare const cacheMetrics: {
    hits: number;
    misses: number;
    errors: number;
    recordHit(): void;
    recordMiss(): void;
    recordError(): void;
    getHitRate(): number;
    reset(): void;
    toString(): string;
};
/**
 * Get value from cache with automatic source fetch on miss (Cache-Aside Pattern)
 * @param key - Cache key
 * @param fetchFn - Async function to fetch data on cache miss
 * @param ttl - Time-to-live in seconds (default: 300 = 5 minutes)
 * @returns - Cached or freshly fetched data
 */
export declare function getCachedWithFallback<T>(key: string, fetchFn: () => Promise<T>, ttl?: number): Promise<T>;
/**
 * Get value from cache
 * Returns null if key not found or Redis unavailable
 * @deprecated Use getCachedWithFallback instead for automatic source fetch
 */
export declare function getCached<T>(key: string): Promise<T | null>;
/**
 * Set value in cache with TTL
 * Returns success status
 */
export declare function setCached<T>(key: string, data: T, ttlSeconds?: number): Promise<boolean>;
/**
 * Delete single cache key or pattern
 * Pattern supports * wildcard (e.g., "church:123:*")
 */
export declare function invalidateCache(pattern: string): Promise<boolean>;
/**
 * Clear entire cache (use sparingly!)
 */
export declare function clearCache(): Promise<boolean>;
/**
 * Get cache health status
 */
export declare function getCacheStats(): Promise<{
    isConnected: boolean;
    status: string;
    ttlInfo?: string;
}>;
/**
 * Cache key generators for consistent key naming
 */
export declare const CACHE_KEYS: {
    churchSettings: (churchId: string) => string;
    churchPlan: (churchId: string) => string;
    churchStats: (churchId: string) => string;
    adminPermissions: (adminId: string) => string;
    adminRole: (adminId: string) => string;
    contactGroups: (churchId: string) => string;
    groupMembers: (groupId: string) => string;
    memberDetails: (memberId: string) => string;
    billingPlan: (churchId: string) => string;
    billingUsage: (churchId: string) => string;
    planLimits: (planName: string) => string;
    planningCenterStatus: (churchId: string) => string;
    planningCenterSync: (churchId: string) => string;
    churchAll: (churchId: string) => string;
    adminAll: (adminId: string) => string;
    groupAll: (groupId: string) => string;
    memberAll: (memberId: string) => string;
};
/**
 * TTL presets
 */
export declare const CACHE_TTL: {
    SHORT: number;
    MEDIUM: number;
    LONG: number;
    EXTENDED: number;
};
//# sourceMappingURL=cache.service.d.ts.map