/**
 * Language Server Protocol Client
 *
 * Manages:
 * - LSP server process spawning
 * - Client initialization and capabilities
 * - Language client lifecycle
 * - Communication with LSP server
 * - Error handling and recovery
 */

import * as vscode from 'vscode';
import { LanguageClient as VscodeLanguageClient, LanguageClientOptions, ServerOptions } from 'vscode-languageclient/node';
import * as path from 'path';
import { logger } from './logger';
import { NetworkError } from './errors';
import { Config } from './config';

/**
 * Agent analysis statistics
 */
export interface AnalysisStats {
  analysisCount: number;
  issueCount: number;
  averageResponseTime: number;
  lastAnalysisAt?: Date;
}

/**
 * Language Server client wrapper
 */
export class LSPClient {
  private client: VscodeLanguageClient | null = null;
  private serverPath: string;
  private running: boolean = false;
  private stats: AnalysisStats = {
    analysisCount: 0,
    issueCount: 0,
    averageResponseTime: 0,
  };

  constructor() {
    // LSP server will be in lsp-server/out/index.js after build
    this.serverPath = path.join(__dirname, '..', '..', 'lsp-server', 'out', 'index.js');
    logger.debug('LSP server path set', { serverPath: this.serverPath });
  }

  /**
   * Initialize LSP client
   */
  public async initialize(context: vscode.ExtensionContext, config: Config): Promise<void> {
    try {
      logger.info('Initializing LSP client...');

      // Setup server options
      const serverOptions = this.createServerOptions(config);
      logger.debug('Server options created');

      // Setup client options
      const clientOptions = this.createClientOptions(config);
      logger.debug('Client options created');

      // Create the language client
      this.client = new VscodeLanguageClient(
        'agent-analyzer',
        'Agent Analyzer',
        serverOptions,
        clientOptions
      );

      logger.debug('Language client created');

      // Setup client event handlers
      this.setupClientHandlers();

      // Start the client
      logger.info('Starting LSP client...');
      await this.client.start();
      this.running = true;

      logger.info('✅ LSP client started successfully');

      // Add to extension subscriptions for cleanup
      context.subscriptions.push(this.client);

    } catch (error) {
      logger.error('Failed to initialize LSP client', error instanceof Error ? error : undefined);
      throw new NetworkError('Failed to start language server', error instanceof Error ? error : undefined);
    }
  }

  /**
   * Check if client is running
   */
  public isRunning(): boolean {
    return this.running && this.client !== null;
  }

  /**
   * Start the LSP client
   */
  public async start(): Promise<void> {
    try {
      if (!this.client) {
        throw new Error('Client not initialized');
      }

      if (this.running) {
        logger.info('LSP client already running');
        return;
      }

      logger.info('Starting LSP client...');
      await this.client.start();
      this.running = true;
      logger.info('✅ LSP client started');

    } catch (error) {
      logger.error('Error starting LSP client', error);
      this.running = false;
      throw error;
    }
  }

  /**
   * Stop the LSP client
   */
  public async stop(): Promise<void> {
    try {
      if (!this.client) {
        logger.info('Client not initialized, nothing to stop');
        return;
      }

      if (!this.running) {
        logger.info('LSP client already stopped');
        return;
      }

      logger.info('Stopping LSP client...');
      await this.client.stop();
      this.running = false;
      logger.info('✅ LSP client stopped');

    } catch (error) {
      logger.error('Error stopping LSP client', error);
      this.running = false;
      throw error;
    }
  }

  /**
   * Analyze a file
   */
  public async analyzeFile(document: vscode.TextDocument): Promise<void> {
    try {
      if (!this.client || !this.running) {
        throw new Error('LSP client not running');
      }

      logger.info('Requesting analysis for file', { fileName: document.fileName });

      // Send custom request to server for file analysis
      await this.client.sendRequest('custom/analyzeFile', {
        uri: document.uri.toString(),
        languageId: document.languageId,
      });

      this.stats.analysisCount++;
      this.stats.lastAnalysisAt = new Date();
      logger.info('File analysis completed', { count: this.stats.analysisCount });

    } catch (error) {
      logger.error('Error analyzing file', error);
      throw error;
    }
  }

