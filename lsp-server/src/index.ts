#!/usr/bin/env node

/**
 * LSP Server Entry Point
 *
 * Starts the Language Server Protocol server that:
 * - Listens for messages from VS Code client
 * - Manages text documents
 * - Publishes diagnostics
 * - Handles code actions
 * - Provides hover information
 */

import {
  createConnection,
  TextDocuments,
  Diagnostic,
  DidChangeConfigurationNotification,
  InitializeParams,
  InitializeResult,
  ServerCapabilities,
  TextDocumentSyncKind,
} from 'vscode-languageserver';
import { logger } from './logger';
import { AnalysisError } from './errors';
import { configManager } from './config';
import { hoverProvider } from './hover';
import { diagnosticsHandler } from './diagnostics';
import { codeActionsProvider } from './codeActions';

/**
 * Create connection (IPC by default for LSP)
 */
const connection = (createConnection as any)() as any;

/**
 * Create document manager
 */
const documents = new (TextDocuments as any)(Object);

/**
 * Global state
 */
let hasConfigurationCapability = false;
let hasWorkspaceFolderCapability = false;
let hasDiagnosticRelatedInformationCapability = false;

/**
 * Initialize logger with connection
 */
logger.setConnection(connection);
logger.setContext('LSP-Server');

/**
 * Initialize server
 */
connection.onInitialize((params: InitializeParams): InitializeResult => {
  try {
    logger.info('🚀 LSP Server initialization requested');

    // Check client capabilities
    hasConfigurationCapability = !!(
      params.capabilities.workspace && !!params.capabilities.workspace.configuration
    );
    hasWorkspaceFolderCapability = !!(
      params.capabilities.workspace && !!params.capabilities.workspace.workspaceFolders
    );
    hasDiagnosticRelatedInformationCapability = !!(
      params.capabilities.textDocument &&
      params.capabilities.textDocument.publishDiagnostics &&
      params.capabilities.textDocument.publishDiagnostics.relatedInformation
    );

    logger.info('Client capabilities detected', {
      configuration: hasConfigurationCapability,
      workspaceFolders: hasWorkspaceFolderCapability,
      diagnosticRelatedInfo: hasDiagnosticRelatedInformationCapability,
    });

    // Update config from client
    const initOptions = params.initializationOptions as any;
    if (initOptions && initOptions.agentConfig) {
      configManager.updateFromClient(initOptions.agentConfig);
      logger.info('Configuration updated from client', {
        agents: configManager.getAgents().length,
      });
    }

    // Server capabilities
    const capabilities: ServerCapabilities = {
      textDocumentSync: TextDocumentSyncKind.Full,
      diagnosticProvider: {
        interFileDependencies: true,
        workspaceDiagnostics: true,
      },
      hoverProvider: true,
      codeActionProvider: true,
      documentFormattingProvider: false,
      documentRangeFormattingProvider: false,
    };

    logger.info('✅ LSP Server capabilities configured');

    const result: InitializeResult = {
      capabilities,
      serverInfo: {
        name: 'Agent Analyzer LSP',
        version: '1.0.0',
      },
    };

    return result;

  } catch (error) {
    logger.error('Error during LSP initialization', error instanceof Error ? error : undefined);
    throw error;
  }
});

/**
 * Initialized notification
 */
connection.onInitialized(() => {
  try {
    logger.info('LSP Server initialization complete');

    // Initialize handlers with connection
    diagnosticsHandler.setConnection(connection);
    logger.debug('Diagnostics handler initialized with connection');

    // Watch configuration changes if supported
    if (hasConfigurationCapability) {
      connection.client.register(DidChangeConfigurationNotification.type, undefined);
      logger.info('Configuration change notifications enabled');
    }

    // Send server started notification
    connection.sendNotification('custom/serverStarted', {
      timestamp: new Date().toISOString(),
      agents: configManager.getAgents(),
    });

    logger.info('✅ Server started notification sent');

  } catch (error) {
    logger.error('Error in onInitialized', error);
  }
});

/**
 * Configuration change handler
 */
