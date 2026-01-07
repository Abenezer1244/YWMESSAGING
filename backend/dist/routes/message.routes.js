import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { messageLimiter, uploadLimiter } from '../middleware/user-rate-limit.middleware.js';
import { validateBody, validateParams } from '../middleware/validation.middleware.js';
import * as messageController from '../controllers/message.controller.js';
import * as conversationController from '../controllers/conversation.controller.js';
import { SendMessageSchema, ReplyToConversationSchema, ConversationParamSchema, UpdateConversationStatusSchema, } from '../lib/validation/schemas.js';
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
        }
        else {
            cb(null, true);
        }
    },
});
// ============ BROADCAST MESSAGING (Existing) ============
// Send broadcast message
// ✅ OPTIMIZATION: Per-user rate limiting (100 messages/hour)
// ✅ VALIDATION: Validate message content, recipients, and optional schedule time
router.post('/send', authenticateToken, messageLimiter(), validateBody(SendMessageSchema), messageController.sendMessage);
// Get message history (with pagination and filters)
router.get('/history', authenticateToken, messageLimiter(), messageController.getMessageHistory);
// Get single message details
router.get('/:messageId', authenticateToken, messageController.getMessageDetails);
// ============ RCS RICH MESSAGING ============
// Send rich card announcement
router.post('/rcs/announcement', authenticateToken, messageController.sendRichAnnouncement);
// Send event invitation with RSVP
router.post('/rcs/event', authenticateToken, messageController.sendEventInvitation);
// Send weekly schedule carousel
router.post('/rcs/schedule', authenticateToken, messageController.sendWeeklySchedule);
// Check RCS configuration status
router.get('/rcs/status', authenticateToken, messageController.getRCSStatus);
// ============ CONVERSATIONS (New - SMS/MMS with media) ============
// Get all conversations
router.get('/conversations', authenticateToken, conversationController.getConversations);
// Get single conversation with all messages
router.get('/conversations/:conversationId', authenticateToken, conversationController.getConversation);
// Send text-only reply
// ✅ OPTIMIZATION: Per-user rate limiting (100 messages/hour - same as broadcast)
// ✅ VALIDATION: Validate conversation ID and reply content
router.post('/conversations/:conversationId/reply', authenticateToken, messageLimiter(), validateParams(ConversationParamSchema), validateBody(ReplyToConversationSchema), conversationController.replyToConversation);
// Send reply with media attachment (full quality)
// ✅ OPTIMIZATION: Per-user upload rate limiting (10 uploads/hour)
// ✅ VALIDATION: Validate conversation ID
router.post('/conversations/:conversationId/reply-with-media', authenticateToken, uploadLimiter(), validateParams(ConversationParamSchema), upload.single('file'), conversationController.replyWithMedia);
// Mark conversation as read
router.patch('/conversations/:conversationId/read', authenticateToken, conversationController.markAsRead);
// Update conversation status
// ✅ VALIDATION: Validate conversation ID and new status
router.patch('/conversations/:conversationId/status', authenticateToken, validateParams(ConversationParamSchema), validateBody(UpdateConversationStatusSchema), conversationController.updateStatus);
// ============ MESSAGE REACTIONS (iMessage-style) ============
// Add reaction to message
router.post('/conversations/:conversationId/messages/:messageId/reactions', authenticateToken, conversationController.addReaction);
// Remove reaction from message
router.delete('/conversations/:conversationId/messages/:messageId/reactions/:emoji', authenticateToken, conversationController.removeReaction);
// ============ WEBHOOKS (No authentication) ============
// Telnyx MMS webhook - receive messages from congregation
router.post('/webhooks/telnyx/mms', conversationController.handleTelnyxInboundMMS);
// Telnyx delivery status webhook - track SMS/MMS delivery
router.post('/webhooks/telnyx/status', conversationController.handleTelnyxWebhook);
export default router;
//# sourceMappingURL=message.routes.js.map