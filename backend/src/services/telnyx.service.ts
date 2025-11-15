import axios from 'axios';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const TELNYX_BASE_URL = 'https://api.telnyx.com/v2';

// ============================================================================
// TypeScript Interfaces (Phase 4: Type Safety)
// ============================================================================

/**
 * Interface for Telnyx phone number search response
 */
interface PhoneNumberSearchResult {
  id: string;
  phoneNumber: string;
  formattedNumber: string;
  costPerMinute: number;
  costPerSms: number;
  region: string;
  capabilities: string[];
}

/**
 * Interface for Telnyx purchase number request
 */
interface PurchaseNumberRequest {
  phoneNumber: string;
  connectionId?: string;
  customerReference?: string;
}

/**
 * Telnyx Phone Number record from API
 */
interface TelnyxPhoneNumber {
  id: string;
  phone_number: string;
  messaging_profile_id: string | null;
  status: string;
  [key: string]: any;
}

/**
 * Telnyx Messaging Profile record
 */
interface TelnyxMessagingProfile {
  id: string;
  name: string;
  webhook_url: string;
  enabled: boolean;
  phone_numbers?: string[];
  [key: string]: any;
}

/**
 * Linking operation result with metrics
 */
interface LinkingResult {
  success: boolean;
  method: 'direct' | 'profile' | null;
  duration: number;
  phoneNumberId: string;
  messagingProfileId: string;
  phoneNumber: string;
  error?: {
    code: string;
    message: string;
    httpStatus?: number;
  };
}

/**
 * Structured log entry for monitoring
 */
interface LinkingLogEntry {
  timestamp: string;
  churchId?: string;
  phoneNumber: string;
  messagingProfileId: string;
  step: string;
  result: 'success' | 'failure' | 'retry';
  errorCode?: string;
  errorDetails?: string;
  duration: number;
}

// ============================================================================
// Utility Functions (Phase 1: Monitoring & Logging)
// ============================================================================

/**
 * Structured logging for linking operations
 * Outputs JSON format for ELK/Datadog/CloudWatch integration
 */
function logLinkingOperation(entry: LinkingLogEntry) {
  const logLevel = entry.result === 'failure' ? 'error' : 'info';
  const logEntry = {
    ...entry,
    timestamp: new Date().toISOString(),
  };

  if (logLevel === 'error') {
    console.error('[TELNYX_LINKING]', JSON.stringify(logEntry));
  } else {
    console.log('[TELNYX_LINKING]', JSON.stringify(logEntry));
  }
}

/**
 * Validate phone number format (E.164)
 */
function validatePhoneNumber(phoneNumber: string): boolean {
  // E.164 format: +1234567890 or variations
  const e164Regex = /^\+?[1-9]\d{1,14}$/;
  return e164Regex.test(phoneNumber.replace(/\D/g, ''));
}

/**
 * Validate Telnyx ID format (UUID-like)
 */
function validateTelnyxId(id: string): boolean {
  // Telnyx IDs are typically UUIDs or numeric strings
  return /^[a-f0-9\-\d]{8,}$/i.test(id);
}

/**
 * Generate error code for structured logging
 */
function generateErrorCode(status?: number, message?: string): string {
  if (!status) return 'UNKNOWN_ERROR';
  if (status === 422) return 'UNPROCESSABLE_ENTITY_PHONE_NUMBER';
  if (status === 400) return 'BAD_REQUEST_INVALID_FORMAT';
  if (status === 429) return 'RATE_LIMIT_EXCEEDED';
  if (status === 401 || status === 403) return 'AUTHENTICATION_ERROR';
  if (status === 404) return 'NOT_FOUND';
  if (status >= 500) return 'TELNYX_SERVICE_ERROR';
  return 'API_ERROR';
}

// Function to get API key - reads from environment on every call
function getTelnyxClient() {
  const apiKey = process.env.TELNYX_API_KEY;
  if (!apiKey) {
    console.warn('TELNYX_API_KEY environment variable is not set');
  }
  return axios.create({
    baseURL: TELNYX_BASE_URL,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
  });
}

// ============================================================================
// Exports for type reuse
// ============================================================================
export type { LinkingResult, TelnyxPhoneNumber, TelnyxMessagingProfile, LinkingLogEntry };

