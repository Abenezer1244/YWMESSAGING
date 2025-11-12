import client from './client';
/**
 * Search for available phone numbers
 */
export async function searchAvailableNumbers(options) {
    const params = new URLSearchParams();
    if (options.areaCode)
        params.append('areaCode', options.areaCode);
    if (options.state)
        params.append('state', options.state);
    if (options.contains)
        params.append('contains', options.contains);
    if (options.quantity)
        params.append('quantity', options.quantity.toString());
    const response = await client.get(`/numbers/search?${params.toString()}`);
    return response.data.data;
}
/**
 * Create payment intent for phone number setup fee
 */
export async function setupPaymentIntent(phoneNumber) {
    const response = await client.post('/numbers/setup-payment-intent', {
        phoneNumber,
    });
    return response.data;
}
/**
 * Confirm payment intent with card details
 */
export async function confirmPayment(paymentIntentId, cardNumber, cardExpiry, cardCvc, cardName) {
    const response = await client.post('/numbers/confirm-payment', {
        paymentIntentId,
        cardNumber,
        cardExpiry,
        cardCvc,
        cardName,
    });
    return response.data;
}
/**
 * Purchase a phone number (after payment confirmed)
 */
export async function purchaseNumber(phoneNumber, paymentIntentId, connectionId) {
    const response = await client.post('/numbers/purchase', {
        phoneNumber,
        paymentIntentId,
        connectionId,
    });
    return response.data;
}
/**
 * Get church's current phone number
 */
export async function getCurrentNumber() {
    const response = await client.get('/numbers/current');
    return response.data.data;
}
/**
 * Release/delete church's phone number
 */
export async function releaseNumber() {
    const response = await client.delete('/numbers/current');
    return response.data;
}
//# sourceMappingURL=numbers.js.map