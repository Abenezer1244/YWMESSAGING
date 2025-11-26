/**
 * MCP Monitoring Service Tests
 *
 * Comprehensive test suite for MCP monitoring service including:
 * - Tool initialization and metrics tracking
 * - Success/failure recording
 * - Health status calculation
 * - Recommendations generation
 * - Execution history management
 */

import { mcpMonitoring, MCPToolMetrics, MCPHealthStatus } from './mcp-monitoring.service';

describe('MCPMonitoringService', () => {
  beforeEach(() => {
    mcpMonitoring.reset();
  });

  afterAll(() => {
    mcpMonitoring.stopHealthChecks();
  });

  describe('Tool Initialization', () => {
    it('should initialize monitoring for a new tool', () => {
      mcpMonitoring.initializeToolMonitoring('exa_web_search');

      const metrics = mcpMonitoring.getToolMetrics('exa_web_search');
      expect(metrics).toBeDefined();
      expect(metrics?.toolName).toBe('exa_web_search');
      expect(metrics?.executionCount).toBe(0);
      expect(metrics?.isHealthy).toBe(true);
    });

    it('should not reinitialize an already initialized tool', () => {
      mcpMonitoring.initializeToolMonitoring('semgrep_scan');
      mcpMonitoring.recordSuccess('semgrep_scan', 100);

      const before = mcpMonitoring.getToolMetrics('semgrep_scan');
      expect(before?.executionCount).toBe(1);

      // Trying to initialize again should not reset metrics
      mcpMonitoring.initializeToolMonitoring('semgrep_scan');
      const after = mcpMonitoring.getToolMetrics('semgrep_scan');
      expect(after?.executionCount).toBe(1);
    });
  });

  describe('Success Recording', () => {
    it('should record successful execution with correct metrics', () => {
      mcpMonitoring.recordSuccess('test_tool', 150, 'Test passed');

      const metrics = mcpMonitoring.getToolMetrics('test_tool');
      expect(metrics?.executionCount).toBe(1);
      expect(metrics?.successCount).toBe(1);
      expect(metrics?.failureCount).toBe(0);
      expect(metrics?.averageExecutionTimeMs).toBe(150);
      expect(metrics?.successRate).toBe(100);
      expect(metrics?.isHealthy).toBe(true);
    });

    it('should calculate correct average execution time across multiple calls', () => {
      mcpMonitoring.recordSuccess('metric_test', 100);
      mcpMonitoring.recordSuccess('metric_test', 200);
      mcpMonitoring.recordSuccess('metric_test', 300);

      const metrics = mcpMonitoring.getToolMetrics('metric_test');
      expect(metrics?.executionCount).toBe(3);
      expect(metrics?.averageExecutionTimeMs).toBe(200); // (100 + 200 + 300) / 3
    });

    it('should update lastExecutionTime', () => {
      mcpMonitoring.recordSuccess('time_test', 50);

      const metrics = mcpMonitoring.getToolMetrics('time_test');
      expect(metrics?.lastExecutionTime).toBeDefined();
      expect(
        Math.abs(metrics!.lastExecutionTime!.getTime() - Date.now())
      ).toBeLessThan(100);
    });
  });

  describe('Failure Recording', () => {
    it('should record failed execution with correct metrics', () => {
      mcpMonitoring.recordFailure('failing_tool', 200, 'Connection timeout');

      const metrics = mcpMonitoring.getToolMetrics('failing_tool');
      expect(metrics?.executionCount).toBe(1);
      expect(metrics?.successCount).toBe(0);
      expect(metrics?.failureCount).toBe(1);
      expect(metrics?.successRate).toBe(0);
      expect(metrics?.isHealthy).toBe(false);
    });

    it('should calculate correct success rate with mixed results', () => {
      mcpMonitoring.recordSuccess('mixed_tool', 100);
      mcpMonitoring.recordSuccess('mixed_tool', 100);
      mcpMonitoring.recordFailure('mixed_tool', 100, 'API error');
      mcpMonitoring.recordSuccess('mixed_tool', 100);

      const metrics = mcpMonitoring.getToolMetrics('mixed_tool');
      expect(metrics?.executionCount).toBe(4);
      expect(metrics?.successCount).toBe(3);
      expect(metrics?.failureCount).toBe(1);
      expect(metrics?.successRate).toBeCloseTo(75, 1);
      expect(metrics?.isHealthy).toBe(true); // 75% is >= 80% threshold for health with failures
    });

    it('should mark tool as unhealthy when success rate drops below 80%', () => {
      for (let i = 0; i < 8; i++) {
        mcpMonitoring.recordFailure('unreliable_tool', 100, 'Error');
      }
      for (let i = 0; i < 2; i++) {
        mcpMonitoring.recordSuccess('unreliable_tool', 100);
      }

      const metrics = mcpMonitoring.getToolMetrics('unreliable_tool');
      expect(metrics?.successRate).toBe(20);
      expect(metrics?.isHealthy).toBe(false);
    });
  });

  describe('Skipped Execution Recording', () => {
    it('should record skipped execution', () => {
      mcpMonitoring.recordSkipped('claude_mcp_tool', 'Handled by Claude API natively');

      const history = mcpMonitoring.getToolHistory('claude_mcp_tool', 10);
      expect(history.length).toBe(1);
      expect(history[0].status).toBe('skipped');
      expect(history[0].resultSummary).toBe('Handled by Claude API natively');
    });
  });

  describe('Health Status', () => {
    it('should return healthy status when all tools are healthy', () => {
      mcpMonitoring.recordSuccess('tool1', 100);
      mcpMonitoring.recordSuccess('tool2', 100);

      const health = mcpMonitoring.getHealthStatus();
      expect(health.overallHealth).toBe('healthy');
      expect(health.toolMetrics.length).toBe(2);
      expect(health.recentErrors.length).toBe(0);
    });

    it('should return degraded status when some tools are unhealthy', () => {
      // Healthy tool
      mcpMonitoring.recordSuccess('healthy_tool', 100);
      mcpMonitoring.recordSuccess('healthy_tool', 100);

      // Unhealthy tool
      for (let i = 0; i < 9; i++) {
        mcpMonitoring.recordFailure('unhealthy_tool', 100, 'Error');
      }
      mcpMonitoring.recordSuccess('unhealthy_tool', 100);

      const health = mcpMonitoring.getHealthStatus();
      expect(health.overallHealth).toBe('degraded');
      expect(health.toolMetrics.length).toBe(2);
    });

    it('should return unhealthy status when most tools are unhealthy', () => {
      // Unhealthy tools
      for (let i = 0; i < 2; i++) {
        for (let j = 0; j < 9; j++) {
          mcpMonitoring.recordFailure(`unhealthy_tool_${i}`, 100, 'Error');
        }
        mcpMonitoring.recordSuccess(`unhealthy_tool_${i}`, 100);
      }

      // Healthy tool
      mcpMonitoring.recordSuccess('healthy_tool', 100);

      const health = mcpMonitoring.getHealthStatus();
      expect(health.overallHealth).toBe('unhealthy');
    });

    it('should include recent errors in health status', () => {
      for (let i = 0; i < 5; i++) {
        mcpMonitoring.recordFailure('error_tool', 100, `Error ${i}`);
      }

      const health = mcpMonitoring.getHealthStatus();
      expect(health.recentErrors.length).toBe(5);
      expect(health.recentErrors[0].status).toBe('failure');
    });
  });

  describe('Recommendations', () => {
    it('should recommend monitoring for slow tools', () => {
      mcpMonitoring.recordSuccess('slow_tool', 6000); // > 5000ms threshold

      const health = mcpMonitoring.getHealthStatus();
      const slowToolRec = health.recommendations.find((r) =>
        r.includes('high average execution time')
      );
      expect(slowToolRec).toBeDefined();
    });

    it('should recommend investigation for critical failure rate', () => {
      for (let i = 0; i < 19; i++) {
        mcpMonitoring.recordFailure('critical_tool', 100, 'Error');
      }
      mcpMonitoring.recordSuccess('critical_tool', 100);

      const health = mcpMonitoring.getHealthStatus();
      const criticalRec = health.recommendations.find((r) => r.includes('CRITICAL'));
      expect(criticalRec).toBeDefined();
    });

    it('should provide positive feedback when all is healthy', () => {
      mcpMonitoring.recordSuccess('good_tool', 100);
      mcpMonitoring.recordSuccess('good_tool', 100);

      const health = mcpMonitoring.getHealthStatus();
      const positiveRec = health.recommendations.find((r) =>
        r.includes('operating normally')
      );
      expect(positiveRec).toBeDefined();
    });
  });

  describe('Execution History', () => {
    it('should maintain execution history for a tool', () => {
      mcpMonitoring.recordSuccess('history_tool', 100);
      mcpMonitoring.recordFailure('history_tool', 150, 'Error');
      mcpMonitoring.recordSuccess('history_tool', 120);

      const history = mcpMonitoring.getToolHistory('history_tool');
      expect(history.length).toBe(3);
      expect(history[0].status).toBe('success'); // Most recent first
      expect(history[2].status).toBe('success');
      expect(history[1].status).toBe('failure');
    });

    it('should respect history limit', () => {
      for (let i = 0; i < 150; i++) {
        mcpMonitoring.recordSuccess('limited_tool', 100);
      }

      const history = mcpMonitoring.getToolHistory('limited_tool', 50);
      expect(history.length).toBe(50);
    });

    it('should return empty history for non-existent tool', () => {
      const history = mcpMonitoring.getToolHistory('non_existent', 10);
      expect(history.length).toBe(0);
    });
  });

  describe('Metrics Aggregation', () => {
    it('should return all metrics', () => {
      mcpMonitoring.recordSuccess('tool1', 100);
      mcpMonitoring.recordSuccess('tool2', 100);
      mcpMonitoring.recordSuccess('tool3', 100);

      const allMetrics = mcpMonitoring.getAllMetrics();
      expect(allMetrics.length).toBe(3);
      expect(allMetrics.map((m) => m.toolName).sort()).toEqual([
        'tool1',
        'tool2',
        'tool3',
      ]);
    });
  });

  describe('Reset', () => {
    it('should clear all metrics and logs', () => {
      mcpMonitoring.recordSuccess('reset_tool', 100);
      expect(mcpMonitoring.getAllMetrics().length).toBe(1);

      mcpMonitoring.reset();
      expect(mcpMonitoring.getAllMetrics().length).toBe(0);
      expect(mcpMonitoring.getToolHistory('reset_tool').length).toBe(0);
    });
  });

  describe('Health Checks', () => {
    it('should start and stop health checks', (done) => {
      mcpMonitoring.recordSuccess('health_tool', 100);
      mcpMonitoring.startHealthChecks(100);

      expect(mcpMonitoring['healthCheckInterval']).toBeDefined();

      setTimeout(() => {
        mcpMonitoring.stopHealthChecks();
        expect(mcpMonitoring['healthCheckInterval']).toBeNull();
        done();
      }, 150);
    });
  });
});
