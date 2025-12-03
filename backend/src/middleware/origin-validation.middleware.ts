import { Request, Response, NextFunction } from 'express';

/**
 * ✅ SECURITY: Origin/Referer Validation Middleware
 *
 * Prevents CSRF attacks by validating that requests originate from
 * trusted domains. Works as defense-in-depth with HTTPOnly cookies.
 *
 * Reference: OWASP Cross-Site Request Forgery (CSRF)
 * https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html
 */

// Allowed origins - whitelisted frontend URLs
const ALLOWED_ORIGINS = [
  // Production
  process.env.FRONTEND_URL,
  process.env.FRONTEND_URL?.replace('https://', 'https://www.'),

  // Development
  ...(process.env.NODE_ENV === 'development' ? [
    'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:5174',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:5173',
  ] : []),
].filter(Boolean) as string[];

// Methods that require origin validation (state-changing operations)
const PROTECTED_METHODS = ['POST', 'PUT', 'DELETE', 'PATCH'];

// Endpoints that are public webhooks and should bypass origin validation
const WEBHOOK_PATHS = [
  '/api/webhooks/',
  '/api/github-agents/',
];

/**
 * Check if a path is a webhook endpoint
 */
function isWebhookPath(path: string): boolean {
  return WEBHOOK_PATHS.some(webhookPath => path.startsWith(webhookPath));
}

/**
 * Validate origin header against whitelist
 * Returns error message if invalid, null if valid
 */
function validateOrigin(origin: string | undefined): string | null {
  // If no origin header, it's likely a same-origin request or old browser
  // Allow it (same-origin requests don't send Origin header in some cases)
  if (!origin) {
    return null;
  }

  // Check if origin is in whitelist
  const isAllowed = ALLOWED_ORIGINS.some(allowedOrigin => {
    if (!allowedOrigin) return false;

    // Exact match
    if (origin === allowedOrigin) return true;

    // Handle both http and https variants
    if (origin.replace('http://', 'https://') === allowedOrigin) return true;
    if (origin.replace('https://', 'http://') === allowedOrigin.replace('https://', 'http://')) return true;

    return false;
  });

  return isAllowed ? null : `Origin not allowed: ${origin}`;
}

/**
 * Validate referer header as backup check
 * Returns error message if invalid, null if valid
 */
function validateReferer(referer: string | undefined): string | null {
  // Referer header is optional and can be empty (privacy settings)
  if (!referer) {
    return null;
  }

  // Extract hostname from referer URL
  try {
    const refererUrl = new URL(referer);
    const refererOrigin = `${refererUrl.protocol}//${refererUrl.host}`;

    // Check if referer origin is in whitelist
    const isAllowed = ALLOWED_ORIGINS.some(allowedOrigin => {
      if (!allowedOrigin) return false;

      try {
        const allowedUrl = new URL(allowedOrigin);
        const allowedRefererOrigin = `${allowedUrl.protocol}//${allowedUrl.host}`;
        return refererOrigin === allowedRefererOrigin;
      } catch {
        return false;
      }
    });

    return isAllowed ? null : `Referer not allowed: ${referer}`;
  } catch (error) {
    // Invalid referer URL format
    return `Invalid referer format: ${referer}`;
  }
}

/**
 * Origin Validation Middleware
 *
 * For state-changing requests (POST, PUT, DELETE, PATCH):
 * 1. Check Origin header (primary validation)
 * 2. Check Referer header (backup validation)
 * 3. Allow safe requests without headers (same-origin)
 * 4. Block requests from untrusted origins
 */
export const originValidationMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Skip validation for:
  // 1. Safe methods (GET, HEAD, OPTIONS)
  // 2. Webhook endpoints (signature-verified)
  if (!PROTECTED_METHODS.includes(req.method) || isWebhookPath(req.path)) {
    return next();
  }

  const origin = req.headers.origin;
  const referer = req.headers.referer;

  // Validate origin header
  const originError = validateOrigin(origin);
  if (originError) {
    // Try referer as backup
    const refererError = validateReferer(referer);
    if (refererError) {
      // Both origin and referer failed/missing
      // For same-origin requests (no origin header), allow
      if (!origin && !referer) {
        // Same-origin or privacy mode - allow
        // (browsers typically include origin for CORS requests)
        return next();
      }

      // Origin/Referer explicitly provided but not allowed
      console.warn(`🚨 CSRF ATTEMPT: ${req.method} ${req.path}`, {
        ip: req.ip,
        origin: origin || 'not set',
        referer: referer || 'not set',
        userAgent: req.headers['user-agent'],
      });

      return res.status(403).json({
        success: false,
        error: 'Request origin not allowed (CSRF protection)',
        code: 'CSRF_INVALID_ORIGIN',
      });
    }
  }

  // Validation passed
  next();
};

/**
 * Strict Origin Validation (for sensitive endpoints)
 *
 * Stricter than the default middleware:
 * - Requires Origin header for cross-origin requests
 * - Does not allow missing headers
 * - Useful for API endpoints accessed from JavaScript
 */
export const strictOriginValidationMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Skip validation for safe methods and webhooks
  if (!PROTECTED_METHODS.includes(req.method) || isWebhookPath(req.path)) {
    return next();
  }

  const origin = req.headers.origin;

  if (!origin) {
    // Strict mode: require Origin header
    // This indicates a cross-origin request that should have header
    console.warn(`🚨 CSRF ATTEMPT: Missing Origin header for ${req.method} ${req.path}`, {
      ip: req.ip,
      referer: req.headers.referer || 'not set',
      userAgent: req.headers['user-agent'],
    });

    return res.status(403).json({
      success: false,
      error: 'Missing Origin header (CSRF protection)',
      code: 'CSRF_MISSING_ORIGIN',
    });
  }

  // Validate origin
  const originError = validateOrigin(origin);
  if (originError) {
    console.warn(`🚨 CSRF ATTEMPT: Invalid origin ${origin}`, {
      ip: req.ip,
      path: req.path,
      userAgent: req.headers['user-agent'],
    });

    return res.status(403).json({
      success: false,
      error: originError,
      code: 'CSRF_INVALID_ORIGIN',
    });
  }

  next();
};

/**
 * Report CSRF Attempt (for monitoring/alerting)
 * Called when CSRF validation fails
 */
export async function reportCSRFAttempt(
  req: Request,
  origin: string | undefined,
  referer: string | undefined,
): Promise<void> {
  const csrfEvent = {
    type: 'CSRF_ATTEMPT',
    timestamp: new Date().toISOString(),
    ip: req.ip,
    method: req.method,
    path: req.path,
    origin: origin || 'not provided',
    referer: referer || 'not provided',
    userAgent: req.headers['user-agent'],
    userId: (req as any).user?.id || 'unknown',
  };

  // Log to console (will be picked up by Sentry)
  console.error('🚨 CSRF Attack Detected:', csrfEvent);

  // Optional: Send to security monitoring system
  // await alertSecurityTeam(csrfEvent);
}

/**
 * Get allowed origins list (for debugging/documentation)
 */
export function getAllowedOrigins(): string[] {
  return ALLOWED_ORIGINS.filter(Boolean) as string[];
}

export default {
  originValidationMiddleware,
  strictOriginValidationMiddleware,
  reportCSRFAttempt,
  getAllowedOrigins,
  validateOrigin,
  validateReferer,
};
