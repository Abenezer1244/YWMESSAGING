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
/**
 * Create a payment intent for one-time charges (e.g., phone number setup fee)
 * $0.50 charged to customer (Stripe minimum)
 */
export async function createPhoneNumberSetupPaymentIntent(customerId, phoneNumber) {
    try {
        const amountInCents = 50; // $0.50 in cents (Stripe minimum)
        // Use idempotency key to prevent duplicate charges
        const idempotencyKey = `phone_setup_${customerId}_${phoneNumber}`;
        const paymentIntent = await stripe.paymentIntents.create({
            amount: amountInCents,
            currency: 'usd',
            customer: customerId,
            description: `Phone number setup fee for ${phoneNumber}`,
            metadata: {
                phoneNumber,
                type: 'phone_number_setup',
                telnyxFee: 100, // $1.00 goes to Telnyx
            },
        }, {
            idempotencyKey,
        });
        console.log(`✅ Payment intent created: ${paymentIntent.id}`);
        return {
            clientSecret: paymentIntent.client_secret || '',
            paymentIntentId: paymentIntent.id,
        };
    }
    catch (error) {
        console.error('❌ Failed to create payment intent:', {
            message: error.message,
            code: error.code,
            statusCode: error.statusCode,
            type: error.type,
            param: error.param,
            stripeError: error.raw?.message,
        });
        throw new Error(`Stripe error: ${error.message || 'Failed to create payment intent'}`);
    }
}
/**
 * Verify a payment intent belongs to a customer and was successful
 */
export async function verifyPaymentIntent(paymentIntentId, customerId, expectedAmount, phoneNumber) {
    try {
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
        // Verify payment intent belongs to the correct customer
        if (paymentIntent.customer !== customerId) {
            console.error(`⚠️ Payment intent customer mismatch: expected ${customerId}, got ${paymentIntent.customer}`);
            return false;
        }
        // Verify payment was successful
        if (paymentIntent.status !== 'succeeded') {
            console.error(`⚠️ Payment intent not successful: ${paymentIntent.status}`);
            return false;
        }
        // Verify correct amount
        if (paymentIntent.amount !== expectedAmount) {
            console.error(`⚠️ Payment amount mismatch: expected ${expectedAmount}, got ${paymentIntent.amount}`);
            return false;
        }
        // Verify phone number matches
        if (paymentIntent.metadata?.phoneNumber !== phoneNumber) {
            console.error(`⚠️ Phone number mismatch in payment intent metadata`);
            return false;
        }
        // Verify payment intent type
        if (paymentIntent.metadata?.type !== 'phone_number_setup') {
            console.error(`⚠️ Invalid payment intent type: ${paymentIntent.metadata?.type}`);
            return false;
        }
        console.log(`✅ Payment intent verified: ${paymentIntentId}`);
        return true;
    }
    catch (error) {
        console.error('❌ Failed to verify payment intent:', error);
        return false;
    }
}
/**
 * Confirm a payment intent (for one-time charges)
 */
export async function confirmPaymentIntent(paymentIntentId, paymentMethodId) {
    try {
        const paymentIntent = await stripe.paymentIntents.confirm(paymentIntentId, {
            payment_method: paymentMethodId,
        });
        if (paymentIntent.status === 'succeeded') {
            console.log(`✅ Payment succeeded: ${paymentIntentId}`);
            return true;
        }
        else if (paymentIntent.status === 'requires_action') {
            console.log(`⚠️ Payment requires additional action: ${paymentIntentId}`);
            return false;
        }
        console.log(`❌ Payment failed with status: ${paymentIntent.status}`);
        return false;
    }
    catch (error) {
        console.error('❌ Failed to confirm payment intent:', error);
        throw error;
    }
}
//# sourceMappingURL=stripe.service.js.map