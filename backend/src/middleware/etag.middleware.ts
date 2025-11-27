import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

/**
 * Priority 3.1: ETag Support Middleware
 *
 * Generates and validates ETags for response caching.
 * Allows clients to cache responses and validate freshness using ETag headers.
 *
 * Implementation:
 * - Generates MD5 hash of response body as ETag
 * - Returns 304 Not Modified if ETag matches If-None-Match header
 * - Reduces bandwidth by 100% when cache is valid
 * - Compatible with all HTTP clients and browsers
 *
 * Client Flow:
 * 1. First request: Client receives response with ETag header
 * 2. Client caches response + ETag
 * 3. Next request: Client sends If-None-Match header with stored ETag
 * 4. Server compares ETags:
 *    - If match: Returns 304 Not Modified (browser uses cached response)
 *    - If different: Returns 200 with new response and new ETag
 */

function generateETag(content: string): string {
  // Generate a strong ETag using MD5 hash
  const hash = crypto.createHash('md5').update(content).digest('hex');
  return `"${hash}"`;
}

export function etagMiddleware(req: Request, res: Response, next: NextFunction): void {
  // Store original json method
  const originalJson = res.json.bind(res);

  // Override json method to generate ETag and handle caching
  res.json = function (data: any): Response {
    const jsonString = JSON.stringify(data);
    const etag = generateETag(jsonString);

    // Set cache headers for all responses
    res.setHeader('Cache-Control', 'public, max-age=3600'); // 1 hour
    res.setHeader('Expires', new Date(Date.now() + 60 * 60 * 1000).toUTCString());

    // Check if client sent If-None-Match header
    const clientETag = req.headers['if-none-match'];

    if (clientETag === etag) {
      // ETag matches - return 304 Not Modified
      console.log(`✅ Cache HIT (ETag): ${req.path} - Returning 304 Not Modified`);
      res.status(304);
      res.setHeader('ETag', etag);
      res.end();
      return res;
    }

    // ETag doesn't match - return full response with new ETag
    res.setHeader('ETag', etag);

    // Log cache miss in development
    if (process.env.NODE_ENV !== 'production') {
      console.log(`📝 Cache MISS (ETag): ${req.path} - Generated ETag: ${etag}`);
    }

    // Call original json method
    return originalJson(data);
  };

  next();
}

/**
 * Generate ETag for a given content string
 * Can be used by services to pre-compute ETags for specific responses
 */
export function computeETag(content: string): string {
  return generateETag(content);
}

/**
 * Utility to check if ETag matches
 * Can be used in route handlers for custom ETag logic
 */
export function etagMatches(clientETag: string | undefined, serverETag: string): boolean {
  return clientETag === serverETag;
}
