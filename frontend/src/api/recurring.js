import client from './client';
/**
 * Get all recurring messages
 */
export async function getRecurringMessages() {
    const response = await client.get('/recurring');
    return response.data;
}
/**
 * Create recurring message
 */
export async function createRecurringMessage(data) {
    const response = await client.post('/recurring', data);
    return response.data;
}
/**
 * Update recurring message
 */
export async function updateRecurringMessage(messageId, data) {
    const response = await client.put(`/recurring/${messageId}`, data);
    return response.data;
}
/**
 * Delete recurring message
 */
export async function deleteRecurringMessage(messageId) {
    const response = await client.delete(`/recurring/${messageId}`);
    return response.data;
}
/**
 * Toggle recurring message active status
 */
export async function toggleRecurringMessage(messageId, isActive) {
    const response = await client.put(`/recurring/${messageId}/toggle`, {
        isActive,
    });
    return response.data;
}
//# sourceMappingURL=recurring.js.map