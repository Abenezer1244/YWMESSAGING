import AppError from './AppError.js';
/**
 * AuthorizationError - Thrown when user lacks permission to access resource
 * HTTP 403 Forbidden
 */
export class AuthorizationError extends AppError {
    constructor(message = 'Access denied', details) {
        super(message, 403, 'AUTHORIZATION_ERROR', details);
        Object.setPrototypeOf(this, AuthorizationError.prototype);
    }
}
export default AuthorizationError;
//# sourceMappingURL=AuthorizationError.js.map