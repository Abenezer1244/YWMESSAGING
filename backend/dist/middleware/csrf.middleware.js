import csrf from 'csurf';
/**
 * CSRF protection middleware
 * Uses double-submit cookie pattern combined with token validation
 * ✅ CRITICAL: SameSite must match auth cookies to allow cross-subdomain requests
 */
export const csrfProtection = csrf({
    cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        // ✅ CRITICAL: SameSite must be 'none' in production (cross-subdomain) or 'lax' in development
        // Must match auth cookies SameSite setting to ensure cookies are sent together
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        // ✅ CRITICAL: Set domain for cross-subdomain cookie sharing
        // This allows the _csrf cookie to be sent to both koinoniasms.com and api.koinoniasms.com
        domain: process.env.NODE_ENV === 'production' ? '.koinoniasms.com' : undefined,
    },
});
/**
 * Middleware to generate CSRF token for GET requests
 * This can be used to get a fresh token before making state-changing requests
 */
export function generateCsrfToken(req, res, next) {
    res.json({ csrfToken: req.csrfToken() });
}
//# sourceMappingURL=csrf.middleware.js.map