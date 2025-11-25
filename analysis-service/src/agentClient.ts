/**
 * Agent Client Service
 *
 * Makes HTTP requests to backend API to invoke agents.
 * Handles agent invocation, result retrieval, and error handling.
 */

import axios, { AxiosInstance } from 'axios';
import { logger } from './logger';

/**
 * Agent types
 */
export type AgentType =
  | 'backend-engineer'
  | 'senior-frontend'
  | 'security-analyst'
  | 'design-review'
  | 'qa-testing'
  | 'system-architecture'
  | 'devops'
  | 'product-manager';

/**
 * Agent invocation request
 */
export interface AgentInvocationRequest {
  fileContent: string;
  fileName: string;
  language: string;
  agents: AgentType[];
}

/**
 * Agent result
 */
export interface AgentResult {
  agent: AgentType;
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
 * Agent invocation response
 */
export interface AgentInvocationResponse {
  fileUri: string;
  results: AgentResult[];
  totalDuration: number;
  timestamp: string;
}

/**
 * Agent client service
 */
export class AgentClient {
  private static instance: AgentClient;
  private client: AxiosInstance;
  private apiEndpoint: string;
  private apiKey: string;
  private requestTimeout: number;

  /**
   * Constructor
   */
  private constructor(apiEndpoint: string, _apiKey: string, timeout: number = 10000) {
    this.apiEndpoint = apiEndpoint;
    this.apiKey = _apiKey;
    this.requestTimeout = timeout;

    // Create axios instance
    this.client = axios.create({
      baseURL: apiEndpoint,
      timeout,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
    });

    logger.debug('Agent client initialized', {
      endpoint: apiEndpoint,
      timeout,
    });
  }

  /**
   * Get singleton instance
   */
  public static getInstance(
    apiEndpoint: string,
    apiKey: string,
    timeout?: number
  ): AgentClient {
    if (!AgentClient.instance) {
      AgentClient.instance = new AgentClient(apiEndpoint, apiKey, timeout);
    }
    return AgentClient.instance;
  }

  /**
   * Invoke agents for file analysis
   */
  public async invokeAgents(request: AgentInvocationRequest): Promise<AgentInvocationResponse> {
    try {
      const startTime = Date.now();

      logger.info('Invoking agents', {
        fileName: request.fileName,
        agents: request.agents.length,
      });

      // Call backend API
      const response = await this.client.post<AgentInvocationResponse>(
        '/agents/invoke',
        request
      );

      const duration = Date.now() - startTime;

      logger.info('Agents invoked successfully', {
        fileName: request.fileName,
        totalDuration: response.data.totalDuration,
        networkDuration: duration,
        resultCount: response.data.results.length,
      });

      return response.data;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      logger.error('Error invoking agents', error instanceof Error ? error : new Error(message));
      throw error;
    }
  }

  /**
   * Health check - verify backend is available
   */
  public async healthCheck(): Promise<boolean> {
    try {
      logger.debug('Checking agent backend health');

      const response = await this.client.get('/health', {
        timeout: 5000,
      });

      const isHealthy = response.status === 200;

      if (isHealthy) {
        logger.debug('✅ Agent backend is healthy');
      } else {
        logger.warn('Agent backend returned non-200 status', { status: response.status });
      }

      return isHealthy;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      logger.warn('Health check failed', error instanceof Error ? error : new Error(message));
      return false;
    }
  }

  /**
   * Get available agents
   */
  public async getAvailableAgents(): Promise<AgentType[]> {
    try {
      logger.debug('Fetching available agents');

      const response = await this.client.get<{ agents: AgentType[] }>('/agents/available');

      logger.debug('Available agents retrieved', {
        count: response.data.agents.length,
      });

      return response.data.agents;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      logger.error('Error fetching available agents', error instanceof Error ? error : new Error(message));
      throw error;
    }
  }

  /**
   * Validate configuration
   */
  public async validateConfig(): Promise<boolean> {
    try {
      logger.debug('Validating agent configuration');

      // Check if endpoint is reachable
      const isHealthy = await this.healthCheck();

      if (!isHealthy) {
        logger.error('Agent backend is not healthy');
        return false;
      }

      // Check if API key is valid by calling a protected endpoint
      try {
        await this.getAvailableAgents();
      } catch (error) {
        logger.error('API key validation failed');
        return false;
      }

      logger.info('✅ Agent configuration is valid');
      return true;
    } catch (error) {
      logger.error(
        'Configuration validation failed',
        error instanceof Error ? error : new Error(String(error))
      );
      return false;
    }
  }

  /**
   * Get timeout
   */
  public getTimeout(): number {
    return this.requestTimeout;
  }

  /**
   * Get endpoint
   */
  public getEndpoint(): string {
    return this.apiEndpoint;
  }
}

/**
 * Export types and class
 */
export const agentClient = (apiEndpoint: string, apiKey: string, timeout?: number) =>
  AgentClient.getInstance(apiEndpoint, apiKey, timeout);
