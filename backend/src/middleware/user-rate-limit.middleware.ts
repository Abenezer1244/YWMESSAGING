/**
 * User Rate Limit Middleware
 * Per-user rate limiting using token bucket algorithm
 *
 * Protects endpoints from individual users consuming all resources
 * Returns 429 with RateLimit headers when quota exceeded
 */

import { Request, Response, NextFunction } from 'express';
import {
  checkRateLimit,
  getRateLimitStatus,
  recordViolation,
  RateLimitConfig,
} from '../services/rate-limit.service.js';

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
export function createUserRateLimitMiddleware(config: RateLimitConfig) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Get user ID from authenticated request
      const userId = (req as any).user?.userId;

      if (!userId) {
        // Unauthenticated request - skip per-user rate limiting
        return next();
      }

      // Check rate limit for this user
      const allowed = await checkRateLimit(userId, config);

      // Get current status for headers
      const status = await getRateLimitStatus(userId, config);

      // Add rate limit info to request for later use
      (req as any).rateLimit = {
        remaining: status.remaining,
        limit: status.limit,
        resetTimestamp: status.resetTimestamp,
      };

      // Set standard RateLimit headers
      res.setHeader('X-RateLimit-Limit', status.limit.toString());
      res.setHeader('X-RateLimit-Remaining', status.remaining.toString());
      res.setHeader('X-RateLimit-Reset', status.resetTimestamp.toString());

      if (allowed) {
        // Request allowed - proceed to next middleware
        return next();
      }

      // Rate limit exceeded
      console.log(
        `🚫 Rate limit exceeded: user=${userId}, remaining=${status.remaining}, retry=${status.retryAfterSeconds}s`
      );

      // Record violation for analytics
      await recordViolation(userId, req.path, status.retryAfterSeconds);

      // Set Retry-After header
      if (status.retryAfterSeconds > 0) {
        res.setHeader('Retry-After', status.retryAfterSeconds.toString());
      }

      // Return 429 Too Many Requests
      res.status(429).json({
        error: 'Too many requests',
        message: `Rate limit exceeded. Please retry in ${status.retryAfterSeconds} seconds.`,
        retryAfter: status.retryAfterSeconds,
        resetTimestamp: status.resetTimestamp,
      });
    } catch (error: any) {
      console.error('❌ Rate limit middleware error:', error.message);
      // On error, allow request (fail-open principle)
      next();
    }
  };
}

/**
 * Predefined rate limit configurations
 */
export const RateLimitPresets = {
  /**
   * Messages: 100 messages per hour
   * Allows burst of 100 messages, then 1 per 36 seconds
   */
  MESSAGES: {
    capacity: 100,
    windowSeconds: 3600,
    costPerRequest: 1,
  } as RateLimitConfig,

  /**
   * API Requests: 1000 requests per hour
   * General API usage quota
   */
  API: {
    capacity: 1000,
    windowSeconds: 3600,
    costPerRequest: 1,
  } as RateLimitConfig,

  /**
   * File Uploads: 10 uploads per hour
   * Heavier operation, more restrictive
   */
  UPLOADS: {
    capacity: 10,
    windowSeconds: 3600,
    costPerRequest: 1,
  } as RateLimitConfig,

  /**
   * Webhooks: 5 webhooks created per hour
   * Administrative operation, very restrictive
   */
  WEBHOOKS: {
    capacity: 5,
    windowSeconds: 3600,
    costPerRequest: 1,
  } as RateLimitConfig,

  /**
   * Strict: 10 requests per minute
   * For sensitive operations (password reset, etc.)
   */
  STRICT: {
    capacity: 10,
    windowSeconds: 60,
    costPerRequest: 1,
  } as RateLimitConfig,

  /**
   * Moderate: 100 requests per minute
   * For normal API operations
   */
  MODERATE: {
    capacity: 100,
    windowSeconds: 60,
    costPerRequest: 1,
  } as RateLimitConfig,

  /**
   * Relaxed: 1000 requests per minute
   * For high-frequency operations
   */
  RELAXED: {
    capacity: 1000,
    windowSeconds: 60,
    costPerRequest: 1,
  } as RateLimitConfig,
};

/**
 * Convenience functions for common rate limits
 */
export function messageLimiter() {
  return createUserRateLimitMiddleware(RateLimitPresets.MESSAGES);
}

export function apiLimiter() {
  return createUserRateLimitMiddleware(RateLimitPresets.API);
}

export function uploadLimiter() {
  return createUserRateLimitMiddleware(RateLimitPresets.UPLOADS);
}

export function webhookLimiter() {
  return createUserRateLimitMiddleware(RateLimitPresets.WEBHOOKS);
}

export function strictLimiter() {
  return createUserRateLimitMiddleware(RateLimitPresets.STRICT);
}
