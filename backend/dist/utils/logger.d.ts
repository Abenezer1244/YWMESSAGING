/**
 * Structured Logging Utility
 *
 * Provides JSON-structured logging with:
 * - Log levels: DEBUG, INFO, WARN, ERROR
 * - Request correlation IDs for tracing
 * - Sensitive data masking (phone numbers, API keys, passwords)
 * - Pretty printing for development
 * - Log rotation ready (can pipe to log management service)
 *
 * Usage:
 * ```typescript
 * import { logger } from '../utils/logger.js';
 *
 * logger.info('User logged in', { userId: '123', email: 'user@example.com' });
 * logger.error('Database connection failed', { error: err.message });
 * ```
 */
interface LogContext {
    [key: string]: any;
}
/**
 * Main logger class
 */
declare class Logger {
    private minLevel;
    constructor();
    /**
     * Format timestamp as ISO string
     */
    private getTimestamp;
    /**
     * Log message at specified level
     */
    private log;
    /**
     * Log debug message
     */
    debug(message: string, context?: LogContext, correlationId?: string): void;
    /**
     * Log info message
     */
    info(message: string, context?: LogContext, correlationId?: string): void;
    /**
     * Log warning message
     */
    warn(message: string, context?: LogContext, correlationId?: string, error?: Error): void;
    /**
     * Log error message
     */
    error(message: string, error?: Error | string | LogContext, context?: LogContext, correlationId?: string): void;
    /**
     * Log operation timing
     */
    time(message: string, durationMs: number, context?: LogContext, correlationId?: string): void;
    /**
     * Create a timed operation wrapper
     */
    timeAsync<T>(message: string, fn: () => Promise<T>, context?: LogContext, correlationId?: string): Promise<T>;
}
export declare const logger: Logger;
/**
 * Middleware to add correlation ID to requests
 */
export declare function loggerMiddleware(req: any, res: any, next: any): void;
export {};
//# sourceMappingURL=logger.d.ts.map