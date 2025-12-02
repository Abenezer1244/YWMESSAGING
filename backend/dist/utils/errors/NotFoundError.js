import AppError from './AppError.js';
/**
 * NotFoundError - Thrown when requested resource doesn't exist
 * HTTP 404 Not Found
 */
export class NotFoundError extends AppError {
    constructor(resource, details) {
        super(`${resource} not found`, 404, 'NOT_FOUND_ERROR', details);
        Object.setPrototypeOf(this, NotFoundError.prototype);
    }
}
export default NotFoundError;
//# sourceMappingURL=NotFoundError.js.map