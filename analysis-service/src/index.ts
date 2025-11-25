#!/usr/bin/env node

/**
 * Analysis Service Entry Point
 *
 * Real-time code analysis service that:
 * - Watches for file changes
 * - Invokes specialized AI agents
 * - Publishes results to LSP server
 */

import { logger } from './logger';
import { configManager } from './config';
import { analyzer, AnalysisResultEvent } from './analyzer';

/**
 * Start analysis service
 */
async function start(): Promise<void> {
  try {
    logger.info('🚀 Starting Analysis Service');
    const startTime = Date.now();

    // Initialize configuration
    logger.info('📋 Loading configuration');
    configManager.validate();
    const config = configManager.getConfig();

    logger.info('Configuration loaded', {
      apiEndpoint: config.apiEndpoint,
      agents: config.agents.length,
      watchPath: config.watchPath,
    });

    // Register analysis result handler
    analyzer.onAnalysisComplete(async (result: AnalysisResultEvent) => {
      try {
        if (result.success) {
          logger.info('✅ Analysis completed', {
            file: result.filePath,
            issuesFound: result.results.results.reduce((sum, r) => sum + r.issues.length, 0),
          });

          // TODO: Send results to LSP server via socket/pipe
          // Results should be published as diagnostics
        } else {
          logger.error('❌ Analysis failed', {
            file: result.filePath,
            error: result.error?.message,
          });
        }
      } catch (error) {
        logger.error('Error handling analysis result', error instanceof Error ? error : new Error(String(error)));
      }
    });

    // Start analyzer
    logger.info('🎯 Starting file analysis');
    await analyzer.start({
      apiEndpoint: config.apiEndpoint,
      apiKey: config.apiKey,
      agents: config.agents,
      watchPath: config.watchPath,
      excludePaths: config.excludePaths,
      debounceMs: config.analysisDelay,
      requestTimeout: config.requestTimeout,
    });

    const duration = Date.now() - startTime;
    logger.info(`✅ Analysis Service started (${duration}ms)`);
    logger.info('📁 Watching for file changes in: ' + config.watchPath);

    // Handle graceful shutdown
    process.on('SIGTERM', () => {
      logger.info('SIGTERM received, shutting down');
      shutdown();
    });

    process.on('SIGINT', () => {
      logger.info('SIGINT received, shutting down');
      shutdown();
    });
  } catch (error) {
    logger.error(
      'Fatal error starting analysis service',
      error instanceof Error ? error : new Error(String(error))
    );
    process.exit(1);
  }
}

/**
 * Shutdown analysis service
 */
async function shutdown(): Promise<void> {
  try {
    logger.info('🛑 Shutting down Analysis Service');

    // Stop analyzer
    await analyzer.stop();

    logger.info('✅ Analysis Service stopped');
    process.exit(0);
  } catch (error) {
    logger.error(
      'Error during shutdown',
      error instanceof Error ? error : new Error(String(error))
    );
    process.exit(1);
  }
}

/**
 * Start the service
 */
start();

/**
 * Log unhandled errors
 */
process.on('uncaughtException', (error) => {
  logger.error('Uncaught exception', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled rejection', new Error(String(reason)));
  process.exit(1);
});
