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
interface SpanContext {
    [key: string]: any;
}
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
export declare function createCustomSpan<T>(operationName: string, fn: () => Promise<T> | T, context?: SpanContext, serviceName?: string): Promise<T>;
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
export declare function createAsyncSpan<T>(operationName: string, asyncFn: (...args: any[]) => Promise<T>, context?: SpanContext, serviceName?: string): (...args: any[]) => Promise<T>;
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
export declare function createDatabaseSpan<T>(operation: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE' | 'TRANSACTION', table: string, fn: () => Promise<T> | T, context?: SpanContext): Promise<T>;
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
export declare function createExternalApiSpan<T>(apiName: string, endpoint: string, fn: () => Promise<T> | T, context?: SpanContext): Promise<T>;
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
export declare function createJobSpan<T>(jobName: string, fn: () => Promise<T> | T, context?: SpanContext): Promise<T>;
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
export declare function trackTiming(name: string, duration: number, tags?: SpanContext): void;
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
export declare function recordMetric(metricName: string, value: number, tags?: SpanContext): void;
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
export declare function measurePerformance<T>(name: string, fn: () => Promise<T> | T, shouldLog?: boolean): Promise<T>;
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
export declare function getRouteSpan(req: any, spanName: string, context?: SpanContext): tracer.Span;
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
export declare function getCurrentSpan(): tracer.Span | null;
declare const _default: {
    createCustomSpan: typeof createCustomSpan;
    createAsyncSpan: typeof createAsyncSpan;
    createDatabaseSpan: typeof createDatabaseSpan;
    createExternalApiSpan: typeof createExternalApiSpan;
    createJobSpan: typeof createJobSpan;
    trackTiming: typeof trackTiming;
    recordMetric: typeof recordMetric;
    measurePerformance: typeof measurePerformance;
    getRouteSpan: typeof getRouteSpan;
    getCurrentSpan: typeof getCurrentSpan;
};
export default _default;
//# sourceMappingURL=apm-instrumentation.d.ts.map