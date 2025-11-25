/**
 * Agent Analyzer VS Code Extension
 * Real-time code analysis with 8 specialized AI agents
 *
 * Entry point for the extension. Handles:
 * - Logger initialization
 * - Configuration loading and validation
 * - LSP client setup and connection
 * - Command registration
 * - Status bar integration
 * - Error handling and recovery
 */

import * as vscode from 'vscode';
import { logger } from './logger';
import { setupGlobalErrorHandling } from './errors';
import { configManager } from './config';
import LSPClient from './client';

// Global extension state
let languageClient: LSPClient | null = null;
let statusBarItem: vscode.StatusBarItem | null = null;

/**
 * Activate extension
 * Called when extension is first loaded or activated by trigger
 */
export async function activate(context: vscode.ExtensionContext): Promise<void> {
  try {
    logger.setContext('Extension');

    logger.info('🚀 Activating Agent Analyzer extension...');
    const startTime = Date.now();

    // Setup global error handling
    setupGlobalErrorHandling();
    logger.debug('Global error handling initialized');

    // Step 1: Initialize configuration
    logger.info('📋 Loading configuration...');
    try {
      configManager.initialize();
      logger.info('Configuration loaded successfully', {
        enabled: configManager.getConfig().enabled,
        agents: configManager.getConfig().agents.length,
      });
    } catch (error) {
      logger.showError('Failed to load configuration', error instanceof Error ? error : undefined);
      logger.error('Configuration initialization failed', error);
      return;
    }

    // Step 2: Validate configuration
    logger.info('✅ Validating configuration...');
    try {
      configManager.validate();
      logger.info('Configuration validation passed');
    } catch (error) {
      logger.showError(
        'Configuration validation failed. Please check your settings.',
        error instanceof Error ? error : undefined
      );
      logger.error('Configuration validation error', error);
      return;
    }

    // Step 3: Setup status bar
    logger.info('📊 Setting up status bar...');
    setupStatusBar();

    // Step 4: Initialize configuration change listener
    logger.info('👂 Setting up configuration change listener...');
    configManager.onConfigChange((config) => {
      logger.info('Configuration changed', { agents: config.agents.length });
      updateStatusBar('ready');
    });

    // Step 5: Register commands
    logger.info('📝 Registering commands...');
    registerCommands(context);

    // Step 6: Initialize LSP client
    if (configManager.isEnabled()) {
      logger.info('🤖 Initializing LSP client...');
      try {
        languageClient = new LSPClient();
        await languageClient.initialize(context, configManager.getConfig());
        logger.info('LSP client initialized and started');
        updateStatusBar('ready');
      } catch (error) {
        logger.warn('Failed to initialize LSP client', error instanceof Error ? error : undefined);
        logger.showWarning('LSP initialization failed. Some features may not work.');
        updateStatusBar('error');
      }
    } else {
      logger.info('⏸️ Extension disabled in configuration');
      updateStatusBar('disabled');
    }

    // Step 7: Add extension to subscriptions for cleanup
    context.subscriptions.push({
      dispose: () => deactivate(),
    });

    const duration = Date.now() - startTime;
    logger.timeLog('Agent Analyzer extension activated', duration);
    logger.showInfo(`Agent Analyzer ready (${duration}ms)`);

  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    logger.error('Fatal error during extension activation', err);
    logger.showError('Failed to activate Agent Analyzer. Check the output panel for details.');
  }
}

/**
 * Deactivate extension
 * Called when extension is unloaded
 */
export async function deactivate(): Promise<void> {
  try {
    logger.info('🛑 Deactivating Agent Analyzer extension...');

    // Stop LSP client
    if (languageClient?.isRunning()) {
      logger.info('Stopping LSP client...');
      await languageClient.stop();
      logger.info('LSP client stopped');
    }

    // Dispose status bar
    if (statusBarItem) {
      statusBarItem.dispose();
      logger.debug('Status bar disposed');
    }

    // Dispose config manager
    configManager.dispose();
    logger.debug('Configuration manager disposed');

    // Dispose logger
    logger.dispose();

  } catch (error) {
    console.error('Error during deactivation:', error);
  }
}

/**
 * Setup status bar
 */
function setupStatusBar(): void {
  try {
    if (statusBarItem) {
      statusBarItem.dispose();
    }

    statusBarItem = vscode.window.createStatusBarItem(
      vscode.StatusBarAlignment.Right,
      100
    );
    statusBarItem.command = 'agent-analyzer.showStats';
    updateStatusBar('ready');
    statusBarItem.show();

    logger.debug('Status bar created and shown');
  } catch (error) {
    logger.warn('Failed to setup status bar', error);
  }
}

/**
 * Update status bar item
 */
