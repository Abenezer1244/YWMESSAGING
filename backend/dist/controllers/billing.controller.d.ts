import { Request, Response } from 'express';
import { AccessTokenPayload } from '../utils/jwt.utils.js';
declare global {
    namespace Express {
        interface Request {
            user?: AccessTokenPayload;
        }
    }
}
/**
 * GET /api/billing/usage
 * Get current usage for the church
 */
export declare function getUsageHandler(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
/**
 * GET /api/billing/plan
 * Get current plan, limits, and remaining capacity
 */
export declare function getPlanHandler(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
/**
 * GET /api/billing/trial
 * Get trial status and days remaining
 */
export declare function getTrialHandler(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
/**
 * POST /api/billing/subscribe
 * Subscribe to a plan with payment method
 * Body: { planName: 'starter' | 'growth' | 'pro', paymentMethodId?: string }
 */
export declare function subscribeHandler(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
/**
 * PUT /api/billing/upgrade
 * Upgrade or downgrade to a different plan
 * Body: { newPlan: 'starter' | 'growth' | 'pro' }
 */
export declare function upgradeHandler(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
/**
 * DELETE /api/billing/cancel
 * Cancel subscription
 */
export declare function cancelHandler(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
/**
 * POST /api/billing/payment-intent
 * Create a Stripe payment intent for subscription payment
 * Body: { planName: 'starter' | 'growth' | 'pro' }
 */
export declare function createPaymentIntentHandler(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=billing.controller.d.ts.map