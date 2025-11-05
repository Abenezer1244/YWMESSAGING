import client from './client';
/**
 * Send a chat message and get AI response
 */
export async function sendChatMessage(message, conversationId, visitorId) {
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
export async function getChatHistory(conversationId) {
    const response = await client.get(`/chat/history/${conversationId}`);
    return response.data.data;
}
/**
 * Create a new conversation
 */
export async function createConversation(visitorId) {
    const response = await client.post('/chat/conversation', {
        visitorId,
    });
    return response.data.data;
}
//# sourceMappingURL=chat.js.map