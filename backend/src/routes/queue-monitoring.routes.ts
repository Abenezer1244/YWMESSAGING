/**
 * Queue Monitoring Routes
 * ✅ PHASE 1: Exposes queue performance metrics for monitoring and debugging
 * Admin only - requires authentication
 */

import { Router, Request, Response } from 'express';
import { smsQueue, mmsQueue, mailQueue } from '../jobs/queue.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = Router();

/**
 * GET /api/admin/queue/metrics
 * Get current queue performance metrics
 * Response: {
 *   sms: { waiting, active, completed, failed, delayed },
 *   mms: { waiting, active, completed, failed, delayed },
 *   mail: { waiting, active, completed, failed, delayed }
 * }
 */
router.get('/metrics', authMiddleware, async (req: Request, res: Response) => {
  try {
    // If queues are disabled, return empty metrics
    if (!smsQueue) {
      return res.json({
        message: 'Queues are disabled. Set ENABLE_QUEUES=true to enable.',
        sms: { waiting: 0, active: 0, completed: 0, failed: 0, delayed: 0 },
        mms: { waiting: 0, active: 0, completed: 0, failed: 0, delayed: 0 },
        mail: { waiting: 0, active: 0, completed: 0, failed: 0, delayed: 0 },
      });
    }

    // Get metrics from each queue
    const [smsMetrics, mmsMetrics, mailMetrics] = await Promise.all([
      smsQueue.getJobCounts(),
      mmsQueue ? mmsQueue.getJobCounts() : Promise.resolve({ waiting: 0, active: 0, completed: 0, failed: 0, delayed: 0 }),
      mailQueue ? mailQueue.getJobCounts() : Promise.resolve({ waiting: 0, active: 0, completed: 0, failed: 0, delayed: 0 }),
    ]);

    const totalJobs = (smsMetrics.waiting || 0) + (smsMetrics.active || 0) +
                     (mmsMetrics?.waiting || 0) + (mmsMetrics?.active || 0) +
                     (mailMetrics?.waiting || 0) + (mailMetrics?.active || 0);

    return res.json({
      status: 'operational',
      queuesEnabled: true,
      sms: smsMetrics || { waiting: 0, active: 0, completed: 0, failed: 0, delayed: 0 },
      mms: mmsMetrics || { waiting: 0, active: 0, completed: 0, failed: 0, delayed: 0 },
      mail: mailMetrics || { waiting: 0, active: 0, completed: 0, failed: 0, delayed: 0 },
      totalJobs,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching queue metrics:', error);
    res.status(500).json({ error: 'Failed to fetch queue metrics' });
  }
});

/**
 * GET /api/admin/queue/health
 * Check queue service health
 */
router.get('/health', authMiddleware, async (req: Request, res: Response) => {
  try {
    if (!smsQueue) {
      return res.json({
        status: 'disabled',
        message: 'Queues are disabled. Set ENABLE_QUEUES=true to enable.',
        health: 'offline',
      });
    }

    const smsMetrics = await smsQueue.getJobCounts();
    const failedCount = (smsMetrics.failed || 0);
    const activeCount = (smsMetrics.active || 0);

    // Determine health status based on failed jobs and activity
    let health = 'healthy';
    if (failedCount > 100) {
      health = 'unhealthy';
    } else if (failedCount > 50 || activeCount > 1000) {
      health = 'degraded';
    }

    return res.json({
      status: 'operational',
      queuesEnabled: true,
      health,
      metrics: {
        smsWaiting: smsMetrics.waiting,
        smsActive: smsMetrics.active,
        smsFailed: smsMetrics.failed,
      },
      recommendation:
        health === 'healthy'
          ? 'Queue health is good'
          : health === 'degraded'
          ? 'Consider checking failed jobs and queue backlog'
          : 'Critical: Multiple queue failures detected - investigate immediately',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error checking queue health:', error);
    res.status(500).json({ error: 'Failed to check queue health' });
  }
});

/**
 * GET /api/admin/queue/failed
 * Get recently failed queue jobs (last 50)
 */
router.get('/failed', authMiddleware, async (req: Request, res: Response) => {
  try {
    if (!smsQueue) {
      return res.json({
        queuesEnabled: false,
        failed: [],
        message: 'Queues are disabled',
      });
    }

    // Get failed jobs from SMS queue
    const failedJobs = await smsQueue.getFailed(0, 49); // Last 50

    const jobs = failedJobs.map((job: any) => ({
      id: job.id,
      data: {
        phone: job.data.phone,
        churchId: job.data.churchId,
        recipientId: job.data.recipientId,
      },
      failedReason: job.failedReason,
      attemptsMade: job.attemptsMade,
      timestamp: job.finishedOn,
    }));

    return res.json({
      queuesEnabled: true,
      failedCount: jobs.length,
      jobs,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching failed jobs:', error);
    res.status(500).json({ error: 'Failed to fetch failed jobs' });
  }
});

/**
 * POST /api/admin/queue/retry-failed
 * Retry all failed SMS jobs
 * Admin only
 */
router.post('/retry-failed', authMiddleware, async (req: Request, res: Response) => {
  try {
    if (!smsQueue) {
      return res.status(400).json({
        queuesEnabled: false,
        message: 'Queues are disabled',
      });
    }

    const failedJobs = await smsQueue.getFailed(0, -1); // Get all failed jobs
    let retried = 0;

    for (const job of failedJobs) {
      try {
        await job.retry(); // Retry the job
        retried++;
      } catch (error) {
        console.error(`Failed to retry job ${job.id}:`, error);
      }
    }

    return res.json({
      message: `Retried ${retried} of ${failedJobs.length} failed jobs`,
      retried,
      total: failedJobs.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error retrying failed jobs:', error);
    res.status(500).json({ error: 'Failed to retry jobs' });
  }
});

/**
 * POST /api/admin/queue/clear-failed
 * Clear all failed jobs from queue
 * Admin only
 */
router.post('/clear-failed', authMiddleware, async (req: Request, res: Response) => {
  try {
    if (!smsQueue) {
      return res.status(400).json({
        queuesEnabled: false,
        message: 'Queues are disabled',
      });
    }

    const failedJobs = await smsQueue.getFailed(0, -1);
    let cleared = 0;

    for (const job of failedJobs) {
      try {
        await job.remove();
        cleared++;
      } catch (error) {
        console.error(`Failed to remove job ${job.id}:`, error);
      }
    }

    return res.json({
      message: `Cleared ${cleared} failed jobs`,
      cleared,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error clearing failed jobs:', error);
    res.status(500).json({ error: 'Failed to clear jobs' });
  }
});

export default router;
