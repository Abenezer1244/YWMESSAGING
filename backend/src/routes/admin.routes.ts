import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.middleware.js';
import {
  getProfileHandler,
  updateProfileHandler,
  getDeliveryTierStatusHandler,
  getCoAdminsHandler,
  inviteCoAdminHandler,
  removeCoAdminHandler,
  getActivityLogsHandler,
  logActivityHandler,
  linkPhoneNumberHandler,
} from '../controllers/admin.controller.js';
import cacheMonitoringRoutes from './cache-monitoring.routes.js';
import queueMonitoringRoutes from './queue-monitoring.routes.js';

const router = Router();

// All admin routes require authentication
router.use(authenticateToken);

// Church profile endpoints
router.get('/profile', getProfileHandler);
router.put('/profile', updateProfileHandler);
router.get('/delivery-tier-status', getDeliveryTierStatusHandler);

// Co-admin endpoints
router.get('/co-admins', getCoAdminsHandler);
router.post('/co-admins', inviteCoAdminHandler);
router.delete('/co-admins/:adminId', removeCoAdminHandler);

// Activity log endpoints
router.get('/activity-logs', getActivityLogsHandler);
router.post('/activity-log', logActivityHandler);

// Phone number endpoints
router.post('/phone-numbers/link', linkPhoneNumberHandler);

// Cache monitoring endpoints (production monitoring)
router.use('/cache', cacheMonitoringRoutes);

// Queue monitoring endpoints (✅ PHASE 1: SMS queue monitoring)
router.use('/queue', queueMonitoringRoutes);

export default router;
