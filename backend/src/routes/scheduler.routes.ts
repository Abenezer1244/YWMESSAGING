import express from 'express';
import {
  handleDLCApprovalCheck,
  getSchedulerStatus,
  manualTriggerDLCCheck,
  getMetrics,
} from '../controllers/scheduler.controller.js';

const router = express.Router();

/**
 * CloudWatch EventBridge Trigger
 * POST /api/scheduler/dlc-approval-check
 *
 * Called by AWS CloudWatch Events every 30 minutes
 * Requires: x-api-key header with INTERNAL_SCHEDULER_KEY
 */
router.post('/dlc-approval-check', handleDLCApprovalCheck);

/**
 * Manual trigger for testing
 * POST /api/scheduler/trigger
 *
 * Same as CloudWatch trigger, but can be called manually
 * Requires: x-api-key header with INTERNAL_SCHEDULER_KEY
 */
router.post('/trigger', manualTriggerDLCCheck);

/**
 * Get scheduler status and metrics
 * GET /api/scheduler/status
 *
 * Returns current scheduler health and metrics
 * Can be called by CloudWatch Alarms for health checks
 */
router.get('/status', getSchedulerStatus);

/**
 * Get metrics for CloudWatch Alarms
 * GET /api/scheduler/metrics
 *
 * Returns simple metrics CloudWatch can use for alarming:
 * - isHealthy (0 or 1)
 * - lastRunAge (seconds since last run)
 * - errorCount (0 or 1)
 */
router.get('/metrics', getMetrics);

export default router;
