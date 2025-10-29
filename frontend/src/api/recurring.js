import client from './client';
/**
 * Get all recurring messages
 */
export async function getRecurringMessages() {
    const response = await client.get('/recurring-messages');
    return response.data;
}
/**
 * Create recurring message
 */
export async function createRecurringMessage(data) {
    const response = await client.post('/recurring-messages', data);
    return response.data;
}
/**
 * Update recurring message
 */
export async function updateRecurringMessage(messageId, data) {
    const response = await client.put(`/recurring-messages/${messageId}`, data);
    return response.data;
}
/**
 * Delete recurring message
 */
export async function deleteRecurringMessage(messageId) {
    const response = await client.delete(`/recurring-messages/${messageId}`);
    return response.data;
}
/**
 * Toggle recurring message active status
 */
export async function toggleRecurringMessage(messageId, isActive) {
    const response = await client.put(`/recurring-messages/${messageId}/toggle`, {
        isActive,
    });
    return response.data;
}
//# sourceMappingURL=recurring.js.map