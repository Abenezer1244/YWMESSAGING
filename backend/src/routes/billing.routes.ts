import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.middleware.js';
import {
  getUsageHandler,
  getPlanHandler,
  getTrialHandler,
  subscribeHandler,
  upgradeHandler,
  cancelHandler,
} from '../controllers/billing.controller.js';

const router = Router();

// All billing routes require authentication
router.use(authenticateToken);

// Get current usage
router.get('/billing/usage', getUsageHandler);

// Get current plan and limits
router.get('/billing/plan', getPlanHandler);

// Get trial status
router.get('/billing/trial', getTrialHandler);

// Subscribe to a plan
router.post('/billing/subscribe', subscribeHandler);

// Upgrade/downgrade plan
router.put('/billing/upgrade', upgradeHandler);

// Cancel subscription
router.delete('/billing/cancel', cancelHandler);

export default router;
