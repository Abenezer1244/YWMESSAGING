/**
 * Planning Center Controller
 * Handles OAuth2 connection, member syncing, and integration management
 */
import { Request, Response } from 'express';
/**
 * GET /api/integrations/planning-center/status
 * Get Planning Center integration status for the church
 */
export declare function getPlanningCenterStatus(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
/**
 * POST /api/integrations/planning-center/connect
 * Connect church to Planning Center using OAuth2 token
 */
export declare function connectPlanningCenter(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
/**
 * POST /api/integrations/planning-center/sync-members
 * Sync members from Planning Center
 */
export declare function syncPlanningCenterMembers(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
/**
 * DELETE /api/integrations/planning-center
 * Disconnect Planning Center
 */
export declare function disconnectPlanningCenter(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
/**
 * POST /api/integrations/planning-center/validate
 * Validate Planning Center connection
 */
export declare function validatePlanningCenterConnection(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=planning-center.controller.d.ts.map