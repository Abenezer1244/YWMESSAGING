import * as vscode from 'vscode';

/**
 * Log levels with numeric values for filtering
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
  error?: Error;
  duration?: number;
}

/**
 * Enterprise-grade logger service
 * Provides structured logging with multiple output targets
 */
export class Logger {
  private static instance: Logger;
  private outputChannel: vscode.OutputChannel;
  private logLevel: LogLevel = LogLevel.INFO;
  private logBuffer: LogEntry[] = [];
  private readonly MAX_BUFFER_SIZE = 1000;
  private context: string = 'Extension';

  private constructor() {
    this.outputChannel = vscode.window.createOutputChannel('Agent Analyzer', 'log');
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  /**
   * Set current context for logs
   */
  public setContext(context: string): void {
    this.context = context;
  }

  /**
   * Set log level (DEBUG, INFO, WARN, ERROR)
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
   * Debug level log
   */
  public debug(message: string, data?: unknown): void {
    this.log(LogLevel.DEBUG, message, data);
  }

  /**
   * Info level log
   */
  public info(message: string, data?: unknown): void {
    this.log(LogLevel.INFO, message, data);
  }

  /**
   * Warn level log
   */
  public warn(message: string, data?: unknown): void {
    this.log(LogLevel.WARN, message, data);
  }

  /**
   * Error level log with optional error object
   */
  public error(message: string, error?: Error | unknown): void {
    if (error instanceof Error) {
      this.logWithError(LogLevel.ERROR, message, error);
    } else {
      this.log(LogLevel.ERROR, message, error);
    }
  }

  /**
   * Log with timing information
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
   * Show info message to user
   */
  public showInfo(message: string): void {
    this.info(message);
    vscode.window.showInformationMessage(`Agent Analyzer: ${message}`);
  }

  /**
   * Show warning message to user
   */
  public showWarning(message: string): void {
    this.warn(message);
    vscode.window.showWarningMessage(`Agent Analyzer: ${message}`);
  }

  /**
   * Show error message to user
   */
  public showError(message: string, error?: Error): void {
    this.error(message, error);
    vscode.window.showErrorMessage(`Agent Analyzer: ${message}`);
  }

  /**
   * Show status message in status bar
   */
  public setStatus(message: string, tooltip?: string): vscode.Disposable {
    const item = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right);
    item.text = `$(loading~spin) ${message}`;
    item.tooltip = tooltip;
    item.show();
    return item;
  }

  /**
   * Reveal output channel
   */
  public show(): void {
    this.outputChannel.show();
  }

  /**
   * Clear output channel
   */
  public clear(): void {
    this.outputChannel.clear();
    this.logBuffer = [];
  }

  /**
   * Get all logs as JSON
   */
  public getLogs(): LogEntry[] {
    return [...this.logBuffer];
  }

  /**
   * Export logs to file (returns as string)
   */
  public exportLogs(): string {
    return JSON.stringify(this.logBuffer, null, 2);
  }

  /**
   * Private: Core logging implementation
   */
  private log(level: LogLevel, message: string, data?: unknown): void {
    if (level < this.logLevel) {
      return; // Skip logs below current level
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
   * Private: Logging with error
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
      error,
      data: {
        stack: error.stack,
        name: error.name,
      },
    };

    this.logEntry(entry);
  }

  /**
   * Private: Log entry to output and buffer
   */
  private logEntry(entry: LogEntry): void {
    // Format and output to channel
    const formattedLog = this.formatLog(entry);
    this.outputChannel.appendLine(formattedLog);

    // Add to buffer
    if (this.logBuffer.length >= this.MAX_BUFFER_SIZE) {
      this.logBuffer.shift(); // Remove oldest entry
    }
    this.logBuffer.push(entry);

    // Also log critical errors to console for immediate visibility
    if (entry.level === 'ERROR') {
      console.error(`[${entry.context}] ${entry.message}`, entry.data || entry.error);
    }
  }

  /**
   * Private: Format log entry for display
   */
  private formatLog(entry: LogEntry): string {
    const icon = this.getIcon(entry.level);
    const timestamp = entry.timestamp;
    const context = entry.context ? ` [${entry.context}]` : '';
    const duration = entry.duration ? ` (${entry.duration}ms)` : '';

    let output = `${icon} ${timestamp}${context} ${entry.message}${duration}`;

    if (entry.data) {
      output += `\n  Data: ${JSON.stringify(entry.data)}`;
    }

    if (entry.error) {
      output += `\n  Error: ${entry.error.message}`;
      if (entry.error.stack) {
        output += `\n  Stack: ${entry.error.stack}`;
      }
    }

    return output;
  }

  /**
   * Private: Get icon for log level
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
   * Private: Get ISO timestamp
   */
  private getTimestamp(): string {
    return new Date().toISOString();
  }

  /**
   * Cleanup resources
   */
  public dispose(): void {
    this.outputChannel.dispose();
  }
}

/**
 * Export singleton instance
 */
export const logger = Logger.getInstance();
