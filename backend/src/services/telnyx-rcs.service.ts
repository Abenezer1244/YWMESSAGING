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

import axios from 'axios';
import { getRegistryPrisma, getTenantPrisma } from '../lib/tenant-prisma.js';
import { telnyxCircuitBreaker } from '../utils/circuit-breaker.js';
import { sendSMS } from './telnyx.service.js';
import { sendMMS } from './telnyx-mms.service.js';

const TELNYX_BASE_URL = 'https://api.telnyx.com/v2';

// ============================================================================
// TypeScript Interfaces
// ============================================================================

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
  mediaUrl?: string;           // Hero image URL
  mediaHeight?: 'SHORT' | 'MEDIUM' | 'TALL';  // Image height
  suggestions?: RCSSuggestion[];  // Action buttons on the card
}

/**
 * RCS Carousel (multiple swipeable cards)
 */
export interface RCSCarousel {
  cards: RCSRichCard[];
  cardWidth?: 'SMALL' | 'MEDIUM';  // Card width in carousel
}

/**
 * RCS Suggestion (action button or quick reply)
 */
export interface RCSSuggestion {
  type: 'action' | 'reply';
  text: string;                    // Button text
  postbackData?: string;           // Data sent back when clicked
  // For action type:
  action?: {
    type: 'openUrl' | 'dialPhone' | 'showLocation' | 'shareLocation' | 'createCalendarEvent';
    url?: string;                  // For openUrl
    phoneNumber?: string;          // For dialPhone
    latitude?: number;             // For showLocation
    longitude?: number;            // For showLocation
    label?: string;                // Location label
    // Calendar event
    title?: string;
    description?: string;
    startTime?: string;
    endTime?: string;
  };
}

// ============================================================================
// Utility Functions
// ============================================================================

function getTelnyxClient() {
  const apiKey = process.env.TELNYX_API_KEY;
  if (!apiKey) {
    throw new Error('TELNYX_API_KEY not configured');
  }

  return axios.create({
    baseURL: TELNYX_BASE_URL,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
  });
}

/**
 * Log RCS operations for monitoring
 */
function logRCS(operation: string, data: Record<string, any>) {
  console.log(`[TELNYX_RCS] ${operation}`, JSON.stringify({
    timestamp: new Date().toISOString(),
    ...data,
  }));
}

// ============================================================================
// RCS Capability Check
// ============================================================================

/**
 * Check if a phone number supports RCS messaging
 *
 * @param phoneNumber - E.164 formatted phone number
 * @param agentId - RCS Agent ID (from church's RCS registration)
 * @returns RCS capability information
 */
export async function checkRCSCapability(
  phoneNumber: string,
  agentId: string
): Promise<RCSCapability> {
  const startTime = Date.now();

  try {
    logRCS('capability_check_start', { phoneNumber, agentId });

    const client = getTelnyxClient();

    // Telnyx RCS Capabilities Check API
    // GET /rcs/capabilities/{agent_id}/{phone_number}
    const response = await telnyxCircuitBreaker.execute(async () => {
      return await client.get(`/rcs/capabilities/${agentId}/${phoneNumber}`);
    });

    const data = response.data?.data;

    const capability: RCSCapability = {
      phoneNumber,
      rcsEnabled: data?.rcs_enabled ?? false,
      carrierSupportsRCS: data?.carrier_supports_rcs ?? false,
      features: {
        richCards: data?.features?.rich_cards ?? false,
        carousels: data?.features?.carousels ?? false,
        suggestedActions: data?.features?.suggested_actions ?? false,
        suggestedReplies: data?.features?.suggested_replies ?? false,
        mediaAttachments: data?.features?.media_attachments ?? false,
      },
      checkedAt: new Date(),
    };

    logRCS('capability_check_success', {
      phoneNumber,
      rcsEnabled: capability.rcsEnabled,
      duration: Date.now() - startTime,
    });

    return capability;
  } catch (error: any) {
    logRCS('capability_check_error', {
      phoneNumber,
      error: error.message,
      status: error.response?.status,
      duration: Date.now() - startTime,
    });

    // Return disabled capability on error (will fallback to SMS)
    return {
      phoneNumber,
      rcsEnabled: false,
      carrierSupportsRCS: false,
      features: {
        richCards: false,
        carousels: false,
        suggestedActions: false,
        suggestedReplies: false,
        mediaAttachments: false,
      },
      checkedAt: new Date(),
    };
  }
}

