/**
 * Find member by phone number
 * Returns existing member or creates new one for unknown number
 */
export declare function findOrCreateMemberByPhone(churchId: string, phone: string): Promise<any>;
/**
 * Send MMS (SMS with media attachment) via Telnyx
 * Used for leader replies with media
 */
export declare function sendMMS(to: string, message: string, churchId: string, mediaS3Url?: string): Promise<{
    messageSid: string;
    success: boolean;
}>;
/**
 * Handle inbound message webhook (SMS/MMS/RCS)
 * Called when member sends message to church number
 */
export declare function handleInboundMMS(churchId: string, senderPhone: string, messageText: string, mediaUrls: string[], telnyxMessageId?: string, channel?: 'sms' | 'mms' | 'rcs'): Promise<{
    conversationId: string;
    messageIds: string[];
}>;
/**
 * Broadcast inbound message to all congregation members
 * When a member texts the church number, send SMS to all other members
 * Sends synchronously without Redis queue
 */
export declare function broadcastInboundToMembers(churchId: string, senderMemberId: string, messageText: string, mediaType?: string): Promise<void>;
/**
 * Get member by phone (for outbound messaging)
 */
export declare function getMemberByPhone(churchId: string, phone: string): Promise<any | null>;
/**
 * Validate MMS credentials
 */
export declare function validateMMSSetup(): Promise<{
    telnyxConfigured: boolean;
    s3Configured: boolean;
    ready: boolean;
}>;
//# sourceMappingURL=telnyx-mms.service.d.ts.map