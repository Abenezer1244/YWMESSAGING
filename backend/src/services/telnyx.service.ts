import axios from 'axios';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const TELNYX_BASE_URL = 'https://api.telnyx.com/v2';

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

    const response = await client.post('/number_orders', orderData);

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
 * Note: Telnyx routes inbound messages via the messaging profile associated with the number
 * This tries multiple approaches to ensure the number is linked
 * IMPORTANT: Phone numbers need time to be indexed in Telnyx's system after purchase
 */
export async function linkPhoneNumberToMessagingProfile(
  phoneNumber: string,
  messagingProfileId: string
): Promise<boolean> {
  try {
    const client = getTelnyxClient();

    console.log(`🔗 Linking phone ${phoneNumber} to messaging profile ${messagingProfileId}...`);

    // Step 1: Get the phone number record with all details
    // Retry up to 5 times with delays as the number might not be immediately available
    let phoneNumberRecord: any = null;
    for (let searchAttempt = 1; searchAttempt <= 5; searchAttempt++) {
      try {
        console.log(`   Search attempt ${searchAttempt}/5: Looking for phone ${phoneNumber} in Telnyx...`);
        const searchResponse = await client.get('/phone_numbers', {
          params: {
            filter: {
              phone_number: phoneNumber,
            },
            limit: 10,
          },
        });

        phoneNumberRecord = searchResponse.data?.data?.[0];
        if (phoneNumberRecord?.id) {
          console.log(`✅ Found phone number ID: ${phoneNumberRecord.id}`);
          console.log(`   Current messaging_profile_id: ${phoneNumberRecord.messaging_profile_id}`);
          break;
        }

        if (searchAttempt < 5) {
          console.warn(`⚠️ Phone number not found yet, waiting 2 seconds before retry...`);
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      } catch (searchError: any) {
        console.error(`⚠️ Search attempt ${searchAttempt} failed:`, searchError.message);
        if (searchAttempt < 5) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }
    }

    if (!phoneNumberRecord?.id) {
      throw new Error(`Phone number ${phoneNumber} not found after 5 search attempts. It may take a few minutes to appear in Telnyx's system.`);
    }

    // Step 2: Try to update the phone number itself to assign the messaging profile
    // This is the most direct way to link a number to a messaging profile
    try {
      console.log(`🔄 Method 1: Updating phone number ${phoneNumberRecord.id} to assign messaging profile...`);
      const updateNumberResponse = await client.patch(`/phone_numbers/${phoneNumberRecord.id}`, {
        messaging_profile_id: messagingProfileId,
      });

      const linkedProfileId = updateNumberResponse.data?.data?.messaging_profile_id;
      if (linkedProfileId === messagingProfileId) {
        console.log(`✅ Phone number linked via Method 1:`, {
          phoneNumber: updateNumberResponse.data?.data?.phone_number,
          messagingProfileId: linkedProfileId,
        });
        return true;
      } else {
        throw new Error(`Phone linked but with wrong profile. Expected: ${messagingProfileId}, Got: ${linkedProfileId}`);
      }
    } catch (method1Error: any) {
      console.warn(`⚠️ Method 1 failed (${method1Error.response?.status}): ${method1Error.response?.data?.errors?.[0]?.detail || method1Error.message}`);
      console.log(`   Response data:`, JSON.stringify(method1Error.response?.data, null, 2));

      // Step 3: Fallback - try updating the messaging profile to include the phone number
      try {
        console.log(`🔄 Method 2: Updating messaging profile to include phone number...`);
        const updateProfileResponse = await client.patch(`/messaging_profiles/${messagingProfileId}`, {
          phone_numbers: [phoneNumber],
        });

        console.log(`✅ Phone number linked via Method 2:`, updateProfileResponse.data?.data?.id);
        return true;
      } catch (method2Error: any) {
        console.warn(`⚠️ Method 2 failed (${method2Error.response?.status}): ${method2Error.response?.data?.errors?.[0]?.detail || method2Error.message}`);
        console.log(`   Response data:`, JSON.stringify(method2Error.response?.data, null, 2));

        // Both methods failed
        console.log(`❌ Both automatic linking methods failed.`);
        console.log(`   To link manually in Telnyx dashboard:`);
        console.log(`   1. Go to Real-Time Communications → Messaging → Phone Numbers`);
        console.log(`   2. Find and click on ${phoneNumber}`);
        console.log(`   3. In the "Messaging profile" dropdown, select your profile`);
        console.log(`   4. Click Save`);
        console.log(`   5. Refresh this page`);

        throw new Error(
          `Failed to link ${phoneNumber} to messaging profile ${messagingProfileId}. ` +
          `Method 1 error: ${method1Error.message}. ` +
          `Method 2 error: ${method2Error.message}. ` +
          `Please link manually in Telnyx dashboard.`
        );
      }
    }
  } catch (error: any) {
    console.error('❌ Telnyx phone number linking error:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });
    const errorMessage = error.response?.data?.errors?.[0]?.detail || error.message || 'Failed to link phone number';
    throw new Error(`Failed to link phone number to messaging profile: ${errorMessage}`);
  }
}