/**
 * Send SMS via Telnyx
 */
export async function sendSMS(
  to: string,
  message: string,
  churchId: string
): Promise<{ messageSid: string; success: boolean }> {
  // Get church Telnyx credentials
  const church = await prisma.church.findUnique({
    where: { id: churchId },
    select: {
      telnyxPhoneNumber: true,
    },
  });

  if (!church?.telnyxPhoneNumber) {
    throw new Error('Telnyx phone number not configured for this church');
  }

  try {
    const client = getTelnyxClient();
    const response = await client.post('/messages', {
      from: church.telnyxPhoneNumber,
      to: to,
      text: message,
      type: 'SMS',
      webhook_url: `${process.env.BACKEND_URL || 'https://api.koinoniasms.com'}/api/webhooks/telnyx/status`,
      webhook_failover_url: `${process.env.BACKEND_URL || 'https://api.koinoniasms.com'}/api/webhooks/telnyx/status`,
    });

    const messageId = response.data?.data?.id;
    if (!messageId) {
      throw new Error('No message ID returned from Telnyx');
    }

    return {
      messageSid: messageId,
      success: true,
    };
  } catch (error: any) {
    const errorMessage = error.response?.data?.errors?.[0]?.detail || error.message || 'Failed to send SMS';
    throw new Error(`Telnyx error: ${errorMessage}`);
  }
}

/**
 * Validate Telnyx API key
 */
export async function validateTelnyxApiKey(): Promise<boolean> {
  const apiKey = process.env.TELNYX_API_KEY;
  if (!apiKey) {
    console.error('TELNYX_API_KEY is not set in environment variables');
    return false;
  }
  // Simply check if the API key is set. The actual API calls will validate
  // whether the key has the right permissions and is active.
  console.log('Telnyx API key is configured');
  return true;
}

/**
 * Search for available phone numbers
 * Options: areaCode, state, rateCenter, quantity, features
 */
export async function searchAvailableNumbers(options: {
  areaCode?: string;
  state?: string;
  contains?: string;
  quantity?: number;
}): Promise<PhoneNumberSearchResult[]> {
  try {
    const params: Record<string, any> = {
      filter: {
        national_destination_code: options.areaCode,
        administrative_area: options.state,
        contains: options.contains,
      },
      limit: options.quantity || 10,
    };

    // Remove undefined filters
    Object.keys(params.filter).forEach(
      key => params.filter[key] === undefined && delete params.filter[key]
    );

    const client = getTelnyxClient();
    const response = await client.get('/available_phone_numbers', {
      params,
    });

    const numbers = response.data?.data || [];

    // Option 3 pricing: $0.02 per SMS, $0.01 per minute for voice
    const SMS_COST_PER_MESSAGE = 0.02;
    const VOICE_COST_PER_MINUTE = 0.01;

    return numbers.map((num: any) => ({
      id: num.id,
      phoneNumber: num.phone_number,
      formattedNumber: num.phone_number || num.formatted_number, // Use phone_number as primary
      costPerMinute: VOICE_COST_PER_MINUTE,
      costPerSms: SMS_COST_PER_MESSAGE,
      region: `${num.administrative_area || 'US'}, ${num.country_code || 'US'}`, // Provide defaults
      capabilities: num.capabilities || [],
    }));
  } catch (error: any) {
    console.error('Telnyx search error details:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message,
    });
    const errorMessage = error.response?.data?.errors?.[0]?.detail || error.response?.data?.message || error.message || 'Failed to search numbers';
    throw new Error(`Telnyx search error: ${errorMessage}`);
  }
}

/**
 * Purchase a phone number
 */
