import AppError from './AppError.js';
/**
 * AuthenticationError - Thrown when authentication fails (missing or invalid credentials)
 * HTTP 401 Unauthorized
 */
export declare class AuthenticationError extends AppError {
    constructor(message?: string, details?: Record<string, any>);
}
export default AuthenticationError;
//# sourceMappingURL=AuthenticationError.d.ts.map