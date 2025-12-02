/**
 * NPS Controller
 * Handles NPS survey submission and analytics endpoints
 */
import { Request, Response } from 'express';
/**
 * POST /api/nps/submit
 * Submit NPS survey response
 */
export declare function submitSurvey(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
/**
 * GET /api/nps/analytics
 * Get NPS analytics for current church
 */
export declare function getAnalytics(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
/**
 * GET /api/nps/recent
 * Get recent survey responses
 */
export declare function getRecentSurveys(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
/**
 * GET /api/nps/by-category
 * Get NPS score by feedback category
 */
export declare function getNPSByCategory(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=nps.controller.d.ts.map