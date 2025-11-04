import client from './client';
/**
 * Get all branches for a church
 */
export async function getBranches(churchId) {
    const response = await client.get(`/branches/churches/${churchId}/branches`);
    return response.data.data;
}
/**
 * Create a new branch
 */
export async function createBranch(churchId, data) {
    const response = await client.post(`/branches/churches/${churchId}/branches`, data);
    return response.data.data;
}
/**
 * Update an existing branch
 */
export async function updateBranch(branchId, data) {
    const response = await client.put(`/branches/${branchId}`, data);
    return response.data.data;
}
/**
 * Delete a branch
 */
export async function deleteBranch(branchId) {
    const response = await client.delete(`/branches/${branchId}`);
    return response.data.data;
}
//# sourceMappingURL=branches.js.map