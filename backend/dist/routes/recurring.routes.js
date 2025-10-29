import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.middleware.js';
import * as recurringController from '../controllers/recurring.controller.js';
const router = Router();
router.use(authenticateToken);
router.get('/api/recurring-messages', recurringController.getRecurringMessages);
router.post('/api/recurring-messages', recurringController.createRecurringMessage);
router.put('/api/recurring-messages/:messageId', recurringController.updateRecurringMessage);
router.delete('/api/recurring-messages/:messageId', recurringController.deleteRecurringMessage);
router.put('/api/recurring-messages/:messageId/toggle', recurringController.toggleRecurringMessage);
export default router;
//# sourceMappingURL=recurring.routes.js.map