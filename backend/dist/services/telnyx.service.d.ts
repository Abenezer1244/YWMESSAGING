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
 * Telnyx Phone Number record from API
 */
interface TelnyxPhoneNumber {
    id: string;
    phone_number: string;
    messaging_profile_id: string | null;
    status: string;
    [key: string]: any;
}
/**
 * Telnyx Messaging Profile record
 */
interface TelnyxMessagingProfile {
    id: string;
    name: string;
    webhook_url: string;
    enabled: boolean;
    phone_numbers?: string[];
    [key: string]: any;
}
/**
 * Linking operation result with metrics
 */
interface LinkingResult {
    success: boolean;
    method: 'direct' | 'profile' | 'aggressive_search_retry' | null;
    duration: number;
    phoneNumberId: string;
    messagingProfileId: string;
    phoneNumber: string;
    error?: {
        code: string;
        message: string;
        httpStatus?: number;
    };
}
/**
 * Structured log entry for monitoring
 */
interface LinkingLogEntry {
    timestamp: string;
    churchId?: string;
    phoneNumber: string;
    messagingProfileId: string;
    step: string;
    result: 'success' | 'failure' | 'retry';
    errorCode?: string;
    errorDetails?: string;
    duration: number;
}
export type { LinkingResult, TelnyxPhoneNumber, TelnyxMessagingProfile, LinkingLogEntry };
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
export declare function purchasePhoneNumber(phoneNumber: string, churchId: string, connectionId?: string, messagingProfileId?: string): Promise<{
    numberSid: string;
    phoneNumber: string;
    success: boolean;
}>;
/**
 * Get details about a phone number owned by the account
 */
export declare function getPhoneNumberDetails(numberSid: string): Promise<any>;
/**
 * Release/delete a phone number with soft-delete support
 *
 * Soft-delete: Phone number is marked as archived with 30-day recovery window
 * - Telnyx release is called immediately (can't undo with Telnyx)
 * - DB marks number as "archived" instead of clearing it
 * - Conversations stay but show "archived number" status
 * - Can be restored within 30 days
 */
export declare function releasePhoneNumber(numberSid: string, churchId: string, options?: {
    softDelete?: boolean;
    deletedBy?: string;
}): Promise<boolean>;
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
/**
 * Link phone number to messaging profile for webhook routing
 * Enterprise-grade implementation with validation, monitoring, and structured logging
 *
 * Note: Telnyx routes inbound messages via the messaging profile associated with the number
 * This tries multiple approaches to ensure the number is linked
 * IMPORTANT: Phone numbers need time to be indexed in Telnyx's system after purchase
 */
export declare function linkPhoneNumberToMessagingProfile(phoneNumber: string, messagingProfileId: string, churchId?: string): Promise<LinkingResult>;
//# sourceMappingURL=telnyx.service.d.ts.map