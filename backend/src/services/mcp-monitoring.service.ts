/**
 * MCP Tool Monitoring Service
 *
 * Provides real-time monitoring, metrics, and health checks for MCP (Model Context Provider)
 * tool execution. Tracks success/failure rates, execution times, and provides detailed
 * diagnostics for agent analysis.
 *
 * Enterprise-grade monitoring for production MCP operations.
 */

import axios from 'axios';

export interface MCPToolMetrics {
  toolName: string;
  executionCount: number;
  successCount: number;
  failureCount: number;
  averageExecutionTimeMs: number;
  lastExecutionTime?: Date;
  successRate: number;
  isHealthy: boolean;
}

export interface MCPExecutionLog {
  toolName: string;
  timestamp: Date;
  duration: number;
  status: 'success' | 'failure' | 'skipped';
  errorMessage?: string;
  input?: Record<string, any>;
  resultSummary?: string;
}

export interface MCPHealthStatus {
  timestamp: Date;
  overallHealth: 'healthy' | 'degraded' | 'unhealthy';
  toolMetrics: MCPToolMetrics[];
  recentErrors: MCPExecutionLog[];
  recommendations: string[];
}

class MCPMonitoringService {
  private metricsMap: Map<string, MCPToolMetrics> = new Map();
  private executionLog: MCPExecutionLog[] = [];
  private readonly maxLogEntries = 1000;
  private healthCheckInterval: NodeJS.Timeout | null = null;

  /**
   * Initialize monitoring for a specific MCP tool
   */
  public initializeToolMonitoring(toolName: string): void {
    if (!this.metricsMap.has(toolName)) {
      this.metricsMap.set(toolName, {
        toolName,
        executionCount: 0,
        successCount: 0,
        failureCount: 0,
        averageExecutionTimeMs: 0,
        successRate: 0,
        isHealthy: true,
      });

      console.log(`📊 MCP Monitoring initialized for: ${toolName}`);
    }
  }

  /**
   * Record successful MCP tool execution
   */
  public recordSuccess(
    toolName: string,
    executionTimeMs: number,
    resultSummary?: string
  ): void {
    this.initializeToolMonitoring(toolName);

    const metrics = this.metricsMap.get(toolName)!;
    metrics.executionCount++;
    metrics.successCount++;
    metrics.lastExecutionTime = new Date();

    // Calculate rolling average
    const totalTime =
      metrics.averageExecutionTimeMs * (metrics.executionCount - 1) + executionTimeMs;
    metrics.averageExecutionTimeMs = totalTime / metrics.executionCount;
    metrics.successRate = (metrics.successCount / metrics.executionCount) * 100;

    // Determine health
    metrics.isHealthy = metrics.successRate >= 90;

    // Log execution
    this.logExecution({
      toolName,
      timestamp: new Date(),
      duration: executionTimeMs,
      status: 'success',
      resultSummary,
    });

    console.log(
      `✅ ${toolName} success (${executionTimeMs}ms) - Rate: ${metrics.successRate.toFixed(1)}%`
    );
  }

  /**
   * Record failed MCP tool execution
   */
  public recordFailure(toolName: string, executionTimeMs: number, error: string): void {
    this.initializeToolMonitoring(toolName);

    const metrics = this.metricsMap.get(toolName)!;
    metrics.executionCount++;
    metrics.failureCount++;
    metrics.lastExecutionTime = new Date();

    // Calculate rolling average
    const totalTime =
      metrics.averageExecutionTimeMs * (metrics.executionCount - 1) + executionTimeMs;
    metrics.averageExecutionTimeMs = totalTime / metrics.executionCount;
    metrics.successRate = (metrics.successCount / metrics.executionCount) * 100;

    // Determine health - mark unhealthy if success rate drops below 80%
    metrics.isHealthy = metrics.successRate >= 80;

    // Log execution
    this.logExecution({
      toolName,
      timestamp: new Date(),
      duration: executionTimeMs,
      status: 'failure',
      errorMessage: error,
    });

    console.error(
      `❌ ${toolName} failed (${executionTimeMs}ms) - Rate: ${metrics.successRate.toFixed(1)}% - Error: ${error}`
    );
  }

  /**
   * Record skipped MCP tool execution (e.g., Claude MCP handled natively)
   */
  public recordSkipped(toolName: string, reason: string): void {
    this.initializeToolMonitoring(toolName);

    this.logExecution({
      toolName,
      timestamp: new Date(),
      duration: 0,
      status: 'skipped',
      resultSummary: reason,
    });

    console.log(`⊘ ${toolName} skipped - ${reason}`);
  }

  /**
   * Get metrics for a specific tool
   */
  public getToolMetrics(toolName: string): MCPToolMetrics | null {
    return this.metricsMap.get(toolName) || null;
  }

  /**
   * Get all MCP tool metrics
   */
  public getAllMetrics(): MCPToolMetrics[] {
    return Array.from(this.metricsMap.values());
  }

