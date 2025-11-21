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

export default router;
