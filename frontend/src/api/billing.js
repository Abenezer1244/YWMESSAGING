import client from './client';
/**
 * Get current usage
 */
export async function getUsage() {
    const response = await client.get('/billing/billing/usage');
    return response.data;
}
/**
 * Get current plan and limits
 */
export async function getPlan() {
    const response = await client.get('/billing/billing/plan');
    return response.data;
}
/**
 * Get trial status
 */
export async function getTrial() {
    const response = await client.get('/billing/billing/trial');
    return response.data;
}
/**
 * Subscribe to a plan
 */
export async function subscribe(planName, paymentMethodId) {
    const response = await client.post('/billing/billing/subscribe', {
        planName,
        paymentMethodId,
    });
    return response.data;
}
/**
 * Upgrade/downgrade plan
 */
export async function upgradePlan(newPlan) {
    const response = await client.put('/billing/billing/upgrade', {
        newPlan,
    });
    return response.data;
}
/**
 * Cancel subscription
 */
export async function cancelSubscription() {
    const response = await client.delete('/billing/billing/cancel');
    return response.data;
}
/**
 * Create payment intent for subscription
 */
export async function createPaymentIntent(planName) {
    const response = await client.post('/billing/billing/payment-intent', {
        planName,
    });
    return response.data;
}
//# sourceMappingURL=billing.js.map