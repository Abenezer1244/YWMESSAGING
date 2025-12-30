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
import { Request, Response, NextFunction } from 'express';
/**
 * APM middleware for Express
 * Traces all incoming HTTP requests with response times and status codes
 */
export declare function apmMiddleware(req: Request, res: Response, next: NextFunction): void;
export default apmMiddleware;
//# sourceMappingURL=apm.middleware.d.ts.map