import AppError from './AppError.js';

/**
 * AuthenticationError - Thrown when authentication fails (missing or invalid credentials)
 * HTTP 401 Unauthorized
 */
export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication failed', details?: Record<string, any>) {
    super(message, 401, 'AUTHENTICATION_ERROR', details);
    Object.setPrototypeOf(this, AuthenticationError.prototype);
  }
}

export default AuthenticationError;