  /**
   * Get health status of entire MCP system
   */
  public getHealthStatus(): MCPHealthStatus {
    const allMetrics = this.getAllMetrics();

    // Determine overall health
    const healthyTools = allMetrics.filter((m) => m.isHealthy).length;
    const totalTools = allMetrics.length;
    let overallHealth: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';

    if (totalTools === 0) {
      overallHealth = 'healthy'; // No tools initialized yet
    } else if (healthyTools === totalTools) {
      overallHealth = 'healthy';
    } else if (healthyTools >= totalTools * 0.5) {
      overallHealth = 'degraded';
    } else {
      overallHealth = 'unhealthy';
    }

    // Get recent errors
    const recentErrors = this.executionLog
      .filter((log) => log.status === 'failure')
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 10);

    // Generate recommendations
    const recommendations = this.generateRecommendations(allMetrics, recentErrors);

    return {
      timestamp: new Date(),
      overallHealth,
      toolMetrics: allMetrics,
      recentErrors,
      recommendations,
    };
  }

  /**
   * Get execution history for a specific tool
   */
  public getToolHistory(toolName: string, limit: number = 100): MCPExecutionLog[] {
    return this.executionLog
      .filter((log) => log.toolName === toolName)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  /**
   * Clear all metrics and logs (for testing)
   */
  public reset(): void {
    this.metricsMap.clear();
    this.executionLog = [];
    console.log('🔄 MCP Monitoring metrics reset');
  }

  /**
   * Start periodic health checks
   */
  public startHealthChecks(intervalMs: number = 60000): void {
    if (this.healthCheckInterval) {
      return; // Already running
    }

    this.healthCheckInterval = setInterval(() => {
      const health = this.getHealthStatus();
      const healthEmoji = health.overallHealth === 'healthy' ? '✅' : '⚠️';

      console.log(`${healthEmoji} MCP Health Check: ${health.overallHealth.toUpperCase()}`);
      console.log(`   Tools monitored: ${health.toolMetrics.length}`);
      console.log(`   Healthy tools: ${health.toolMetrics.filter((m) => m.isHealthy).length}`);

      if (health.recommendations.length > 0) {
        console.log('   Recommendations:');
        health.recommendations.forEach((rec) => console.log(`     - ${rec}`));
      }
    }, intervalMs);

    console.log(`⏱️ MCP health checks started (interval: ${intervalMs}ms)`);
  }

  /**
   * Stop periodic health checks
   */
  public stopHealthChecks(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
      console.log('⏹️ MCP health checks stopped');
    }
  }

  /**
   * Private: Log execution to history
   */
  private logExecution(log: MCPExecutionLog): void {
    this.executionLog.push(log);

    // Keep log size manageable
    if (this.executionLog.length > this.maxLogEntries) {
      this.executionLog = this.executionLog.slice(-this.maxLogEntries);
    }
  }

  /**
   * Private: Generate recommendations based on metrics
   */
  private generateRecommendations(
    metrics: MCPToolMetrics[],
    recentErrors: MCPExecutionLog[]
  ): string[] {
    const recommendations: string[] = [];

    // Check for unhealthy tools
    const unhealthyTools = metrics.filter((m) => !m.isHealthy);
    if (unhealthyTools.length > 0) {
      unhealthyTools.forEach((tool) => {
        if (tool.successRate < 50) {
          recommendations.push(
            `CRITICAL: ${tool.toolName} has ${tool.successRate.toFixed(1)}% success rate. Investigate immediately.`
          );
        } else {
          recommendations.push(
            `WARNING: ${tool.toolName} success rate is ${tool.successRate.toFixed(1)}%. Monitor closely.`
          );
        }
      });
    }

    // Check for recent error patterns
    if (recentErrors.length > 5) {
      recommendations.push(
        `High error rate detected (${recentErrors.length} recent failures). Review error logs for patterns.`
      );
    }

    // Check for slow tools
    const slowTools = metrics.filter((m) => m.averageExecutionTimeMs > 5000);
    if (slowTools.length > 0) {
      slowTools.forEach((tool) => {
        recommendations.push(
          `${tool.toolName} has high average execution time (${tool.averageExecutionTimeMs.toFixed(0)}ms). Consider optimization.`
        );
      });
    }

    // All healthy
    if (recommendations.length === 0) {
      recommendations.push('All MCP tools operating normally. No action required.');
    }

    return recommendations;
  }
}

// Export singleton instance
export const mcpMonitoring = new MCPMonitoringService();

/**
 * Usage Example:
 *
 * // Initialize monitoring
 * mcpMonitoring.initializeToolMonitoring('exa_web_search_exa');
 *
 * // Record execution
 * try {
 *   const startTime = Date.now();
 *   const result = await executeExaSearch(input);
 *   const duration = Date.now() - startTime;
 *   mcpMonitoring.recordSuccess('exa_web_search_exa', duration, 'Returned 5 results');
 * } catch (error) {
 *   const duration = Date.now() - startTime;
 *   mcpMonitoring.recordFailure('exa_web_search_exa', duration, error.message);
 * }
 *
 * // Get health status
 * const health = mcpMonitoring.getHealthStatus();
 * console.log(health);
 *
 * // Start periodic health checks
 * mcpMonitoring.startHealthChecks(60000);
 */
