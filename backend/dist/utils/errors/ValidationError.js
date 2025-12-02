import AppError from './AppError.js';
/**
 * ValidationError - Thrown when input validation fails
 * HTTP 400 Bad Request
 */
export class ValidationError extends AppError {
    constructor(message, details) {
        super(message, 400, 'VALIDATION_ERROR', details);
        Object.setPrototypeOf(this, ValidationError.prototype);
    }
}
export default ValidationError;
//# sourceMappingURL=ValidationError.js.map