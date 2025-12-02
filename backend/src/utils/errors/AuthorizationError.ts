import AppError from './AppError.js';

/**
 * AuthorizationError - Thrown when user lacks permission to access resource
 * HTTP 403 Forbidden
 */
export class AuthorizationError extends AppError {
  constructor(message: string = 'Access denied', details?: Record<string, any>) {
    super(message, 403, 'AUTHORIZATION_ERROR', details);
    Object.setPrototypeOf(this, AuthorizationError.prototype);
  }
}

export default AuthorizationError;
