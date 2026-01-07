import client from './client';
/**
 * Get all conversations for the church
 */
export async function getConversations(options = {}) {
    const params = new URLSearchParams();
    if (options.page)
        params.append('page', options.page.toString());
    if (options.limit)
        params.append('limit', options.limit.toString());
    if (options.status)
        params.append('status', options.status);
    const response = await client.get(`/messages/conversations?${params.toString()}`);
    return response.data;
}
/**
 * Get single conversation with messages
 */
export async function getConversation(conversationId, options = {}) {
    const params = new URLSearchParams();
    if (options.page)
        params.append('page', options.page.toString());
    if (options.limit)
        params.append('limit', options.limit.toString());
    const response = await client.get(`/messages/conversations/${conversationId}?${params.toString()}`);
    return response.data;
}
/**
 * Reply to conversation with text only
 * Supports reply threading (replyToId) and send effects (sendEffect)
 */
export async function replyToConversation(conversationId, content, options) {
    const response = await client.post(`/messages/conversations/${conversationId}/reply`, {
        content,
        replyToId: options?.replyToId,
        sendEffect: options?.sendEffect,
    });
    return response.data;
}
/**
 * Reply to conversation with media
 */
export async function replyWithMedia(conversationId, file, content) {
    const formData = new FormData();
    formData.append('file', file);
    if (content) {
        formData.append('content', content);
    }
    const response = await client.post(`/messages/conversations/${conversationId}/reply-with-media`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
}
/**
 * Mark conversation as read
 */
export async function markConversationAsRead(conversationId) {
    await client.patch(`/messages/conversations/${conversationId}/read`);
}
/**
 * Update conversation status
 */
export async function updateConversationStatus(conversationId, status) {
    const response = await client.patch(`/messages/conversations/${conversationId}/status`, { status });
    return response.data;
}
/**
 * Add reaction to a message (iMessage-style)
 */
export async function addReaction(conversationId, messageId, emoji) {
    const response = await client.post(`/messages/conversations/${conversationId}/messages/${messageId}/reactions`, { emoji });
    return response.data;
}
/**
 * Remove reaction from a message (iMessage-style)
 */
export async function removeReaction(conversationId, messageId, emoji) {
    await client.delete(`/messages/conversations/${conversationId}/messages/${messageId}/reactions/${encodeURIComponent(emoji)}`);
}
//# sourceMappingURL=conversations.js.map