/**
 * Interface for Telnyx phone number search response
 */
interface PhoneNumberSearchResult {
    id: string;
    phoneNumber: string;
    formattedNumber: string;
    costPerMinute: number;
    costPerSms: number;
    region: string;
    capabilities: string[];
}
/**
 * Send SMS via Telnyx
 */
export declare function sendSMS(to: string, message: string, churchId: string): Promise<{
    messageSid: string;
    success: boolean;
}>;
/**
 * Validate Telnyx API key
 */
export declare function validateTelnyxApiKey(): Promise<boolean>;
/**
 * Search for available phone numbers
 * Options: areaCode, state, rateCenter, quantity, features
 */
export declare function searchAvailableNumbers(options: {
    areaCode?: string;
    state?: string;
    contains?: string;
    quantity?: number;
}): Promise<PhoneNumberSearchResult[]>;
/**
 * Purchase a phone number
 */
export declare function purchasePhoneNumber(phoneNumber: string, churchId: string, connectionId?: string): Promise<{
    numberSid: string;
    phoneNumber: string;
    success: boolean;
}>;
/**
 * Get details about a phone number owned by the account
 */
export declare function getPhoneNumberDetails(numberSid: string): Promise<any>;
/**
 * Release/delete a phone number
 */
export declare function releasePhoneNumber(numberSid: string, churchId: string): Promise<boolean>;
/**
 * Create webhook for incoming messages (auto-setup)
 */
export declare function createWebhook(webhookUrl: string): Promise<{
    id: string;
}>;
/**
 * Delete webhook by ID
 */
export declare function deleteWebhook(webhookId: string): Promise<boolean>;
export {};
//# sourceMappingURL=telnyx.service.d.ts.map