/**
 * Telnyx RCS (Rich Communication Services) Service
 *
 * Provides iMessage-like messaging features:
 * - HD photos/videos (no carrier compression)
 * - Read receipts
 * - Typing indicators
 * - Branded sender (church logo, name)
 * - Auto-fallback to SMS when RCS unavailable
 *
 * @see https://developers.telnyx.com/docs/messaging/messages/receiving-rcs-webhooks
 */
/**
 * RCS capability check result
 */
export interface RCSCapability {
    phoneNumber: string;
    rcsEnabled: boolean;
    carrierSupportsRCS: boolean;
    features: {
        richCards: boolean;
        carousels: boolean;
        suggestedActions: boolean;
        suggestedReplies: boolean;
        mediaAttachments: boolean;
    };
    checkedAt: Date;
}
/**
 * RCS send message result
 */
export interface RCSSendResult {
    success: boolean;
    messageId: string;
    channel: 'rcs' | 'sms' | 'mms';
    fallbackReason?: string;
}
/**
 * RCS Agent configuration
 */
export interface RCSAgentConfig {
    agentId: string;
    brandName: string;
    logoUrl?: string;
    webhookUrl: string;
}
/**
 * RCS Rich Card content
 */
export interface RCSRichCard {
    title: string;
    description?: string;
    mediaUrl?: string;
    mediaHeight?: 'SHORT' | 'MEDIUM' | 'TALL';
    suggestions?: RCSSuggestion[];
}
/**
 * RCS Carousel (multiple swipeable cards)
 */
export interface RCSCarousel {
    cards: RCSRichCard[];
    cardWidth?: 'SMALL' | 'MEDIUM';
}
/**
 * RCS Suggestion (action button or quick reply)
 */
export interface RCSSuggestion {
    type: 'action' | 'reply';
    text: string;
    postbackData?: string;
    action?: {
        type: 'openUrl' | 'dialPhone' | 'showLocation' | 'shareLocation' | 'createCalendarEvent';
        url?: string;
        phoneNumber?: string;
        latitude?: number;
        longitude?: number;
        label?: string;
        title?: string;
        description?: string;
        startTime?: string;
        endTime?: string;
    };
}
/**
 * Check if a phone number supports RCS messaging
 *
 * @param phoneNumber - E.164 formatted phone number
 * @param agentId - RCS Agent ID (from church's RCS registration)
 * @returns RCS capability information
 */
export declare function checkRCSCapability(phoneNumber: string, agentId: string): Promise<RCSCapability>;
/**
 * Send an RCS message
 *
 * @param to - Recipient phone number (E.164 format)
 * @param content - Message text content
 * @param agentId - RCS Agent ID
 * @param options - Optional media URL and webhook URL
 * @returns Send result with message ID
 */
export declare function sendRCS(to: string, content: string, agentId: string, options?: {
    mediaUrl?: string;
    webhookUrl?: string;
}): Promise<{
    messageId: string;
    success: boolean;
}>;
/**
 * Send an RCS Rich Card
 *
 * Rich cards display:
 * - Hero image (optional)
 * - Title
 * - Description
 * - Action buttons (optional)
 *
 * @param to - Recipient phone number
 * @param agentId - RCS Agent ID
 * @param card - Rich card content
 * @param suggestions - Standalone suggestions (outside card)
 */
export declare function sendRichCard(to: string, agentId: string, card: RCSRichCard, suggestions?: RCSSuggestion[]): Promise<{
    messageId: string;
    success: boolean;
}>;
/**
 * Send an RCS Carousel (multiple swipeable cards)
 *
 * @param to - Recipient phone number
 * @param agentId - RCS Agent ID
 * @param carousel - Carousel configuration with cards
 * @param suggestions - Standalone suggestions below carousel
 */
