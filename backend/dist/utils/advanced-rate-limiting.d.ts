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
import { Request, Response, NextFunction } from 'express';
interface RateLimitConfig {
    windowMs: number;
    maxRequests: number;
    burstSize?: number;
    burstWindow?: number;
    keyGenerator?: (req: Request) => string;
    skipSuccessfulRequests?: boolean;
    skipFailedRequests?: boolean;
    onLimitReached?: (req: Request, res: Response) => void;
}
interface KeyConfig {
    [key: string]: {
        maxRequests: number;
        burstSize?: number;
        priority?: number;
        description?: string;
    };
}
interface RateLimitStatus {
    allowed: boolean;
    requestsRemaining: number;
    requestLimit: number;
    resetTime: Date;
    retryAfter: number;
    isInBurst: boolean;
}
interface RateLimitAnalytics {
    apiKey: string;
    requestsUsed: number;
    requestLimit: number;
    burstUsed: number;
    burstLimit: number;
    percentUsed: number;
    windowResetAt: Date;
    hourlyAverage: number;
    dailyTotal: number;
    hitsSinceReset: number;
    blocksSinceReset: number;
}
interface RateLimiterInstance {
    check: (key: string) => Promise<RateLimitStatus>;
    reset: (key: string) => Promise<void>;
    getAnalytics: (key: string) => Promise<RateLimitAnalytics>;
    getGlobalStats: () => Promise<{
        totalRequests: number;
        totalBlocks: number;
    }>;
    updateConfig: (config: Partial<RateLimitConfig>) => void;
    middleware: () => (req: Request, res: Response, next: NextFunction) => Promise<void>;
}
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
export declare function createRateLimiter(config: RateLimitConfig, keyConfigs?: KeyConfig): RateLimiterInstance;
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
export declare function enforceRateLimit(limiter: RateLimiterInstance): (req: Request, res: Response, next: NextFunction) => Promise<void>;
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
export declare function createApiKeyLimiter(keyConfigs: KeyConfig): RateLimiterInstance;
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
export declare function createTieredLimiter(): RateLimiterInstance;
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
export declare function getRateLimitStatus(limiter: RateLimiterInstance, key: string): Promise<string>;
declare const _default: {
    createRateLimiter: typeof createRateLimiter;
    enforceRateLimit: typeof enforceRateLimit;
    createApiKeyLimiter: typeof createApiKeyLimiter;
    createTieredLimiter: typeof createTieredLimiter;
    getRateLimitStatus: typeof getRateLimitStatus;
};
export default _default;
//# sourceMappingURL=advanced-rate-limiting.d.ts.map