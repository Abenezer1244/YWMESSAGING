import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
/**
 * Validation middleware for Zod schemas
 *
 * Usage:
 *   router.post('/endpoint', validateRequest(MySchema), handler);
 *
 * This will:
 * 1. Validate req.body against the schema
 * 2. Return 400 with detailed error messages if invalid
 * 3. Call next() if valid (req.body contains validated data)
 */
export declare function validateRequest(schema: ZodSchema): (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * Validation middleware for query parameters
 *
 * Usage:
 *   router.get('/endpoint', validateQuery(FilterSchema), handler);
 */
export declare function validateQuery(schema: ZodSchema): (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * Validation middleware for URL parameters
 *
 * Usage:
 *   router.get('/endpoint/:id', validateParams(z.object({ id: z.string().uuid() })), handler);
 */
export declare function validateParams(schema: ZodSchema): (req: Request, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=validation.middleware.d.ts.map