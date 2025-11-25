/**
 * File Watcher Service
 *
 * Monitors file system changes using chokidar.
 * Detects which files changed and triggers analysis.
 */

import * as chokidar from 'chokidar';
import * as path from 'path';
import { logger } from './logger';

/**
 * File change event
 */
export interface FileChangeEvent {
  filePath: string;
  changeType: 'add' | 'change' | 'unlink';
  timestamp: number;
}

/**
 * File watcher callback
 */
export type FileWatcherCallback = (event: FileChangeEvent) => void;

/**
 * File watcher service
 */
export class FileWatcher {
  private static instance: FileWatcher;
  private watcher: chokidar.FSWatcher | null = null;
  private callbacks: FileWatcherCallback[] = [];
  private watchPath: string = '';

  /**
   * Get singleton instance
   */
  public static getInstance(): FileWatcher {
    if (!FileWatcher.instance) {
      FileWatcher.instance = new FileWatcher();
    }
    return FileWatcher.instance;
  }

  /**
   * Start watching for file changes
   */
  public start(watchPath: string, excludePaths: string[] = []): void {
    try {
      if (this.watcher) {
        logger.warn('File watcher already started');
        return;
      }

      this.watchPath = watchPath;

      logger.info('Starting file watcher', {
        path: watchPath,
        excludedPatterns: excludePaths.length,
      });

      // Build ignore patterns
      const ignorePatterns = [
        '**/node_modules/**',
        '**/.git/**',
        '**/.vscode/**',
        '**/dist/**',
        '**/build/**',
        '**/.next/**',
        ...excludePaths.map((p) => `**/${p}/**`),
      ];

      // Create watcher
      this.watcher = chokidar.watch(watchPath, {
        ignored: ignorePatterns,
        persistent: true,
        awaitWriteFinish: {
          stabilityThreshold: 300,
          pollInterval: 100,
        },
      });

      // Handle file changes
      this.watcher.on('add', (filePath) => {
        this.handleFileChange(filePath, 'add');
      });

      this.watcher.on('change', (filePath) => {
        this.handleFileChange(filePath, 'change');
      });

      this.watcher.on('unlink', (filePath) => {
        this.handleFileChange(filePath, 'unlink');
      });

      // Handle watcher errors
      this.watcher.on('error', (error) => {
        logger.error('File watcher error', error instanceof Error ? error : new Error(String(error)));
      });

      logger.info('✅ File watcher started');
    } catch (error) {
      logger.error('Error starting file watcher', error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }

  /**
   * Stop watching for file changes
   */
  public async stop(): Promise<void> {
    try {
      if (!this.watcher) {
        logger.info('File watcher not running');
        return;
      }

      logger.info('Stopping file watcher');
      await this.watcher.close();
      this.watcher = null;

      logger.info('✅ File watcher stopped');
    } catch (error) {
      logger.error('Error stopping file watcher', error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }

  /**
   * Register callback for file changes
   */
  public onChange(callback: FileWatcherCallback): void {
    this.callbacks.push(callback);
    logger.debug('File change callback registered');
  }

  /**
   * Unregister callback
   */
  public offChange(callback: FileWatcherCallback): void {
    const index = this.callbacks.indexOf(callback);
    if (index >= 0) {
      this.callbacks.splice(index, 1);
      logger.debug('File change callback unregistered');
    }
  }

  /**
   * Check if file should be analyzed
   */
  private shouldAnalyzeFile(filePath: string): boolean {
    // Only analyze source files
    const ext = path.extname(filePath).toLowerCase();
    const analyzableExts = ['.js', '.ts', '.jsx', '.tsx', '.mjs'];

    return analyzableExts.includes(ext);
  }

  /**
   * Handle file change event
   */
  private handleFileChange(filePath: string, changeType: 'add' | 'change' | 'unlink'): void {
    try {
      // Skip if not an analyzable file
      if (changeType !== 'unlink' && !this.shouldAnalyzeFile(filePath)) {
        return;
      }

      const event: FileChangeEvent = {
        filePath,
        changeType,
        timestamp: Date.now(),
      };

      logger.debug('File change detected', {
        file: path.basename(filePath),
        type: changeType,
      });

      // Notify all callbacks
      this.callbacks.forEach((callback) => {
        try {
          callback(event);
        } catch (error) {
          logger.error('Error in file change callback', error instanceof Error ? error : new Error(String(error)));
        }
      });
    } catch (error) {
      logger.error('Error handling file change', error instanceof Error ? error : new Error(String(error)));
    }
  }

  /**
   * Get current watch status
   */
  public isWatching(): boolean {
    return this.watcher !== null;
  }

  /**
   * Get watch path
   */
  public getWatchPath(): string {
    return this.watchPath;
  }
}

/**
 * Export singleton
 */
export const fileWatcher = FileWatcher.getInstance();
