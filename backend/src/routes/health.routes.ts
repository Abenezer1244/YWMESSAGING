/**
 * Health Check Routes
 * ✅ PHASE 2: Used by load balancers and monitoring systems
 * Simple /health endpoint for fast load balancer checks
 * Detailed /health/detailed for comprehensive health monitoring
 */

import { Router, Request, Response } from 'express';
import { checkDatabaseHealth } from '../lib/prisma.js';
import { redisClient } from '../config/redis.config.js';
import { createCustomSpan, createDatabaseSpan } from '../utils/apm-instrumentation.js';

const router = Router();

/**
 * GET /health
 * Simple health check - used by load balancers
 * Returns immediately with basic status
 * Response: { status: 'ok' }
 */
router.get('/health', (req: Request, res: Response) => {
  return res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

/**
 * GET /health/detailed
 * Comprehensive health check - used for monitoring dashboards
 * Checks database, Redis, and application health
 * Response: { status, database, redis, services, timestamp }
 */
router.get('/health/detailed', async (req: Request, res: Response) => {
  try {
    // Check database health
    const dbHealthy = await checkDatabaseHealth();

    // Check Redis health
    let redisHealthy = false;
    try {
      if (redisClient.isOpen) {
        await redisClient.ping();
        redisHealthy = true;
      }
    } catch (error) {
      console.warn('Redis health check failed:', error);
      redisHealthy = false;
    }

    // Determine overall status
    const allHealthy = dbHealthy && redisHealthy;
    const status = allHealthy ? 'healthy' : 'degraded';

    // If degraded or unhealthy, return 503 so load balancer can mark as down
    const statusCode = allHealthy ? 200 : 503;

    return res.status(statusCode).json({
      status,
      checks: {
        database: dbHealthy ? 'ok' : 'failed',
        redis: redisHealthy ? 'ok' : 'failed',
        application: 'ok',
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Health check failed:', error);
    return res.status(503).json({
      status: 'unhealthy',
      error: (error as Error).message,
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * GET /health/ready
 * Readiness check - returns 200 only when app is fully initialized
 * Used by orchestration platforms (Kubernetes, etc)
 */
router.get('/health/ready', async (req: Request, res: Response) => {
  try {
    // Check database connectivity
    const dbReady = await checkDatabaseHealth();

    // Check Redis connectivity
    const redisReady = redisClient.isOpen;

    if (!dbReady || !redisReady) {
      return res.status(503).json({
        ready: false,
        database: dbReady,
        redis: redisReady,
      });
    }

    return res.json({
      ready: true,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return res.status(503).json({
      ready: false,
      error: (error as Error).message,
    });
  }
});

/**
 * GET /health/live
 * Liveness check - returns 200 if process is alive
 * Does NOT check dependencies (fast response)
 * Used by process monitors and orchestration
 */
router.get('/health/live', (req: Request, res: Response) => {
  return res.json({
    alive: true,
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

/**
 * GET /health/apm-diagnostic
 * APM diagnostic endpoint - exercises tracing for verification
 * Makes test spans and checks if Datadog APM is initialized
 */
router.get('/health/apm-diagnostic', async (req: Request, res: Response) => {
  return createCustomSpan(
    'health.apm_diagnostic',
    async () => {
      try {
        const results: any = {
          timestamp: new Date().toISOString(),
          spans: [],
        };

        // Test custom span
        results.spans.push({
          name: 'custom_test_span',
          status: 'created',
        });

        // Test database span
        try {
          const dbHealthy = await createDatabaseSpan(
            'SELECT',
            'test',
            async () => {
              return await checkDatabaseHealth();
            },
            { test: 'apm_diagnostic' }
          );
          results.spans.push({
            name: 'database_test_span',
            status: dbHealthy ? 'success' : 'failed',
          });
        } catch (error) {
          results.spans.push({
            name: 'database_test_span',
            status: 'error',
            error: (error as Error).message,
          });
        }

        results.message = 'APM diagnostic complete - traces should appear in Datadog';
        results.next_step = 'Check Datadog dashboard: APM > Services > koinonia-sms-backend';

        return res.json({
          apm_diagnostic: results,
          status: 'ok',
        });
      } catch (error) {
        console.error('APM diagnostic failed:', error);
        return res.status(500).json({
          error: (error as Error).message,
          status: 'failed',
        });
      }
    },
    { type: 'diagnostic' }
  );
});

export default router;
