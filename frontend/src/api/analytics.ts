import client from './client';

export interface MessageStats {
  totalMessages: number;
  deliveredCount: number;
  failedCount: number;
  deliveryRate: number;
  pendingCount: number;
  byDay: Array<{
    date: string;
    count: number;
    delivered: number;
    failed: number;
  }>;
}

export interface BranchStats {
  id: string;
  name: string;
  memberCount: number;
  messageCount: number;
  deliveryRate: number;
  groupCount: number;
}

export interface SummaryStats {
  totalMessages: number;
  averageDeliveryRate: number;
  totalMembers: number;
  totalBranches: number;
  totalGroups: number;
}

/**
 * Get message statistics
 */
export async function getMessageStats(options: {
  days?: number;
} = {}): Promise<MessageStats> {
  const params = new URLSearchParams();
  if (options.days) {
    params.append('days', options.days.toString());
  }

  const response = await client.get(`/analytics/messages?${params.toString()}`);
  return response.data;
}

/**
 * Get branch comparison statistics
 */
export async function getBranchStats(): Promise<BranchStats[]> {
  const response = await client.get('/analytics/branches');
  return response.data;
}

/**
 * Get overall summary statistics
 */
export async function getSummaryStats(): Promise<SummaryStats> {
  const response = await client.get('/analytics/summary');
  return response.data;
}