// ============================================================================
// RCS Message Sending
// ============================================================================

/**
 * Send an RCS message
 *
 * @param to - Recipient phone number (E.164 format)
 * @param content - Message text content
 * @param agentId - RCS Agent ID
 * @param options - Optional media URL and webhook URL
 * @returns Send result with message ID
 */
export async function sendRCS(
  to: string,
  content: string,
  agentId: string,
  options?: {
    mediaUrl?: string;
    webhookUrl?: string;
  }
): Promise<{ messageId: string; success: boolean }> {
  const startTime = Date.now();

  try {
    logRCS('send_start', { to, agentId, hasMedia: !!options?.mediaUrl });

    const client = getTelnyxClient();

    // Build RCS message payload
    // Telnyx RCS uses the /messages endpoint with RCS-specific parameters
    const payload: Record<string, any> = {
      to,
      from: agentId, // RCS uses agent_id as sender
      type: 'RCS',
      text: content,
    };

    // Add media if provided (HD quality, no compression)
    if (options?.mediaUrl) {
      payload.media_urls = [options.mediaUrl];
    }

    // Add webhook URLs for delivery/read receipts
    const webhookUrl = options?.webhookUrl ||
      `${process.env.BACKEND_URL || 'https://api.koinoniasms.com'}/api/webhooks/telnyx/rcs`;

    payload.webhook_url = webhookUrl;
    payload.webhook_failover_url = webhookUrl;

    const response = await telnyxCircuitBreaker.execute(async () => {
      return await client.post('/messages', payload);
    });

    const messageId = response.data?.data?.id;

    if (!messageId) {
      throw new Error('No message ID returned from Telnyx RCS');
    }

    logRCS('send_success', {
      to,
      messageId,
      duration: Date.now() - startTime,
    });

    return {
      messageId,
      success: true,
    };
  } catch (error: any) {
    logRCS('send_error', {
      to,
      error: error.message,
      status: error.response?.status,
      details: error.response?.data?.errors?.[0]?.detail,
      duration: Date.now() - startTime,
    });

    throw error;
  }
}

// ============================================================================
// RCS Rich Card Sending
// ============================================================================

/**
 * Build Telnyx RCS suggestion payload from our interface
 */
