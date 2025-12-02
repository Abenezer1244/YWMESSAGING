/**
 * Health Check Endpoint
 * Used by Render for load balancer health checks and monitoring
 * Response time should be < 100ms
 *
 * Endpoint: GET /health
 * Response: JSON with service status
 */

import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import * as redis from 'redis';
import { validateTelnyxApiKey } from '../services/telnyx.service.js';

const router = Router();

/**
 * Quick health check (< 100ms)
 * Used by load balancer for rapid health verification
 * Minimal checks to keep response time low
 */
router.get('/health', async (req: Request, res: Response) => {
  const startTime = Date.now();
  let databaseOk = false;
  let redisOk = false;
  let statusCode = 200;

  try {
    // Quick database check (ping)
    try {
      await prisma.$queryRaw`SELECT 1`;
      databaseOk = true;
    } catch (error) {
      databaseOk = false;
      statusCode = 503;
    }

    // Quick Redis check (if available)
    try {
      const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
      const client = redis.createClient({ url: redisUrl });
      await client.connect();
      await client.ping();
      await client.quit();
      redisOk = true;
    } catch (error) {
      // Redis optional - don't fail health check if down
      // Queue system will fall back to sync messaging
      redisOk = false;
    }

    const responseTime = Date.now() - startTime;

    res.status(statusCode).json({
      status: statusCode === 200 ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      responseTime: `${responseTime}ms`,
      checks: {
        database: databaseOk ? 'ok' : 'down',
        redis: redisOk ? 'ok' : 'unavailable',
        queues: process.env.ENABLE_QUEUES === 'true' ? 'enabled' : 'disabled',
      },
      environment: process.env.NODE_ENV || 'development',
      uptime: `${Math.floor(process.uptime())}s`,
    });
  } catch (error) {
    console.error('Health check error:', error);

    const responseTime = Date.now() - startTime;

    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      responseTime: `${responseTime}ms`,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * Detailed health check (for monitoring/debugging)
 * Performs comprehensive checks
 * Response time may be 100-500ms
 *
 * Endpoint: GET /health/detailed
 * Response: JSON with detailed diagnostics
 */
router.get('/health/detailed', async (req: Request, res: Response) => {
  const startTime = Date.now();

  try {
    // Database checks
    let databaseStatus = 'unknown';
    let dbConnectionTime = 0;

    try {
      const dbStart = Date.now();
      await prisma.$queryRaw`SELECT 1`;
      dbConnectionTime = Date.now() - dbStart;
      databaseStatus = 'healthy';
    } catch (error) {
      databaseStatus = 'unhealthy';
    }

    // Redis checks
    let redisStatus = 'unknown';
    let redisConnectionTime = 0;

    try {
      const redisStart = Date.now();
      const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
      const client = redis.createClient({ url: redisUrl });

      await client.connect();

      // Test SET/GET
      await client.set('health-check', new Date().toISOString());
      const value = await client.get('health-check');
      await client.del('health-check');
      await client.quit();

      redisConnectionTime = Date.now() - redisStart;
      redisStatus = value ? 'healthy' : 'unhealthy';
    } catch (error) {
      redisStatus = 'unavailable';
    }

    // Get database stats
    let databaseStats: any = {};
    try {
      databaseStats = await prisma.$queryRaw`
        SELECT
          datname as database,
          numbackends as active_connections,
          pg_database_size(datname) as size_bytes
        FROM pg_stat_database
        WHERE datname = current_database()
      `;
    } catch (error) {
      databaseStats = { error: 'Could not fetch stats' };
    }

    // Telnyx API check
    let telnyxStatus = 'unknown';
    let telnyxConnectionTime = 0;
    try {
      const telnyxStart = Date.now();
      const isValid = await validateTelnyxApiKey();
      telnyxConnectionTime = Date.now() - telnyxStart;
      telnyxStatus = isValid ? 'healthy' : 'unhealthy';
    } catch (error) {
      telnyxStatus = 'unhealthy';
    }

    // Stripe API check (just verify env variable for now)
    let stripeStatus = 'unknown';
    const hasStripeKey = !!process.env.STRIPE_SECRET_KEY;
    stripeStatus = hasStripeKey ? 'configured' : 'unconfigured';

    const totalTime = Date.now() - startTime;
    const statusCode =
      databaseStatus === 'healthy' ? 200 : 503;

    res.status(statusCode).json({
      status: statusCode === 200 ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      totalResponseTime: `${totalTime}ms`,
      uptime: `${Math.floor(process.uptime())}s`,
      environment: {
        nodeEnv: process.env.NODE_ENV || 'development',
        queuesEnabled: process.env.ENABLE_QUEUES === 'true',
        appVersion: process.env.APP_VERSION || '1.0.0',
      },
      checks: {
        database: {
          status: databaseStatus,
          responseTime: `${dbConnectionTime}ms`,
          stats: databaseStats,
        },
        redis: {
          status: redisStatus,
          responseTime: `${redisConnectionTime}ms`,
          configured: !!process.env.REDIS_URL,
        },
        externalServices: {
          telnyx: {
            status: telnyxStatus,
            responseTime: `${telnyxConnectionTime}ms`,
            configured: !!process.env.TELNYX_API_KEY,
          },
          stripe: {
            status: stripeStatus,
            configured: hasStripeKey,
          },
        },
        process: {
          memory: {
            rss: `${Math.round(process.memoryUsage().rss / 1024 / 1024)}MB`,
            heapUsed: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`,
            heapTotal: `${Math.round(process.memoryUsage().heapTotal / 1024 / 1024)}MB`,
          },
          uptime: process.uptime(),
          pid: process.pid,
        },
      },
    });
  } catch (error) {
    console.error('Detailed health check error:', error);

    const totalTime = Date.now() - startTime;

    res.status(503).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      totalResponseTime: `${totalTime}ms`,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * Readiness check (used by Kubernetes-like orchestration)
 * Indicates if service is ready to receive traffic
 * GET /ready
 */
router.get('/ready', async (req: Request, res: Response) => {
  try {
    // Check critical services
    await prisma.$queryRaw`SELECT 1`;

    res.status(200).json({
      ready: true,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(503).json({
      ready: false,
      error: error instanceof Error ? error.message : 'Not ready',
    });
  }
});

/**
 * Liveness check (used by Kubernetes-like orchestration)
 * Indicates if service is alive (should restart if false)
 * GET /alive
 */
router.get('/alive', async (req: Request, res: Response) => {
  // Simple check - process is alive if we got here
  res.status(200).json({
    alive: true,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

export default router;
