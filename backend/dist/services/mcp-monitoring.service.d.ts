/**
 * MCP Tool Monitoring Service
 *
 * Provides real-time monitoring, metrics, and health checks for MCP (Model Context Provider)
 * tool execution. Tracks success/failure rates, execution times, and provides detailed
 * diagnostics for agent analysis.
 *
 * Enterprise-grade monitoring for production MCP operations.
 */
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
declare class MCPMonitoringService {
    private metricsMap;
    private executionLog;
    private readonly maxLogEntries;
    private healthCheckInterval;
    /**
     * Initialize monitoring for a specific MCP tool
     */
    initializeToolMonitoring(toolName: string): void;
    /**
     * Record successful MCP tool execution
     */
    recordSuccess(toolName: string, executionTimeMs: number, resultSummary?: string): void;
    /**
     * Record failed MCP tool execution
     */
    recordFailure(toolName: string, executionTimeMs: number, error: string): void;
    /**
     * Record skipped MCP tool execution (e.g., Claude MCP handled natively)
     */
    recordSkipped(toolName: string, reason: string): void;
    /**
     * Get metrics for a specific tool
     */
    getToolMetrics(toolName: string): MCPToolMetrics | null;
    /**
     * Get all MCP tool metrics
     */
    getAllMetrics(): MCPToolMetrics[];
    /**
     * Get health status of entire MCP system
     */
    getHealthStatus(): MCPHealthStatus;
    /**
     * Get execution history for a specific tool
     */
    getToolHistory(toolName: string, limit?: number): MCPExecutionLog[];
    /**
     * Clear all metrics and logs (for testing)
     */
    reset(): void;
    /**
     * Start periodic health checks
     */
    startHealthChecks(intervalMs?: number): void;
    /**
     * Stop periodic health checks
     */
    stopHealthChecks(): void;
    /**
     * Private: Log execution to history
     */
    private logExecution;
    /**
     * Private: Generate recommendations based on metrics
     */
    private generateRecommendations;
}
export declare const mcpMonitoring: MCPMonitoringService;
export {};
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
//# sourceMappingURL=mcp-monitoring.service.d.ts.map