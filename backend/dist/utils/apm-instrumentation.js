/**
 * APM Instrumentation Utilities
 *
 * Provides custom span creation and performance tracking for Datadog APM
 * Enables detailed tracing of critical operations:
 * - Database queries
 * - External API calls
 * - Business logic operations
 * - Async job processing
 *
 * Usage:
 * ```typescript
 * import { createCustomSpan, createAsyncSpan } from '../utils/apm-instrumentation.js';
 *
 * // Sync operation
 * await createCustomSpan('process_payment', async () => {
 *   return stripe.charges.create({ amount: 100 });
 * }, { userId: '123', amount: 100 });
 *
 * // Async operation with automatic error handling
 * const result = await createAsyncSpan('fetch_user_data', getUserData, {
 *   userId: '123'
 * });
 * ```
 */
import tracer from './tracer.js';
/**
 * Create a custom APM span for synchronous operations
 *
 * @param operationName - Name of the operation (shown in APM dashboard)
 * @param fn - Function to execute within the span
 * @param context - Additional context data to tag with the span
 * @param serviceName - Custom service name (defaults to current service)
 * @returns Result of the function
 *
 * @example
 * const user = await createCustomSpan('fetch_user', fetchUser, { userId: '123' });
 */
export async function createCustomSpan(operationName, fn, context, serviceName) {
    const span = tracer.startSpan(operationName, {
        childOf: tracer.scope().active() || undefined,
    });
    // Set resource tags
    span.setTag('resource', operationName);
    if (serviceName) {
        span.setTag('service', serviceName);
    }
    try {
        // Add context tags to span
        if (context) {
            Object.entries(context).forEach(([key, value]) => {
                if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
                    span.setTag(key, value);
                }
            });
        }
        // Execute the function
        const result = await fn();
        // Mark span as successful
        span.setTag('status', 'success');
        return result;
    }
    catch (error) {
        // Mark span as failed and capture error
        span.setTag('status', 'error');
        span.setTag('error', true);
        if (error instanceof Error) {
            span.setTag('error.message', error.message);
            span.setTag('error.stack', error.stack);
        }
        throw error;
    }
    finally {
        span.finish();
    }
}
/**
 * Create a custom APM span for async operations
 * Automatically handles promise resolution and rejection
 *
 * @param operationName - Name of the operation
 * @param asyncFn - Async function to execute
 * @param context - Additional context data
 * @param serviceName - Custom service name
 * @returns Promise with the result of the async function
 *
 * @example
 * const result = await createAsyncSpan('send_email', sendEmail, { userId: '123' });
 */
export function createAsyncSpan(operationName, asyncFn, context, serviceName) {
    return async (...args) => {
        return createCustomSpan(operationName, () => asyncFn(...args), context, serviceName);
    };
}
/**
 * Create a span for database operations
 * Automatically tags with database-specific information
 *
 * @param operation - Type of operation (SELECT, INSERT, UPDATE, DELETE)
 * @param table - Table name
 * @param fn - Function to execute
 * @param context - Additional context
 *
 * @example
 * await createDatabaseSpan('SELECT', 'users', queryUsers, { limit: 10 });
 */
export async function createDatabaseSpan(operation, table, fn, context) {
    return createCustomSpan(`db.${operation.toLowerCase()}.${table}`, fn, {
        db_operation: operation,
        db_table: table,
        ...context,
    }, 'database');
}
/**
 * Create a span for external API calls
 * Automatically tags with API-specific information
 *
 * @param apiName - Name of the API (e.g., 'stripe', 'telnyx')
 * @param endpoint - API endpoint being called
 * @param fn - Function to execute
 * @param context - Additional context
 *
 * @example
 * await createExternalApiSpan('stripe', 'charges.create', createCharge, { amount: 100 });
 */
export async function createExternalApiSpan(apiName, endpoint, fn, context) {
    return createCustomSpan(`external.${apiName}.${endpoint}`, fn, {
        api_name: apiName,
        api_endpoint: endpoint,
        ...context,
    }, apiName);
}
/**
 * Create a span for background jobs/async operations
 * Used for queue processing, scheduled tasks, webhooks
 *
 * @param jobName - Name of the job
 * @param fn - Function to execute
 * @param context - Additional context
 *
 * @example
 * await createJobSpan('process_recurring_messages', processMessages, { churchId: '123' });
 */
