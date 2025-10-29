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
 * GET /api/admin/profile
 * Get church profile
 */
export declare function getProfileHandler(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
/**
 * PUT /api/admin/profile
 * Update church profile
 */
export declare function updateProfileHandler(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
/**
 * GET /api/admin/co-admins
 * Get all co-admins
 */
export declare function getCoAdminsHandler(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
/**
 * DELETE /api/admin/co-admins/:adminId
 * Remove a co-admin
 */
export declare function removeCoAdminHandler(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
/**
 * GET /api/admin/activity-logs
 * Get activity logs
 * Query params: ?page=1&limit=50
 */
export declare function getActivityLogsHandler(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
/**
 * POST /api/admin/activity-log
 * Log an activity (internal use)
 */
export declare function logActivityHandler(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=admin.controller.d.ts.map