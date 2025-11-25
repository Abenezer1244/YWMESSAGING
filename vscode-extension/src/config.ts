import * as vscode from 'vscode';
import { logger } from './logger';
import { ConfigurationError } from './errors';

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
 * Configuration interface
 */
export interface Config {
  enabled: boolean;
  apiEndpoint: string;
  apiKey: string;
  agents: AgentType[];
  analysisDelay: number;
  enableCache: boolean;
  cacheDuration: number;
  maxFileSize: number;
  excludePaths: string[];
  analyzeOnSave: boolean;
  logLevel: string;
  autoFixEnabled: boolean;
}

/**
 * Configuration manager
 */
export class ConfigManager {
  private static instance: ConfigManager;
  private config: Config | null = null;
  private configChangeListener: vscode.Disposable | null = null;
  private onConfigChangeCallbacks: Array<(config: Config) => void> = [];

  private constructor() {}

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
   * Initialize configuration
   */
  public initialize(): void {
    try {
      this.loadConfig();
      this.setupConfigChangeListener();
      logger.info('Configuration initialized', {
        agents: this.config?.agents.length,
        endpoint: this.config?.apiEndpoint,
      });
    } catch (error) {
      logger.error('Failed to initialize configuration', error);
      throw error;
    }
  }

  /**
   * Get current configuration
   */
  public getConfig(): Config {
    if (!this.config) {
      this.loadConfig();
    }
    return this.config!;
  }

  /**
   * Get API endpoint
   */
  public getApiEndpoint(): string {
    return this.getConfig().apiEndpoint;
  }

  /**
   * Get API key
   */
  public getApiKey(): string {
    return this.getConfig().apiKey;
  }

  /**
   * Get agents to run
   */
  public getAgents(): AgentType[] {
    return this.getConfig().agents;
  }

  /**
   * Get analysis delay
   */
  public getAnalysisDelay(): number {
    return this.getConfig().analysisDelay;
  }

  /**
   * Is enabled
   */
  public isEnabled(): boolean {
    return this.getConfig().enabled;
  }

  /**
   * Is cache enabled
   */
  public isCacheEnabled(): boolean {
    return this.getConfig().enableCache;
  }

  /**
   * Get max file size
   */
  public getMaxFileSize(): number {
    return this.getConfig().maxFileSize;
  }

  /**
   * Get excluded paths
   */
  public getExcludedPaths(): string[] {
    return this.getConfig().excludePaths;
  }

  /**
   * Should analyze on save
   */
  public shouldAnalyzeOnSave(): boolean {
    return this.getConfig().analyzeOnSave;
  }

  /**
   * Is auto fix enabled
   */
  public isAutoFixEnabled(): boolean {
    return this.getConfig().autoFixEnabled;
  }

  /**
   * Register for config changes
   */
  public onConfigChange(callback: (config: Config) => void): void {
    this.onConfigChangeCallbacks.push(callback);
  }

  /**
   * Validate configuration
   */
  public validate(): void {
    const config = this.getConfig();

    // Validate endpoint
    try {
      new URL(config.apiEndpoint);
    } catch {
      throw new ConfigurationError('Invalid API endpoint URL', 'apiEndpoint');
    }

    // Validate API key
    if (!config.apiKey) {
      throw new ConfigurationError('API key is required', 'apiKey');
    }

    // Validate agents
    if (!config.agents || config.agents.length === 0) {
      throw new ConfigurationError('At least one agent must be selected', 'agents');
    }

    // Validate delays
    if (config.analysisDelay < 500 || config.analysisDelay > 10000) {
      throw new ConfigurationError('Analysis delay must be between 500-10000 ms', 'analysisDelay');
    }

    // Validate file size
    if (config.maxFileSize <= 0) {
      throw new ConfigurationError('Max file size must be greater than 0', 'maxFileSize');
    }

    logger.info('Configuration validated successfully');
  }

  /**
   * Private: Load config
   */
  private loadConfig(): void {
    const workspaceConfig = vscode.workspace.getConfiguration('agent-analyzer');

    // Resolve API key from environment if needed
    let apiKey = workspaceConfig.get<string>('apiKey') || '';
    if (apiKey.includes('${env:')) {
      // Extract env var name: ${env:AGENT_API_KEY} -> AGENT_API_KEY
      const match = apiKey.match(/\$\{env:([^}]+)\}/);
      if (match && match[1]) {
        apiKey = process.env[match[1]] || '';
      }
    }

    this.config = {
      enabled: workspaceConfig.get<boolean>('enabled') ?? true,
      apiEndpoint: workspaceConfig.get<string>('apiEndpoint') ?? 'http://localhost:3000/api',
      apiKey,
      agents: workspaceConfig.get<AgentType[]>('agents') ?? [
        'backend-engineer',
        'senior-frontend',
        'security-analyst',
      ],
      analysisDelay: workspaceConfig.get<number>('analysisDelay') ?? 2000,
      enableCache: workspaceConfig.get<boolean>('enableCache') ?? true,
      cacheDuration: workspaceConfig.get<number>('cacheDuration') ?? 86400000,
      maxFileSize: workspaceConfig.get<number>('maxFileSize') ?? 10485760,
      excludePaths: workspaceConfig.get<string[]>('excludePaths') ?? [
        'node_modules',
        '.git',
        'dist',
      ],
      analyzeOnSave: workspaceConfig.get<boolean>('analyzeOnSave') ?? true,
      logLevel: workspaceConfig.get<string>('logLevel') ?? 'info',
      autoFixEnabled: workspaceConfig.get<boolean>('autoFixEnabled') ?? false,
    };
  }

  /**
   * Private: Setup config change listener
   */
  private setupConfigChangeListener(): void {
    this.configChangeListener = vscode.workspace.onDidChangeConfiguration(event => {
      if (event.affectsConfiguration('agent-analyzer')) {
        logger.info('Configuration changed, reloading...');
        this.loadConfig();
        this.onConfigChangeCallbacks.forEach(callback => callback(this.config!));
      }
    });
  }

  /**
   * Cleanup
   */
  public dispose(): void {
    if (this.configChangeListener) {
      this.configChangeListener.dispose();
    }
  }
}

/**
 * Export singleton
 */
export const configManager = ConfigManager.getInstance();
