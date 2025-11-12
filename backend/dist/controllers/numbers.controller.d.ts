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
 * GET /api/numbers/search
 * Search for available phone numbers
 * Query params: areaCode, state, contains, quantity
 */
export declare function searchNumbers(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
/**
 * POST /api/numbers/setup-payment-intent
 * Create a payment intent for phone number setup fee
 * Body: { phoneNumber }
 * SECURITY: Validates phone number format and user authorization
 */
export declare function setupPaymentIntent(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
/**
 * POST /api/numbers/confirm-payment
 * Confirm payment intent with Stripe payment method token
 * SECURITY: Payment method is created on frontend, never exposes card details to backend
 */
export declare function confirmPayment(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
/**
 * POST /api/numbers/purchase
 * Purchase a phone number for the church (after payment is confirmed)
 * Body: { phoneNumber, paymentIntentId, connectionId? }
 * SECURITY: Verifies payment before allowing purchase
 */
export declare function purchaseNumber(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
/**
 * GET /api/numbers/current
 * Get the church's current phone number
 */
export declare function getCurrentNumber(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
/**
 * DELETE /api/numbers/current
 * Release/delete the church's phone number
 */
export declare function releaseCurrentNumber(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=numbers.controller.d.ts.map