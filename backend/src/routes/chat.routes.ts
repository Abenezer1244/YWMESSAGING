import { Router } from 'express';
import { handleChatMessage, getChatHistory, createConversation } from '../controllers/chat.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = Router();

// Public routes (no authentication required)
router.post('/message', handleChatMessage);
router.post('/conversation', createConversation);

// Protected routes (requires authentication)
router.get('/history/:conversationId', authenticateToken, getChatHistory);

export default router;
