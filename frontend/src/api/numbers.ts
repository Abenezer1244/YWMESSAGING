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
    webhookId?: string | null;
    verified?: boolean;
    autoLinked?: boolean;
    message?: string;
  };
}

export interface PaymentIntentResponse {
  success: boolean;
  data: {
    clientSecret: string;
    paymentIntentId: string;
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
 * Create payment intent for phone number setup fee
 */
export async function setupPaymentIntent(phoneNumber: string): Promise<PaymentIntentResponse> {
  const response = await client.post('/numbers/setup-payment-intent', {
    phoneNumber,
  });
  return response.data;
}

/**
 * Confirm payment intent with Stripe payment method
 */
export async function confirmPayment(
  paymentIntentId: string,
  paymentMethodId: string
): Promise<{ success: boolean; data: { paymentIntentId: string; status: string } }> {
  const response = await client.post('/numbers/confirm-payment', {
    paymentIntentId,
    paymentMethodId,
  });
  return response.data;
}

/**
 * Purchase a phone number (after payment confirmed)
 */
export async function purchaseNumber(
  phoneNumber: string,
  paymentIntentId: string,
  connectionId?: string
): Promise<PurchaseResponse> {
  const response = await client.post('/numbers/purchase', {
    phoneNumber,
    paymentIntentId,
    connectionId,
  });
  return response.data;
}

/**
 * Get church's current phone number
 *
 * @throws Will throw 404 error if no phone number has been purchased yet
 * The calling code should handle this with a try-catch block
 *
 * Example:
 *   try {
 *     const number = await getCurrentNumber();
 *   } catch (error) {
 *     // No phone number configured - this is expected for new accounts
 *   }
 */
export async function getCurrentNumber(): Promise<CurrentNumber> {
  const response = await client.get('/numbers/current');
  return response.data.data;
}

/**
 * Release/delete church's phone number with soft-delete (30-day recovery window)
 * @param confirm - User confirms they want to delete
 * @param confirmPhone - User types the phone number to confirm
 */
export async function releaseNumber(options?: {
  confirm?: boolean;
  confirmPhone?: string;
}): Promise<{ success: boolean; message: string; data?: any }> {
  const response = await client.delete('/numbers/current', {
    data: options,
  });
  return response.data;
}