function buildSuggestionPayload(suggestion: RCSSuggestion): Record<string, any> {
  if (suggestion.type === 'reply') {
    return {
      reply: {
        text: suggestion.text,
        postbackData: suggestion.postbackData || suggestion.text,
      },
    };
  }

  // Action type
  const action = suggestion.action;
  if (!action) {
    return {
      reply: {
        text: suggestion.text,
        postbackData: suggestion.postbackData || suggestion.text,
      },
    };
  }

  switch (action.type) {
    case 'openUrl':
      return {
        action: {
          text: suggestion.text,
          postbackData: suggestion.postbackData || suggestion.text,
          openUrlAction: {
            url: action.url,
          },
        },
      };
    case 'dialPhone':
      return {
        action: {
          text: suggestion.text,
          postbackData: suggestion.postbackData || suggestion.text,
          dialAction: {
            phoneNumber: action.phoneNumber,
          },
        },
      };
    case 'showLocation':
      return {
        action: {
          text: suggestion.text,
          postbackData: suggestion.postbackData || suggestion.text,
          viewLocationAction: {
            latLong: {
              latitude: action.latitude,
              longitude: action.longitude,
            },
            label: action.label,
          },
        },
      };
    case 'createCalendarEvent':
      return {
        action: {
          text: suggestion.text,
          postbackData: suggestion.postbackData || suggestion.text,
          createCalendarEventAction: {
            title: action.title,
            description: action.description,
            startTime: action.startTime,
            endTime: action.endTime,
          },
        },
      };
    default:
      return {
        reply: {
          text: suggestion.text,
          postbackData: suggestion.postbackData || suggestion.text,
        },
      };
  }
}

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
export async function sendRichCard(
  to: string,
  agentId: string,
  card: RCSRichCard,
  suggestions?: RCSSuggestion[]
): Promise<{ messageId: string; success: boolean }> {
  const startTime = Date.now();

  try {
    logRCS('send_rich_card_start', { to, agentId, title: card.title });

    const client = getTelnyxClient();

    // Build the standalone card content
    const standaloneCard: Record<string, any> = {
      cardContent: {
        title: card.title,
        description: card.description || '',
      },
    };

    // Add media if provided
    if (card.mediaUrl) {
      standaloneCard.cardContent.media = {
        height: card.mediaHeight || 'MEDIUM',
        contentInfo: {
          fileUrl: card.mediaUrl,
          forceRefresh: false,
        },
      };
    }

    // Add card-level suggestions (buttons on the card)
    if (card.suggestions && card.suggestions.length > 0) {
      standaloneCard.cardContent.suggestions = card.suggestions.map(buildSuggestionPayload);
    }

    // Build the full message payload
    const payload: Record<string, any> = {
      to,
      from: agentId,
      type: 'RCS',
      contentMessage: {
        richCard: {
          standaloneCard,
        },
      },
    };

    // Add standalone suggestions (chips below the card)
    if (suggestions && suggestions.length > 0) {
      payload.contentMessage.suggestions = suggestions.map(buildSuggestionPayload);
    }

    // Webhook URL
    const webhookUrl = `${process.env.BACKEND_URL || 'https://api.koinoniasms.com'}/api/webhooks/telnyx/rcs`;
    payload.webhook_url = webhookUrl;

    const response = await telnyxCircuitBreaker.execute(async () => {
      return await client.post('/messages', payload);
    });

    const messageId = response.data?.data?.id;

    logRCS('send_rich_card_success', {
      to,
      messageId,
      duration: Date.now() - startTime,
    });

    return { messageId, success: true };
  } catch (error: any) {
    logRCS('send_rich_card_error', {
      to,
      error: error.message,
      details: error.response?.data,
      duration: Date.now() - startTime,
    });
    throw error;
  }
}

/**
 * Send an RCS Carousel (multiple swipeable cards)
 *
 * @param to - Recipient phone number
 * @param agentId - RCS Agent ID
 * @param carousel - Carousel configuration with cards
 * @param suggestions - Standalone suggestions below carousel
 */
