import client from './client';
/**
 * Get current usage
 */
export async function getUsage() {
    const response = await client.get('/billing/usage');
    return response.data;
}
/**
 * Get current plan and limits
 */
export async function getPlan() {
    const response = await client.get('/billing/plan');
    return response.data;
}
/**
 * Get trial status
 */
export async function getTrial() {
    const response = await client.get('/billing/trial');
    return response.data;
}
/**
 * Subscribe to a plan
 */
export async function subscribe(planName, paymentMethodId) {
    const response = await client.post('/billing/subscribe', {
        planName,
        paymentMethodId,
    });
    return response.data;
}
/**
 * Upgrade/downgrade plan
 */
export async function upgradePlan(newPlan) {
    const response = await client.put('/billing/upgrade', {
        newPlan,
    });
    return response.data;
}
/**
 * Cancel subscription
 */
export async function cancelSubscription() {
    const response = await client.delete('/billing/cancel');
    return response.data;
}
//# sourceMappingURL=billing.js.map