import client from './client';
/**
 * Get current usage
 */
export async function getUsage() {
    const response = await client.get('/billing/usage');
    return response.data.data; // Unwrap the nested data structure
}
/**
 * Get current plan and limits
 */
export async function getPlan() {
    const response = await client.get('/billing/plan');
    return response.data.data; // Unwrap the nested data structure
}
/**
 * Get trial status
 */
export async function getTrial() {
    const response = await client.get('/billing/trial');
    return response.data.data; // Unwrap the nested data structure
}
/**
 * Subscribe to a plan
 */
export async function subscribe(planName, paymentMethodId) {
    const response = await client.post('/billing/subscribe', {
        planName,
        paymentMethodId,
    });
    return response.data.data; // Unwrap the nested data structure
}
/**
 * Upgrade/downgrade plan
 */
export async function upgradePlan(newPlan) {
    const response = await client.put('/billing/upgrade', {
        newPlan,
    });
    return response.data.data; // Unwrap the nested data structure
}
/**
 * Cancel subscription
 */
export async function cancelSubscription() {
    const response = await client.delete('/billing/cancel');
    return response.data.data; // Unwrap the nested data structure
}
/**
 * Create payment intent for subscription
 */
export async function createPaymentIntent(planName) {
    const response = await client.post('/billing/payment-intent', {
        planName,
    });
    return response.data.data; // Unwrap the nested data structure
}
//# sourceMappingURL=billing.js.map