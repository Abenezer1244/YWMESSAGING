import { ZodError } from 'zod';
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
export function validateRequest(schema) {
    return async (req, res, next) => {
        try {
            // Validate request body against schema
            const validated = schema.parse(req.body);
            // Replace req.body with validated data (removes extra fields, applies transformations)
            req.body = validated;
            next();
        }
        catch (error) {
            if (error instanceof ZodError) {
                // Format Zod validation errors
                const formattedErrors = error.errors.map((err) => ({
                    field: err.path.join('.'),
                    message: err.message,
                    code: err.code,
                }));
                res.status(400).json({
                    error: 'Validation failed',
                    details: formattedErrors,
                    timestamp: new Date().toISOString(),
                });
                return;
            }
            // Unexpected error
            res.status(500).json({
                error: 'Validation error',
                message: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    };
}
/**
 * Validation middleware for query parameters
 *
 * Usage:
 *   router.get('/endpoint', validateQuery(FilterSchema), handler);
 */
export function validateQuery(schema) {
    return async (req, res, next) => {
        try {
            const validated = schema.parse(req.query);
            req.query = validated;
            next();
        }
        catch (error) {
            if (error instanceof ZodError) {
                const formattedErrors = error.errors.map((err) => ({
                    field: err.path.join('.'),
                    message: err.message,
                    code: err.code,
                }));
                res.status(400).json({
                    error: 'Invalid query parameters',
                    details: formattedErrors,
                });
                return;
            }
            res.status(500).json({
                error: 'Query validation error',
                message: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    };
}
/**
 * Validation middleware for URL parameters
 *
 * Usage:
 *   router.get('/endpoint/:id', validateParams(z.object({ id: z.string().uuid() })), handler);
 */
export function validateParams(schema) {
    return async (req, res, next) => {
        try {
            const validated = schema.parse(req.params);
            req.params = validated;
            next();
        }
        catch (error) {
            if (error instanceof ZodError) {
                const formattedErrors = error.errors.map((err) => ({
                    field: err.path.join('.'),
                    message: err.message,
                }));
                res.status(400).json({
                    error: 'Invalid parameters',
                    details: formattedErrors,
                });
                return;
            }
            res.status(500).json({ error: 'Parameter validation error' });
        }
    };
}
//# sourceMappingURL=validation.middleware.js.map