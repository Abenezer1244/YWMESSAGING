/**
 * Cache Monitoring Routes
 * Exposes cache performance metrics for monitoring and debugging
 * Admin only - requires authentication
 */

import { Router, Request, Response } from 'express';
import { cacheMetrics } from '../services/cache.service.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = Router();

/**
 * GET /api/admin/cache/metrics
 * Get current cache performance metrics
 * Response: {
 *   hits: number,
 *   misses: number,
 *   errors: number,
 *   hitRate: number (percentage),
 *   status: 'excellent' | 'good' | 'warning' | 'poor'
 * }
 */
router.get('/metrics', authMiddleware, (req: Request, res: Response) => {
  try {
    const hitRate = cacheMetrics.getHitRate();

    let status: 'excellent' | 'good' | 'warning' | 'poor' = 'good';
    if (hitRate >= 80) {
      status = 'excellent';
    } else if (hitRate >= 60) {
      status = 'good';
    } else if (hitRate >= 40) {
      status = 'warning';
    } else {
      status = 'poor';
    }

    return res.json({
      hits: cacheMetrics.hits,
      misses: cacheMetrics.misses,
      errors: cacheMetrics.errors,
      hitRate,
      totalOperations: cacheMetrics.hits + cacheMetrics.misses,
      status,
      recommendation:
        status === 'excellent'
          ? 'Cache performance is excellent'
          : status === 'good'
          ? 'Cache performance is good'
          : status === 'warning'
          ? 'Consider reviewing cache TTLs and key distribution'
          : 'Cache performance needs improvement - check Redis connectivity',
    });
  } catch (error) {
    console.error('Error fetching cache metrics:', error);
    res.status(500).json({ error: 'Failed to fetch cache metrics' });
  }
});

/**
 * POST /api/admin/cache/reset
 * Reset cache metrics (useful for period analysis)
 * Admin only
 */
router.post('/reset', authMiddleware, (req: Request, res: Response) => {
  try {
    const before = {
      hits: cacheMetrics.hits,
      misses: cacheMetrics.misses,
      errors: cacheMetrics.errors,
    };

    cacheMetrics.reset();

    return res.json({
      message: 'Cache metrics reset successfully',
      before,
      after: {
        hits: 0,
        misses: 0,
        errors: 0,
      },
    });
  } catch (error) {
    console.error('Error resetting cache metrics:', error);
    res.status(500).json({ error: 'Failed to reset cache metrics' });
  }
});

/**
 * GET /api/admin/cache/health
 * Check cache service health
 */
router.get('/health', authMiddleware, (req: Request, res: Response) => {
  try {
    const hitRate = cacheMetrics.getHitRate();
    const totalOps = cacheMetrics.hits + cacheMetrics.misses;

    return res.json({
      status: 'operational',
      metrics: {
        hitRate,
        totalOperations: totalOps,
        hitCount: cacheMetrics.hits,
        missCount: cacheMetrics.misses,
        errorCount: cacheMetrics.errors,
      },
      health:
        hitRate >= 70
          ? 'healthy'
          : hitRate >= 50
          ? 'degraded'
          : 'unhealthy',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error checking cache health:', error);
    res.status(500).json({ error: 'Failed to check cache health' });
  }
});

export default router;
