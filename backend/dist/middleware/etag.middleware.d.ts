import { Request, Response, NextFunction } from 'express';
export declare function etagMiddleware(req: Request, res: Response, next: NextFunction): void;
/**
 * Generate ETag for a given content string
 * Can be used by services to pre-compute ETags for specific responses
 */
export declare function computeETag(content: string): string;
/**
 * Utility to check if ETag matches
 * Can be used in route handlers for custom ETag logic
 */
export declare function etagMatches(clientETag: string | undefined, serverETag: string): boolean;
//# sourceMappingURL=etag.middleware.d.ts.map