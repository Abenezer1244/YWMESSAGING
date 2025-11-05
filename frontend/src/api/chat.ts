import client from './client';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

export interface ChatConversation {
  conversationId: string;
}

export interface ChatResponse {
  conversationId: string;
  message: string;
}

/**
 * Send a chat message and get AI response
 */
export async function sendChatMessage(message: string, conversationId?: string, visitorId?: string): Promise<ChatResponse> {
  const response = await client.post('/chat/message', {
    message,
    conversationId,
    visitorId,
  });
  return response.data.data;
}

/**
 * Get conversation history
 */
export async function getChatHistory(conversationId: string): Promise<ChatMessage[]> {
  const response = await client.get(`/chat/history/${conversationId}`);
  return response.data.data;
}

/**
 * Create a new conversation
 */
export async function createConversation(visitorId?: string): Promise<ChatConversation> {
  const response = await client.post('/chat/conversation', {
    visitorId,
  });
  return response.data.data;
}