export async function purchasePhoneNumber(
  phoneNumber: string,
  churchId: string,
  connectionId?: string,
  messagingProfileId?: string
): Promise<{ numberSid: string; phoneNumber: string; success: boolean }> {
  try {
    const client = getTelnyxClient();
    // Use /number_orders endpoint to purchase phone numbers
    const phoneNumberData: Record<string, any> = { phone_number: phoneNumber };

    // Link to messaging profile during purchase if provided
    if (messagingProfileId) {
      phoneNumberData.messaging_profile_id = messagingProfileId;
    }

    const orderData: Record<string, any> = {
      phone_numbers: [phoneNumberData],
      customer_reference: `church_${churchId}`,
    };

    console.log(`📝 Sending number_orders request with data:`, JSON.stringify(orderData, null, 2));
    const response = await client.post('/number_orders', orderData);
    console.log(`📝 Number order response:`, JSON.stringify(response.data?.data, null, 2));

    const data = response.data?.data;
    if (!data?.id) {
      throw new Error('No order ID returned from Telnyx');
    }

    // The phone_numbers array contains the purchased numbers
    const purchasedNumber = data.phone_numbers?.[0];
    if (!purchasedNumber?.phone_number) {
      throw new Error('No phone number returned from Telnyx order');
    }

    // Save to database
    await prisma.church.update({
      where: { id: churchId },
      data: {
        telnyxPhoneNumber: purchasedNumber.phone_number,
        telnyxNumberSid: data.id, // Order ID
        telnyxVerified: true,
        telnyxPurchasedAt: new Date(),
      },
    });

    return {
      numberSid: data.id,
      phoneNumber: purchasedNumber.phone_number,
      success: true,
    };
  } catch (error: any) {
    console.error('Telnyx purchase error details:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message,
      fullError: error,
    });
    const errorMessage = error.response?.data?.errors?.[0]?.detail || error.message || 'Failed to purchase number';
    throw new Error(`Telnyx purchase error: ${errorMessage}`);
  }
}

/**
 * Get details about a phone number owned by the account
 */
export async function getPhoneNumberDetails(numberSid: string): Promise<any> {
  try {
    const client = getTelnyxClient();
    const response = await client.get(`/phone_numbers/${numberSid}`);
    return response.data?.data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.errors?.[0]?.detail || error.message || 'Failed to get number details';
    throw new Error(`Telnyx error: ${errorMessage}`);
  }
}

/**
 * Release/delete a phone number
 */
export async function releasePhoneNumber(numberSid: string, churchId: string): Promise<boolean> {
  try {
    const client = getTelnyxClient();
    await client.delete(`/phone_numbers/${numberSid}`);

    // Clear from database
    await prisma.church.update({
      where: { id: churchId },
      data: {
        telnyxPhoneNumber: null,
        telnyxNumberSid: null,
        telnyxVerified: false,
      },
    });

    return true;
  } catch (error: any) {
    const errorMessage = error.response?.data?.errors?.[0]?.detail || error.message || 'Failed to release number';
    throw new Error(`Telnyx error: ${errorMessage}`);
  }
}

/**
 * Create webhook for incoming messages (auto-setup)
 */
