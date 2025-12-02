/**
 * AppError - Base custom error class for all application errors
 * Extends Error with statusCode and error code for consistent error handling
 * Allows clients to parse error codes for programmatic error handling
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly details?: Record<string, any>;

  constructor(
    message: string,
    statusCode: number,
    code: string,
    details?: Record<string, any>
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;

    // Set the prototype explicitly (needed for instanceof checks)
    Object.setPrototypeOf(this, AppError.prototype);
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      error: {
        message: this.message,
        code: this.code,
        statusCode: this.statusCode,
        ...(this.details && { details: this.details }),
      },
    };
  }
}

export default AppError;