export async function createJobSpan(jobName, fn, context) {
    return createCustomSpan(`job.${jobName}`, fn, {
        job_name: jobName,
        ...context,
    }, 'background-jobs');
}
/**
 * Track timing of a code section
 * Useful for measuring performance without wrapping in a span
 *
 * @param name - Name of the section
 * @param duration - Duration in milliseconds
 * @param tags - Additional tags
 *
 * @example
 * const start = Date.now();
 * // ... do work ...
 * trackTiming('data_processing', Date.now() - start, { records: 1000 });
 */
export function trackTiming(name, duration, tags) {
    const span = tracer.startSpan(`timing.${name}`);
    span.setTag('duration_ms', duration);
    if (tags) {
        Object.entries(tags).forEach(([key, value]) => {
            if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
                span.setTag(key, value);
            }
        });
    }
    span.finish();
}
/**
 * Add custom metric to APM
 * Useful for business metrics (revenue, errors, conversions, etc.)
 *
 * @param metricName - Name of the metric
 * @param value - Metric value
 * @param tags - Additional tags
 *
 * @example
 * recordMetric('payment_amount', 1000, { currency: 'USD', type: 'charge' });
 */
export function recordMetric(metricName, value, tags) {
    try {
        // Use tracer's metric recording if available
        const span = tracer.startSpan(`metric.${metricName}`);
        span.setTag('value', value);
        if (tags) {
            Object.entries(tags).forEach(([key, val]) => {
                if (typeof val === 'string' || typeof val === 'number' || typeof val === 'boolean') {
                    span.setTag(key, val);
                }
            });
        }
        span.finish();
    }
    catch (error) {
        console.warn(`Failed to record metric ${metricName}:`, error);
    }
}
/**
 * Measure performance of a function and log timing
 * Returns the execution time in milliseconds
 *
 * @param name - Name of the operation
 * @param fn - Function to execute
 * @param shouldLog - Whether to log the timing (default: false)
 *
 * @example
 * const duration = await measurePerformance('database_query', queryUsers);
 * console.log(`Query took ${duration}ms`);
 */
export async function measurePerformance(name, fn, shouldLog = false) {
    const startTime = Date.now();
    try {
        const result = await fn();
        const duration = Date.now() - startTime;
        if (shouldLog) {
            console.log(`⏱️ ${name} took ${duration}ms`);
        }
        trackTiming(name, duration);
        return result;
    }
    catch (error) {
        const duration = Date.now() - startTime;
        console.error(`❌ ${name} failed after ${duration}ms:`, error);
        trackTiming(`${name}_error`, duration, { error: 'true' });
        throw error;
    }
}
/**
 * Create a span wrapper for route handlers
 * Automatically captures HTTP request details
 *
 * @param req - Express request object
 * @param spanName - Name of the span
 * @param context - Additional context
 *
 * @example
 * export async function handleCreateUser(req: Request, res: Response) {
 *   const span = getRouteSpan(req, 'create_user', { email: req.body.email });
 *   try {
 *     // ... route logic ...
 *   } catch (error) {
 *     span.setTag('error', true);
 *     throw error;
 *   } finally {
 *     span.finish();
 *   }
 * }
 */
export function getRouteSpan(req, spanName, context) {
    const span = tracer.startSpan(`http.${spanName}`, {
        childOf: tracer.scope().active() || undefined,
    });
    // Set type tags
    span.setTag('span.type', 'web');
    span.setTag('resource', `${req.method} ${req.path}`);
    // Add request context
    span.setTag('http.method', req.method);
    span.setTag('http.path', req.path);
    span.setTag('http.ip', req.ip);
    if (context) {
        Object.entries(context).forEach(([key, value]) => {
            if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
                span.setTag(key, value);
            }
        });
    }
    return span;
}
/**
 * Get the current active span
 * Useful for adding tags/context to ongoing spans
 *
 * @returns Current active span or undefined
 *
 * @example
 * const span = getCurrentSpan();
 * if (span) {
 *   span.setTag('user_id', userId);
 * }
 */
export function getCurrentSpan() {
    return tracer.scope().active();
}
export default {
    createCustomSpan,
    createAsyncSpan,
    createDatabaseSpan,
    createExternalApiSpan,
    createJobSpan,
    trackTiming,
    recordMetric,
    measurePerformance,
    getRouteSpan,
    getCurrentSpan,
};
//# sourceMappingURL=apm-instrumentation.js.map