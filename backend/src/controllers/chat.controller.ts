import { Request, Response } from 'express';
import { getOrCreateConversation, sendChatMessage, getConversationHistory } from '../services/chat.service.js';

/**
 * POST /api/chat/message
 * Send a chat message and get AI response
 */
export async function handleChatMessage(req: Request, res: Response): Promise<void> {
  try {
    const { message, conversationId, visitorId } = req.body;

    if (!message || !message.trim()) {
      res.status(400).json({ error: 'Message is required' });
      return;
    }

    // Get or create conversation
    let convId = conversationId;
    if (!convId) {
      const userId = req.user?.adminId;
      convId = await getOrCreateConversation(userId, visitorId);
    }

    // Send message and get response
    const assistantResponse = await sendChatMessage(convId, message);

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

    if (!conversationId) {
      res.status(400).json({ error: 'Conversation ID is required' });
      return;
    }

    const messages = await getConversationHistory(conversationId);

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

    const userId = req.user?.adminId;
    const conversationId = await getOrCreateConversation(userId, visitorId);

    res.status(201).json({
      success: true,
      data: { conversationId },
    });
  } catch (error: any) {
    console.error('Conversation creation error:', error);
    res.status(500).json({ error: 'Failed to create conversation' });
  }
}
