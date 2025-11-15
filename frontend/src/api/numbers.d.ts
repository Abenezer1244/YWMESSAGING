export interface PhoneNumber {
    id: string;
    phoneNumber: string;
    formattedNumber: string;
    costPerMinute: number;
    costPerSms: number;
    region: string;
    capabilities: string[];
}
export interface CurrentNumber {
    telnyxPhoneNumber: string;
    telnyxNumberSid: string;
    telnyxVerified: boolean;
    telnyxPurchasedAt: string | null;
}
export interface PurchaseResponse {
    success: boolean;
    data: {
        numberSid: string;
        phoneNumber: string;
        success: boolean;
        webhookId?: string | null;
        verified?: boolean;
        autoLinked?: boolean;
        message?: string;
    };
}
export interface PaymentIntentResponse {
    success: boolean;
    data: {
        clientSecret: string;
        paymentIntentId: string;
    };
}
/**
 * Search for available phone numbers
 */
export declare function searchAvailableNumbers(options: {
    areaCode?: string;
    state?: string;
    contains?: string;
    quantity?: number;
}): Promise<PhoneNumber[]>;
/**
 * Create payment intent for phone number setup fee
 */
export declare function setupPaymentIntent(phoneNumber: string): Promise<PaymentIntentResponse>;
/**
 * Confirm payment intent with Stripe payment method
 */
export declare function confirmPayment(paymentIntentId: string, paymentMethodId: string): Promise<{
    success: boolean;
    data: {
        paymentIntentId: string;
        status: string;
    };
}>;
/**
 * Purchase a phone number (after payment confirmed)
 */
export declare function purchaseNumber(phoneNumber: string, paymentIntentId: string, connectionId?: string): Promise<PurchaseResponse>;
/**
 * Get church's current phone number
 */
export declare function getCurrentNumber(): Promise<CurrentNumber>;
/**
 * Release/delete church's phone number with soft-delete (30-day recovery window)
 * @param confirm - User confirms they want to delete
 * @param confirmPhone - User types the phone number to confirm
 */
export declare function releaseNumber(options?: {
    confirm?: boolean;
    confirmPhone?: string;
}): Promise<{
    success: boolean;
    message: string;
    data?: any;
}>;
//# sourceMappingURL=numbers.d.ts.map