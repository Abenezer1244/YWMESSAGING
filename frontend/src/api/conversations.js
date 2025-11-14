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
 */
export async function replyToConversation(conversationId, content) {
    const response = await client.post(`/messages/conversations/${conversationId}/reply`, { content });
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
//# sourceMappingURL=conversations.js.map