import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.middleware.js';
import * as analyticsController from '../controllers/analytics.controller.js';

const router = Router();

router.use(authenticateToken);

router.get('/api/analytics/messages', analyticsController.getMessageStats);
router.get('/api/analytics/branches', analyticsController.getBranchStats);
router.get('/api/analytics/summary', analyticsController.getSummaryStats);

export default router;
