/**
 * Analysis Service Integration
 *
 * Bridges LSP Server with Analysis Service.
 * Invokes analyzer for file analysis and converts results to diagnostics.
 */

import axios, { AxiosInstance } from 'axios';
import * as path from 'path';
import { logger } from './logger';

/**
 * Agent invocation request
 */
export interface AnalysisRequest {
  fileContent: string;
  fileName: string;
  language: string;
  agents: string[];
}

/**
 * Agent result
 */
export interface AgentResult {
  agent: string;
  success: boolean;
  issues: Array<{
    message: string;
    severity: 'error' | 'warning' | 'info' | 'hint';
    line?: number;
    column?: number;
    suggestion?: string;
  }>;
  duration: number;
}

/**
 * Analysis response
 */
export interface AnalysisResponse {
  fileUri: string;
  results: AgentResult[];
  totalDuration: number;
  timestamp: string;
}

/**
 * Analysis integration service
 */
export class AnalysisIntegration {
  private static instance: AnalysisIntegration;
  private client: AxiosInstance | null = null;
  private apiEndpoint: string = '';
  private apiKey: string = '';
  private isConfigured: boolean = false;

  /**
   * Get singleton instance
   */
  public static getInstance(): AnalysisIntegration {
    if (!AnalysisIntegration.instance) {
      AnalysisIntegration.instance = new AnalysisIntegration();
    }
    return AnalysisIntegration.instance;
  }

  /**
   * Configure with API details
   */
  public configure(apiEndpoint: string, apiKey: string): void {
    if (this.isConfigured && this.apiEndpoint === apiEndpoint && this.apiKey === apiKey) {
      return; // Already configured with same values
    }

    this.apiEndpoint = apiEndpoint;
    this.apiKey = apiKey;

    // Create axios instance
    this.client = axios.create({
      baseURL: apiEndpoint,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
    });

    this.isConfigured = true;
    logger.debug('Analysis integration configured', { endpoint: apiEndpoint });
  }

  /**
   * Invoke analysis for a file
   */
  public async analyzeFile(request: AnalysisRequest): Promise<AnalysisResponse> {
    if (!this.isConfigured || !this.client) {
      throw new Error('Analysis integration not configured. Call configure() first.');
    }

    try {
      const startTime = Date.now();

      logger.info('Invoking analysis', {
        fileName: request.fileName,
        agents: request.agents.length,
      });

      // Call backend API
      const response = await this.client.post<AnalysisResponse>('/agents/invoke', request);

      const duration = Date.now() - startTime;

      logger.info('Analysis completed', {
        fileName: request.fileName,
        duration,
        resultsCount: response.data.results.length,
      });

      return response.data;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      logger.error('Error during analysis', error instanceof Error ? error : new Error(message));
      throw error;
    }
  }

  /**
   * Detect language from file extension
   */
  public detectLanguage(filePath: string): string {
    const ext = path.extname(filePath).toLowerCase();

    const languageMap: Record<string, string> = {
      '.js': 'javascript',
      '.mjs': 'javascript',
      '.ts': 'typescript',
      '.jsx': 'javascript',
      '.tsx': 'typescript',
    };

    return languageMap[ext] || 'unknown';
  }

  /**
   * Should analyze file
   */
  public shouldAnalyzeFile(filePath: string): boolean {
    const ext = path.extname(filePath).toLowerCase();
    const analyzableExtensions = ['.js', '.mjs', '.ts', '.jsx', '.tsx'];
    return analyzableExtensions.includes(ext);
  }

  /**
   * Convert analysis results to issues format for diagnostics
   */
  public convertToIssues(
    results: AgentResult[]
  ): Array<{
    message: string;
    severity: 'error' | 'warning' | 'info' | 'hint';
    line?: number;
    column?: number;
    suggestion?: string;
    agent: string;
  }> {
    const issues: Array<{
      message: string;
      severity: 'error' | 'warning' | 'info' | 'hint';
      line?: number;
      column?: number;
      suggestion?: string;
      agent: string;
    }> = [];

    for (const result of results) {
      if (result.success) {
        for (const issue of result.issues) {
          issues.push({
            ...issue,
            agent: result.agent,
          });
        }
      }
    }

    return issues;
  }

  /**
   * Get configuration status
   */
  public isReady(): boolean {
    return this.isConfigured && !!this.client;
  }
}

/**
 * Export singleton
 */
export const analysisIntegration = AnalysisIntegration.getInstance();