export async function sendCarousel(
  to: string,
  agentId: string,
  carousel: RCSCarousel,
  suggestions?: RCSSuggestion[]
): Promise<{ messageId: string; success: boolean }> {
  const startTime = Date.now();

  try {
    logRCS('send_carousel_start', { to, agentId, cardCount: carousel.cards.length });

    const client = getTelnyxClient();

    // Build carousel cards
    const carouselCards = carousel.cards.map((card) => {
      const cardContent: Record<string, any> = {
        title: card.title,
        description: card.description || '',
      };

      if (card.mediaUrl) {
        cardContent.media = {
          height: card.mediaHeight || 'MEDIUM',
          contentInfo: {
            fileUrl: card.mediaUrl,
            forceRefresh: false,
          },
        };
      }

      if (card.suggestions && card.suggestions.length > 0) {
        cardContent.suggestions = card.suggestions.map(buildSuggestionPayload);
      }

      return { cardContent };
    });

    // Build payload
    const payload: Record<string, any> = {
      to,
      from: agentId,
      type: 'RCS',
      contentMessage: {
        richCard: {
          carouselCard: {
            cardWidth: carousel.cardWidth || 'MEDIUM',
            cardContents: carouselCards,
          },
        },
      },
    };

    // Add standalone suggestions
    if (suggestions && suggestions.length > 0) {
      payload.contentMessage.suggestions = suggestions.map(buildSuggestionPayload);
    }

    // Webhook URL
    const webhookUrl = `${process.env.BACKEND_URL || 'https://api.koinoniasms.com'}/api/webhooks/telnyx/rcs`;
    payload.webhook_url = webhookUrl;

    const response = await telnyxCircuitBreaker.execute(async () => {
      return await client.post('/messages', payload);
    });

    const messageId = response.data?.data?.id;

    logRCS('send_carousel_success', {
      to,
      messageId,
      cardCount: carousel.cards.length,
      duration: Date.now() - startTime,
    });

    return { messageId, success: true };
  } catch (error: any) {
    logRCS('send_carousel_error', {
      to,
      error: error.message,
      details: error.response?.data,
      duration: Date.now() - startTime,
    });
    throw error;
  }
}

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
export async function sendWithSuggestions(
  to: string,
  content: string,
  agentId: string,
  suggestions: RCSSuggestion[]
): Promise<{ messageId: string; success: boolean }> {
  const startTime = Date.now();

  try {
    logRCS('send_with_suggestions_start', { to, agentId, suggestionCount: suggestions.length });

    const client = getTelnyxClient();

    const payload: Record<string, any> = {
      to,
      from: agentId,
      type: 'RCS',
      text: content,
      contentMessage: {
        text: content,
        suggestions: suggestions.map(buildSuggestionPayload),
      },
    };

    // Webhook URL
    const webhookUrl = `${process.env.BACKEND_URL || 'https://api.koinoniasms.com'}/api/webhooks/telnyx/rcs`;
    payload.webhook_url = webhookUrl;

    const response = await telnyxCircuitBreaker.execute(async () => {
      return await client.post('/messages', payload);
    });

    const messageId = response.data?.data?.id;

    logRCS('send_with_suggestions_success', {
      to,
      messageId,
      duration: Date.now() - startTime,
    });

    return { messageId, success: true };
  } catch (error: any) {
    logRCS('send_with_suggestions_error', {
      to,
      error: error.message,
      details: error.response?.data,
      duration: Date.now() - startTime,
    });
    throw error;
  }
}

// ============================================================================
// RCS with Fallback to SMS/MMS
// ============================================================================

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
export async function sendRCSWithFallback(
  to: string,
  content: string,
  churchId: string,
  options?: {
    mediaUrl?: string;
  }
): Promise<RCSSendResult> {
  const startTime = Date.now();

  try {
    // Get church's RCS agent ID
    const church = await getRegistryPrisma().church.findUnique({
      where: { id: churchId },
      select: {
        rcsAgentId: true,
        dlcBrandId: true,
        telnyxPhoneNumber: true,
      },
    });

    // If no RCS agent configured, skip to SMS/MMS
    if (!church?.rcsAgentId) {
      logRCS('fallback_no_agent', { churchId, to });
      return await sendViaSMSOrMMS(to, content, churchId, options?.mediaUrl, 'No RCS agent configured');
    }

    // Check recipient RCS capability
    const capability = await checkRCSCapability(to, church.rcsAgentId);

    if (!capability.rcsEnabled) {
      logRCS('fallback_not_capable', {
        to,
        carrierSupportsRCS: capability.carrierSupportsRCS,
      });
      return await sendViaSMSOrMMS(to, content, churchId, options?.mediaUrl, 'Recipient does not support RCS');
    }

    // Send via RCS
    const rcsResult = await sendRCS(to, content, church.rcsAgentId, {
      mediaUrl: options?.mediaUrl,
    });

    logRCS('send_via_rcs_success', {
      to,
      churchId,
      messageId: rcsResult.messageId,
      duration: Date.now() - startTime,
    });

    return {
      success: true,
      messageId: rcsResult.messageId,
      channel: 'rcs',
    };
  } catch (error: any) {
    logRCS('rcs_failed_fallback_to_sms', {
      to,
      churchId,
      error: error.message,
    });

    // Fallback to SMS/MMS on RCS failure
    return await sendViaSMSOrMMS(to, content, churchId, options?.mediaUrl, `RCS failed: ${error.message}`);
  }
}

// ============================================================================
// RCS Read Receipt Handling
// ============================================================================

/**
 * Process RCS read receipt webhook
 * Updates message status when recipient reads the message
 *
 * @param messageId - Telnyx message ID
 * @param readAt - Timestamp when message was read
 */
