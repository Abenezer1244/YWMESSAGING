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
}

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
 */
export async function replyToConversation(
  conversationId: string,
  content: string
): Promise<ConversationMessage> {
  const response = await client.post(
    `/messages/conversations/${conversationId}/reply`,
    { content }
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
