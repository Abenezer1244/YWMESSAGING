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
/**
 * Create a payment intent for one-time charges (e.g., phone number setup fee)
 * $0.50 charged to customer (Stripe minimum)
 */
export declare function createPhoneNumberSetupPaymentIntent(customerId: string, phoneNumber: string): Promise<{
    clientSecret: string;
    paymentIntentId: string;
}>;
/**
 * Verify a payment intent belongs to a customer and was successful
 */
export declare function verifyPaymentIntent(paymentIntentId: string, customerId: string, expectedAmount: number, phoneNumber: string): Promise<boolean>;
/**
 * Confirm a payment intent (for one-time charges)
 */
export declare function confirmPaymentIntent(paymentIntentId: string, paymentMethodId: string): Promise<boolean>;
//# sourceMappingURL=stripe.service.d.ts.map