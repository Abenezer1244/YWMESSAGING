import { Request, Response } from 'express';
/**
 * CloudWatch EventBridge Trigger Handler
 * Called by AWS CloudWatch Events every 30 minutes
 *
 * Validates the request came from AWS CloudWatch using API key
 * Runs the 10DLC approval check
 */
export declare function handleDLCApprovalCheck(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
/**
 * Get scheduler status and metrics
 * Can be called by CloudWatch alarms to monitor health
 *
 * GET /admin/scheduler/status
 */
export declare function getSchedulerStatus(req: Request, res: Response): Promise<void>;
/**
 * Manual trigger for testing (requires same API key)
 *
 * POST /admin/scheduler/trigger
 * Headers: { 'x-api-key': 'your-secret-key' }
 */
export declare function manualTriggerDLCCheck(req: Request, res: Response): Promise<void>;
/**
 * Get metrics endpoint for CloudWatch Alarms
 * CloudWatch can query this to check scheduler health
 *
 * GET /admin/scheduler/metrics
 */
export declare function getMetrics(req: Request, res: Response): Promise<void>;
//# sourceMappingURL=scheduler.controller.d.ts.map