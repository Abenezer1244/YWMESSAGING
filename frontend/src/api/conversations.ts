import client from './client';

export interface Conversation {
  id: string;
  churchId: string;
  memberId: string;
  member: {
    id: string;
    firstName: string;
    lastName: string;
    phone: string;
  };
  lastMessageAt: string;
  status: 'open' | 'closed' | 'archived';
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
  // RCS (iMessage-style) fields
  recipientRcsCapable?: boolean;  // Whether recipient supports RCS
  isTyping?: boolean;             // Typing indicator from member
  lastTypingAt?: string | null;   // When typing indicator was last received
}

// Message reaction (iMessage-style)
export interface MessageReaction {
  id: string;
  emoji: string;  // ❤️ 👍 👎 😂 😮 😢
  reactedBy: string;  // "church" or member ID
  createdAt: string;
}

// Send effect types (iMessage-style)
export type SendEffect = 'slam' | 'loud' | 'gentle' | 'invisibleInk' | 'none';

export interface ConversationMessage {
  id: string;
  conversationId: string;
  content: string;
  direction: 'inbound' | 'outbound';
  memberName?: string;
  deliveryStatus?: 'pending' | 'delivered' | 'failed' | null;
  mediaUrl?: string | null;
  mediaType?: 'image' | 'video' | 'audio' | 'document' | null;
  mediaName?: string | null;
  mediaSizeBytes?: number | null;
  mediaDuration?: number | null;
  createdAt: string;
  // RCS (iMessage-style) fields
  channel?: 'sms' | 'mms' | 'rcs';  // Message delivery channel
  rcsReadAt?: string | null;        // When recipient read the message (RCS only)
  // Reply threading (iMessage-style)
  replyToId?: string | null;        // ID of message being replied to
  replyTo?: {                       // Preview of replied message
    id: string;
    content: string;
    direction: 'inbound' | 'outbound';
  } | null;
  // Reactions (iMessage-style)
  reactions?: MessageReaction[];
  // Send effect animation (iMessage-style)
  sendEffect?: SendEffect | null;
}

/**
 * Get all conversations for the church
 */
export async function getConversations(options: {
  page?: number;
  limit?: number;
  status?: 'open' | 'closed' | 'archived';
} = {}): Promise<{
  data: Conversation[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}> {
  const params = new URLSearchParams();
  if (options.page) params.append('page', options.page.toString());
  if (options.limit) params.append('limit', options.limit.toString());
  if (options.status) params.append('status', options.status);

  const response = await client.get(`/messages/conversations?${params.toString()}`);
  return response.data;
}

/**
 * Get single conversation with messages
 */
export async function getConversation(
  conversationId: string,
  options: { page?: number; limit?: number } = {}
): Promise<{
  conversation: Conversation;
  messages: ConversationMessage[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}> {
  const params = new URLSearchParams();
  if (options.page) params.append('page', options.page.toString());
  if (options.limit) params.append('limit', options.limit.toString());

  const response = await client.get(
    `/messages/conversations/${conversationId}?${params.toString()}`
  );
  return response.data;
}

/**
 * Reply to conversation with text only
 * Supports reply threading (replyToId) and send effects (sendEffect)
 */
export async function replyToConversation(
  conversationId: string,
  content: string,
  options?: {
    replyToId?: string;
    sendEffect?: SendEffect;
  }
): Promise<ConversationMessage> {
  const response = await client.post(
    `/messages/conversations/${conversationId}/reply`,
    {
      content,
      replyToId: options?.replyToId,
      sendEffect: options?.sendEffect,
    }
  );
  return response.data;
}

/**
 * Reply to conversation with media
 */
export async function replyWithMedia(
  conversationId: string,
  file: File,
  content?: string
): Promise<ConversationMessage> {
  const formData = new FormData();
  formData.append('file', file);
  if (content) {
    formData.append('content', content);
  }

  const response = await client.post(
    `/messages/conversations/${conversationId}/reply-with-media`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );
  return response.data;
}

/**
 * Mark conversation as read
 */
export async function markConversationAsRead(
  conversationId: string
): Promise<void> {
  await client.patch(
    `/messages/conversations/${conversationId}/read`
  );
}

/**
 * Update conversation status
 */
export async function updateConversationStatus(
  conversationId: string,
  status: 'open' | 'closed' | 'archived'
): Promise<Conversation> {
  const response = await client.patch(
    `/messages/conversations/${conversationId}/status`,
    { status }
  );
  return response.data;
}

/**
 * Add reaction to a message (iMessage-style)
 */
export async function addReaction(
  conversationId: string,
  messageId: string,
  emoji: string
): Promise<MessageReaction> {
  const response = await client.post(
    `/messages/conversations/${conversationId}/messages/${messageId}/reactions`,
    { emoji }
  );
  return response.data;
}

/**
 * Remove reaction from a message (iMessage-style)
 */
export async function removeReaction(
  conversationId: string,
  messageId: string,
  emoji: string
): Promise<void> {
  await client.delete(
    `/messages/conversations/${conversationId}/messages/${messageId}/reactions/${encodeURIComponent(emoji)}`
  );
}
