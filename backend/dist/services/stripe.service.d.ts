import Stripe from 'stripe';
/**
 * Create a Stripe customer
 */
export declare function createCustomer(email: string, name: string): Promise<string>;
/**
 * Create a subscription
 */
export declare function createSubscription(customerId: string, priceId: string, paymentMethodId?: string): Promise<string>;
/**
 * Update a subscription
 */
export declare function updateSubscription(subscriptionId: string, newPriceId: string): Promise<string>;
/**
 * Cancel a subscription
 */
export declare function cancelSubscription(subscriptionId: string): Promise<void>;
/**
 * Get customer by ID
 */
export declare function getCustomer(customerId: string): Promise<Stripe.Customer | null>;
//# sourceMappingURL=stripe.service.d.ts.map