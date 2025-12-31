import client from './client';
/**
 * Get all members with pagination
 */
export async function getMembers(options = {}) {
    const params = new URLSearchParams();
    if (options.page)
        params.append('page', options.page.toString());
    if (options.limit)
        params.append('limit', options.limit.toString());
    if (options.search)
        params.append('search', options.search);
    // CRITICAL FIX: Add cache buster to prevent browser from returning stale cached responses
    // This ensures we always get fresh data from server, especially after adding/updating members
    params.append('_t', Date.now().toString());
    const response = await client.get(`/members?${params.toString()}`);
    return response.data;
}
/**
 * Add a single member
 */
export async function addMember(data) {
    const response = await client.post(`/members`, data);
    return response.data.data;
}
/**
 * Import members from CSV file
 */
export async function importMembers(file) {
    const formData = new FormData();
    formData.append('file', file);
    // Note: Do NOT set Content-Type header - let axios set it with the boundary
    // Authorization header is automatically added by the client interceptor
    const response = await client.post(`/members/import`, formData, {
        headers: {
        // Let axios auto-set Content-Type with multipart boundary
        // 'Content-Type': 'multipart/form-data' - DO NOT SET, let axios handle it
        },
    });
    return response.data.data;
}
/**
 * Update a member
 */
export async function updateMember(memberId, data) {
    const response = await client.put(`/members/${memberId}`, data);
    return response.data.data;
}
/**
 * Remove a member
 */
export async function removeMember(memberId) {
    const response = await client.delete(`/members/${memberId}`);
    return response.data.data;
}
//# sourceMappingURL=members.js.map