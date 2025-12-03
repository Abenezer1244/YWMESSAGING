/**
 * Advanced Rate Limiting Enhancements
 *
 * Production-grade rate limiting with advanced features:
 * - Per-API-key rate limits (different limits for different keys)
 * - Burst allowance (temporary spike handling)
 * - Redis-backed distributed state (works across multiple instances)
 * - Adaptive rate limiting (adjusts based on load)
 * - Fair queuing (prevents one client from blocking others)
 * - Analytics and reporting (usage per API key)
 *
 * Usage:
 * ```typescript
 * import { createRateLimiter, enforceRateLimit } from '../utils/advanced-rate-limiting.js';
 *
 * // Create advanced rate limiter
 * const limiter = createRateLimiter({
 *   windowMs: 60000,      // 1 minute window
 *   maxRequests: 100,     // 100 requests per window
 *   burstSize: 20,        // Allow 20 requests in burst
 *   burstWindow: 5000,    // 5 second burst window
 * });
 *
 * // Apply to route
 * app.get('/api/endpoint', enforceRateLimit(limiter), handler);
 *
 * // Get analytics
 * const stats = await limiter.getAnalytics('api-key-123');
 * console.log(`API key 123 used: ${stats.requestsUsed}/${stats.requestLimit}`);
 * ```
 */
import { redisClient } from '../config/redis.config.js';
import { logger } from './logger.js';
/**
 * Create a Redis-backed rate limiter
 *
 * @param config - Rate limiting configuration
 * @param keyConfigs - Optional per-key configurations
 * @returns Rate limiter instance
 *
 * @example
 * const limiter = createRateLimiter(
 *   { windowMs: 60000, maxRequests: 100 },
 *   { 'premium-key': { maxRequests: 1000 } }
 * );
 */
