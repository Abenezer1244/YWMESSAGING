/**
 * CSRF protection middleware
 * Uses double-submit cookie pattern combined with token validation
 * ✅ CRITICAL: SameSite must match auth cookies to allow cross-subdomain requests
 */
export declare const csrfProtection: import("express-serve-static-core").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
/**
 * Middleware to generate CSRF token for GET requests
 * This can be used to get a fresh token before making state-changing requests
 */
export declare function generateCsrfToken(req: any, res: any, next: any): void;
//# sourceMappingURL=csrf.middleware.d.ts.map