export async function handleRCSReadReceipt(
  messageId: string,
  readAt: Date
): Promise<void> {
  try {
    logRCS('read_receipt_received', { messageId, readAt: readAt.toISOString() });

    // Update message in database
    // Note: This requires finding the message across all tenant databases
    // For now, we'll log and handle in the webhook controller with tenant context

    logRCS('read_receipt_processed', { messageId });
  } catch (error: any) {
    logRCS('read_receipt_error', { messageId, error: error.message });
  }
}

// ============================================================================
// RCS Typing Indicator Handling
// ============================================================================

/**
 * Process RCS typing indicator webhook
 * Updates conversation when recipient starts/stops typing
 *
 * @param conversationId - Conversation ID
 * @param isTyping - Whether recipient is currently typing
 */
export async function handleRCSTypingIndicator(
  phoneNumber: string,
  isTyping: boolean
): Promise<void> {
  try {
    logRCS('typing_indicator_received', { phoneNumber, isTyping });

    // This will be handled in the webhook controller with tenant context
    // The controller will update the conversation's typing state

    logRCS('typing_indicator_processed', { phoneNumber, isTyping });
  } catch (error: any) {
    logRCS('typing_indicator_error', { phoneNumber, error: error.message });
  }
}

// ============================================================================
// RCS Agent Management
// ============================================================================

/**
 * Get RCS agent details for a church
 *
 * @param churchId - Church ID
 * @returns RCS agent configuration or null if not configured
 */
export async function getRCSAgent(churchId: string): Promise<RCSAgentConfig | null> {
  try {
    const church = await getRegistryPrisma().church.findUnique({
      where: { id: churchId },
      select: {
        rcsAgentId: true,
        name: true,
      },
    });

    if (!church?.rcsAgentId) {
      return null;
    }

    return {
      agentId: church.rcsAgentId,
      brandName: church.name,
      logoUrl: undefined, // Logo URL would come from RCS agent configuration in Telnyx
      webhookUrl: `${process.env.BACKEND_URL || 'https://api.koinoniasms.com'}/api/webhooks/telnyx/rcs`,
    };
  } catch (error: any) {
    logRCS('get_agent_error', { churchId, error: error.message });
    return null;
  }
}

/**
 * Validate RCS configuration for a church
 *
 * @param churchId - Church ID
 * @returns Validation result
 */
export async function validateRCSSetup(churchId: string): Promise<{
  configured: boolean;
  agentId: string | null;
  ready: boolean;
  message: string;
}> {
  try {
    const agent = await getRCSAgent(churchId);

    if (!agent) {
      return {
        configured: false,
        agentId: null,
        ready: false,
        message: 'RCS agent not configured. Register for RCS Business Messaging.',
      };
    }

    return {
      configured: true,
      agentId: agent.agentId,
      ready: true,
      message: 'RCS is configured and ready.',
    };
  } catch (error: any) {
    return {
      configured: false,
      agentId: null,
      ready: false,
      message: `RCS validation error: ${error.message}`,
    };
  }
}

