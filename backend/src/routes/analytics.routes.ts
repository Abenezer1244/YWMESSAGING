import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.middleware.js';
import * as analyticsController from '../controllers/analytics.controller.js';

const router = Router();

router.use(authenticateToken);

router.get('/analytics/messages', analyticsController.getMessageStats);
router.get('/analytics/branches', analyticsController.getBranchStats);
router.get('/analytics/summary', analyticsController.getSummaryStats);

export default router;
