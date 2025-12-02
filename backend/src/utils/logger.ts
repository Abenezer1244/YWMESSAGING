/**
 * Structured Logging Utility
 *
 * Provides JSON-structured logging with:
 * - Log levels: DEBUG, INFO, WARN, ERROR
 * - Request correlation IDs for tracing
 * - Sensitive data masking (phone numbers, API keys, passwords)
 * - Pretty printing for development
 * - Log rotation ready (can pipe to log management service)
 *
 * Usage:
 * ```typescript
 * import { logger } from '../utils/logger.js';
 *
 * logger.info('User logged in', { userId: '123', email: 'user@example.com' });
 * logger.error('Database connection failed', { error: err.message });
 * ```
 */

type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';

interface LogContext {
  [key: string]: any;
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: LogContext;
  correlationId?: string;
  duration?: number;
  error?: {
    message: string;
    stack?: string;
    code?: string;
  };
}

// Store correlation ID in async local storage-like structure
const contextMap = new WeakMap<object, string>();

/**
 * Mask sensitive data in log context
 */
function maskSensitiveData(obj: any, depth = 0): any {
  if (depth > 10 || obj === null || obj === undefined) {
    return obj;
  }

  if (typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => maskSensitiveData(item, depth + 1));
  }

  const masked: any = {};
  const sensitiveFields = [
    'password',
    'apiKey',
    'api_key',
    'secretKey',
    'secret_key',
    'token',
    'accessToken',
    'access_token',
    'refreshToken',
    'refresh_token',
    'creditCard',
    'credit_card',
    'ssn',
    'phone',
    'phoneNumber',
    'phone_number',
  ];

  for (const [key, value] of Object.entries(obj)) {
    if (sensitiveFields.includes(key.toLowerCase())) {
      // Mask the value - keep first 4 chars if string, then ***
      if (typeof value === 'string' && value.length > 4) {
        masked[key] = value.substring(0, 4) + '***';
      } else {
        masked[key] = '***';
      }
    } else if (typeof value === 'object') {
      masked[key] = maskSensitiveData(value, depth + 1);
    } else {
      masked[key] = value;
    }
  }

  return masked;
}

/**
 * Format log entry as JSON
 */
function formatLogEntry(entry: LogEntry): string {
  // In production, output JSON for machine parsing
  // In development, output pretty JSON
  const isDevelopment = process.env.NODE_ENV !== 'production';

  const logObject = {
    ...entry,
    context: entry.context ? maskSensitiveData(entry.context) : undefined,
  };

  if (isDevelopment) {
    return JSON.stringify(logObject, null, 2);
  } else {
    return JSON.stringify(logObject);
  }
}

/**
 * Main logger class
 */
class Logger {
  private minLevel: number = 1; // INFO level

  constructor() {
    // Set min log level based on environment
    const level = process.env.LOG_LEVEL?.toUpperCase() || 'INFO';
    switch (level) {
      case 'DEBUG':
        this.minLevel = 0;
        break;
      case 'INFO':
        this.minLevel = 1;
        break;
      case 'WARN':
        this.minLevel = 2;
        break;
      case 'ERROR':
        this.minLevel = 3;
        break;
    }
  }

  /**
   * Format timestamp as ISO string
   */
  private getTimestamp(): string {
    return new Date().toISOString();
  }

  /**
   * Log message at specified level
   */
  private log(
    level: LogLevel,
    message: string,
    context?: LogContext,
    correlationId?: string,
    duration?: number,
    error?: Error
  ): void {
    const levelMap: { [key in LogLevel]: number } = {
      DEBUG: 0,
      INFO: 1,
      WARN: 2,
      ERROR: 3,
    };

    // Skip if below min level
    if (levelMap[level] < this.minLevel) {
      return;
    }

    const entry: LogEntry = {
      timestamp: this.getTimestamp(),
      level,
      message,
      context,
      correlationId,
      duration,
      ...(error && {
        error: {
          message: error.message,
          stack: error.stack,
          code: (error as any).code,
        },
      }),
    };

    const formatted = formatLogEntry(entry);

    // Write to appropriate stream
    switch (level) {
      case 'DEBUG':
      case 'INFO':
        console.log(formatted);
        break;
      case 'WARN':
        console.warn(formatted);
        break;
      case 'ERROR':
        console.error(formatted);
        break;
    }
  }

  /**
   * Log debug message
   */
  debug(message: string, context?: LogContext, correlationId?: string): void {
    this.log('DEBUG', message, context, correlationId);
  }

  /**
   * Log info message
   */
  info(message: string, context?: LogContext, correlationId?: string): void {
    this.log('INFO', message, context, correlationId);
  }

  /**
   * Log warning message
   */
  warn(
    message: string,
    context?: LogContext,
    correlationId?: string,
    error?: Error
  ): void {
    this.log('WARN', message, context, correlationId, undefined, error);
  }

  /**
   * Log error message
   */
  error(
    message: string,
    error?: Error | string | LogContext,
    context?: LogContext,
    correlationId?: string
  ): void {
    let actualError: Error | undefined;
    let actualContext: LogContext | undefined = context;

    // Handle overloads
    if (typeof error === 'string') {
      actualError = new Error(error);
      actualContext = context;
    } else if (error instanceof Error) {
      actualError = error;
      actualContext = context;
    } else if (error && typeof error === 'object') {
      // error is actually context
      actualContext = error;
      actualError = context instanceof Error ? context : undefined;
    }

    this.log('ERROR', message, actualContext, correlationId, undefined, actualError);
  }

  /**
   * Log operation timing
   */
  time(
    message: string,
    durationMs: number,
    context?: LogContext,
    correlationId?: string
  ): void {
    this.log('INFO', message, { ...context, durationMs }, correlationId, durationMs);
  }

  /**
   * Create a timed operation wrapper
   */
  async timeAsync<T>(
    message: string,
    fn: () => Promise<T>,
    context?: LogContext,
    correlationId?: string
  ): Promise<T> {
    const startTime = Date.now();
    try {
      const result = await fn();
      const duration = Date.now() - startTime;
      this.time(message, duration, context, correlationId);
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      this.error(message + ' (failed)', error as Error, { ...context, durationMs: duration }, correlationId);
      throw error;
    }
  }
}

// Export singleton instance
export const logger = new Logger();

/**
 * Middleware to add correlation ID to requests
 */
export function loggerMiddleware(req: any, res: any, next: any) {
  const correlationId = req.headers['x-correlation-id'] || `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  req.correlationId = correlationId;

  // Log request
  logger.info('Incoming request', {
    method: req.method,
    path: req.path,
    ip: req.ip,
    userAgent: req.get('user-agent'),
  }, correlationId);

  // Log response on finish
  const originalSend = res.send;
  let startTime = Date.now();

  res.send = function(data: any) {
    const duration = Date.now() - startTime;
    logger.info('Response sent', {
      method: req.method,
      path: req.path,
      status: res.statusCode,
      durationMs: duration,
    }, correlationId);

    return originalSend.call(this, data);
  };

  next();
}
