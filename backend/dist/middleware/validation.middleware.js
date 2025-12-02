import { ZodError } from 'zod';
import { ValidationError } from '../utils/errors/ValidationError.js';
/**
 * Validation Middleware
 * Validates request body, query params, or URL params against Zod schemas
 * Throws ValidationError with detailed field information on validation failure
 */
export function validateBody(schema) {
    return async (req, res, next) => {
        try {
            const validated = await schema.parseAsync(req.body);
            req.body = validated;
            next();
        }
        catch (error) {
            if (error instanceof ZodError) {
                const details = error.errors.map((err) => ({
                    field: err.path.join('.'),
                    message: err.message,
                    code: err.code,
                }));
                throw new ValidationError('Request validation failed', { errors: details });
            }
            throw error;
        }
    };
}
/**
 * Validate query parameters
 */
export function validateQuery(schema) {
    return async (req, res, next) => {
        try {
            const validated = await schema.parseAsync(req.query);
            req.query = validated;
            next();
        }
        catch (error) {
            if (error instanceof ZodError) {
                const details = error.errors.map((err) => ({
                    field: err.path.join('.'),
                    message: err.message,
                    code: err.code,
                }));
                throw new ValidationError('Query parameter validation failed', { errors: details });
            }
            throw error;
        }
    };
}
/**
 * Validate URL parameters
 */
export function validateParams(schema) {
    return async (req, res, next) => {
        try {
            const validated = await schema.parseAsync(req.params);
            req.params = validated;
            next();
        }
        catch (error) {
            if (error instanceof ZodError) {
                const details = error.errors.map((err) => ({
                    field: err.path.join('.'),
                    message: err.message,
                    code: err.code,
                }));
                throw new ValidationError('URL parameter validation failed', { errors: details });
            }
            throw error;
        }
    };
}
/**
 * Safe validation helper - doesn't throw, returns result or error
 * Useful for optional validations or internal use
 */
export async function safeValidate(schema, data) {
    try {
        const validated = await schema.parseAsync(data);
        return { data: validated };
    }
    catch (error) {
        if (error instanceof ZodError) {
            const details = error.errors.map((err) => ({
                field: err.path.join('.'),
                message: err.message,
                code: err.code,
            }));
            return {
                error: new ValidationError('Validation failed', { errors: details }),
            };
        }
        return {
            error: new ValidationError('Unknown validation error'),
        };
    }
}
//# sourceMappingURL=validation.middleware.js.map