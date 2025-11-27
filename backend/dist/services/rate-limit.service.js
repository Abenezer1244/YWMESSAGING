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
import { redisClient } from '../config/redis.config.js';
/**
 * Check if user has exceeded rate limit
 * Returns true if request is allowed, false if rate limited
 */
export async function checkRateLimit(userId, config, cost = config.costPerRequest || 1) {
    try {
        const key = `rate_limit:${userId}`;
        // Get current bucket state
        const data = await redisClient.get(key);
        let bucket = data ? JSON.parse(data) : null;
        // First request or bucket expired - initialize new bucket
        if (!bucket) {
            bucket = {
                tokens: config.capacity,
                lastRefillTime: Date.now(),
                totalRequests: 0,
            };
        }
        // Refill tokens based on elapsed time
        const now = Date.now();
        const elapsedSeconds = (now - bucket.lastRefillTime) / 1000;
        const tokensPerSecond = config.capacity / config.windowSeconds;
        const tokensToAdd = elapsedSeconds * tokensPerSecond;
        bucket.tokens = Math.min(config.capacity, bucket.tokens + tokensToAdd);
        bucket.lastRefillTime = now;
        bucket.totalRequests++;
        // Check if request is allowed
        if (bucket.tokens >= cost) {
            // Consume tokens
            bucket.tokens -= cost;
            // Save updated bucket with TTL = window size
            await redisClient.setEx(key, config.windowSeconds, JSON.stringify(bucket));
            return true; // Request allowed
        }
        // Rate limit exceeded - save bucket and reject
        await redisClient.setEx(key, config.windowSeconds, JSON.stringify(bucket));
        return false; // Request rejected
    }
    catch (error) {
        console.error(`❌ Rate limit check failed for user ${userId}:`, error.message);
        // On error, allow request (fail-open)
        return true;
    }
}
/**
 * Get current rate limit status for user
 * Returns remaining tokens and reset time
 */
export async function getRateLimitStatus(userId, config) {
    try {
        const key = `rate_limit:${userId}`;
        const data = await redisClient.get(key);
        let bucket = data ? JSON.parse(data) : null;
        // No bucket = full quota available
        if (!bucket) {
            return {
                remaining: config.capacity,
                limit: config.capacity,
                resetTimestamp: Math.floor((Date.now() + config.windowSeconds * 1000) / 1000),
                retryAfterSeconds: 0,
            };
        }
        // Refill tokens based on elapsed time
        const now = Date.now();
        const elapsedSeconds = (now - bucket.lastRefillTime) / 1000;
        const tokensPerSecond = config.capacity / config.windowSeconds;
        const tokensToAdd = elapsedSeconds * tokensPerSecond;
        bucket.tokens = Math.min(config.capacity, bucket.tokens + tokensToAdd);
        // Calculate time until next token available
        let retryAfterSeconds = 0;
        if (bucket.tokens < 1) {
            const tokensNeeded = 1 - bucket.tokens;
            retryAfterSeconds = Math.ceil(tokensNeeded / tokensPerSecond);
        }
        const resetTime = bucket.lastRefillTime + config.windowSeconds * 1000;
        return {
            remaining: Math.floor(bucket.tokens),
            limit: config.capacity,
            resetTimestamp: Math.floor(resetTime / 1000),
            retryAfterSeconds,
        };
    }
    catch (error) {
        console.error(`❌ Failed to get rate limit status for user ${userId}:`, error.message);
        // On error, return full quota (fail-open)
        return {
            remaining: config.capacity,
            limit: config.capacity,
            resetTimestamp: Math.floor((Date.now() + config.windowSeconds * 1000) / 1000),
            retryAfterSeconds: 0,
        };
    }
}
/**
 * Manually reset user's rate limit bucket
 * Used for testing or administrative reset
 */
export async function resetUserBucket(userId) {
    try {
        const key = `rate_limit:${userId}`;
        await redisClient.del(key);
        console.log(`🔄 Reset rate limit bucket for user: ${userId}`);
    }
    catch (error) {
        console.error(`❌ Failed to reset bucket for user ${userId}:`, error.message);
    }
}
/**
 * Record rate limit violation for analytics
 * Tracks abuse attempts for detection
 */
export async function recordViolation(userId, endpoint, remainingTime) {
    try {
        const key = `rate_limit:violations:${userId}`;
        const violation = {
            endpoint,
            timestamp: new Date().toISOString(),
            remainingTime,
        };
        // Keep violation log for 24 hours
        await redisClient.lPush(key, JSON.stringify(violation));
        await redisClient.expire(key, 24 * 60 * 60);
        console.log(`⚠️ Rate limit violation: user=${userId}, endpoint=${endpoint}`);
    }
    catch (error) {
        console.error(`❌ Failed to record violation for user ${userId}:`, error.message);
    }
}
/**
 * Get violation history for user (last 24 hours)
 * Used for abuse detection and monitoring
 */
export async function getViolationHistory(userId) {
    try {
        const key = `rate_limit:violations:${userId}`;
        const violations = await redisClient.lRange(key, 0, -1);
        return violations.map(v => JSON.parse(v));
    }
    catch (error) {
        console.error(`❌ Failed to get violations for user ${userId}:`, error.message);
        return [];
    }
}
/**
 * Get total requests made by user in current window
 * For analytics and billing purposes
 */
export async function getUserRequestCount(userId) {
    try {
        const key = `rate_limit:${userId}`;
        const data = await redisClient.get(key);
        if (!data)
            return 0;
        const bucket = JSON.parse(data);
        return bucket.totalRequests || 0;
    }
    catch (error) {
        console.error(`❌ Failed to get request count for user ${userId}:`, error.message);
        return 0;
    }
}
/**
 * Clean up old rate limit buckets (maintenance)
 * Redis TTL handles this automatically, but can be called manually
 */
export async function cleanupExpiredBuckets() {
    try {
        // Redis automatically expires keys with TTL
        // This is a no-op but kept for explicit cleanup if needed
        console.log('✅ Rate limit buckets cleaned (TTL-based expiration)');
    }
    catch (error) {
        console.error('❌ Cleanup failed:', error.message);
    }
}
//# sourceMappingURL=rate-limit.service.js.map