import client from './client';
/**
 * Get message statistics
 */
export async function getMessageStats(options = {}) {
    const params = new URLSearchParams();
    if (options.days) {
        params.append('days', options.days.toString());
    }
    const response = await client.get(`/analytics/messages?${params.toString()}`);
    return response.data;
}
/**
 * Get branch comparison statistics
 */
export async function getBranchStats() {
    const response = await client.get('/analytics/branches');
    return response.data;
}
/**
 * Get overall summary statistics
 */
export async function getSummaryStats() {
    // Add cache buster to prevent browser from returning stale member count
    const params = new URLSearchParams();
    params.append('_t', Date.now().toString());
    const response = await client.get(`/analytics/summary?${params.toString()}`);
    return response.data;
}
//# sourceMappingURL=analytics.js.map