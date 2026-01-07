import client from './client';
// ============================================
// RCS Status & Configuration
// ============================================
/**
 * Get RCS configuration status for the current church
 */
export async function getRCSStatus() {
    const response = await client.get('/messages/rcs/status');
    return response.data.data;
}
/**
 * Register RCS Agent for the church
 */
export async function registerRCSAgent(agentId) {
    const response = await client.post('/admin/rcs/register', { agentId });
    return response.data;
}
// ============================================
// RCS Rich Messaging
// ============================================
/**
 * Send a rich card announcement to all members
 */
export async function sendRichAnnouncement(data) {
    const response = await client.post('/messages/rcs/announcement', data);
    return response.data.data;
}
/**
 * Send an event invitation to all members
 */
export async function sendEventInvitation(data) {
    const response = await client.post('/messages/rcs/event', data);
    return response.data.data;
}
/**
 * Send weekly schedule carousel to all members
 */
export async function sendWeeklySchedule(events) {
    const response = await client.post('/messages/rcs/schedule', { events });
    return response.data.data;
}
//# sourceMappingURL=rcs.js.map