import { Request, Response } from 'express';
declare const router: import("express-serve-static-core").Router;
/**
 * POST /api/webhooks/stripe
 * Handle Stripe webhook events
 */
export declare function handleStripeWebhook(req: Request, res: Response): Promise<void>;
export default router;
//# sourceMappingURL=webhook.routes.d.ts.map