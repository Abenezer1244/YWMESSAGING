import { Request, Response, NextFunction } from 'express';
import { AccessTokenPayload } from '../utils/jwt.utils.js';
declare global {
    namespace Express {
        interface Request {
            user?: AccessTokenPayload;
        }
    }
}
/**
 * Middleware to check if church can create a new branch
 */
export declare function checkBranchLimit(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
/**
 * Middleware to check if church can add a new member
 */
export declare function checkMemberLimit(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
/**
 * Middleware to check if church can send a message
 */
export declare function checkMessageLimit(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
/**
 * Middleware to check if church can add a co-admin
 */
export declare function checkCoAdminLimit(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
/**
 * Middleware to require active subscription
 * (Only applies if trial is over)
 */
export declare function requireActiveSubscription(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=planLimits.middleware.d.ts.map