import csrf from 'csurf';

/**
 * CSRF protection middleware
 * Uses double-submit cookie pattern combined with token validation
 */
export const csrfProtection = csrf({
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    // ✅ CRITICAL: Set domain for cross-subdomain cookie sharing
    // This allows the _csrf cookie to be sent to both koinoniasms.com and api.koinoniasms.com
    domain: process.env.NODE_ENV === 'production' ? '.koinoniasms.com' : undefined,
  },
});

/**
 * Middleware to generate CSRF token for GET requests
 * This can be used to get a fresh token before making state-changing requests
 */
export function generateCsrfToken(req: any, res: any, next: any): void {
  res.json({ csrfToken: req.csrfToken() });
}
