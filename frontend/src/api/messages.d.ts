import { SentMessage } from '../stores/messageStore';
export interface KoinoniaTwilioData {
    accountSid: string;
    authToken: string;
    phoneNumber: string;
}
export interface SendMessageData {
    content: string;
    targetType: 'individual' | 'groups' | 'branches' | 'all';
    targetIds?: string[];
}
/**
 * Koinonia Twilio credentials
 */
export declare function connectTwilio(data: KoinoniaTwilioData): Promise<any>;
/**
 * Send message to recipients
 */
export declare function sendMessage(data: SendMessageData): Promise<SentMessage>;
/**
 * Get message history with pagination
 */
export declare function getMessageHistory(options?: {
    page?: number;
    limit?: number;
    status?: string;
}): Promise<{
    data: SentMessage[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
    };
}>;
/**
 * Get single message details
 */
export declare function getMessageDetails(messageId: string): Promise<any>;
//# sourceMappingURL=messages.d.ts.map