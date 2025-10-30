import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.middleware.js';
import * as recurringController from '../controllers/recurring.controller.js';

const router = Router();

router.use(authenticateToken);

router.get('/recurring-messages', recurringController.getRecurringMessages);
router.post('/recurring-messages', recurringController.createRecurringMessage);
router.put(
  '/recurring-messages/:messageId',
  recurringController.updateRecurringMessage
);
router.delete(
  '/recurring-messages/:messageId',
  recurringController.deleteRecurringMessage
);
router.put(
  '/recurring-messages/:messageId/toggle',
  recurringController.toggleRecurringMessage
);

export default router;