connection.onDidChangeConfiguration((_change: any) => {
  try {
    logger.info('Configuration change detected');

    if (hasConfigurationCapability) {
      // The new configuration has been sent from the client
      logger.info('Configuration updated', { agents: configManager.getAgents().length });
    }

  } catch (error) {
    logger.error('Error handling configuration change', error);
  }
});

/**
 * Text document change handler
 */
documents.onDidChangeContent((change: any) => {
  try {
    const doc = change.document;
    logger.debug('Document changed', { uri: doc.uri });

    // Trigger analysis on change
    analyzeDocument(doc);

  } catch (error) {
    logger.error('Error handling document change', error);
  }
});

/**
 * Text document save handler
 */
documents.onDidSave((change: any) => {
  try {
    const doc = change.document;
    logger.info('Document saved', { uri: doc.uri });

    // Trigger analysis on save
    analyzeDocument(doc);

  } catch (error) {
    logger.error('Error handling document save', error);
  }
});

/**
 * Hover provider
 */
connection.onHover((params: any) => {
  try {
    const doc = documents.get(params.textDocument.uri);
    if (!doc) {
      logger.debug('Document not found for hover', { uri: params.textDocument.uri });
      return null;
    }

    logger.debug('Hover requested', {
      uri: params.textDocument.uri,
      position: params.position,
    });

    // Get hover information from provider
    const hover = hoverProvider.provideHover(doc, params.position);
    return hover;

  } catch (error) {
    logger.error('Error handling hover', error);
    return null;
  }
});

/**
 * Code action provider
 */
connection.onCodeAction((params: any) => {
  try {
    logger.debug('Code action requested', { uri: params.textDocument.uri });

    const doc = documents.get(params.textDocument.uri);
    if (!doc) {
      logger.debug('Document not found for code actions', { uri: params.textDocument.uri });
      return [];
    }

    // Get code actions for the diagnostic context
    const codeActions = codeActionsProvider.getCodeActions(doc, params.context.diagnostics);

    logger.debug('Code actions provided', {
      uri: params.textDocument.uri,
      count: codeActions.length,
    });

    return codeActions;

  } catch (error) {
    logger.error('Error handling code action', error);
    return [];
  }
});

/**
 * Custom request: Analyze file
 */
connection.onRequest('custom/analyzeFile', async (params: any) => {
  try {
    logger.info('Custom request: analyze file', { uri: params.uri });

    const doc = documents.get(params.uri);
    if (!doc) {
      throw new AnalysisError('Document not found', params.uri);
    }

    await analyzeDocument(doc);
    logger.info('File analysis completed');

    return { success: true };

  } catch (error) {
    logger.error('Error in analyzeFile request', error);
    throw error;
  }
});

/**
 * Custom request: Clear cache
 */
connection.onRequest('custom/clearCache', async () => {
  try {
    logger.info('Custom request: clear cache');
    // Cache clearing will be implemented when analysis service is integrated
    logger.info('Cache cleared');
    return { success: true };

  } catch (error) {
    logger.error('Error in clearCache request', error);
    throw error;
  }
});

/**
 * Analyze document (placeholder)
 */
async function analyzeDocument(doc: any): Promise<void> {
  try {
    const startTime = Date.now();
    logger.debug('Analyzing document', { uri: doc.uri });

    // TODO: Call analysis service when integrated
    // For now, send empty diagnostics
    const diagnostics: Diagnostic[] = [];

    // Publish diagnostics
    connection.sendDiagnostics({
      uri: doc.uri,
      diagnostics,
    });

    const duration = Date.now() - startTime;
    logger.timeLog('Document analysis completed', duration, { uri: doc.uri });

    // Send analysis complete notification
    connection.sendNotification('custom/analysisComplete', {
      uri: doc.uri,
      issuesCount: diagnostics.length,
      duration,
    });

  } catch (error) {
    logger.error('Error analyzing document', error);
    connection.sendNotification('custom/error', {
      message: 'Failed to analyze document',
      details: error instanceof Error ? error.message : String(error),
    });
  }
}

/**
 * Document manager listen
 */
documents.listen(connection);

/**
 * Start listening on the connection
 */
connection.listen();

logger.info('LSP Server started and listening for connections');

/**
 * Handle graceful shutdown
 */
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down...');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down...');
  process.exit(0);
});
