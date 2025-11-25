/**
 * Analysis Orchestrator
 *
 * Coordinates file monitoring, debouncing, and agent invocation.
 * Manages the complete analysis workflow.
 */

import * as fs from 'fs';
import * as path from 'path';
import { logger } from './logger';
import { FileChangeEvent, FileWatcher } from './fileWatcher';
import { Debouncer } from './debouncer';
import { AgentClient, AgentType, AgentInvocationRequest, AgentInvocationResponse } from './agentClient';

/**
 * Analysis options
 */
export interface AnalysisOptions {
  apiEndpoint: string;
  apiKey: string;
  agents: AgentType[];
  watchPath: string;
  excludePaths: string[];
  debounceMs?: number;
  requestTimeout?: number;
}

/**
 * Analysis result
 */
export interface AnalysisResultEvent {
  filePath: string;
  fileUri: string;
  results: AgentInvocationResponse;
  success: boolean;
  error?: Error;
}

/**
 * Analysis callback
 */
export type AnalysisCallback = (result: AnalysisResultEvent) => Promise<void>;

/**
 * Analysis orchestrator
 */
export class Analyzer {
  private static instance: Analyzer;
  private fileWatcher: FileWatcher;
  private debouncer: Debouncer;
  private agentClient: AgentClient | null = null;
  private callbacks: AnalysisCallback[] = [];
  private isRunning: boolean = false;
  private trackedFiles: Map<string, number> = new Map();

  /**
   * Constructor (private for singleton)
   */
  private constructor() {
    this.fileWatcher = FileWatcher.getInstance();
    this.debouncer = Debouncer.getInstance();
    logger.debug('Analyzer initialized');
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): Analyzer {
    if (!Analyzer.instance) {
      Analyzer.instance = new Analyzer();
    }
    return Analyzer.instance;
  }

  /**
   * Start analysis service
   */
  public async start(options: AnalysisOptions): Promise<void> {
    try {
      if (this.isRunning) {
        logger.warn('Analyzer already running');
        return;
      }

      logger.info('Starting analyzer', {
        path: options.watchPath,
        agents: options.agents.length,
      });

      // Initialize agent client
      this.agentClient = AgentClient.getInstance(
        options.apiEndpoint,
        options.apiKey,
        options.requestTimeout
      );

      // Validate configuration
      if (!this.agentClient) {
        throw new Error('Failed to initialize agent client');
      }

      const isValid = await this.agentClient.validateConfig();
      if (!isValid) {
        throw new Error('Agent configuration validation failed');
      }

      // Start file watcher
      this.fileWatcher.start(options.watchPath, options.excludePaths);

      // Register file change handler
      this.fileWatcher.onChange((event: FileChangeEvent) => {
        this.handleFileChange(event, options.agents);
      });

      this.isRunning = true;
      logger.info('✅ Analyzer started');
    } catch (error) {
      logger.error('Error starting analyzer', error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }

  /**
   * Stop analysis service
   */
  public async stop(): Promise<void> {
    try {
      if (!this.isRunning) {
        logger.info('Analyzer not running');
        return;
      }

      logger.info('Stopping analyzer');

      // Cancel pending debounces
      await this.debouncer.flushAll(async () => {
        logger.debug('Flushed pending analyses');
      });

      // Stop file watcher
      await this.fileWatcher.stop();

      this.isRunning = false;
      logger.info('✅ Analyzer stopped');
    } catch (error) {
      logger.error('Error stopping analyzer', error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }

  /**
   * Register callback for analysis results
   */
  public onAnalysisComplete(callback: AnalysisCallback): void {
    this.callbacks.push(callback);
    logger.debug('Analysis callback registered');
  }

  /**
   * Unregister callback
   */
  public offAnalysisComplete(callback: AnalysisCallback): void {
    const index = this.callbacks.indexOf(callback);
    if (index >= 0) {
      this.callbacks.splice(index, 1);
      logger.debug('Analysis callback unregistered');
    }
  }

  /**
   * Handle file change
   */
  private handleFileChange(event: FileChangeEvent, agents: AgentType[]): void {
    try {
      logger.debug('File change handler triggered', {
        file: path.basename(event.filePath),
        type: event.changeType,
      });

      // Update tracked files
      this.trackedFiles.set(event.filePath, event.timestamp);

      // Debounce analysis
      this.debouncer.debounce(event.filePath, async (filePath) => {
        await this.analyzeFile(filePath, agents);
      }).catch((error) => {
        logger.error('Error scheduling analysis', error instanceof Error ? error : new Error(String(error)));
      });
    } catch (error) {
      logger.error('Error handling file change', error instanceof Error ? error : new Error(String(error)));
    }
  }

  /**
   * Analyze a file
   */
  private async analyzeFile(filePath: string, agents: AgentType[]): Promise<void> {
    try {
      const startTime = Date.now();

      logger.info('Analyzing file', {
        file: path.basename(filePath),
        agents: agents.length,
      });

      // Read file content
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      const fileName = path.basename(filePath);
      const ext = path.extname(filePath).toLowerCase();

      // Determine language
      const languageMap: Record<string, string> = {
        '.js': 'javascript',
        '.mjs': 'javascript',
        '.ts': 'typescript',
        '.jsx': 'javascript',
        '.tsx': 'typescript',
      };
      const language = languageMap[ext] || 'unknown';

      // Create invocation request
      const request: AgentInvocationRequest = {
        fileContent,
        fileName,
        language,
        agents,
      };

      // Invoke agents
      if (!this.agentClient) {
        throw new Error('Agent client not initialized');
      }

      const response = await this.agentClient.invokeAgents(request);

      const duration = Date.now() - startTime;

      logger.info('File analysis completed', {
        file: fileName,
        duration,
        issuesFound: response.results.reduce((sum, r) => sum + r.issues.length, 0),
      });

      // Notify callbacks
      const result: AnalysisResultEvent = {
        filePath,
        fileUri: `file://${filePath}`,
        results: response,
        success: true,
      };

      await this.notifyCallbacks(result);
    } catch (error) {
      logger.error('Error analyzing file', error instanceof Error ? error : new Error(String(error)));

      // Notify callbacks of failure
      const result: AnalysisResultEvent = {
        filePath,
        fileUri: `file://${filePath}`,
        results: {
          fileUri: `file://${filePath}`,
          results: [],
          totalDuration: 0,
          timestamp: new Date().toISOString(),
        },
        success: false,
        error: error instanceof Error ? error : new Error(String(error)),
      };

      await this.notifyCallbacks(result);
    }
  }

  /**
   * Notify all callbacks
   */
  private async notifyCallbacks(result: AnalysisResultEvent): Promise<void> {
    try {
      for (const callback of this.callbacks) {
        try {
          await callback(result);
        } catch (error) {
          logger.error('Error in analysis callback', error instanceof Error ? error : new Error(String(error)));
        }
      }
    } catch (error) {
      logger.error('Error notifying callbacks', error instanceof Error ? error : new Error(String(error)));
    }
  }

  /**
   * Get statistics
   */
  public getStats(): {
    isRunning: boolean;
    trackedFiles: number;
    pendingAnalysis: number;
  } {
    return {
      isRunning: this.isRunning,
      trackedFiles: this.trackedFiles.size,
      pendingAnalysis: this.debouncer.getPendingCount(),
    };
  }

  /**
   * Check if running
   */
  public isAnalyzing(): boolean {
    return this.isRunning;
  }
}

/**
 * Export singleton
 */
export const analyzer = Analyzer.getInstance();
