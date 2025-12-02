/**
 * ✅ SECURITY: Centralized Error Handling
 *
 * Purpose: Hide internal error details from clients while maintaining debugging capability
 * - Logs full details (stack trace) server-side for debugging
 * - Returns safe, user-friendly messages to clients
 * - Maps errors to appropriate HTTP status codes
 * - Integrates with Sentry for error tracking
 *
 * NEVER expose:
 * - Database error details
 * - Stack traces
 * - Internal file paths
 * - SQL queries
 * - Environment variables
 * - Service names or architecture details
 */
export class AppError extends Error {
    constructor(userMessage, statusCode = 500, context, isOperational = true) {
        super(userMessage);
        this.statusCode = statusCode;
        this.userMessage = userMessage;
        this.isOperational = isOperational;
        this.context = context;
        // Capture stack trace for debugging
        Error.captureStackTrace(this, this.constructor);
        // Set prototype explicitly (required for TypeScript to work correctly)
        Object.setPrototypeOf(this, AppError.prototype);
    }
    /**
     * Log error with full details (server-side only, never exposed to client)
     */
    logError() {
        console.error({
            message: this.message,
            statusCode: this.statusCode,
            context: this.context,
            stack: this.stack,
            timestamp: new Date().toISOString(),
        });
    }
}
/**
 * Error mapping for common scenarios
 * Maps internal errors to safe client messages
 */
export const ERROR_MESSAGES = {
    // Authentication & Authorization
    INVALID_CREDENTIALS: {
        message: 'Invalid email or password',
        statusCode: 401,
    },
    UNAUTHORIZED: {
        message: 'You do not have permission to access this resource',
        statusCode: 403,
    },
    TOKEN_EXPIRED: {
        message: 'Your session has expired. Please log in again.',
        statusCode: 401,
    },
    TOKEN_INVALID: {
        message: 'Invalid or malformed authentication token',
        statusCode: 401,
    },
    // Not Found
    NOT_FOUND: {
        message: 'The requested resource was not found',
        statusCode: 404,
    },
    CONVERSATION_NOT_FOUND: {
        message: 'Conversation not found',
        statusCode: 404,
    },
    CHURCH_NOT_FOUND: {
        message: 'Church not found',
        statusCode: 404,
    },
    USER_NOT_FOUND: {
        message: 'User not found',
        statusCode: 404,
    },
    // Validation
    INVALID_INPUT: {
        message: 'The provided input is invalid. Please check your request and try again.',
        statusCode: 400,
    },
    VALIDATION_ERROR: {
        message: 'Validation failed. Please check your input and try again.',
        statusCode: 400,
    },
    MISSING_REQUIRED_FIELD: {
        message: 'A required field is missing from your request',
        statusCode: 400,
    },
    // Business Logic
    INSUFFICIENT_CREDITS: {
        message: 'Insufficient credits to complete this action',
        statusCode: 402,
    },
    TRIAL_EXPIRED: {
        message: 'Your trial has expired. Please upgrade your subscription.',
        statusCode: 402,
    },
    SUBSCRIPTION_INACTIVE: {
        message: 'Your subscription is inactive. Please upgrade to continue.',
        statusCode: 402,
    },
    BILLING_ERROR: {
        message: 'A billing error occurred. Please contact support.',
        statusCode: 500,
    },
    // Rate Limiting
    RATE_LIMIT_EXCEEDED: {
        message: 'Too many requests. Please try again later.',
        statusCode: 429,
    },
    RATE_LIMIT_MESSAGES: {
        message: 'You are sending messages too quickly. Please slow down.',
        statusCode: 429,
    },
    // Server Errors
    DATABASE_ERROR: {
        message: 'A database error occurred. Please try again later.',
        statusCode: 500,
    },
    INTERNAL_ERROR: {
        message: 'An unexpected error occurred. Please try again later.',
        statusCode: 500,
    },
    SERVICE_UNAVAILABLE: {
        message: 'The service is temporarily unavailable. Please try again later.',
        statusCode: 503,
    },
    // External Service Errors
    STRIPE_ERROR: {
        message: 'A payment processing error occurred. Please try again or contact support.',
        statusCode: 500,
    },
    TELNYX_ERROR: {
        message: 'A messaging service error occurred. Please try again later.',
        statusCode: 500,
    },
    S3_ERROR: {
        message: 'A file storage error occurred. Please try again later.',
        statusCode: 500,
    },
    // File Upload
    FILE_TOO_LARGE: {
        message: 'File size exceeds the maximum allowed (500 MB)',
        statusCode: 413,
    },
    INVALID_FILE_TYPE: {
        message: 'This file type is not supported',
        statusCode: 400,
    },
};
/**
 * Extract safe error message from unknown error type
 */
export function getSafeErrorMessage(error) {
    // If it's our AppError, use the user message
    if (error instanceof AppError) {
        return error.userMessage;
    }
    // If it's a standard Error, return generic message
    if (error instanceof Error) {
        return ERROR_MESSAGES.INTERNAL_ERROR.message;
    }
    // If it's a string, return it (assuming it's a safe message from validation)
    if (typeof error === 'string') {
        return error;
    }
    return ERROR_MESSAGES.INTERNAL_ERROR.message;
}
/**
 * Extract HTTP status code from error
 */
export function getStatusCode(error) {
    if (error instanceof AppError) {
        return error.statusCode;
    }
    if (error.statusCode && typeof error.statusCode === 'number') {
        return error.statusCode;
    }
    return 500;
}
/**
 * Helper to throw safe errors from services
 */
export function throwAppError(userMessage, statusCode = 500, context) {
    throw new AppError(userMessage, statusCode, context);
}
/**
 * Catch block handler for service methods
 * Converts internal errors to safe AppErrors
 */
export function handleServiceError(error, defaultMessage = 'Operation failed') {
    if (error instanceof AppError) {
        return error;
    }
    // Log the actual error for debugging
    console.error(`[ServiceError] ${defaultMessage}:`, {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        timestamp: new Date().toISOString(),
    });
    // Return safe error to client
    return new AppError(defaultMessage, 500, { originalError: error instanceof Error ? error.message : String(error) });
}
export default AppError;
//# sourceMappingURL=app-error.js.map