import { Request, Response } from 'express';
/**
 * GDPR Controller - Handle data export, deletion, and consent endpoints
 * All endpoints require admin authentication
 */
/**
 * POST /api/gdpr/export
 * Request data export - returns download URL
 */
export declare function requestExport(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
/**
 * GET /api/gdpr/export/:exportId/download
 * Download exported data as JSON file
 */
export declare function downloadExport(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
/**
 * POST /api/gdpr/delete-account/request
 * Request account deletion - sends confirmation token via email
 */
export declare function requestAccountDeletion(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
/**
 * DELETE /api/gdpr/delete-account
 * Confirm account deletion with token
 */
export declare function confirmAccountDeletion(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
/**
 * POST /api/gdpr/delete-account/cancel
 * Cancel pending account deletion
 */
export declare function cancelAccountDeletion(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
/**
 * GET /api/gdpr/consent
 * Get current consent status
 */
export declare function getConsentStatus(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
/**
 * POST /api/gdpr/consent/:type
 * Update consent for specific type
 */
export declare function updateConsent(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
/**
 * GET /api/gdpr/consent/history
 * Get consent change audit trail
 */
export declare function getConsentHistory(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=gdpr.controller.d.ts.map