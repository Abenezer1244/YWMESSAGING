import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.middleware.js';
import * as messageController from '../controllers/message.controller.js';

const router = Router();

// Send message
router.post('/send', authenticateToken, messageController.sendMessage);

// Get message history (with pagination and filters)
router.get('/history', authenticateToken, messageController.getMessageHistory);

// Get single message details
router.get('/:messageId', authenticateToken, messageController.getMessageDetails);

// Telnyx webhook (no authentication)
router.post('/webhooks/telnyx/status', messageController.handleTelnyxWebhook);

export default router;
