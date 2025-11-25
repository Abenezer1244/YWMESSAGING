/**
 * Diagnostics Handler
 *
 * Publishes diagnostic information (errors, warnings) to the client.
 * Receives analysis results and formats them for display in VS Code.
 */

import {
  Diagnostic,
  DiagnosticSeverity,
  Range,
  Position,
  Connection,
} from 'vscode-languageserver';
import { logger } from './logger';

/**
 * Analysis result interface
 */
export interface AnalysisResult {
  uri: string;
  issues: AnalysisIssue[];
  duration: number;
}

/**
 * Analysis issue interface
 */
export interface AnalysisIssue {
  message: string;
  severity: 'error' | 'warning' | 'info' | 'hint';
  line?: number;
  column?: number;
  endLine?: number;
  endColumn?: number;
  code?: string;
  agent: string;
  suggestion?: string;
  fixSuggestion?: string;
  relatedInformation?: Array<{
    message: string;
    file: string;
    line: number;
    column: number;
  }>;
}

/**
 * Diagnostics handler class
 */
export class DiagnosticsHandler {
  private static instance: DiagnosticsHandler;
  private connection: Connection | null = null;
  private diagnosticsCache: Map<string, Diagnostic[]> = new Map();
  private lastPublished: Map<string, number> = new Map();

  /**
   * Get singleton instance
   */
  public static getInstance(): DiagnosticsHandler {
    if (!DiagnosticsHandler.instance) {
      DiagnosticsHandler.instance = new DiagnosticsHandler();
    }
    return DiagnosticsHandler.instance;
  }

  /**
   * Set connection
   */
  public setConnection(connection: Connection): void {
    this.connection = connection;
    logger.debug('Diagnostics handler connection set');
  }

  /**
   * Publish diagnostics for a document
   */
  public async publishDiagnostics(
    uri: string,
    analysisResult: AnalysisResult,
    hasDiagnosticRelatedInfo: boolean = false
  ): Promise<void> {
    try {
      if (!this.connection) {
        logger.warn('Connection not set, cannot publish diagnostics', { uri });
        return;
      }

      logger.debug('Publishing diagnostics', {
        uri,
        issueCount: analysisResult.issues.length,
      });

      // Convert analysis issues to diagnostics
      const diagnostics = analysisResult.issues.map((issue) =>
        this.convertIssueToDiagnostic(issue, hasDiagnosticRelatedInfo)
      );

      // Cache diagnostics
      this.diagnosticsCache.set(uri, diagnostics);
      this.lastPublished.set(uri, Date.now());

      // Publish to client
      this.connection.sendDiagnostics({
        uri,
        diagnostics,
      });

      logger.debug('Diagnostics published', {
        uri,
        count: diagnostics.length,
      });
    } catch (error) {
      logger.error('Error publishing diagnostics', error);
      // Send empty diagnostics on error
      this.connection?.sendDiagnostics({
        uri,
        diagnostics: [],
      });
    }
  }

  /**
   * Clear diagnostics for a document
   */
  public clearDiagnostics(uri: string): void {
    try {
      if (!this.connection) {
        logger.warn('Connection not set, cannot clear diagnostics', { uri });
        return;
      }

      this.connection.sendDiagnostics({
        uri,
        diagnostics: [],
      });

      this.diagnosticsCache.delete(uri);
      this.lastPublished.delete(uri);

      logger.debug('Diagnostics cleared', { uri });
    } catch (error) {
      logger.error('Error clearing diagnostics', error);
    }
  }

  /**
   * Clear all diagnostics
   */
  public clearAllDiagnostics(): void {
    try {
      logger.debug('Clearing all diagnostics');

      // Clear diagnostics for all cached URIs
      this.diagnosticsCache.forEach((_, uri) => {
        this.clearDiagnostics(uri);
      });

      this.diagnosticsCache.clear();
      this.lastPublished.clear();

      logger.debug('All diagnostics cleared');
    } catch (error) {
      logger.error('Error clearing all diagnostics', error);
    }
  }

  /**
   * Convert analysis issue to LSP diagnostic
   */
  private convertIssueToDiagnostic(
    issue: AnalysisIssue,
    includeRelatedInfo: boolean = false
  ): Diagnostic {
    try {
      // Convert severity
      const severity = this.getSeverityLevel(issue.severity);

      // Create range (0-indexed in LSP)
      // Use defaults if line/column not provided
      const line = issue.line || 1;
      const column = issue.column || 1;
      const endLine = issue.endLine || line;
      const endColumn = issue.endColumn || column + 1;

      const range: Range = {
        start: Position.create(line - 1, column - 1),
        end: Position.create(endLine - 1, endColumn - 1),
      };

      // Build message with agent info
      const messageLines = [
        issue.message,
        `**Agent**: ${issue.agent}`,
      ];

      // Add suggestion or fixSuggestion if available
      const suggestion = issue.fixSuggestion || issue.suggestion;
      if (suggestion) {
        messageLines.push(`**Suggestion**: ${suggestion}`);
      }

      const message = messageLines.join('\n');

      // Create diagnostic
      const diagnostic: Diagnostic = {
        severity,
        range,
        message,
        source: 'Agent Analyzer',
        code: issue.code || `${issue.agent}/${issue.severity}`,
      };

      // Add related information if supported
      if (includeRelatedInfo && issue.relatedInformation) {
        diagnostic.relatedInformation = issue.relatedInformation.map((info) => ({
          location: {
            uri: info.file,
            range: Range.create(
              Position.create(info.line - 1, info.column - 1),
              Position.create(info.line - 1, info.column)
            ),
          },
          message: info.message,
        }));
      }

      return diagnostic;
    } catch (error) {
      logger.error('Error converting issue to diagnostic', error);

      // Return basic diagnostic on error
      return {
        severity: DiagnosticSeverity.Error,
        range: Range.create(Position.create(0, 0), Position.create(0, 1)),
        message: issue.message || 'Unknown error',
        source: 'Agent Analyzer',
      };
    }
  }

  /**
   * Convert severity string to LSP severity level
   */
  private getSeverityLevel(severity: string): DiagnosticSeverity {
    switch (severity.toLowerCase()) {
      case 'error':
        return DiagnosticSeverity.Error;
      case 'warning':
        return DiagnosticSeverity.Warning;
      case 'info':
        return DiagnosticSeverity.Information;
      case 'hint':
        return DiagnosticSeverity.Hint;
      default:
        return DiagnosticSeverity.Information;
    }
  }

  /**
   * Get cached diagnostics for a document
   */
  public getCachedDiagnostics(uri: string): Diagnostic[] | undefined {
    return this.diagnosticsCache.get(uri);
  }

  /**
   * Get last published timestamp for a document
   */
  public getLastPublished(uri: string): number | undefined {
    return this.lastPublished.get(uri);
  }

  /**
   * Check if diagnostics are recent (within threshold)
   */
  public isRecent(uri: string, thresholdMs: number = 5000): boolean {
    const lastTime = this.lastPublished.get(uri);
    if (!lastTime) {
      return false;
    }
    return Date.now() - lastTime < thresholdMs;
  }

  /**
   * Get statistics
   */
  public getStatistics(): {
    cachedUris: number;
    totalDiagnostics: number;
  } {
    let totalDiagnostics = 0;
    this.diagnosticsCache.forEach((diags) => {
      totalDiagnostics += diags.length;
    });

    return {
      cachedUris: this.diagnosticsCache.size,
      totalDiagnostics,
    };
  }
}

/**
 * Export singleton
 */
export const diagnosticsHandler = DiagnosticsHandler.getInstance();
