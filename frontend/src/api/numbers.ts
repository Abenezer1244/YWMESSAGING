import client from './client';

export interface PhoneNumber {
  id: string;
  phoneNumber: string;
  formattedNumber: string;
  costPerMinute: number;
  costPerSms: number;
  region: string;
  capabilities: string[];
}

export interface CurrentNumber {
  telnyxPhoneNumber: string;
  telnyxNumberSid: string;
  telnyxVerified: boolean;
  telnyxPurchasedAt: string | null;
}

export interface PurchaseResponse {
  success: boolean;
  data: {
    numberSid: string;
    phoneNumber: string;
    success: boolean;
  };
}

/**
 * Search for available phone numbers
 */
export async function searchAvailableNumbers(options: {
  areaCode?: string;
  state?: string;
  contains?: string;
  quantity?: number;
}): Promise<PhoneNumber[]> {
  const params = new URLSearchParams();
  if (options.areaCode) params.append('areaCode', options.areaCode);
  if (options.state) params.append('state', options.state);
  if (options.contains) params.append('contains', options.contains);
  if (options.quantity) params.append('quantity', options.quantity.toString());

  const response = await client.get(`/numbers/search?${params.toString()}`);
  return response.data.data;
}

/**
 * Purchase a phone number
 */
export async function purchaseNumber(phoneNumber: string, connectionId?: string): Promise<PurchaseResponse> {
  const response = await client.post('/numbers/purchase', {
    phoneNumber,
    connectionId,
  });
  return response.data;
}

/**
 * Get church's current phone number
 */
export async function getCurrentNumber(): Promise<CurrentNumber> {
  const response = await client.get('/numbers/current');
  return response.data.data;
}

/**
 * Release/delete church's phone number
 */
export async function releaseNumber(): Promise<{ success: boolean; message: string }> {
  const response = await client.delete('/numbers/current');
  return response.data;
}
