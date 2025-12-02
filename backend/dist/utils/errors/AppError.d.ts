/**
 * AppError - Base custom error class for all application errors
 * Extends Error with statusCode and error code for consistent error handling
 * Allows clients to parse error codes for programmatic error handling
 */
export declare class AppError extends Error {
    readonly statusCode: number;
    readonly code: string;
    readonly details?: Record<string, any>;
    constructor(message: string, statusCode: number, code: string, details?: Record<string, any>);
    toJSON(): {
        error: {
            details?: Record<string, any> | undefined;
            message: string;
            code: string;
            statusCode: number;
        };
    };
}
export default AppError;
//# sourceMappingURL=AppError.d.ts.map