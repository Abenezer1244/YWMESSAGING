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
  FILE_WATCH = 'file-watch',
  ANALYSIS = 'analysis',
  API = 'api',
  TIMEOUT = 'timeout',
  CACHE = 'cache',
  UNKNOWN = 'unknown',
}

/**
 * Analysis service error
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
      retryable: this.retryable,
      stack: this.stack,
    };
  }
}

/**
 * File watching errors
 */
export class FileWatchError extends AppError {
  constructor(message: string, path?: string, cause?: Error) {
    super(
      message,
      'FILE_WATCH_ERROR',
      ErrorSeverity.HIGH,
      ErrorCategory.FILE_WATCH,
      { context: path, cause, retryable: true }
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
      { context, cause, retryable: true }
    );
  }
}

/**
 * API errors
 */
export class ApiError extends AppError {
  public readonly statusCode?: number;

  constructor(message: string, statusCode?: number, cause?: Error) {
    super(
      message,
      'API_ERROR',
      ErrorSeverity.HIGH,
      ErrorCategory.API,
      {
        cause,
        retryable: statusCode ? [408, 429, 500, 502, 503, 504].includes(statusCode) : true,
      }
    );
    this.statusCode = statusCode;
  }
}

/**
 * Timeout errors
 */
export class TimeoutError extends AppError {
  constructor(message: string, timeoutMs: number) {
    super(
      message,
      'TIMEOUT_ERROR',
      ErrorSeverity.MEDIUM,
      ErrorCategory.TIMEOUT,
      { retryable: true }
    );
  }
}

/**
 * Cache errors
 */
export class CacheError extends AppError {
  constructor(message: string, cause?: Error) {
    super(
      message,
      'CACHE_ERROR',
      ErrorSeverity.LOW,
      ErrorCategory.CACHE,
      { cause }
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
      if (error.retryable) {
        logger.info(`Error is retryable: ${error.message}`);
      }
    } else {
      logger.error(context ? `${context}: ${error.message}` : error.message, error);
    }
  }

  /**
   * Handle with retry
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
          throw error;
        }

        if (attempt < maxRetries) {
          const waitTime = delay * Math.pow(2, attempt - 1);
          logger.warn(`Attempt ${attempt} failed, retrying in ${waitTime}ms...`);
          await this.delay(waitTime);
        }
      }
    }

    throw lastError;
  }

  /**
   * Check if retryable
   */
  public static isRetryable(error: Error): boolean {
    return error instanceof AppError && error.retryable;
  }

  /**
   * Get code
   */
  public static getCode(error: Error): string {
    return error instanceof AppError ? error.code : 'UNKNOWN_ERROR';
  }

  /**
   * Private: Delay
   */
  private static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
