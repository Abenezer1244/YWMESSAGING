import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.middleware.js';
import * as analyticsController from '../controllers/analytics.controller.js';
const router = Router();
router.use(authenticateToken);
router.get('/messages', analyticsController.getMessageStats);
router.get('/branches', analyticsController.getBranchStats);
router.get('/summary', analyticsController.getSummaryStats);
export default router;
//# sourceMappingURL=analytics.routes.js.map