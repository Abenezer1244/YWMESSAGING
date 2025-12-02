/**
 * Database Query Monitoring and Slow Query Detection
 *
 * Monitors Prisma query execution times and logs slow queries for optimization.
 * Slow query threshold: 100ms (configurable)
 *
 * Features:
 * - Automatic query duration tracking
 * - Slow query detection and logging
 * - Query statistics collection
 * - Performance metrics aggregation
 * - Integration with logger for structured output
 */

import { PrismaClient } from '@prisma/client';
import { logger } from './logger.js';

interface QueryMetrics {
  totalQueries: number;
  slowQueries: number;
  averageDuration: number;
  maxDuration: number;
  minDuration: number;
  queryDurations: number[];
}

const metrics: QueryMetrics = {
  totalQueries: 0,
  slowQueries: 0,
  averageDuration: 0,
  maxDuration: 0,
  minDuration: Infinity,
  queryDurations: [],
};

const SLOW_QUERY_THRESHOLD_MS = process.env.SLOW_QUERY_THRESHOLD_MS
  ? parseInt(process.env.SLOW_QUERY_THRESHOLD_MS)
  : 100;

/**
 * Initialize query monitoring for Prisma client
 * Must be called immediately after creating PrismaClient instance
 *
 * Usage:
 * ```typescript
 * const prisma = new PrismaClient();
 * initializeQueryMonitoring(prisma);
 * ```
 */
export function initializeQueryMonitoring(prisma: PrismaClient) {
  // Hook into Prisma's query events
  prisma.$on('query', (event: any) => {
    const startTime = Date.now();

    // Note: 'query' event fires when query starts
    // We need to track the duration, so we'll use 'query' + custom timing
    // Actually, Prisma's query event doesn't give us duration directly
    // We'll need to use middleware instead

    logger.debug('Database query', {
      query: event.query.substring(0, 200), // Log first 200 chars
      params: event.params ? event.params.substring(0, 100) : 'none',
    });
  });

  // Use Prisma middleware for better duration tracking
  prisma.$use(async (params, next) => {
    const startTime = Date.now();
    const result = await next(params);
    const duration = Date.now() - startTime;

    // Update metrics
    metrics.totalQueries++;
    metrics.queryDurations.push(duration);
    metrics.averageDuration =
      metrics.queryDurations.reduce((a, b) => a + b, 0) / metrics.queryDurations.length;
    metrics.maxDuration = Math.max(metrics.maxDuration, duration);
    metrics.minDuration = Math.min(metrics.minDuration, duration);

    // Detect slow queries
    if (duration > SLOW_QUERY_THRESHOLD_MS) {
      metrics.slowQueries++;

      logger.warn(
        `Slow query detected (${duration}ms)`,
        {
          operation: params.action,
          model: params.model,
          duration,
          threshold: SLOW_QUERY_THRESHOLD_MS,
        }
      );
    }

    // Log very slow queries with more detail
    if (duration > SLOW_QUERY_THRESHOLD_MS * 2) {
      logger.error(
        `Very slow query detected (${duration}ms)`,
        new Error(`Query exceeded double threshold: ${duration}ms > ${SLOW_QUERY_THRESHOLD_MS * 2}ms`),
        {
          operation: params.action,
          model: params.model,
          duration,
        }
      );
    }

    return result;
  });
}

/**
 * Get current query metrics
 */
export function getQueryMetrics(): QueryMetrics {
  return {
    ...metrics,
  };
}

/**
 * Reset query metrics
 */
export function resetQueryMetrics(): void {
  metrics.totalQueries = 0;
  metrics.slowQueries = 0;
  metrics.averageDuration = 0;
  metrics.maxDuration = 0;
  metrics.minDuration = Infinity;
  metrics.queryDurations = [];
}

/**
 * Get slow query percentage
 */
export function getSlowQueryPercentage(): number {
  if (metrics.totalQueries === 0) {
    return 0;
  }
  return (metrics.slowQueries / metrics.totalQueries) * 100;
}

/**
 * Get query performance percentiles
 */
export function getQueryPercentiles(): {
  p50: number;
  p90: number;
  p95: number;
  p99: number;
} {
  const sorted = [...metrics.queryDurations].sort((a, b) => a - b);
  const len = sorted.length;

  const getPercentile = (p: number) => {
    const index = Math.ceil((p / 100) * len) - 1;
    return sorted[Math.max(0, Math.min(index, len - 1))];
  };

  return {
    p50: getPercentile(50),
    p90: getPercentile(90),
    p95: getPercentile(95),
    p99: getPercentile(99),
  };
}

/**
 * Get database health status
 * Returns 'healthy' if slow query percentage < 5%
 * Returns 'degraded' if 5-10%
 * Returns 'unhealthy' if > 10%
 */
export function getDatabaseHealth(): 'healthy' | 'degraded' | 'unhealthy' {
  const slowPercentage = getSlowQueryPercentage();
  if (slowPercentage < 5) return 'healthy';
  if (slowPercentage < 10) return 'degraded';
  return 'unhealthy';
}
