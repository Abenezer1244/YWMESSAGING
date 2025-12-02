/**
 * Cache Service - Redis-backed caching with fallback
 * Handles all caching operations with graceful Redis failure handling
 */
/**
 * Get value from cache
 * Returns null if key not found or Redis unavailable
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