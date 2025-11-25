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
 * LSP Server configuration
 */
export interface Config {
  agents: AgentType[];
  analysisDelay: number;
  enableCache: boolean;
  cacheDuration: number;
  maxFileSize: number;
  excludePaths: string[];
  logLevel: string;
  requestTimeout: number;
}

/**
 * Configuration manager for LSP
 */
export class ConfigManager {
  private static instance: ConfigManager;
  private config: Config;

  private constructor() {
    this.config = this.getDefaults();
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
   * Get configuration
   */
  public getConfig(): Config {
    return this.config;
  }

  /**
   * Update configuration from client
   */
  public updateFromClient(clientConfig: Partial<Config>): void {
    this.config = {
      ...this.config,
      ...clientConfig,
    };
    logger.info('Configuration updated from client', clientConfig);
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
   * Private: Get defaults
   */
  private getDefaults(): Config {
    return {
      agents: ['backend-engineer', 'senior-frontend', 'security-analyst'],
      analysisDelay: 2000,
      enableCache: true,
      cacheDuration: 86400000,
      maxFileSize: 10485760,
      excludePaths: ['node_modules', '.git', 'dist'],
      logLevel: 'info',
      requestTimeout: 10000,
    };
  }
}

/**
 * Export singleton
 */
export const configManager = ConfigManager.getInstance();
