import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.middleware.js';
import * as messageController from '../controllers/message.controller.js';

const router = Router();

// Twilio connection
router.post(
  '/twilio/connect',
  authenticateToken,
  messageController.connectTwilio
);

// Send message
router.post('/messages/send', authenticateToken, messageController.sendMessage);

// Get message history (with pagination and filters)
router.get('/messages/history', authenticateToken, messageController.getMessageHistory);

// Get single message details
router.get('/messages/:messageId', authenticateToken, messageController.getMessageDetails);

// Twilio webhook (no authentication)
router.post('/webhooks/twilio/status', messageController.handleTwilioWebhook);

export default router;
