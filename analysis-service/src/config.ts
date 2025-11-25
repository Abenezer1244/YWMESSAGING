import * as path from 'path';
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
 * Analysis service configuration
 */
export interface Config {
  apiEndpoint: string;
  apiKey: string;
  agents: AgentType[];
  analysisDelay: number;
  enableCache: boolean;
  cacheDuration: number;
  maxFileSize: number;
  excludePaths: string[];
  watchPath: string;
  requestTimeout: number;
  logLevel: string;
  logFilePath: string;
}

/**
 * Configuration manager for analysis service
 */
export class ConfigManager {
  private static instance: ConfigManager;
  private config: Config;

  private constructor() {
    this.config = this.loadFromEnvironment();
  }

  /**
   * Get singleton
   */
  public static getInstance(): ConfigManager {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager();
    }
    return ConfigManager.instance;
  }

  /**
   * Get config
   */
  public getConfig(): Config {
    return this.config;
  }

  /**
   * Get API endpoint
   */
  public getApiEndpoint(): string {
    return this.config.apiEndpoint;
  }

  /**
   * Get API key
   */
  public getApiKey(): string {
    return this.config.apiKey;
  }

  /**
   * Get agents
   */
  public getAgents(): AgentType[] {
    return this.config.agents;
  }

  /**
   * Get analysis delay
   */
  public getAnalysisDelay(): number {
    return this.config.analysisDelay;
  }

  /**
   * Is cache enabled
   */
  public isCacheEnabled(): boolean {
    return this.config.enableCache;
  }

  /**
   * Get watch path
   */
  public getWatchPath(): string {
    return this.config.watchPath;
  }

  /**
   * Get excluded paths
   */
  public getExcludedPaths(): string[] {
    return this.config.excludePaths;
  }

  /**
   * Get request timeout
   */
  public getRequestTimeout(): number {
    return this.config.requestTimeout;
  }

  /**
   * Get log file path
   */
  public getLogFilePath(): string {
    return this.config.logFilePath;
  }

  /**
   * Validate configuration
   */
  public validate(): void {
    // Validate endpoint
    try {
      new URL(this.config.apiEndpoint);
    } catch {
      throw new Error('Invalid API endpoint URL');
    }

    // Validate API key
    if (!this.config.apiKey) {
      throw new Error('API key is required (set AGENT_API_KEY env var)');
    }

    // Validate agents
    if (!this.config.agents || this.config.agents.length === 0) {
      throw new Error('At least one agent must be configured');
    }

    // Validate watch path
    if (!this.config.watchPath) {
      throw new Error('Watch path must be configured');
    }

    logger.info('Configuration validated successfully');
  }

  /**
   * Private: Load from environment
   */
  private loadFromEnvironment(): Config {
    const cwd = process.cwd();

    return {
      apiEndpoint: process.env.AGENT_API_ENDPOINT || 'http://localhost:3000/api',
      apiKey: process.env.AGENT_API_KEY || '',
      agents: (process.env.AGENT_AGENTS?.split(',') as AgentType[]) || [
        'backend-engineer',
        'senior-frontend',
        'security-analyst',
      ],
      analysisDelay: parseInt(process.env.AGENT_ANALYSIS_DELAY || '2000', 10),
      enableCache: process.env.AGENT_ENABLE_CACHE !== 'false',
      cacheDuration: parseInt(process.env.AGENT_CACHE_DURATION || '86400000', 10),
      maxFileSize: parseInt(process.env.AGENT_MAX_FILE_SIZE || '10485760', 10),
      excludePaths: (process.env.AGENT_EXCLUDE_PATHS?.split(',') as string[]) || [
        'node_modules',
        '.git',
        'dist',
        'build',
        '.next',
      ],
      watchPath: process.env.AGENT_WATCH_PATH || path.join(cwd, 'src'),
      requestTimeout: parseInt(process.env.AGENT_REQUEST_TIMEOUT || '10000', 10),
      logLevel: process.env.AGENT_LOG_LEVEL || 'info',
      logFilePath:
        process.env.AGENT_LOG_FILE ||
        path.join(cwd, '.agent-analyzer', 'analysis.log'),
    };
  }
}

/**
 * Export singleton
 */
export const configManager = ConfigManager.getInstance();
