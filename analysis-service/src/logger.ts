import * as fs from 'fs';
import * as path from 'path';

/**
 * Log levels
 */
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

/**
 * Structured log entry
 */
export interface LogEntry {
  timestamp: string;
  level: string;
  message: string;
  context?: string;
  data?: unknown;
  error?: string;
  stack?: string;
  duration?: number;
}

/**
 * Enterprise-grade logger for analysis service
 * Supports file output and structured logging
 */
export class Logger {
  private static instance: Logger;
  private logLevel: LogLevel = LogLevel.INFO;
  private logBuffer: LogEntry[] = [];
  private readonly MAX_BUFFER_SIZE = 5000;
  private context: string = 'Analysis-Service';
  private logFile: string | null = null;

  private constructor() {}

  /**
   * Get singleton
   */
  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  /**
   * Initialize with log file path
   */
  public initialize(logFilePath: string): void {
    this.logFile = logFilePath;
    // Create log file directory if needed
    const dir = path.dirname(logFilePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  /**
   * Set context
   */
  public setContext(context: string): void {
    this.context = context;
  }

  /**
   * Set log level
   */
  public setLogLevel(level: LogLevel): void {
    this.logLevel = level;
  }

  /**
   * Set log level from string
   */
  public setLogLevelFromString(level: string): void {
    const levelMap: Record<string, LogLevel> = {
      'debug': LogLevel.DEBUG,
      'info': LogLevel.INFO,
      'warn': LogLevel.WARN,
      'error': LogLevel.ERROR,
    };
    this.logLevel = levelMap[level.toLowerCase()] ?? LogLevel.INFO;
  }

  /**
   * Debug level
   */
  public debug(message: string, data?: unknown): void {
    this.log(LogLevel.DEBUG, message, data);
  }

  /**
   * Info level
   */
  public info(message: string, data?: unknown): void {
    this.log(LogLevel.INFO, message, data);
  }

  /**
   * Warn level
   */
  public warn(message: string, data?: unknown): void {
    this.log(LogLevel.WARN, message, data);
  }

  /**
   * Error level
   */
  public error(message: string, error?: Error | unknown): void {
    if (error instanceof Error) {
      this.logWithError(LogLevel.ERROR, message, error);
    } else {
      this.log(LogLevel.ERROR, message, error);
    }
  }

  /**
   * Log with timing
   */
  public timeLog(message: string, duration: number, data?: unknown): void {
    const entry: LogEntry = {
      timestamp: this.getTimestamp(),
      level: 'INFO',
      message: `${message} (${duration}ms)`,
      context: this.context,
      data,
      duration,
    };
    this.logEntry(entry);
  }

  /**
   * Get logs
   */
  public getLogs(): LogEntry[] {
    return [...this.logBuffer];
  }

  /**
   * Export logs as JSON
   */
  public exportLogs(): string {
    return JSON.stringify(this.logBuffer, null, 2);
  }

  /**
   * Clear logs
   */
  public clear(): void {
    this.logBuffer = [];
  }

  /**
   * Write logs to file
   */
  public writeToFile(): void {
    if (!this.logFile) {
      return;
    }

    try {
      fs.writeFileSync(
        this.logFile,
        JSON.stringify(this.logBuffer, null, 2),
        'utf-8'
      );
    } catch (err) {
      console.error('Failed to write logs to file:', err);
    }
  }

  /**
   * Private: Core logging
   */
  private log(level: LogLevel, message: string, data?: unknown): void {
    if (level < this.logLevel) {
      return;
    }

    const entry: LogEntry = {
      timestamp: this.getTimestamp(),
      level: LogLevel[level],
      message,
      context: this.context,
      data,
    };

    this.logEntry(entry);
  }

  /**
   * Private: Log with error
   */
  private logWithError(level: LogLevel, message: string, error: Error): void {
    if (level < this.logLevel) {
      return;
    }

    const entry: LogEntry = {
      timestamp: this.getTimestamp(),
      level: LogLevel[level],
      message,
      context: this.context,
      error: error.message,
      stack: error.stack,
    };

    this.logEntry(entry);
  }

  /**
   * Private: Log entry
   */
  private logEntry(entry: LogEntry): void {
    // Add to buffer
    if (this.logBuffer.length >= this.MAX_BUFFER_SIZE) {
      this.logBuffer.shift();
    }
    this.logBuffer.push(entry);

    // Log to console
    const formatted = this.formatLog(entry);
    if (entry.level === 'ERROR') {
      console.error(formatted);
    } else if (entry.level === 'WARN') {
      console.warn(formatted);
    } else {
      console.log(formatted);
    }
  }

  /**
   * Private: Format log
   */
  private formatLog(entry: LogEntry): string {
    const icon = this.getIcon(entry.level);
    const timestamp = entry.timestamp;
    const context = entry.context ? ` [${entry.context}]` : '';
    const duration = entry.duration ? ` (${entry.duration}ms)` : '';

    let output = `${icon} ${timestamp}${context} ${entry.message}${duration}`;

    if (entry.data) {
      output += ` | ${JSON.stringify(entry.data)}`;
    }

    if (entry.error) {
      output += ` | Error: ${entry.error}`;
    }

    return output;
  }

  /**
   * Private: Get icon
   */
  private getIcon(level: string): string {
    const icons: Record<string, string> = {
      'DEBUG': '🔍',
      'INFO': 'ℹ️',
      'WARN': '⚠️',
      'ERROR': '❌',
    };
    return icons[level] || '•';
  }

  /**
   * Private: Get timestamp
   */
  private getTimestamp(): string {
    return new Date().toISOString();
  }
}

/**
 * Export singleton
 */
export const logger = Logger.getInstance();