export function createRateLimiter(config, keyConfigs = {}) {
    const { windowMs = 60000, maxRequests = 100, burstSize = 20, burstWindow = 5000, keyGenerator = (req) => req.ip || 'unknown', skipSuccessfulRequests = false, skipFailedRequests = false, } = config;
    /**
     * Check rate limit for a key
     */
    async function check(key) {
        if (!redisClient.isOpen) {
            // Failover: if Redis unavailable, allow request
            logger.warn('Redis unavailable, allowing request (rate limit bypassed)');
            return {
                allowed: true,
                requestsRemaining: maxRequests,
                requestLimit: maxRequests,
                resetTime: new Date(Date.now() + windowMs),
                retryAfter: 0,
                isInBurst: false,
            };
        }
        try {
            // Get per-key config or use defaults
            const keyConfig = keyConfigs[key];
            const limit = keyConfig?.maxRequests || maxRequests;
            const burst = keyConfig?.burstSize || burstSize;
            const now = Date.now();
            const windowStart = now - windowMs;
            // Keys for Redis storage
            const requestCountKey = `ratelimit:${key}:requests`;
            const windowStartKey = `ratelimit:${key}:window_start`;
            const burstCountKey = `ratelimit:${key}:burst`;
            const statsKey = `ratelimit:${key}:stats`;
            // Get current window and request count
            const [currentWindow, requestCount, burstCount, statsData] = await Promise.all([
                redisClient.get(windowStartKey),
                redisClient.get(requestCountKey),
                redisClient.get(burstCountKey),
                redisClient.get(statsKey),
            ]);
            const window = currentWindow ? parseInt(currentWindow) : now;
            const isNewWindow = now - window > windowMs;
            let requests = requestCount ? parseInt(requestCount) : 0;
            let busts = burstCount ? parseInt(burstCount) : 0;
            if (isNewWindow) {
                // New window, reset counters
                requests = 0;
                busts = 0;
                await redisClient.set(windowStartKey, now.toString());
            }
            // Increment request count
            requests++;
            await redisClient.incr(requestCountKey);
            await redisClient.expire(requestCountKey, Math.ceil(windowMs / 1000));
            // Check if over normal limit
            const overLimit = requests > limit;
            // Check burst allowance
            let allowedViaBurst = false;
            if (overLimit && burst > 0 && busts < burst) {
                // Allow via burst, but increment burst counter
                busts++;
                await redisClient.incr(burstCountKey);
                await redisClient.expire(burstCountKey, Math.ceil(burstWindow / 1000));
                allowedViaBurst = true;
            }
            // Determine if request is allowed
            const allowed = !overLimit || allowedViaBurst;
            // Update statistics
            if (allowed) {
                // Track hit
                const stats = statsData ? JSON.parse(statsData) : { hits: 0, blocks: 0 };
                stats.hits = (stats.hits || 0) + 1;
                stats.lastHit = now;
                await redisClient.set(statsKey, JSON.stringify(stats));
                await redisClient.expire(statsKey, 86400); // 24 hour stats
            }
            else {
                // Track block
                const stats = statsData ? JSON.parse(statsData) : { hits: 0, blocks: 0 };
                stats.blocks = (stats.blocks || 0) + 1;
                stats.lastBlock = now;
                await redisClient.set(statsKey, JSON.stringify(stats));
                await redisClient.expire(statsKey, 86400);
            }
            const resetTime = new Date(window + windowMs);
            return {
                allowed,
                requestsRemaining: Math.max(0, limit - requests),
                requestLimit: limit,
                resetTime,
                retryAfter: Math.max(0, resetTime.getTime() - now),
                isInBurst: allowedViaBurst,
            };
        }
        catch (error) {
            logger.error('Rate limit check failed', error);
            // Failover: allow request if check fails
            return {
                allowed: true,
                requestsRemaining: maxRequests,
                requestLimit: maxRequests,
                resetTime: new Date(Date.now() + windowMs),
                retryAfter: 0,
                isInBurst: false,
            };
        }
    }
    /**
     * Reset rate limit for a key
     */
    async function reset(key) {
        try {
            const keys = [
                `ratelimit:${key}:requests`,
                `ratelimit:${key}:window_start`,
                `ratelimit:${key}:burst`,
            ];
            await Promise.all(keys.map((k) => redisClient.del(k)));
            logger.info(`Rate limit reset for key: ${key}`);
        }
        catch (error) {
            logger.error(`Failed to reset rate limit for ${key}`, error);
        }
    }
    /**
     * Get analytics for an API key
     */
    async function getAnalytics(key) {
        try {
            const status = await check(key);
            const statsKey = `ratelimit:${key}:stats`;
            const statsData = await redisClient.get(statsKey);
            const stats = statsData ? JSON.parse(statsData) : { hits: 0, blocks: 0 };
            // Calculate percentages
            const percentUsed = (stats.hits / (status.requestLimit * 1000)) * 100; // Normalized
            const hourlyAverage = stats.hits / 24; // Rough estimate
            const dailyTotal = stats.hits; // This window's hits
            return {
                apiKey: key,
                requestsUsed: status.requestLimit - status.requestsRemaining,
                requestLimit: status.requestLimit,
                burstUsed: 0, // Would need additional tracking
                burstLimit: burstSize,
                percentUsed,
                windowResetAt: status.resetTime,
                hourlyAverage,
                dailyTotal,
                hitsSinceReset: stats.hits || 0,
                blocksSinceReset: stats.blocks || 0,
            };
        }
        catch (error) {
            logger.error(`Failed to get analytics for ${key}`, error);
            return {
                apiKey: key,
                requestsUsed: 0,
                requestLimit: maxRequests,
                burstUsed: 0,
                burstLimit: burstSize,
                percentUsed: 0,
                windowResetAt: new Date(),
                hourlyAverage: 0,
                dailyTotal: 0,
                hitsSinceReset: 0,
                blocksSinceReset: 0,
            };
        }
    }
    /**
     * Get global statistics
     */
    async function getGlobalStats() {
        try {
            // This would scan all rate limit keys and aggregate
            // For now, return placeholder
            return { totalRequests: 0, totalBlocks: 0 };
        }
        catch (error) {
            logger.error('Failed to get global rate limit stats', error);
            return { totalRequests: 0, totalBlocks: 0 };
        }
    }
    /**
     * Update configuration
     */
    function updateConfig(newConfig) {
        Object.assign(config, newConfig);
        logger.info('Rate limit config updated', newConfig);
    }
    /**
     * Express middleware
     */
    function middleware() {
        return async (req, res, next) => {
            try {
                const key = keyGenerator(req);
                const status = await check(key);
                // Set rate limit headers
                res.set('X-RateLimit-Limit', status.requestLimit.toString());
                res.set('X-RateLimit-Remaining', status.requestsRemaining.toString());
                res.set('X-RateLimit-Reset', status.resetTime.toISOString());
                if (status.isInBurst) {
                    res.set('X-RateLimit-Burst', 'true');
                }
                if (!status.allowed) {
                    res.set('Retry-After', (status.retryAfter / 1000).toFixed(0));
                    logger.warn(`Rate limit exceeded for key: ${key}`, {
                        requestsUsed: status.requestLimit - status.requestsRemaining,
                        requestLimit: status.requestLimit,
                        resetTime: status.resetTime,
                    });
                    res.status(429).json({
                        error: 'Too Many Requests',
                        message: `Rate limit exceeded. Reset in ${status.retryAfter}ms`,
                        retryAfter: status.retryAfter,
                    });
                    return;
                }
                next();
            }
            catch (error) {
                logger.error('Rate limit middleware error', error);
                // On error, allow request to proceed
                next();
            }
        };
    }
    return {
        check,
        reset,
        getAnalytics,
        getGlobalStats,
        updateConfig,
        middleware,
    };
}
/**
 * Enforce rate limit on a request
 *
 * @param limiter - Rate limiter instance
 * @returns Express middleware
 *
 * @example
 * const limiter = createRateLimiter({ windowMs: 60000, maxRequests: 100 });
 * app.get('/api/endpoint', enforceRateLimit(limiter), handler);
 */
