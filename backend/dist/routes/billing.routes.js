import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { getUsageHandler, getPlanHandler, getTrialHandler, subscribeHandler, upgradeHandler, cancelHandler, createPaymentIntentHandler, getSMSPricing, getSMSUsage, calculateBatchCost, } from '../controllers/billing.controller.js';
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
// ========== SMS Billing Endpoints ==========
// Get SMS pricing
router.get('/sms-pricing', getSMSPricing);
// Get SMS usage and costs
router.get('/sms-usage', getSMSUsage);
// Calculate cost for batch messages
router.post('/calculate-batch-cost', calculateBatchCost);
export default router;
//# sourceMappingURL=billing.routes.js.map