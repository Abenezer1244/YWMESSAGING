import client from './client';
/**
 * Get all members in a group with pagination
 */
export async function getMembers(groupId, options = {}) {
    const params = new URLSearchParams();
    if (options.page)
        params.append('page', options.page.toString());
    if (options.limit)
        params.append('limit', options.limit.toString());
    if (options.search)
        params.append('search', options.search);
    const response = await client.get(`/groups/${groupId}/members?${params.toString()}`);
    return response.data;
}
/**
 * Add a single member to a group
 */
export async function addMember(groupId, data) {
    const response = await client.post(`/groups/${groupId}/members`, data);
    return response.data.data;
}
/**
 * Import members from CSV file
 */
export async function importMembers(groupId, file) {
    const formData = new FormData();
    formData.append('file', file);
    const response = await client.post(`/groups/${groupId}/members/import`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
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
 * Remove a member from a group
 */
export async function removeMember(groupId, memberId) {
    const response = await client.delete(`/groups/${groupId}/members/${memberId}`);
    return response.data.data;
}
//# sourceMappingURL=members.js.map