// ============================================================================
// High-Level Church Messaging Functions
// ============================================================================

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
export async function sendChurchAnnouncement(
  to: string,
  churchId: string,
  announcement: {
    title: string;
    description: string;
    imageUrl?: string;
    // Optional action buttons
    rsvpUrl?: string;
    websiteUrl?: string;
    phoneNumber?: string;
    location?: {
      latitude: number;
      longitude: number;
      label: string;
    };
    // Optional quick replies
    quickReplies?: string[];  // e.g., ["I'll be there!", "Can't make it", "Maybe"]
  }
): Promise<RCSSendResult> {
  try {
    const church = await getRegistryPrisma().church.findUnique({
      where: { id: churchId },
      select: {
        rcsAgentId: true,
        telnyxPhoneNumber: true,
        name: true,
      },
    });

    // If no RCS agent, fall back to formatted SMS
    if (!church?.rcsAgentId) {
      logRCS('announcement_fallback_no_agent', { churchId, to });
      const smsText = `${announcement.title}\n\n${announcement.description}`;
      return await sendViaSMSOrMMS(to, smsText, churchId, announcement.imageUrl, 'No RCS agent');
    }

    // Check RCS capability
    const capability = await checkRCSCapability(to, church.rcsAgentId);

    if (!capability.rcsEnabled) {
      logRCS('announcement_fallback_not_capable', { to });
      const smsText = `${announcement.title}\n\n${announcement.description}`;
      return await sendViaSMSOrMMS(to, smsText, churchId, announcement.imageUrl, 'Recipient not RCS capable');
    }

    // Build action buttons for the card
    const cardSuggestions: RCSSuggestion[] = [];

    if (announcement.rsvpUrl) {
      cardSuggestions.push({
        type: 'action',
        text: 'RSVP',
        action: { type: 'openUrl', url: announcement.rsvpUrl },
      });
    }

    if (announcement.location) {
      cardSuggestions.push({
        type: 'action',
        text: '📍 Get Directions',
        action: {
          type: 'showLocation',
          latitude: announcement.location.latitude,
          longitude: announcement.location.longitude,
          label: announcement.location.label,
        },
      });
    }

    if (announcement.phoneNumber) {
      cardSuggestions.push({
        type: 'action',
        text: '📞 Call',
        action: { type: 'dialPhone', phoneNumber: announcement.phoneNumber },
      });
    }

    if (announcement.websiteUrl) {
      cardSuggestions.push({
        type: 'action',
        text: '🌐 Website',
        action: { type: 'openUrl', url: announcement.websiteUrl },
      });
    }

    // Build quick reply suggestions
    const quickReplySuggestions: RCSSuggestion[] = (announcement.quickReplies || []).map(text => ({
      type: 'reply',
      text,
      postbackData: text,
    }));

    // Create the rich card
    const card: RCSRichCard = {
      title: announcement.title,
      description: announcement.description,
      mediaUrl: announcement.imageUrl,
      mediaHeight: 'TALL',
      suggestions: cardSuggestions,
    };

    // Send the rich card
    const result = await sendRichCard(to, church.rcsAgentId, card, quickReplySuggestions);

    return {
      success: result.success,
      messageId: result.messageId,
      channel: 'rcs',
    };
  } catch (error: any) {
    logRCS('announcement_error', { to, churchId, error: error.message });

    // Fallback to SMS
    const smsText = `${announcement.title}\n\n${announcement.description}`;
    return await sendViaSMSOrMMS(to, smsText, churchId, announcement.imageUrl, `RCS error: ${error.message}`);
  }
}

/**
 * Internal helper for fallback (also used externally)
 */
