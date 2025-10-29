import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { getProfileHandler, updateProfileHandler, getCoAdminsHandler, removeCoAdminHandler, getActivityLogsHandler, logActivityHandler, } from '../controllers/admin.controller.js';
const router = Router();
// All admin routes require authentication
router.use(authenticateToken);
// Church profile endpoints
router.get('/admin/profile', getProfileHandler);
router.put('/admin/profile', updateProfileHandler);
// Co-admin endpoints
router.get('/admin/co-admins', getCoAdminsHandler);
router.delete('/admin/co-admins/:adminId', removeCoAdminHandler);
// Activity log endpoints
router.get('/admin/activity-logs', getActivityLogsHandler);
router.post('/admin/activity-log', logActivityHandler);
export default router;
//# sourceMappingURL=admin.routes.js.map