import client from './client';
/**
 * Get church profile
 */
export async function getProfile() {
    const response = await client.get('/admin/profile');
    return response.data;
}
/**
 * Update church profile
 */
export async function updateProfile(data) {
    const response = await client.put('/admin/profile', data);
    return response.data;
}
/**
 * Get all co-admins
 */
export async function getCoAdmins() {
    const response = await client.get('/admin/co-admins');
    return response.data;
}
/**
 * Invite a new co-admin
 */
export async function inviteCoAdmin(data) {
    const response = await client.post('/admin/co-admins', data);
    return response.data;
}
/**
 * Remove a co-admin
 */
export async function removeCoAdmin(adminId) {
    const response = await client.delete(`/admin/co-admins/${adminId}`);
    return response.data;
}
/**
 * Get activity logs
 */
export async function getActivityLogs(page = 1, limit = 50) {
    const response = await client.get('/admin/activity-logs', {
        params: { page, limit },
    });
    return response.data;
}
/**
 * Log an activity
 */
export async function logActivity(action, details) {
    const response = await client.post('/admin/activity-log', {
        action,
        details,
    });
    return response.data;
}
//# sourceMappingURL=admin.js.map