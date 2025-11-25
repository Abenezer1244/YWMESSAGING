import { logger } from './logger';

/**
 * Error severity
 */
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

/**
 * Error categories
 */
export enum ErrorCategory {
  LSP = 'lsp',
  ANALYSIS = 'analysis',
  DOCUMENT = 'document',
  COMMUNICATION = 'communication',
  TIMEOUT = 'timeout',
  UNKNOWN = 'unknown',
}

/**
 * LSP Server error
 */
export class AppError extends Error {
  public readonly code: string;
  public readonly severity: ErrorSeverity;
  public readonly category: ErrorCategory;
  public readonly timestamp: Date;
  public readonly context?: string;
  public readonly cause?: Error;

  constructor(
    message: string,
    code: string,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    category: ErrorCategory = ErrorCategory.UNKNOWN,
    options?: {
      context?: string;
      cause?: Error;
    }
  ) {
    super(message);
    this.code = code;
    this.severity = severity;
    this.category = category;
    this.timestamp = new Date();
    this.context = options?.context;
    this.cause = options?.cause;

    Object.setPrototypeOf(this, AppError.prototype);
    Error.captureStackTrace(this, this.constructor);
  }

  public toJSON() {
    return {
      message: this.message,
      code: this.code,
      severity: this.severity,
      category: this.category,
      timestamp: this.timestamp.toISOString(),
      context: this.context,
      stack: this.stack,
    };
  }
}

/**
 * Document-related errors
 */
export class DocumentError extends AppError {
  constructor(message: string, context?: string, cause?: Error) {
    super(
      message,
      'DOCUMENT_ERROR',
      ErrorSeverity.MEDIUM,
      ErrorCategory.DOCUMENT,
      { context, cause }
    );
  }
}

/**
 * Analysis errors
 */
export class AnalysisError extends AppError {
  constructor(message: string, context?: string, cause?: Error) {
    super(
      message,
      'ANALYSIS_ERROR',
      ErrorSeverity.HIGH,
      ErrorCategory.ANALYSIS,
      { context, cause }
    );
  }
}

/**
 * Communication errors
 */
export class CommunicationError extends AppError {
  constructor(message: string, cause?: Error) {
    super(
      message,
      'COMMUNICATION_ERROR',
      ErrorSeverity.HIGH,
      ErrorCategory.COMMUNICATION,
      { cause }
    );
  }
}

/**
 * Timeout errors
 */
export class TimeoutError extends AppError {
  constructor(message: string, _timeoutMs?: number) {
    super(
      message,
      'TIMEOUT_ERROR',
      ErrorSeverity.MEDIUM,
      ErrorCategory.TIMEOUT
    );
  }
}

/**
 * Error handler
 */
export class ErrorHandler {
  /**
   * Handle error
   */
  public static handle(error: Error | AppError, context?: string): void {
    if (error instanceof AppError) {
      logger.error(`[${error.code}] ${error.message}`, error);
      if (error.context) {
        logger.debug(`Context: ${error.context}`);
      }
    } else {
      logger.error(context ? `${context}: ${error.message}` : error.message, error);
    }
  }

  /**
   * Get error code
   */
  public static getCode(error: Error): string {
    return error instanceof AppError ? error.code : 'UNKNOWN_ERROR';
  }

  /**
   * Get error message for LSP
   */
  public static getMessage(error: Error): string {
    if (error instanceof AppError) {
      return `[${error.code}] ${error.message}`;
    }
    return error.message;
  }
}
