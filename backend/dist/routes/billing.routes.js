import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { getUsageHandler, getPlanHandler, getTrialHandler, subscribeHandler, upgradeHandler, cancelHandler, createPaymentIntentHandler, } from '../controllers/billing.controller.js';
const router = Router();
// All billing routes require authentication
router.use(authenticateToken);
// Get current usage
router.get('/usage', getUsageHandler);
// Get current plan and limits
router.get('/plan', getPlanHandler);
// Get trial status
router.get('/trial', getTrialHandler);
// Subscribe to a plan
router.post('/subscribe', subscribeHandler);
// Upgrade/downgrade plan
router.put('/upgrade', upgradeHandler);
// Cancel subscription
router.delete('/cancel', cancelHandler);
// Create payment intent
router.post('/payment-intent', createPaymentIntentHandler);
export default router;
//# sourceMappingURL=billing.routes.js.map