export declare function sendCarousel(to: string, agentId: string, carousel: RCSCarousel, suggestions?: RCSSuggestion[]): Promise<{
    messageId: string;
    success: boolean;
}>;
/**
 * Send a text message with suggested replies/actions
 *
 * Suggested replies appear as chips the user can tap:
 * [Yes] [No] [Maybe Later]
 *
 * @param to - Recipient phone number
 * @param content - Text message
 * @param agentId - RCS Agent ID
 * @param suggestions - Array of suggestions (replies or actions)
 */
export declare function sendWithSuggestions(to: string, content: string, agentId: string, suggestions: RCSSuggestion[]): Promise<{
    messageId: string;
    success: boolean;
}>;
/**
 * Send message via RCS with automatic fallback to SMS/MMS
 *
 * Flow:
 * 1. Check if recipient supports RCS
 * 2. If yes, send via RCS (HD media, read receipts)
 * 3. If no, fallback to SMS/MMS
 *
 * @param to - Recipient phone number
 * @param content - Message content
 * @param churchId - Church ID for credentials lookup
 * @param options - Optional media URL
 * @returns Send result with channel used
 */
export declare function sendRCSWithFallback(to: string, content: string, churchId: string, options?: {
    mediaUrl?: string;
}): Promise<RCSSendResult>;
/**
 * Process RCS read receipt webhook
 * Updates message status when recipient reads the message
 *
 * @param messageId - Telnyx message ID
 * @param readAt - Timestamp when message was read
 */
export declare function handleRCSReadReceipt(messageId: string, readAt: Date): Promise<void>;
/**
 * Process RCS typing indicator webhook
 * Updates conversation when recipient starts/stops typing
 *
 * @param conversationId - Conversation ID
 * @param isTyping - Whether recipient is currently typing
 */
export declare function handleRCSTypingIndicator(phoneNumber: string, isTyping: boolean): Promise<void>;
/**
 * Get RCS agent details for a church
 *
 * @param churchId - Church ID
 * @returns RCS agent configuration or null if not configured
 */
export declare function getRCSAgent(churchId: string): Promise<RCSAgentConfig | null>;
/**
 * Validate RCS configuration for a church
 *
 * @param churchId - Church ID
 * @returns Validation result
 */
export declare function validateRCSSetup(churchId: string): Promise<{
    configured: boolean;
    agentId: string | null;
    ready: boolean;
    message: string;
}>;
/**
 * Send a church announcement as a rich card
 *
 * Creates a beautiful card with:
 * - Church branding
 * - Announcement image (optional)
 * - Title and description
 * - Action buttons (RSVP, Directions, Website)
 *
 * @param to - Recipient phone number
 * @param churchId - Church ID for RCS agent lookup
 * @param announcement - Announcement content
 */
export declare function sendChurchAnnouncement(to: string, churchId: string, announcement: {
    title: string;
    description: string;
    imageUrl?: string;
    rsvpUrl?: string;
    websiteUrl?: string;
    phoneNumber?: string;
    location?: {
        latitude: number;
        longitude: number;
        label: string;
    };
    quickReplies?: string[];
}): Promise<RCSSendResult>;
/**
 * Send event invitation with RSVP options
 *
 * Creates a rich card for events with:
 * - Event image
 * - Event details
 * - RSVP buttons
 * - Add to Calendar action
 *
 * @param to - Recipient phone number
 * @param churchId - Church ID
 * @param event - Event details
 */
export declare function sendEventInvitation(to: string, churchId: string, event: {
    title: string;
    description: string;
    imageUrl?: string;
    startTime: string;
    endTime: string;
    location?: {
        latitude: number;
        longitude: number;
        label: string;
    };
}): Promise<RCSSendResult>;
/**
 * Send weekly schedule as a carousel
 *
 * @param to - Recipient phone number
 * @param churchId - Church ID
 * @param events - Array of events for the carousel
 */
export declare function sendWeeklySchedule(to: string, churchId: string, events: Array<{
    title: string;
    description: string;
    imageUrl?: string;
    startTime?: string;
    location?: {
        latitude: number;
        longitude: number;
        label: string;
    };
}>): Promise<RCSSendResult>;
//# sourceMappingURL=telnyx-rcs.service.d.ts.map