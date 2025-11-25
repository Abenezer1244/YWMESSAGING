import { logger } from './logger';

/**
 * Error severity levels
 */
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

/**
 * Error categories for classification
 */
export enum ErrorCategory {
  NETWORK = 'network',
  SERVER = 'server',
  CONFIGURATION = 'configuration',
  TIMEOUT = 'timeout',
  VALIDATION = 'validation',
  UNKNOWN = 'unknown',
}

/**
 * Custom application error
 */
export class AppError extends Error {
  public readonly code: string;
  public readonly severity: ErrorSeverity;
  public readonly category: ErrorCategory;
  public readonly timestamp: Date;
  public readonly context?: string;
  public readonly cause?: Error;
  public readonly retryable: boolean;

  constructor(
    message: string,
    code: string,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    category: ErrorCategory = ErrorCategory.UNKNOWN,
    options?: {
      context?: string;
      cause?: Error;
      retryable?: boolean;
    }
  ) {
    super(message);
    this.code = code;
    this.severity = severity;
    this.category = category;
    this.timestamp = new Date();
    this.context = options?.context;
    this.cause = options?.cause;
    this.retryable = options?.retryable ?? false;

    // Maintain proper stack trace
    Object.setPrototypeOf(this, AppError.prototype);
    Error.captureStackTrace(this, this.constructor);
  }

  /**
   * Get user-friendly error message
   */
  public getUserMessage(): string {
    const messages: Record<string, string> = {
      'NETWORK_ERROR': 'Network error: Unable to reach the server',
      'SERVER_ERROR': 'Server error: Something went wrong on the server',
      'TIMEOUT': 'Analysis took too long. Please try again.',
      'INVALID_CONFIG': 'Configuration error: Invalid settings',
      'NOT_INITIALIZED': 'Analyzer not initialized. Please restart VS Code.',
      'UNKNOWN': 'An unexpected error occurred',
    };
    return messages[this.code] || this.message;
  }

  /**
   * Convert to JSON for logging
   */
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
 * Network-related errors
 */
export class NetworkError extends AppError {
  constructor(message: string, cause?: Error) {
    super(
      message,
      'NETWORK_ERROR',
      ErrorSeverity.HIGH,
      ErrorCategory.NETWORK,
      { cause, retryable: true }
    );
  }
}

/**
 * Server-related errors
 */
export class ServerError extends AppError {
  public readonly statusCode?: number;

  constructor(message: string, statusCode?: number, cause?: Error) {
    super(
      message,
      'SERVER_ERROR',
      ErrorSeverity.HIGH,
      ErrorCategory.SERVER,
      { cause, retryable: statusCode ? [408, 429, 500, 502, 503, 504].includes(statusCode) : false }
    );
    this.statusCode = statusCode;
  }
}

/**
 * Timeout errors
 */
export class TimeoutError extends AppError {
  public readonly timeoutMs: number;

  constructor(message: string, timeoutMs: number) {
    super(
      message,
      'TIMEOUT',
      ErrorSeverity.MEDIUM,
      ErrorCategory.TIMEOUT,
      { retryable: true }
    );
    this.timeoutMs = timeoutMs;
  }
}

/**
 * Configuration errors
 */
export class ConfigurationError extends AppError {
  constructor(message: string, context?: string) {
    super(
      message,
      'INVALID_CONFIG',
      ErrorSeverity.MEDIUM,
      ErrorCategory.CONFIGURATION,
      { context }
    );
  }
}

/**
 * Validation errors
 */
export class ValidationError extends AppError {
  constructor(message: string, context?: string) {
    super(
      message,
      'VALIDATION_ERROR',
      ErrorSeverity.LOW,
      ErrorCategory.VALIDATION,
      { context }
    );
  }
}

/**
 * Error handler utility
 */
export class ErrorHandler {
  /**
   * Handle an error with logging and user notification
   */
  public static handle(error: Error | AppError, context?: string): void {
    if (error instanceof AppError) {
      logger.error(`[${error.code}] ${error.message}`, error);

      // Log additional context
      if (error.context) {
        logger.debug(`Error context: ${error.context}`);
      }

      // Show user message based on severity
      if (error.severity === ErrorSeverity.CRITICAL || error.severity === ErrorSeverity.HIGH) {
        logger.showError(error.getUserMessage(), error);
      } else if (error.severity === ErrorSeverity.MEDIUM) {
        logger.warn(error.getUserMessage());
      }
    } else {
      // Handle generic Error
      logger.error(context ? `${context}: ${error.message}` : error.message, error);
      logger.showError('An unexpected error occurred');
    }
  }

  /**
   * Handle error with retry capability
   */
  public static async handleWithRetry<T>(
    fn: () => Promise<T>,
    maxRetries: number = 3,
    delay: number = 1000
  ): Promise<T> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        if (!(error instanceof AppError) || !error.retryable) {
          throw error; // Don't retry non-retryable errors
        }

        if (attempt < maxRetries) {
          const waitTime = delay * Math.pow(2, attempt - 1); // Exponential backoff
          logger.warn(`Attempt ${attempt} failed, retrying in ${waitTime}ms...`);
          await this.delay(waitTime);
        }
      }
    }

    throw lastError;
  }

  /**
   * Check if error is retryable
   */
  public static isRetryable(error: Error): boolean {
    return error instanceof AppError && error.retryable;
  }

  /**
   * Get error code
   */
  public static getCode(error: Error): string {
    return error instanceof AppError ? error.code : 'UNKNOWN_ERROR';
  }

  /**
   * Private: Delay helper
   */
  private static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * Global error handler
 */
export function setupGlobalErrorHandling(): void {
  process.on('unhandledRejection', (reason: unknown) => {
    const error = reason instanceof Error ? reason : new Error(String(reason));
    logger.error('Unhandled promise rejection', error);
  });

  process.on('uncaughtException', (error: Error) => {
    logger.error('Uncaught exception', error);
  });
}
