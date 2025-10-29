import { Request, Response } from 'express';
declare const router: import("express-serve-static-core").Router;
/**
 * POST /api/webhooks/stripe
 * Handle Stripe webhook events
 * SECURITY: Validates webhook signature using Stripe signing secret
 */
export declare function handleStripeWebhook(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
export default router;
//# sourceMappingURL=webhook.routes.d.ts.map