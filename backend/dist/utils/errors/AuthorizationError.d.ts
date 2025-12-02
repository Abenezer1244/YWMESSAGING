import AppError from './AppError.js';
/**
 * AuthorizationError - Thrown when user lacks permission to access resource
 * HTTP 403 Forbidden
 */
export declare class AuthorizationError extends AppError {
    constructor(message?: string, details?: Record<string, any>);
}
export default AuthorizationError;
//# sourceMappingURL=AuthorizationError.d.ts.map