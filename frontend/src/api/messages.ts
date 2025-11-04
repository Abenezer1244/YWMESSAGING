import client from './client';
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
export async function connectTwilio(data: KoinoniaTwilioData): Promise<any> {
  const response = await client.post('/messages/twilio/connect', data);
  return response.data.data;
}

/**
 * Send message to recipients
 */
export async function sendMessage(data: SendMessageData): Promise<SentMessage> {
  const response = await client.post('/messages/messages/send', data);
  return response.data.data;
}

/**
 * Get message history with pagination
 */
export async function getMessageHistory(options: {
  page?: number;
  limit?: number;
  status?: string;
} = {}): Promise<{
  data: SentMessage[];
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

  const response = await client.get(`/messages/messages/history?${params.toString()}`);
  return response.data;
}

/**
 * Get single message details
 */
export async function getMessageDetails(messageId: string): Promise<any> {
  const response = await client.get(`/messages/messages/${messageId}`);
  return response.data.data;
}
