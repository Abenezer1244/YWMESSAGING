import AppError from './AppError.js';
/**
 * NotFoundError - Thrown when requested resource doesn't exist
 * HTTP 404 Not Found
 */
export declare class NotFoundError extends AppError {
    constructor(resource: string, details?: Record<string, any>);
}
export default NotFoundError;
//# sourceMappingURL=NotFoundError.d.ts.map