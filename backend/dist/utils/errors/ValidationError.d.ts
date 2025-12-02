import AppError from './AppError.js';
/**
 * ValidationError - Thrown when input validation fails
 * HTTP 400 Bad Request
 */
export declare class ValidationError extends AppError {
    constructor(message: string, details?: Record<string, any>);
}
export default ValidationError;
//# sourceMappingURL=ValidationError.d.ts.map