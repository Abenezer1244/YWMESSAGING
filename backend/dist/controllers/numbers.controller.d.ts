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
 * POST /api/numbers/purchase
 * Purchase a phone number for the church
 * Body: { phoneNumber, connectionId? }
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