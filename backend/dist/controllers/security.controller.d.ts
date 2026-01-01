/**
 * ============================================================================
 * SECURITY MONITORING CONTROLLER
 * ============================================================================
 *
 * Admin endpoints for viewing security alerts and access statistics
 * - View recent security alerts
 * - View EIN access patterns
 * - Monitor user activity
 * - Export audit logs
 */
import { Request, Response } from 'express';
/**
 * GET /api/security/alerts
 * Get recent security alerts
 */
export declare function getAlertsHandler(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
/**
 * GET /api/security/stats/:userId
 * Get access statistics for a specific user
 */
export declare function getUserStatsHandler(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
/**
 * GET /api/security/dashboard
 * Get security dashboard overview
 */
export declare function getDashboardHandler(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=security.controller.d.ts.map