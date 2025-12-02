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
export declare class AppError extends Error {
    readonly statusCode: number;
    readonly isOperational: boolean;
    readonly userMessage: string;
    readonly context?: Record<string, any>;
    constructor(userMessage: string, statusCode?: number, context?: Record<string, any>, isOperational?: boolean);
    /**
     * Log error with full details (server-side only, never exposed to client)
     */
    logError(): void;
}
/**
 * Error mapping for common scenarios
 * Maps internal errors to safe client messages
 */
export declare const ERROR_MESSAGES: {
    INVALID_CREDENTIALS: {
        message: string;
        statusCode: number;
    };
    UNAUTHORIZED: {
        message: string;
        statusCode: number;
    };
    TOKEN_EXPIRED: {
        message: string;
        statusCode: number;
    };
    TOKEN_INVALID: {
        message: string;
        statusCode: number;
    };
    NOT_FOUND: {
        message: string;
        statusCode: number;
    };
    CONVERSATION_NOT_FOUND: {
        message: string;
        statusCode: number;
    };
    CHURCH_NOT_FOUND: {
        message: string;
        statusCode: number;
    };
    USER_NOT_FOUND: {
        message: string;
        statusCode: number;
    };
    INVALID_INPUT: {
        message: string;
        statusCode: number;
    };
    VALIDATION_ERROR: {
        message: string;
        statusCode: number;
    };
    MISSING_REQUIRED_FIELD: {
        message: string;
        statusCode: number;
    };
    INSUFFICIENT_CREDITS: {
        message: string;
        statusCode: number;
    };
    TRIAL_EXPIRED: {
        message: string;
        statusCode: number;
    };
    SUBSCRIPTION_INACTIVE: {
        message: string;
        statusCode: number;
    };
    BILLING_ERROR: {
        message: string;
        statusCode: number;
    };
    RATE_LIMIT_EXCEEDED: {
        message: string;
        statusCode: number;
    };
    RATE_LIMIT_MESSAGES: {
        message: string;
        statusCode: number;
    };
    DATABASE_ERROR: {
        message: string;
        statusCode: number;
    };
    INTERNAL_ERROR: {
        message: string;
        statusCode: number;
    };
    SERVICE_UNAVAILABLE: {
        message: string;
        statusCode: number;
    };
    STRIPE_ERROR: {
        message: string;
        statusCode: number;
    };
    TELNYX_ERROR: {
        message: string;
        statusCode: number;
    };
    S3_ERROR: {
        message: string;
        statusCode: number;
    };
    FILE_TOO_LARGE: {
        message: string;
        statusCode: number;
    };
    INVALID_FILE_TYPE: {
        message: string;
        statusCode: number;
    };
};
/**
 * Safe error response object for HTTP responses
 * Never includes stack traces or internal details
 */
export interface SafeErrorResponse {
    error: string;
    requestId?: string;
    timestamp?: string;
}
/**
 * Extract safe error message from unknown error type
 */
export declare function getSafeErrorMessage(error: any): string;
/**
 * Extract HTTP status code from error
 */
export declare function getStatusCode(error: any): number;
/**
 * Helper to throw safe errors from services
 */
export declare function throwAppError(userMessage: string, statusCode?: number, context?: Record<string, any>): never;
/**
 * Catch block handler for service methods
 * Converts internal errors to safe AppErrors
 */
export declare function handleServiceError(error: any, defaultMessage?: string): AppError;
export default AppError;
//# sourceMappingURL=app-error.d.ts.map