  /**
   * Clear cache
   */
  public async clearCache(): Promise<void> {
    try {
      if (!this.client || !this.running) {
        throw new Error('LSP client not running');
      }

      logger.info('Requesting cache clear from server...');
      await this.client.sendRequest('custom/clearCache', {});
      logger.info('✅ Cache cleared');

    } catch (error) {
      logger.error('Error clearing cache', error);
      throw error;
    }
  }

  /**
   * Get analysis statistics
   */
  public getStatistics(): AnalysisStats {
    return { ...this.stats };
  }

  /**
   * Private: Create server options
   */
  private createServerOptions(config: Config): ServerOptions {
    // Use Node.js module as server
    const serverOptions: ServerOptions = {
      run: {
        module: this.serverPath,
        transport: 'ipc',
        options: {
          cwd: process.cwd(),
          env: {
            ...process.env,
            AGENT_API_ENDPOINT: config.apiEndpoint,
            AGENT_API_KEY: config.apiKey,
            AGENT_AGENTS: config.agents.join(','),
            AGENT_LOG_LEVEL: config.logLevel,
          },
        },
      },
      debug: {
        module: this.serverPath,
        transport: 'ipc',
        options: {
          execArgv: ['--nolazy', '--inspect=6009'],
          cwd: process.cwd(),
          env: {
            ...process.env,
            AGENT_API_ENDPOINT: config.apiEndpoint,
            AGENT_API_KEY: config.apiKey,
            AGENT_AGENTS: config.agents.join(','),
            AGENT_LOG_LEVEL: 'debug',
          },
        },
      },
    };

    logger.debug('Server options configured', {
      module: this.serverPath,
      agents: config.agents.length,
    });

    return serverOptions;
  }

  /**
   * Private: Create client options
   */
  private createClientOptions(config: Config): LanguageClientOptions {
    const clientOptions: LanguageClientOptions = {
      // Activate for JS/TS files
      documentSelector: [
        { scheme: 'file', language: 'javascript' },
        { scheme: 'file', language: 'typescript' },
        { scheme: 'file', language: 'typescriptreact' },
        { scheme: 'file', language: 'javascriptreact' },
      ],

      // Synchronization settings
      synchronize: {
        // Notify server about file changes
        fileEvents: vscode.workspace.createFileSystemWatcher('**/.{js,ts,tsx,jsx}', false, false, false),
        // Notify server about configuration changes
        configurationSection: 'agent-analyzer',
      },

      // Output channel for logs
      outputChannelName: 'Agent Analyzer',

      // Initialization options
      initializationOptions: {
        agentConfig: config,
      },

      // Advanced settings
      middleware: {
        workspace: {
          configuration: (params, next) => {
            logger.debug('Configuration requested by server');
            return next(params);
          },
        },
      },
    };

    logger.debug('Client options configured');
    return clientOptions;
  }

  /**
   * Private: Setup client event handlers
   */
  private setupClientHandlers(): void {
    if (!this.client) {
      return;
    }

    // Ready event
    this.client.onReady().then(() => {
      logger.info('✅ LSP client ready');
    }).catch((error) => {
      logger.error('Error during LSP client initialization', error);
    });

    // Notification: Server started
    this.client.onNotification('custom/serverStarted', (data: any) => {
      logger.info('Server started notification received', data);
    });

    // Notification: Analysis complete
    this.client.onNotification('custom/analysisComplete', (data: any) => {
      logger.info('Analysis complete', {
        issuesFound: data.issuesCount,
        duration: data.duration,
      });
      this.stats.issueCount = (this.stats.issueCount || 0) + (data.issuesCount || 0);
    });

    // Notification: Error
    this.client.onNotification('custom/error', (data: any) => {
      logger.error('Error notification from server', data.message);
    });

    // Notification: Warning
    this.client.onNotification('custom/warning', (data: any) => {
      logger.warn('Warning from server', data.message);
    });

    logger.info('Client event handlers registered');
  }
}

export default LSPClient;
