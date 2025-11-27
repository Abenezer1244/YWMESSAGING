import * as Sentry from '@sentry/node';
import { Request, Response, NextFunction } from 'express';
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
export declare function initSentry(): void;
/**
 * Return the Sentry Express request handler middleware
 * Should be used early in the middleware chain, after security headers but before routes
 */
export declare function getSentryRequestHandler(): (req: Request, res: Response, next: NextFunction) => void;
/**
 * Return the Sentry Express error handler middleware
 * Should be used after routes but before the final error handler
 */
export declare function getSentryErrorHandler(): (err: any, req: Request, res: Response, next: NextFunction) => void;
/**
 * Manually capture an exception in code
 * Useful for catching errors in try-catch blocks and reporting them
 */
export declare function captureException(error: Error, context?: Record<string, any>): void;
/**
 * Manually capture a message (for non-error events)
 * Useful for logging important events
 */
export declare function captureMessage(message: string, level?: 'fatal' | 'error' | 'warning' | 'info' | 'debug', context?: Record<string, any>): void;
/**
 * Set user context for error tracking
 * Helps identify which user encountered the error
 */
export declare function setSentryUser(userId?: string, email?: string, username?: string): void;
/**
 * Clear user context (e.g., on logout)
 */
export declare function clearSentryUser(): void;
/**
 * Add custom context data to all future events
 */
export declare function setSentryContext(name: string, data: Record<string, any>): void;
export default Sentry;
//# sourceMappingURL=sentry.config.d.ts.map