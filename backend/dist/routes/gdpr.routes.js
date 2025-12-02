import { Router } from 'express';
import * as gdprController from '../controllers/gdpr.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';
const router = Router();
/**
 * GDPR Routes - All endpoints require authentication
 * Implements GDPR Articles 17 (Right to be Forgotten), 20 (Right to Data Portability), 7 (Consent)
 */
// Apply auth middleware to all routes
router.use(authenticateToken);
/**
 * Data Export Endpoints
 */
// POST /api/gdpr/export - Request data export
router.post('/export', gdprController.requestExport);
// GET /api/gdpr/export/:exportId/download - Download exported data
router.get('/export/:exportId/download', gdprController.downloadExport);
/**
 * Account Deletion Endpoints
 */
// POST /api/gdpr/delete-account/request - Request account deletion
router.post('/delete-account/request', gdprController.requestAccountDeletion);
// POST /api/gdpr/delete-account/cancel - Cancel pending deletion
router.post('/delete-account/cancel', gdprController.cancelAccountDeletion);
// DELETE /api/gdpr/delete-account - Confirm and execute deletion
router.delete('/delete-account', gdprController.confirmAccountDeletion);
/**
 * Consent Management Endpoints
 */
// GET /api/gdpr/consent - Get current consent status
router.get('/consent', gdprController.getConsentStatus);
// GET /api/gdpr/consent/history - Get consent audit trail
router.get('/consent/history', gdprController.getConsentHistory);
// POST /api/gdpr/consent/:type - Update consent for specific type
router.post('/consent/:type', gdprController.updateConsent);
export default router;
//# sourceMappingURL=gdpr.routes.js.map