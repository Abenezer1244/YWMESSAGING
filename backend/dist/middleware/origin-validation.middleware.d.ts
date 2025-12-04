import { Request, Response, NextFunction } from 'express';
/**
 * Validate origin header against whitelist
 * Returns error message if invalid, null if valid
 */
declare function validateOrigin(origin: string | undefined): string | null;
/**
 * Validate referer header as backup check
 * Returns error message if invalid, null if valid
 */
declare function validateReferer(referer: string | undefined): string | null;
/**
 * Origin Validation Middleware
 *
 * For state-changing requests (POST, PUT, DELETE, PATCH):
 * 1. Check Origin header (primary validation)
 * 2. Check Referer header (backup validation)
 * 3. Allow safe requests without headers (same-origin)
 * 4. Block requests from untrusted origins
 */
export declare const originValidationMiddleware: (req: Request, res: Response, next: NextFunction) => void;
/**
 * Strict Origin Validation (for sensitive endpoints)
 *
 * Stricter than the default middleware:
 * - Requires Origin header for cross-origin requests
 * - Does not allow missing headers
 * - Useful for API endpoints accessed from JavaScript
 */
export declare const strictOriginValidationMiddleware: (req: Request, res: Response, next: NextFunction) => void;
/**
 * Report CSRF Attempt (for monitoring/alerting)
 * Called when CSRF validation fails
 */
export declare function reportCSRFAttempt(req: Request, origin: string | undefined, referer: string | undefined): Promise<void>;
/**
 * Get allowed origins list (for debugging/documentation)
 */
export declare function getAllowedOrigins(): string[];
declare const _default: {
    originValidationMiddleware: (req: Request, res: Response, next: NextFunction) => void;
    strictOriginValidationMiddleware: (req: Request, res: Response, next: NextFunction) => void;
    reportCSRFAttempt: typeof reportCSRFAttempt;
    getAllowedOrigins: typeof getAllowedOrigins;
    validateOrigin: typeof validateOrigin;
    validateReferer: typeof validateReferer;
};
export default _default;
//# sourceMappingURL=origin-validation.middleware.d.ts.map