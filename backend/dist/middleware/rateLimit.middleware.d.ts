/**
 * Rate limiter for login endpoint
 * 5 attempts per 15 minutes, skips successful requests
 */
export declare const loginLimiter: import("express-rate-limit").RateLimitRequestHandler;
/**
 * Rate limiter for registration endpoint
 * 3 attempts per hour
 */
export declare const registerLimiter: import("express-rate-limit").RateLimitRequestHandler;
//# sourceMappingURL=rateLimit.middleware.d.ts.map