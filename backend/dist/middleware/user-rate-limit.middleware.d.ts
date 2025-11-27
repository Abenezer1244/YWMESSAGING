/**
 * User Rate Limit Middleware
 * Per-user rate limiting using token bucket algorithm
 *
 * Protects endpoints from individual users consuming all resources
 * Returns 429 with RateLimit headers when quota exceeded
 */
import { Request, Response, NextFunction } from 'express';
import { RateLimitConfig } from '../services/rate-limit.service.js';
/**
 * Extend Express Request to include rate limit info
 */
declare global {
    namespace Express {
        interface Request {
            rateLimit?: {
                remaining: number;
                limit: number;
                resetTimestamp: number;
            };
        }
    }
}
/**
 * Create rate limit middleware for authenticated users
 * Checks userId from JWT token in req.user
 */
export declare function createUserRateLimitMiddleware(config: RateLimitConfig): (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * Predefined rate limit configurations
 */
export declare const RateLimitPresets: {
    /**
     * Messages: 100 messages per hour
     * Allows burst of 100 messages, then 1 per 36 seconds
     */
    MESSAGES: RateLimitConfig;
    /**
     * API Requests: 1000 requests per hour
     * General API usage quota
     */
    API: RateLimitConfig;
    /**
     * File Uploads: 10 uploads per hour
     * Heavier operation, more restrictive
     */
    UPLOADS: RateLimitConfig;
    /**
     * Webhooks: 5 webhooks created per hour
     * Administrative operation, very restrictive
     */
    WEBHOOKS: RateLimitConfig;
    /**
     * Strict: 10 requests per minute
     * For sensitive operations (password reset, etc.)
     */
    STRICT: RateLimitConfig;
    /**
     * Moderate: 100 requests per minute
     * For normal API operations
     */
    MODERATE: RateLimitConfig;
    /**
     * Relaxed: 1000 requests per minute
     * For high-frequency operations
     */
    RELAXED: RateLimitConfig;
};
/**
 * Convenience functions for common rate limits
 */
export declare function messageLimiter(): (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare function apiLimiter(): (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare function uploadLimiter(): (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare function webhookLimiter(): (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare function strictLimiter(): (req: Request, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=user-rate-limit.middleware.d.ts.map