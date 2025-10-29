import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
  apiVersion: '2023-10-16',
});

/**
 * Create a Stripe customer
 */
export async function createCustomer(email: string, name: string): Promise<string> {
  try {
    const customer = await stripe.customers.create({
      email,
      name,
      description: `Church: ${name}`,
    });

    console.log(`✅ Stripe customer created: ${customer.id}`);
    return customer.id;
  } catch (error) {
    console.error('❌ Failed to create Stripe customer:', error);
    throw error;
  }
}

/**
 * Create a subscription
 */
export async function createSubscription(
  customerId: string,
  priceId: string,
  paymentMethodId?: string
): Promise<string> {
  try {
    const subscriptionParams: any = {
      customer: customerId,
      items: [{ price: priceId }],
    };

    if (paymentMethodId) {
      subscriptionParams.default_payment_method = paymentMethodId;
    }

    const subscription = await stripe.subscriptions.create(subscriptionParams);
    console.log(`✅ Subscription created: ${subscription.id}`);
    return subscription.id;
  } catch (error) {
    console.error('❌ Failed to create subscription:', error);
    throw error;
  }
}

/**
 * Update a subscription
 */
export async function updateSubscription(
  subscriptionId: string,
  newPriceId: string
): Promise<string> {
  try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);

    // Get the subscription item to update
    const subscriptionItem = subscription.items.data[0];

    const updated = await stripe.subscriptionItems.update(subscriptionItem.id, {
      price: newPriceId,
    });

    console.log(`✅ Subscription updated: ${subscriptionId}`);
    return subscriptionId;
  } catch (error) {
    console.error('❌ Failed to update subscription:', error);
    throw error;
  }
}

/**
 * Cancel a subscription
 */
export async function cancelSubscription(subscriptionId: string): Promise<void> {
  try {
    await stripe.subscriptions.del(subscriptionId);
    console.log(`✅ Subscription cancelled: ${subscriptionId}`);
  } catch (error) {
    console.error('❌ Failed to cancel subscription:', error);
    throw error;
  }
}

/**
 * Get customer by ID
 */
export async function getCustomer(customerId: string): Promise<Stripe.Customer | null> {
  try {
    const customer = await stripe.customers.retrieve(customerId);
    return customer;
  } catch (error) {
    console.error('❌ Failed to get customer:', error);
    return null;
  }
}
