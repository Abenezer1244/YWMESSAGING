import { Request, Response } from 'express';
/**
 * GET /api/billing/usage
 * Get current usage for the church
 */
export declare function getUsageHandler(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
/**
 * GET /api/billing/plan
 * Get current plan and limits
 */
export declare function getPlanHandler(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
/**
 * GET /api/billing/trial
 * Get trial status
 */
export declare function getTrialHandler(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
/**
 * POST /api/billing/subscribe
 * Subscribe to a plan
 */
export declare function subscribeHandler(req: Request, res: Response): Promise<void>;
/**
 * PUT /api/billing/upgrade
 * Upgrade/downgrade plan
 */
export declare function upgradeHandler(req: Request, res: Response): Promise<void>;
/**
 * DELETE /api/billing/cancel
 * Cancel subscription
 */
export declare function cancelHandler(req: Request, res: Response): Promise<void>;
/**
 * POST /api/billing/payment-intent
 * Create payment intent
 */
export declare function createPaymentIntentHandler(req: Request, res: Response): Promise<void>;
/**
 * GET /api/billing/sms-pricing
 * Get current SMS pricing for the church
 */
export declare function getSMSPricing(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
/**
 * GET /api/billing/sms-usage
 * Get SMS usage and costs for the church (30-day default)
 */
export declare function getSMSUsage(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
/**
 * POST /api/billing/calculate-batch
 * Calculate cost for a batch of messages
 */
export declare function calculateBatchCost(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=billing.controller.d.ts.map