export async function createWebhook(webhookUrl: string): Promise<{ id: string }> {
  try {
    console.log(`🔗 Creating webhook with URL: ${webhookUrl}`);

    const client = getTelnyxClient();

    // First, try to get existing messaging profiles
    let messagingProfileId: string | null = null;
    try {
      const profilesResponse = await client.get('/messaging_profiles');
      const profiles = profilesResponse.data?.data || [];

      console.log(`📋 Found ${profiles.length} existing messaging profiles`);

      // Use the first available profile, or create a new one if none exist
      if (profiles.length > 0) {
        messagingProfileId = profiles[0].id;
        console.log(`✅ Using existing messaging profile: ${messagingProfileId}`);
        console.log(`   Profile details:`, {
          id: profiles[0].id,
          name: profiles[0].name,
          webhook_url: profiles[0].webhook_url,
          enabled: profiles[0].enabled
        });
      }
    } catch (error: any) {
      console.warn('⚠️ Could not fetch existing messaging profiles, will create a new one');
    }

    let response;

    if (messagingProfileId) {
      // Update existing messaging profile with webhook
      console.log(`🔄 Updating messaging profile ${messagingProfileId} with webhook URL: ${webhookUrl}`);
      response = await client.patch(`/messaging_profiles/${messagingProfileId}`, {
        webhook_url: webhookUrl,
        webhook_failover_url: webhookUrl,
        webhook_api_version: '2',
      });

      console.log(`✅ Update response:`, response.data?.data);
    } else {
      // Create new messaging profile with webhook
      console.log(`✨ Creating new messaging profile with webhook URL: ${webhookUrl}`);
      response = await client.post('/messaging_profiles', {
        name: `Koinonia SMS Profile - ${new Date().toISOString()}`,
        enabled: true,
        webhook_url: webhookUrl,
        webhook_failover_url: webhookUrl,
        webhook_api_version: '2',
      });

      console.log(`✅ Creation response:`, response.data?.data);
    }

    const profileId = response.data?.data?.id;
    if (!profileId) {
      throw new Error('No profile ID returned from Telnyx');
    }

    console.log(`✅ Messaging profile webhook configured: ${profileId}`);
    console.log(`   Webhook URL: ${webhookUrl}`);
    return { id: profileId };
  } catch (error: any) {
    console.error('❌ Telnyx messaging profile error:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });
    const errorMessage = error.response?.data?.errors?.[0]?.detail || error.message || 'Failed to configure messaging profile webhook';
    throw new Error(`Failed to auto-create webhook: ${errorMessage}`);
  }
}

/**
 * Delete webhook by ID
 */
export async function deleteWebhook(webhookId: string): Promise<boolean> {
  try {
    const client = getTelnyxClient();
    await client.delete(`/webhooks/${webhookId}`);
    console.log(`✅ Webhook deleted: ${webhookId}`);
    return true;
  } catch (error: any) {
    console.error('Telnyx webhook deletion error:', error.message);
    const errorMessage = error.response?.data?.errors?.[0]?.detail || error.message || 'Failed to delete webhook';
    throw new Error(`Failed to delete webhook: ${errorMessage}`);
  }
}

/**
 * Link phone number to messaging profile for webhook routing
 * Enterprise-grade implementation with validation, monitoring, and structured logging
 *
 * Note: Telnyx routes inbound messages via the messaging profile associated with the number
 * This tries multiple approaches to ensure the number is linked
 * IMPORTANT: Phone numbers need time to be indexed in Telnyx's system after purchase
 */
export async function linkPhoneNumberToMessagingProfile(
  phoneNumber: string,
  messagingProfileId: string,
  churchId?: string
): Promise<LinkingResult> {
  const operationStartTime = Date.now();
  let currentStep = 'validation';

  try {
    // ========================================================================
    // Phase 4: Input Validation
    // ========================================================================
    currentStep = 'validation';

    // Validate phone number format
    if (!phoneNumber || typeof phoneNumber !== 'string') {
      const errorMsg = 'Phone number is required and must be a string';
      logLinkingOperation({
        timestamp: new Date().toISOString(),
        churchId,
        phoneNumber: phoneNumber || 'INVALID',
        messagingProfileId,
        step: currentStep,
        result: 'failure',
        errorCode: 'INVALID_PHONE_NUMBER_TYPE',
        errorDetails: errorMsg,
        duration: Date.now() - operationStartTime,
      });
      throw new Error(errorMsg);
    }

    if (!validatePhoneNumber(phoneNumber)) {
      const errorMsg = `Phone number format invalid. Expected E.164 format (+1234567890), got: ${phoneNumber}`;
      logLinkingOperation({
        timestamp: new Date().toISOString(),
        churchId,
        phoneNumber,
        messagingProfileId,
        step: currentStep,
        result: 'failure',
        errorCode: 'INVALID_PHONE_NUMBER_FORMAT',
        errorDetails: errorMsg,
        duration: Date.now() - operationStartTime,
      });
      throw new Error(errorMsg);
    }

    // Validate messaging profile ID
    if (!messagingProfileId || typeof messagingProfileId !== 'string') {
      const errorMsg = 'Messaging profile ID is required and must be a string';
      logLinkingOperation({
        timestamp: new Date().toISOString(),
        churchId,
        phoneNumber,
        messagingProfileId: messagingProfileId || 'INVALID',
        step: currentStep,
        result: 'failure',
        errorCode: 'INVALID_PROFILE_ID_TYPE',
        errorDetails: errorMsg,
        duration: Date.now() - operationStartTime,
      });
      throw new Error(errorMsg);
    }

    if (!validateTelnyxId(messagingProfileId)) {
      const errorMsg = `Messaging profile ID format invalid. Expected UUID/ID format, got: ${messagingProfileId}`;
      logLinkingOperation({
        timestamp: new Date().toISOString(),
        churchId,
        phoneNumber,
        messagingProfileId,
        step: currentStep,
        result: 'failure',
        errorCode: 'INVALID_PROFILE_ID_FORMAT',
        errorDetails: errorMsg,
        duration: Date.now() - operationStartTime,
      });
      throw new Error(errorMsg);
    }

    const client = getTelnyxClient();

    // ========================================================================
    // Phase 1: Step 1 - Search for phone number record
    // ========================================================================
    currentStep = 'search_phone_number';
    const searchStartTime = Date.now();
    let phoneNumberRecord: TelnyxPhoneNumber | null = null;
    let lastSearchError: any = null;

    for (let searchAttempt = 1; searchAttempt <= 5; searchAttempt++) {
      try {
        logLinkingOperation({
          timestamp: new Date().toISOString(),
          churchId,
          phoneNumber,
          messagingProfileId,
          step: `${currentStep}_attempt_${searchAttempt}`,
          result: 'retry',
          duration: Date.now() - searchStartTime,
        });

        const searchResponse = await client.get('/phone_numbers', {
          params: {
            filter: {
              phone_number: phoneNumber,
            },
            limit: 10,
          },
        });

        phoneNumberRecord = searchResponse.data?.data?.[0];
        if (phoneNumberRecord?.id && validateTelnyxId(phoneNumberRecord.id)) {
          logLinkingOperation({
            timestamp: new Date().toISOString(),
            churchId,
            phoneNumber,
            messagingProfileId,
            step: `${currentStep}_found`,
            result: 'success',
            duration: Date.now() - searchStartTime,
          });
          break;
        }

        if (searchAttempt < 5) {
          // Exponential backoff: 2s, 4s, 8s, 16s, etc.
          const delayMs = Math.pow(2, searchAttempt) * 1000;
          await new Promise(resolve => setTimeout(resolve, delayMs));
        }
      } catch (searchError: any) {
        lastSearchError = searchError;
        const errorCode = generateErrorCode(searchError.response?.status);

        logLinkingOperation({
          timestamp: new Date().toISOString(),
          churchId,
          phoneNumber,
          messagingProfileId,
          step: `${currentStep}_attempt_${searchAttempt}_error`,
          result: 'failure',
          errorCode,
          errorDetails: searchError.message,
          duration: Date.now() - searchStartTime,
        });

        if (searchAttempt < 5) {
          const delayMs = Math.pow(2, searchAttempt) * 1000;
          await new Promise(resolve => setTimeout(resolve, delayMs));
        }
      }
    }

    if (!phoneNumberRecord?.id) {
      const errorMsg = `Phone number ${phoneNumber} not found after 5 search attempts. It may take a few minutes to appear in Telnyx's system.`;
      logLinkingOperation({
        timestamp: new Date().toISOString(),
        churchId,
        phoneNumber,
        messagingProfileId,
        step: 'search_phone_number_failed',
        result: 'failure',
        errorCode: 'PHONE_NUMBER_NOT_FOUND',
        errorDetails: errorMsg,
        duration: Date.now() - operationStartTime,
      });
      throw new Error(errorMsg);
    }

    // ========================================================================
    // Phase 1: Step 2 - Method 1: Direct phone number update
    // ========================================================================
    currentStep = 'method_1_direct_update';
    const method1StartTime = Date.now();

    try {
      logLinkingOperation({
        timestamp: new Date().toISOString(),
        churchId,
        phoneNumber,
        messagingProfileId,
        step: currentStep,
        result: 'retry',
        duration: 0,
      });

      const updateNumberResponse = await client.patch(`/phone_numbers/${phoneNumberRecord.id}`, {
        messaging_profile_id: messagingProfileId,
      });

      const linkedProfileId = updateNumberResponse.data?.data?.messaging_profile_id;
      if (linkedProfileId === messagingProfileId && validateTelnyxId(linkedProfileId)) {
        logLinkingOperation({
          timestamp: new Date().toISOString(),
          churchId,
          phoneNumber,
          messagingProfileId,
          step: currentStep,
          result: 'success',
          duration: Date.now() - method1StartTime,
        });

        return {
          success: true,
          method: 'direct',
          duration: Date.now() - operationStartTime,
          phoneNumberId: phoneNumberRecord.id,
          messagingProfileId: linkedProfileId,
          phoneNumber,
        };
      } else {
        throw new Error(`Phone linked but with wrong profile. Expected: ${messagingProfileId}, Got: ${linkedProfileId}`);
      }
    } catch (method1Error: any) {
      const errorCode = generateErrorCode(method1Error.response?.status);

      logLinkingOperation({
        timestamp: new Date().toISOString(),
        churchId,
        phoneNumber,
        messagingProfileId,
        step: `${currentStep}_failed`,
        result: 'failure',
        errorCode,
        errorDetails: method1Error.message || method1Error.response?.data?.errors?.[0]?.detail,
        duration: Date.now() - method1StartTime,
      });

      // ====================================================================
      // Phase 1: Step 3 - Method 2: Messaging profile update (FIXED)
      // ====================================================================
      currentStep = 'method_2_profile_update';
      const method2StartTime = Date.now();

      try {
        logLinkingOperation({
          timestamp: new Date().toISOString(),
          churchId,
          phoneNumber,
          messagingProfileId,
          step: currentStep,
          result: 'retry',
          duration: 0,
        });

        // CRITICAL FIX: Use phoneNumberRecord.id (the ID) not phoneNumber (the phone string)
        const updateProfileResponse = await client.patch(`/messaging_profiles/${messagingProfileId}`, {
          phone_numbers: [phoneNumberRecord.id],
        });

        const responseProfileId = updateProfileResponse.data?.data?.id;
        if (responseProfileId === messagingProfileId) {
          logLinkingOperation({
            timestamp: new Date().toISOString(),
            churchId,
            phoneNumber,
            messagingProfileId,
            step: currentStep,
            result: 'success',
            duration: Date.now() - method2StartTime,
          });

          return {
            success: true,
            method: 'profile',
            duration: Date.now() - operationStartTime,
            phoneNumberId: phoneNumberRecord.id,
            messagingProfileId,
            phoneNumber,
          };
        } else {
          throw new Error(`Profile update failed: response ID mismatch`);
        }
      } catch (method2Error: any) {
        const errorCode = generateErrorCode(method2Error.response?.status);

        logLinkingOperation({
          timestamp: new Date().toISOString(),
          churchId,
          phoneNumber,
          messagingProfileId,
          step: `${currentStep}_failed`,
          result: 'failure',
          errorCode,
          errorDetails: method2Error.message || method2Error.response?.data?.errors?.[0]?.detail,
          duration: Date.now() - method2StartTime,
        });

        // Both methods failed - prepare comprehensive error for retry logic
        const finalError = {
          success: false,
          method: null as null,
          duration: Date.now() - operationStartTime,
          phoneNumberId: phoneNumberRecord.id,
          messagingProfileId,
          phoneNumber,
          error: {
            code: 'BOTH_LINKING_METHODS_FAILED',
            message: `Method 1 failed: ${method1Error.message}. Method 2 failed: ${method2Error.message}`,
            httpStatus: method2Error.response?.status,
          },
        };

        logLinkingOperation({
          timestamp: new Date().toISOString(),
          churchId,
          phoneNumber,
          messagingProfileId,
          step: 'both_methods_failed',
          result: 'failure',
          errorCode: 'BOTH_LINKING_METHODS_FAILED',
          errorDetails: `Method 1: ${method1Error.message}. Method 2: ${method2Error.message}`,
          duration: finalError.duration,
        });

        return finalError as LinkingResult;
      }
    }
  } catch (error: any) {
    const errorCode = generateErrorCode(error.response?.status);
    const errorMsg = error.message || 'Unknown error during linking';

    logLinkingOperation({
      timestamp: new Date().toISOString(),
      churchId,
      phoneNumber,
      messagingProfileId,
      step: `${currentStep}_unexpected_error`,
      result: 'failure',
      errorCode: errorCode === 'API_ERROR' ? 'UNEXPECTED_ERROR' : errorCode,
      errorDetails: errorMsg,
      duration: Date.now() - operationStartTime,
    });

    return {
      success: false,
      method: null,
      duration: Date.now() - operationStartTime,
      phoneNumberId: '',
      messagingProfileId,
      phoneNumber,
      error: {
        code: errorCode,
        message: errorMsg,
        httpStatus: error.response?.status,
      },
    };
  }
}
