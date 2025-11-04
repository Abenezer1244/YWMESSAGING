import client from './client';
/**
 * Koinonia Twilio credentials
 */
export async function connectTwilio(data) {
    const response = await client.post('/messages/twilio/connect', data);
    return response.data.data;
}
/**
 * Send message to recipients
 */
export async function sendMessage(data) {
    const response = await client.post('/messages/messages/send', data);
    return response.data.data;
}
/**
 * Get message history with pagination
 */
export async function getMessageHistory(options = {}) {
    const params = new URLSearchParams();
    if (options.page)
        params.append('page', options.page.toString());
    if (options.limit)
        params.append('limit', options.limit.toString());
    if (options.status)
        params.append('status', options.status);
    const response = await client.get(`/messages/messages/history?${params.toString()}`);
    return response.data;
}
/**
 * Get single message details
 */
export async function getMessageDetails(messageId) {
    const response = await client.get(`/messages/messages/${messageId}`);
    return response.data.data;
}
//# sourceMappingURL=messages.js.map