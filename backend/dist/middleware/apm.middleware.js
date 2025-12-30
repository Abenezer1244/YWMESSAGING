/**
 * APM Middleware
 *
 * Integrates Datadog APM tracing for all HTTP requests
 * Automatically captures:
 * - Request/response metadata
 * - Response times
 * - Error tracking
 * - User context
 */
import tracer from '../config/datadog.config.js';
/**
 * APM middleware for Express
 * Traces all incoming HTTP requests with response times and status codes
 */
export function apmMiddleware(req, res, next) {
    // Skip tracing for health checks
    if (req.path === '/health' || req.path === '/healthz') {
        next();
        return;
    }
    const span = tracer.startSpan(`http.request`, {
        childOf: tracer.scope().active() || undefined,
    });
    // Set span resource and type
    span.setTag('span.type', 'web');
    span.setTag('resource', `${req.method} ${req.path}`);
    span.setTag('http.method', req.method);
    span.setTag('http.url', req.originalUrl);
    span.setTag('http.path', req.path);
    span.setTag('http.ip', req.ip);
    // Add tenant context if available
    if (req.headers['x-tenant-id']) {
        span.setTag('tenant_id', req.headers['x-tenant-id']);
    }
    // Add user context if authenticated
    if (req.user?.id) {
        span.setTag('user_id', req.user.id);
    }
    if (req.user?.email) {
        span.setTag('user_email', req.user.email);
    }
    // Track response
    const startTime = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - startTime;
        // Set response tags
        span.setTag('http.status_code', res.statusCode);
        span.setTag('http.response_time_ms', duration);
        // Mark errors
        if (res.statusCode >= 400) {
            span.setTag('http.error', true);
            span.setTag('error', true);
        }
        span.finish();
    });
    // Run in span context
    tracer.scope().activate(span, () => {
        next();
    });
}
export default apmMiddleware;
//# sourceMappingURL=apm.middleware.js.map