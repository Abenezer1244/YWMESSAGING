import { Request, Response } from 'express';
import { getOrCreateConversation, sendChatMessage, getConversationHistory } from '../services/chat.service.js';

/**
 * POST /api/chat/message
 * Send a chat message and get AI response
 */
export async function handleChatMessage(req: Request, res: Response): Promise<void> {
  try {
    const { message, conversationId, visitorId } = req.body;
    const churchId = req.tenantId;

    if (!message || !message.trim()) {
      res.status(400).json({ error: 'Message is required' });
      return;
    }

    if (!churchId) {
      res.status(400).json({ error: 'Church context required' });
      return;
    }

    // Get or create conversation
    let convId = conversationId;
    if (!convId) {
      const userId = req.user?.adminId;
      convId = await getOrCreateConversation(churchId, userId, visitorId);
    }

    // Send message and get response
    const assistantResponse = await sendChatMessage(churchId, convId, message);

    res.status(200).json({
      success: true,
      data: {
        conversationId: convId,
        message: assistantResponse,
      },
    });
  } catch (error: any) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Failed to process chat message' });
  }
}

/**
 * GET /api/chat/history/:conversationId
 * Get conversation history
 */
export async function getChatHistory(req: Request, res: Response): Promise<void> {
  try {
    const { conversationId } = req.params;
    const churchId = req.tenantId;

    if (!conversationId) {
      res.status(400).json({ error: 'Conversation ID is required' });
      return;
    }

    if (!churchId) {
      res.status(400).json({ error: 'Church context required' });
      return;
    }

    const messages = await getConversationHistory(churchId, conversationId);

    res.status(200).json({
      success: true,
      data: messages,
    });
  } catch (error: any) {
    console.error('History error:', error);
    res.status(500).json({ error: 'Failed to fetch chat history' });
  }
}

/**
 * POST /api/chat/conversation
 * Create a new conversation
 */
export async function createConversation(req: Request, res: Response): Promise<void> {
  try {
    const { visitorId } = req.body;
    const churchId = req.tenantId;

    if (!churchId) {
      res.status(400).json({ error: 'Church context required' });
      return;
    }

    const userId = req.user?.adminId;
    const conversationId = await getOrCreateConversation(churchId, userId, visitorId);

    res.status(201).json({
      success: true,
      data: { conversationId },
    });
  } catch (error: any) {
    console.error('Conversation creation error:', error);
    res.status(500).json({ error: 'Failed to create conversation' });
  }
}
