import AppError from './AppError.js';
/**
 * DatabaseError - Thrown when database operations fail
 * HTTP 500 Internal Server Error
 * Should not expose internal DB details to client
 */
export class DatabaseError extends AppError {
    constructor(message = 'Database operation failed', details) {
        super(message, 500, 'DATABASE_ERROR', details);
        Object.setPrototypeOf(this, DatabaseError.prototype);
    }
}
export default DatabaseError;
//# sourceMappingURL=DatabaseError.js.map