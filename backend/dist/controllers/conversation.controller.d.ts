import { Request, Response } from 'express';
/**
 * GET /api/conversations
 * Get all conversations for tenant
 */
export declare function getConversations(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
/**
 * GET /api/conversations/:conversationId
 * Get single conversation with all messages
 */
export declare function getConversation(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
/**
 * POST /api/conversations/:conversationId/reply
 * Send text-only reply
 */
export declare function replyToConversation(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
/**
 * POST /api/conversations/:conversationId/reply-with-media
 * Send reply with media attachment (full quality, no compression)
 */
export declare function replyWithMedia(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
/**
 * PATCH /api/conversations/:conversationId/read
 * Mark conversation as read
 */
export declare function markAsRead(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
/**
 * PATCH /api/conversations/:conversationId/status
 * Update conversation status
 */
export declare function updateStatus(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
export declare function handleTelnyxInboundMMS(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
/**
 * POST /api/webhooks/telnyx/status
 * Receive delivery status updates from Telnyx (for SMS/MMS sent)
 * Updates message delivery status
 * ✅ SECURITY: Verify Telnyx webhook signature using ED25519
 */
export declare function handleTelnyxWebhook(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=conversation.controller.d.ts.map