import { Request, Response, NextFunction } from 'express';
/**
 * Priority 3.1: Response Compression Middleware
 *
 * Automatically compresses response bodies larger than 1KB using gzip compression.
 * Reduces response payload size by 60-70% for typical JSON responses.
 *
 * Implementation:
 * - Only compresses responses >1KB (small responses overhead not worth it)
 * - Respects Accept-Encoding header
 * - Sets appropriate Content-Encoding header
 * - Minimal overhead (<50ms per request)
 */
export declare function compressionMiddleware(req: Request, res: Response, next: NextFunction): void;
//# sourceMappingURL=compression.middleware.d.ts.map