async function sendViaSMSOrMMS(
  to: string,
  content: string,
  churchId: string,
  mediaUrl?: string,
  fallbackReason?: string
): Promise<RCSSendResult> {
  try {
    if (mediaUrl) {
      const result = await sendMMS(to, content, churchId, mediaUrl);
      return {
        success: true,
        messageId: result.messageSid,
        channel: 'mms',
        fallbackReason,
      };
    } else {
      const result = await sendSMS(to, content, churchId);
      return {
        success: true,
        messageId: result.messageSid,
        channel: 'sms',
        fallbackReason,
      };
    }
  } catch (error: any) {
    logRCS('sms_mms_fallback_error', { to, churchId, error: error.message });
    return {
      success: false,
      messageId: '',
      channel: mediaUrl ? 'mms' : 'sms',
      fallbackReason: `All channels failed: ${error.message}`,
    };
  }
}

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
export async function sendEventInvitation(
  to: string,
  churchId: string,
  event: {
    title: string;
    description: string;
    imageUrl?: string;
    startTime: string;  // ISO 8601 format
    endTime: string;    // ISO 8601 format
    location?: {
      latitude: number;
      longitude: number;
      label: string;
    };
  }
): Promise<RCSSendResult> {
  try {
    const church = await getRegistryPrisma().church.findUnique({
      where: { id: churchId },
      select: { rcsAgentId: true },
    });

    if (!church?.rcsAgentId) {
      const smsText = `${event.title}\n${event.description}\n\nDate: ${new Date(event.startTime).toLocaleDateString()}`;
      return await sendViaSMSOrMMS(to, smsText, churchId, event.imageUrl, 'No RCS agent');
    }

    const capability = await checkRCSCapability(to, church.rcsAgentId);
    if (!capability.rcsEnabled) {
      const smsText = `${event.title}\n${event.description}\n\nDate: ${new Date(event.startTime).toLocaleDateString()}`;
      return await sendViaSMSOrMMS(to, smsText, churchId, event.imageUrl, 'Not RCS capable');
    }

    // Build card suggestions
    const cardSuggestions: RCSSuggestion[] = [
      {
        type: 'action',
        text: '📅 Add to Calendar',
        action: {
          type: 'createCalendarEvent',
          title: event.title,
          description: event.description,
          startTime: event.startTime,
          endTime: event.endTime,
        },
      },
    ];

    if (event.location) {
      cardSuggestions.push({
        type: 'action',
        text: '📍 Get Directions',
        action: {
          type: 'showLocation',
          latitude: event.location.latitude,
          longitude: event.location.longitude,
          label: event.location.label,
        },
      });
    }

    // Quick replies for RSVP
    const quickReplies: RCSSuggestion[] = [
      { type: 'reply', text: "I'll be there! ✅" },
      { type: 'reply', text: "Can't make it 😢" },
      { type: 'reply', text: 'Maybe' },
    ];

    const card: RCSRichCard = {
      title: event.title,
      description: event.description,
      mediaUrl: event.imageUrl,
      mediaHeight: 'TALL',
      suggestions: cardSuggestions,
    };

    const result = await sendRichCard(to, church.rcsAgentId, card, quickReplies);

    return {
      success: result.success,
      messageId: result.messageId,
      channel: 'rcs',
    };
  } catch (error: any) {
    const smsText = `${event.title}\n${event.description}`;
    return await sendViaSMSOrMMS(to, smsText, churchId, event.imageUrl, error.message);
  }
}

/**
 * Send weekly schedule as a carousel
 *
 * @param to - Recipient phone number
 * @param churchId - Church ID
 * @param events - Array of events for the carousel
 */
export async function sendWeeklySchedule(
  to: string,
  churchId: string,
  events: Array<{
    title: string;
    description: string;
    imageUrl?: string;
    startTime?: string;
    location?: { latitude: number; longitude: number; label: string };
  }>
): Promise<RCSSendResult> {
  try {
    const church = await getRegistryPrisma().church.findUnique({
      where: { id: churchId },
      select: { rcsAgentId: true },
    });

    if (!church?.rcsAgentId || events.length === 0) {
      const smsText = events.map(e => `• ${e.title}: ${e.description}`).join('\n');
      return await sendViaSMSOrMMS(to, `This Week:\n${smsText}`, churchId, undefined, 'No RCS or empty');
    }

    const capability = await checkRCSCapability(to, church.rcsAgentId);
    if (!capability.rcsEnabled) {
      const smsText = events.map(e => `• ${e.title}: ${e.description}`).join('\n');
      return await sendViaSMSOrMMS(to, `This Week:\n${smsText}`, churchId, undefined, 'Not RCS capable');
    }

    // Build carousel cards
    const cards: RCSRichCard[] = events.map(event => {
      const suggestions: RCSSuggestion[] = [];

      if (event.location) {
        suggestions.push({
          type: 'action',
          text: '📍 Directions',
          action: {
            type: 'showLocation',
            latitude: event.location.latitude,
            longitude: event.location.longitude,
            label: event.location.label,
          },
        });
      }

      return {
        title: event.title,
        description: event.description,
        mediaUrl: event.imageUrl,
        mediaHeight: 'MEDIUM',
        suggestions,
      };
    });

    const result = await sendCarousel(to, church.rcsAgentId, { cards, cardWidth: 'MEDIUM' });

    return {
      success: result.success,
      messageId: result.messageId,
      channel: 'rcs',
    };
  } catch (error: any) {
    const smsText = events.map(e => `• ${e.title}`).join('\n');
    return await sendViaSMSOrMMS(to, `This Week:\n${smsText}`, churchId, undefined, error.message);
  }
}
