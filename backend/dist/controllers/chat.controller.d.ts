import { Request, Response } from 'express';
/**
 * POST /api/chat/message
 * Send a chat message and get AI response
 */
export declare function handleChatMessage(req: Request, res: Response): Promise<void>;
/**
 * GET /api/chat/history/:conversationId
 * Get conversation history
 */
export declare function getChatHistory(req: Request, res: Response): Promise<void>;
/**
 * POST /api/chat/conversation
 * Create a new conversation
 */
export declare function createConversation(req: Request, res: Response): Promise<void>;
//# sourceMappingURL=chat.controller.d.ts.map