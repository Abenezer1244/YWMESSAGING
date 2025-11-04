import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { getProfileHandler, updateProfileHandler, getCoAdminsHandler, inviteCoAdminHandler, removeCoAdminHandler, getActivityLogsHandler, logActivityHandler, } from '../controllers/admin.controller.js';
const router = Router();
// All admin routes require authentication
router.use(authenticateToken);
// Church profile endpoints
router.get('/profile', getProfileHandler);
router.put('/profile', updateProfileHandler);
// Co-admin endpoints
router.get('/co-admins', getCoAdminsHandler);
router.post('/co-admins', inviteCoAdminHandler);
router.delete('/co-admins/:adminId', removeCoAdminHandler);
// Activity log endpoints
router.get('/activity-logs', getActivityLogsHandler);
router.post('/activity-log', logActivityHandler);
export default router;
//# sourceMappingURL=admin.routes.js.map