function updateStatusBar(state: 'ready' | 'analyzing' | 'error' | 'disabled'): void {
  if (!statusBarItem) {
    return;
  }

  const states: Record<'ready' | 'analyzing' | 'error' | 'disabled', { icon: string; text: string; tooltip: string }> = {
    ready: {
      icon: '$(check)',
      text: 'Agent Analyzer Ready',
      tooltip: 'Agent Analyzer is ready. Press Ctrl+Shift+A to analyze.',
    },
    analyzing: {
      icon: '$(loading~spin)',
      text: 'Analyzing...',
      tooltip: 'Analyzing code with agents...',
    },
    error: {
      icon: '$(error)',
      text: 'Agent Analyzer Error',
      tooltip: 'Error: Check output panel',
    },
    disabled: {
      icon: '$(circle-slash)',
      text: 'Agent Analyzer Disabled',
      tooltip: 'Agent Analyzer is disabled',
    },
  };

  const stateInfo = states[state];
  statusBarItem.text = `${stateInfo.icon} ${stateInfo.text}`;
  statusBarItem.tooltip = stateInfo.tooltip;
  logger.debug(`Status bar updated: ${state}`);
}

/**
 * Register VS Code commands
 */
function registerCommands(context: vscode.ExtensionContext): void {
  try {
    // Command: Start analysis
    context.subscriptions.push(
      vscode.commands.registerCommand('agent-analyzer.start', async () => {
        try {
          logger.info('User command: start analysis');
          updateStatusBar('analyzing');
          if (languageClient?.isRunning()) {
            await languageClient.start();
            logger.info('Analysis started');
            updateStatusBar('ready');
          } else {
            logger.warn('LSP client not running');
            logger.showWarning('Analyzer is not running. Please restart VS Code.');
            updateStatusBar('error');
          }
        } catch (error) {
          const err = error instanceof Error ? error : new Error(String(error));
          logger.error('Error starting analysis', err);
          updateStatusBar('error');
        }
      })
    );

    // Command: Stop analysis
    context.subscriptions.push(
      vscode.commands.registerCommand('agent-analyzer.stop', async () => {
        try {
          logger.info('User command: stop analysis');
          if (languageClient?.isRunning()) {
            await languageClient.stop();
            logger.info('Analysis stopped');
          }
          updateStatusBar('ready');
        } catch (error) {
          const err = error instanceof Error ? error : new Error(String(error));
          logger.error('Error stopping analysis', err);
        }
      })
    );

    // Command: Analyze current file
    context.subscriptions.push(
      vscode.commands.registerCommand('agent-analyzer.analyzeFile', async () => {
        try {
          const editor = vscode.window.activeTextEditor;
          if (!editor) {
            logger.warn('No active editor');
            logger.showWarning('Please open a file to analyze');
            return;
          }

          logger.info(`User command: analyze file: ${editor.document.fileName}`);
          updateStatusBar('analyzing');

          if (languageClient?.isRunning()) {
            // Request analysis of current file
            await languageClient.analyzeFile(editor.document);
            logger.info('File analysis requested');
            updateStatusBar('ready');
          } else {
            logger.warn('LSP client not running');
            logger.showWarning('Analyzer is not running');
            updateStatusBar('error');
          }
        } catch (error) {
          const err = error instanceof Error ? error : new Error(String(error));
          logger.error('Error analyzing file', err);
          updateStatusBar('error');
        }
      })
    );

    // Command: Clear cache
    context.subscriptions.push(
      vscode.commands.registerCommand('agent-analyzer.clearCache', async () => {
        try {
          logger.info('User command: clear cache');
          if (languageClient?.isRunning()) {
            await languageClient.clearCache();
            logger.showInfo('Analysis cache cleared');
          } else {
            logger.warn('LSP client not running');
            logger.showWarning('Analyzer is not running');
          }
        } catch (error) {
          const err = error instanceof Error ? error : new Error(String(error));
          logger.error('Error clearing cache', err);
        }
      })
    );

    // Command: Show statistics
    context.subscriptions.push(
      vscode.commands.registerCommand('agent-analyzer.showStats', async () => {
        try {
          logger.info('User command: show statistics');
          if (languageClient?.isRunning()) {
            const stats = languageClient.getStatistics();
            logger.showInfo(`Analyses run: ${stats.analysisCount}\nIssues found: ${stats.issueCount}`);
          } else {
            logger.showInfo('Analyzer is not running');
          }
        } catch (error) {
          const err = error instanceof Error ? error : new Error(String(error));
          logger.error('Error getting statistics', err);
        }
      })
    );

    // Command: Open settings
    context.subscriptions.push(
      vscode.commands.registerCommand('agent-analyzer.openSettings', () => {
        try {
          logger.info('User command: open settings');
          vscode.commands.executeCommand('workbench.action.openSettings', 'agent-analyzer');
        } catch (error) {
          const err = error instanceof Error ? error : new Error(String(error));
          logger.error('Error opening settings', err);
        }
      })
    );

    logger.info('✅ All commands registered', { count: 6 });

  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    logger.error('Error registering commands', err);
  }
}

/**
 * Export functions for testing
 */
export { updateStatusBar, languageClient };
