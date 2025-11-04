import client from './client';
/**
 * Get all groups for a branch
 */
export async function getGroups(branchId) {
    const response = await client.get(`/groups/branches/${branchId}/groups`);
    return response.data.data;
}
/**
 * Create a new group
 */
export async function createGroup(branchId, data) {
    const response = await client.post(`/groups/branches/${branchId}/groups`, data);
    return response.data.data;
}
/**
 * Update a group
 */
export async function updateGroup(groupId, data) {
    const response = await client.put(`/groups/${groupId}`, data);
    return response.data.data;
}
/**
 * Delete a group
 */
export async function deleteGroup(groupId) {
    const response = await client.delete(`/groups/${groupId}`);
    return response.data.data;
}
//# sourceMappingURL=groups.js.map