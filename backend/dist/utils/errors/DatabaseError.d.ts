import AppError from './AppError.js';
/**
 * DatabaseError - Thrown when database operations fail
 * HTTP 500 Internal Server Error
 * Should not expose internal DB details to client
 */
export declare class DatabaseError extends AppError {
    constructor(message?: string, details?: Record<string, any>);
}
export default DatabaseError;
//# sourceMappingURL=DatabaseError.d.ts.map