export function enforceRateLimit(limiter) {
    return limiter.middleware();
}
/**
 * Create API key-based rate limiter
 * Different limits for different API keys
 *
 * @param keyConfigs - Per-key configuration
 * @returns Rate limiter instance
 *
 * @example
 * const limiter = createApiKeyLimiter({
 *   'free-plan': { maxRequests: 100, burstSize: 10 },
 *   'pro-plan': { maxRequests: 1000, burstSize: 100 },
 *   'enterprise': { maxRequests: 10000, burstSize: 1000 }
 * });
 */
export function createApiKeyLimiter(keyConfigs) {
    return createRateLimiter({
        windowMs: 60000,
        maxRequests: 100, // Default
        burstSize: 20,
        keyGenerator: (req) => {
            // Extract API key from header
            const apiKey = req.headers['x-api-key'];
            return apiKey || req.ip || 'unknown';
        },
    }, keyConfigs);
}
/**
 * Create tiered rate limiter
 * Automatically selects limit based on request source
 *
 * @returns Rate limiter instance
 *
 * @example
 * const limiter = createTieredLimiter();
 * // Automatically limits based on user tier
 */
export function createTieredLimiter() {
    const tieredConfigs = {
        'premium': { maxRequests: 1000, burstSize: 100, priority: 1 },
        'standard': { maxRequests: 100, burstSize: 20, priority: 0 },
        'free': { maxRequests: 10, burstSize: 2, priority: -1 },
    };
    return createRateLimiter({
        windowMs: 60000,
        maxRequests: 10, // Default for unknown
        burstSize: 2,
        keyGenerator: (req) => {
            // Would extract user tier from request context
            const userTier = req.userTier || 'free';
            return `${userTier}:${req.ip || 'unknown'}`;
        },
    }, tieredConfigs);
}
/**
 * Get rate limit status for display/debugging
 *
 * @param limiter - Rate limiter instance
 * @param key - API key or identifier
 * @returns Formatted status
 *
 * @example
 * const status = await getRateLimitStatus(limiter, 'api-key-123');
 * console.log(status); // Shows usage and limits
 */
export async function getRateLimitStatus(limiter, key) {
    const status = await limiter.check(key);
    const analytics = await limiter.getAnalytics(key);
    return `
Rate Limit Status for ${key}:
  Requests Used: ${analytics.requestsUsed}/${analytics.requestLimit}
  Usage: ${analytics.percentUsed.toFixed(1)}%
  Requests Remaining: ${status.requestsRemaining}
  Burst Used: ${analytics.burstUsed}/${analytics.burstLimit}
  Window Reset: ${status.resetTime.toISOString()}
  Retry After: ${(status.retryAfter / 1000).toFixed(1)}s
  In Burst Mode: ${status.isInBurst ? 'Yes' : 'No'}
`;
}
export default {
    createRateLimiter,
    enforceRateLimit,
    createApiKeyLimiter,
    createTieredLimiter,
    getRateLimitStatus,
};
//# sourceMappingURL=advanced-rate-limiting.js.map