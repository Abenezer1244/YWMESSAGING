/**
 * Planning Center Integration Routes
 * OAuth2 connection, member syncing, and integration management
 */
import { Router } from 'express';
import { getPlanningCenterStatus, connectPlanningCenter, syncPlanningCenterMembers, disconnectPlanningCenter, validatePlanningCenterConnection, } from '../controllers/planning-center.controller.js';
import { authenticateToken, authorizeChurch } from '../middleware/auth.middleware.js';
const router = Router();
/**
 * All routes require authentication
 */
router.use(authenticateToken);
router.use(authorizeChurch);
/**
 * GET /api/integrations/planning-center/status
 * Get integration status
 */
router.get('/status', getPlanningCenterStatus);
/**
 * POST /api/integrations/planning-center/connect
 * Connect to Planning Center with OAuth2 token
 */
router.post('/connect', connectPlanningCenter);
/**
 * POST /api/integrations/planning-center/sync-members
 * Trigger member sync from Planning Center
 */
router.post('/sync-members', syncPlanningCenterMembers);
/**
 * DELETE /api/integrations/planning-center
 * Disconnect Planning Center
 */
router.delete('/', disconnectPlanningCenter);
/**
 * POST /api/integrations/planning-center/validate
 * Validate current connection
 */
router.post('/validate', validatePlanningCenterConnection);
export default router;
//# sourceMappingURL=planning-center.routes.js.map