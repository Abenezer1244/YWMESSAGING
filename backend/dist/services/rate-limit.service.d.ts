/**
 * Rate Limiting Service
 * Implements token bucket algorithm for per-user rate limiting
 *
 * Prevents abuse through:
 * - Token bucket algorithm (burst-capable, smooth rate limiting)
 * - Per-user quotas (fair resource allocation)
 * - Automatic token refill (time-based)
 * - Analytics tracking (abuse detection)
 *
 * Token Bucket Algorithm:
 * - Bucket capacity = rate limit (e.g., 100 messages/hour)
 * - Tokens refill over time: capacity / time_window
 * - Each request costs 1 token (configurable)
 * - Request allowed if tokens >= cost
 * - Requests rejected with 429 if insufficient tokens
 */
export interface RateLimitConfig {
    capacity: number;
    windowSeconds: number;
    costPerRequest?: number;
}
export interface RateLimitStatus {
    remaining: number;
    limit: number;
    resetTimestamp: number;
    retryAfterSeconds: number;
}
/**
 * Check if user has exceeded rate limit
 * Returns true if request is allowed, false if rate limited
 */
export declare function checkRateLimit(userId: string, config: RateLimitConfig, cost?: number): Promise<boolean>;
/**
 * Get current rate limit status for user
 * Returns remaining tokens and reset time
 */
export declare function getRateLimitStatus(userId: string, config: RateLimitConfig): Promise<RateLimitStatus>;
/**
 * Manually reset user's rate limit bucket
 * Used for testing or administrative reset
 */
export declare function resetUserBucket(userId: string): Promise<void>;
/**
 * Record rate limit violation for analytics
 * Tracks abuse attempts for detection
 */
export declare function recordViolation(userId: string, endpoint: string, remainingTime: number): Promise<void>;
/**
 * Get violation history for user (last 24 hours)
 * Used for abuse detection and monitoring
 */
export declare function getViolationHistory(userId: string): Promise<any[]>;
/**
 * Get total requests made by user in current window
 * For analytics and billing purposes
 */
export declare function getUserRequestCount(userId: string): Promise<number>;
/**
 * Clean up old rate limit buckets (maintenance)
 * Redis TTL handles this automatically, but can be called manually
 */
export declare function cleanupExpiredBuckets(): Promise<void>;
//# sourceMappingURL=rate-limit.service.d.ts.map