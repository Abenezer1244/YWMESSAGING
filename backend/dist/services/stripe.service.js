import Stripe from 'stripe';
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
if (!STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY environment variable is required');
}
const stripe = new Stripe(STRIPE_SECRET_KEY, {
    apiVersion: '2022-11-15',
});
/**
 * Create a Stripe customer
 */
export async function createCustomer(email, name) {
    try {
        const customer = await stripe.customers.create({
            email,
            name,
            description: `Church: ${name}`,
        });
        console.log(`✅ Stripe customer created: ${customer.id}`);
        return customer.id;
    }
    catch (error) {
        console.error('❌ Failed to create Stripe customer:', error);
        throw error;
    }
}
/**
 * Create a subscription
 */
export async function createSubscription(customerId, priceId, paymentMethodId) {
    try {
        const subscriptionParams = {
            customer: customerId,
            items: [{ price: priceId }],
        };
        if (paymentMethodId) {
            subscriptionParams.default_payment_method = paymentMethodId;
        }
        const subscription = await stripe.subscriptions.create(subscriptionParams);
        console.log(`✅ Subscription created: ${subscription.id}`);
        return subscription.id;
    }
    catch (error) {
        console.error('❌ Failed to create subscription:', error);
        throw error;
    }
}
/**
 * Update a subscription
 */
export async function updateSubscription(subscriptionId, newPriceId) {
    try {
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        // Get the subscription item to update
        const subscriptionItem = subscription.items.data[0];
        const updated = await stripe.subscriptionItems.update(subscriptionItem.id, {
            price: newPriceId,
        });
        console.log(`✅ Subscription updated: ${subscriptionId}`);
        return subscriptionId;
    }
    catch (error) {
        console.error('❌ Failed to update subscription:', error);
        throw error;
    }
}
/**
 * Cancel a subscription
 */
export async function cancelSubscription(subscriptionId) {
    try {
        await stripe.subscriptions.del(subscriptionId);
        console.log(`✅ Subscription cancelled: ${subscriptionId}`);
    }
    catch (error) {
        console.error('❌ Failed to cancel subscription:', error);
        throw error;
    }
}
/**
 * Get customer by ID
 */
export async function getCustomer(customerId) {
    try {
        const customer = await stripe.customers.retrieve(customerId);
        // Handle deleted customers
        if ('deleted' in customer && customer.deleted) {
            return null;
        }
        return customer;
    }
    catch (error) {
        console.error('❌ Failed to get customer:', error);
        return null;
    }
}
//# sourceMappingURL=stripe.service.js.map