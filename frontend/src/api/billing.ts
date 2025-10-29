import client from './client';

export interface UsageData {
  branches: number;
  members: number;
  messagesThisMonth: number;
  coAdmins: number;
}

export interface PlanLimits {
  name: string;
  price: number;
  currency: string;
  branches: number;
  members: number;
  messagesPerMonth: number;
  coAdmins: number;
  features: string[];
}

export interface PlanInfo {
  plan: 'starter' | 'growth' | 'pro';
  limits: PlanLimits;
  usage: UsageData;
  remaining: {
    branches: number;
    members: number;
    messagesPerMonth: number;
    coAdmins: number;
  };
}

export interface TrialStatus {
  onTrial: boolean;
  daysRemaining: number;
}

export interface SubscribeResponse {
  success: boolean;
  plan: string;
  subscriptionId: string;
}

/**
 * Get current usage
 */
export async function getUsage(): Promise<UsageData> {
  const response = await client.get('/billing/usage');
  return response.data;
}

/**
 * Get current plan and limits
 */
export async function getPlan(): Promise<PlanInfo> {
  const response = await client.get('/billing/plan');
  return response.data;
}

/**
 * Get trial status
 */
export async function getTrial(): Promise<TrialStatus> {
  const response = await client.get('/billing/trial');
  return response.data;
}

/**
 * Subscribe to a plan
 */
export async function subscribe(
  planName: 'starter' | 'growth' | 'pro',
  paymentMethodId?: string
): Promise<SubscribeResponse> {
  const response = await client.post('/billing/subscribe', {
    planName,
    paymentMethodId,
  });
  return response.data;
}

/**
 * Upgrade/downgrade plan
 */
export async function upgradePlan(
  newPlan: 'starter' | 'growth' | 'pro'
): Promise<SubscribeResponse> {
  const response = await client.put('/billing/upgrade', {
    newPlan,
  });
  return response.data;
}

/**
 * Cancel subscription
 */
export async function cancelSubscription(): Promise<{ success: boolean; message: string }> {
  const response = await client.delete('/billing/cancel');
  return response.data;
}

/**
 * Create payment intent for subscription
 */
export async function createPaymentIntent(
  planName: 'starter' | 'growth' | 'pro'
): Promise<{ clientSecret: string; amount: number; currency: string; plan: string }> {
  const response = await client.post('/billing/payment-intent', {
    planName,
  });
  return response.data;
}
