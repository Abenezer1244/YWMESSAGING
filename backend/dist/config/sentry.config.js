import * as Sentry from '@sentry/node';
/**
 * ✅ SECURITY: Initialize Sentry for error tracking and monitoring
 * Enables real-time error detection, performance monitoring, and alerting
 *
 * Features:
 * - Automatic error capture and reporting
 * - Performance monitoring with distributed tracing
 * - Source map support for debugging
 * - Custom context and breadcrumbs
 * - Environment-aware configuration (dev, staging, production)
 */
export function initSentry() {
    // Only initialize if DSN is provided (requires manual setup in Render or local .env)
    if (!process.env.SENTRY_DSN) {
        console.warn('⚠️ SENTRY_DSN not configured. Error tracking disabled.');
        return;
    }
    Sentry.init({
        // Sentry DSN from environment (get from https://sentry.io)
        dsn: process.env.SENTRY_DSN,
        // Environment
        environment: process.env.NODE_ENV || 'development',
        // Release version (optional, helps track which version has the error)
        release: process.env.APP_VERSION || '0.1.0',
        // Enable tracing for performance monitoring (10% of transactions in production, 100% in dev)
        tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
        // Ignore certain errors
        ignoreErrors: [
            // Browser errors (shouldn't happen in backend, but just in case)
            'ResizeObserver loop limit exceeded',
            // Network errors that are expected
            'ECONNREFUSED',
            'ENOTFOUND',
            // Health check errors (if someone hits /health with bad request)
            'ERR_HTTP_INVALID_STATUS_CODE',
        ],
        // Capture breadcrumbs for better error context
        maxBreadcrumbs: 50,
        // Configure which URLs to capture in breadcrumbs
        maxValueLength: 1024,
    });
    console.log('✅ Sentry initialized for error tracking');
}
/**
 * Return the Sentry Express request handler middleware
 * Should be used early in the middleware chain, after security headers but before routes
 */
export function getSentryRequestHandler() {
    return (req, res, next) => {
        // Attach request information to Sentry context
        Sentry.setContext('express', {
            method: req.method,
            path: req.path,
            query: req.query,
            userAgent: req.get('user-agent'),
        });
        next();
    };
}
/**
 * Return the Sentry Express error handler middleware
 * Should be used after routes but before the final error handler
 */
export function getSentryErrorHandler() {
    return (err, req, res, next) => {
        // Capture the error in Sentry
        Sentry.captureException(err, {
            contexts: {
                express: {
                    method: req.method,
                    path: req.path,
                    query: req.query,
                },
            },
        });
        // Pass to the next error handler
        next(err);
    };
}
/**
 * Manually capture an exception in code
 * Useful for catching errors in try-catch blocks and reporting them
 */
export function captureException(error, context) {
    if (process.env.SENTRY_DSN) {
        Sentry.captureException(error, {
            contexts: {
                custom: context,
            },
        });
    }
}
/**
 * Manually capture a message (for non-error events)
 * Useful for logging important events
 */
export function captureMessage(message, level = 'info', context) {
    if (process.env.SENTRY_DSN) {
        Sentry.captureMessage(message, {
            level,
            contexts: {
                custom: context,
            },
        });
    }
}
/**
 * Set user context for error tracking
 * Helps identify which user encountered the error
 */
export function setSentryUser(userId, email, username) {
    if (process.env.SENTRY_DSN) {
        Sentry.setUser({
            id: userId,
            email,
            username,
        });
    }
}
/**
 * Clear user context (e.g., on logout)
 */
export function clearSentryUser() {
    if (process.env.SENTRY_DSN) {
        Sentry.setUser(null);
    }
}
/**
 * Add custom context data to all future events
 */
export function setSentryContext(name, data) {
    if (process.env.SENTRY_DSN) {
        Sentry.setContext(name, data);
    }
}
export default Sentry;
//# sourceMappingURL=sentry.config.js.map