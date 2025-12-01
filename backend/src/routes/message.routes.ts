import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { messageLimiter, uploadLimiter } from '../middleware/user-rate-limit.middleware.js';
import * as messageController from '../controllers/message.controller.js';
import * as conversationController from '../controllers/conversation.controller.js';

const router = Router();

// Configure multer for file uploads
const upload = multer({
  dest: path.join(process.cwd(), 'temp'),
  limits: {
    fileSize: 500 * 1024 * 1024, // 500MB
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      // Images
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      // Videos
      'video/mp4',
      'video/quicktime',
      'video/x-msvideo',
      'video/x-matroska',
      // Audio
      'audio/mpeg',
      'audio/wav',
      'audio/aac',
      'audio/ogg',
      // Documents
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ];

    if (!allowedMimes.includes(file.mimetype)) {
      cb(new Error(`File type not allowed: ${file.mimetype}`));
    } else {
      cb(null, true);
    }
  },
});

// ============ BROADCAST MESSAGING (Existing) ============
// Send broadcast message
// ✅ OPTIMIZATION: Per-user rate limiting (100 messages/hour)
router.post('/send', authenticateToken, messageLimiter(), messageController.sendMessage);

// Get message history (with pagination and filters)
router.get('/history', authenticateToken, messageLimiter(), messageController.getMessageHistory);

// Get single message details
router.get('/:messageId', authenticateToken, messageController.getMessageDetails);

// ============ CONVERSATIONS (New - SMS/MMS with media) ============

// Get all conversations
router.get('/conversations', authenticateToken, conversationController.getConversations);

// Get single conversation with all messages
router.get('/conversations/:conversationId', authenticateToken, conversationController.getConversation);

// Send text-only reply
router.post('/conversations/:conversationId/reply', authenticateToken, conversationController.replyToConversation);

// Send reply with media attachment (full quality)
// ✅ OPTIMIZATION: Per-user upload rate limiting (10 uploads/hour)
router.post(
  '/conversations/:conversationId/reply-with-media',
  authenticateToken,
  uploadLimiter(),
  upload.single('file'),
  conversationController.replyWithMedia
);

// Mark conversation as read
router.patch(
  '/conversations/:conversationId/read',
  authenticateToken,
  conversationController.markAsRead
);

// Update conversation status
router.patch(
  '/conversations/:conversationId/status',
  authenticateToken,
  conversationController.updateStatus
);

// ============ WEBHOOKS (No authentication) ============

// Telnyx MMS webhook - receive messages from congregation
router.post('/webhooks/telnyx/mms', conversationController.handleTelnyxInboundMMS);

// Telnyx delivery status webhook - track SMS/MMS delivery
router.post('/webhooks/telnyx/status', conversationController.handleTelnyxWebhook);

export default router;
