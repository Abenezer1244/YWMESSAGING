import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
import { ValidationError } from '../utils/errors/ValidationError.js';
/**
 * Validation Middleware
 * Validates request body, query params, or URL params against Zod schemas
 * Throws ValidationError with detailed field information on validation failure
 */
export declare function validateBody(schema: ZodSchema): (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * Validate query parameters
 */
export declare function validateQuery(schema: ZodSchema): (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * Validate URL parameters
 */
export declare function validateParams(schema: ZodSchema): (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * Safe validation helper - doesn't throw, returns result or error
 * Useful for optional validations or internal use
 */
export declare function safeValidate<T>(schema: ZodSchema<T>, data: any): Promise<{
    data?: T;
    error?: ValidationError;
}>;
//# sourceMappingURL=validation.middleware.d.ts.map