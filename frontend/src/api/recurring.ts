import client from './client';

export interface RecurringMessage {
  id: string;
  churchId: string;
  name: string;
  content: string;
  targetType: 'individual' | 'groups' | 'branches' | 'all';
  targetIds: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  dayOfWeek?: number;
  timeOfDay?: string;
  nextSendAt: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRecurringMessageData {
  name: string;
  content: string;
  targetType: 'individual' | 'groups' | 'branches' | 'all';
  targetIds?: string[];
  frequency: 'daily' | 'weekly' | 'monthly';
  dayOfWeek?: number;
  timeOfDay: string;
}

/**
 * Get all recurring messages
 */
export async function getRecurringMessages(): Promise<RecurringMessage[]> {
  const response = await client.get('/recurring/recurring-messages');
  return response.data;
}

/**
 * Create recurring message
 */
export async function createRecurringMessage(
  data: CreateRecurringMessageData
): Promise<RecurringMessage> {
  const response = await client.post('/recurring/recurring-messages', data);
  return response.data;
}

/**
 * Update recurring message
 */
export async function updateRecurringMessage(
  messageId: string,
  data: Partial<CreateRecurringMessageData>
): Promise<RecurringMessage> {
  const response = await client.put(`/recurring/recurring-messages/${messageId}`, data);
  return response.data;
}

/**
 * Delete recurring message
 */
export async function deleteRecurringMessage(messageId: string): Promise<any> {
  const response = await client.delete(`/recurring/recurring-messages/${messageId}`);
  return response.data;
}

/**
 * Toggle recurring message active status
 */
export async function toggleRecurringMessage(
  messageId: string,
  isActive: boolean
): Promise<RecurringMessage> {
  const response = await client.put(`/recurring/recurring-messages/${messageId}/toggle`, {
    isActive,
  });
  return response.data;
}
