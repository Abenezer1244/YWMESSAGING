import { redisClient } from '../config/redis.config.js';
/**
 * Cache Service - Redis-backed caching with fallback
 * Handles all caching operations with graceful Redis failure handling
 */
/**
 * Get value from cache
 * Returns null if key not found or Redis unavailable
 */
export async function getCached(key) {
    try {
        if (!redisClient.isOpen) {
            return null; // Redis not connected, bypass cache
        }
        const cached = await redisClient.get(key);
        if (!cached) {
            return null;
        }
        try {
            return JSON.parse(cached);
        }
        catch (parseError) {
            console.warn(`[Cache] Failed to parse JSON for key ${key}, deleting corrupt data`);
            await invalidateCache(key);
            return null;
        }
    }
    catch (error) {
        console.error(`[Cache] Failed to get ${key}:`, error.message);
        return null; // Graceful fallback
    }
}
/**
 * Set value in cache with TTL
 * Returns success status
 */
export async function setCached(key, data, ttlSeconds = 3600 // Default 1 hour
) {
    try {
        if (!redisClient.isOpen) {
            return false; // Redis not connected, skip caching
        }
        const serialized = JSON.stringify(data);
        await redisClient.setEx(key, ttlSeconds, serialized);
        return true;
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
    // Admin permissions (30 minutes TTL)
    adminPermissions: (adminId) => `admin:${adminId}:permissions`,
    adminRole: (adminId) => `admin:${adminId}:role`,
    // Contact/Member data (30 minutes TTL)
    contactGroups: (churchId) => `church:${churchId}:groups`,
    groupMembers: (groupId) => `group:${groupId}:members`,
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
    groupAll: (groupId) => `group:${groupId}:*`,
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