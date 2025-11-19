import { PrismaClient } from '@prisma/client';
import axios from 'axios';

const prisma = new PrismaClient();

/**
 * Telnyx Error Code Mapping
 * Maps error codes from Telnyx API to user-friendly messages
 */
const TELNYX_ERROR_CODES: Record<number, string> = {
  10001: 'Inactive phone number',
  10002: 'Invalid phone number',
  10003: 'Invalid URL - URLs can be max 2000 characters',
  10004: 'Missing required parameter',
  10005: 'Resource not found',
  10006: 'Invalid resource ID',
  10015: 'Bad request - malformed request body',
  10016: 'Phone number must be in +E.164 format',
  10019: 'Invalid email address',
  10023: 'Invalid JSON in request body',
  10032: 'Invalid enumerated value',
  10033: 'Value outside of allowed range',
  20001: 'Invalid API Key secret',
  20002: 'API Key revoked',
  20006: 'Expired access token',
  40010: 'Not 10DLC registered',
  40332: 'Brand cannot be deleted due to associated active campaign',
  40333: 'Messaging profile spend limit reached',
};

/**
 * Validation Rules from Telnyx API Documentation
 */
const VALIDATION_RULES = {
  displayName: { min: 1, max: 100, required: true },
  companyName: { min: 1, max: 100, required: true },
  ein: { min: 9, max: 20, required: true, pattern: /^\d+$/ },
  email: { max: 100, required: true, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
  phone: { max: 20, required: false, pattern: /^\+1\d{10}$/ }, // US format
  street: { max: 100, required: false },
  city: { max: 100, required: false },
  state: { max: 2, required: false, pattern: /^[A-Z]{2}$/ }, // 2-letter state code
  postalCode: { max: 10, required: false, pattern: /^\d{5}$/ }, // 5-digit US zipcode
};

/**
 * Validate brand data before sending to Telnyx
 * Throws descriptive error if validation fails
 */
function validateBrandData(church: any): void {
  const rules = VALIDATION_RULES;

  // Check displayName
  if (!church.name || church.name.length === 0) {
    throw new Error('Church name is required and cannot be empty');
  }
  if (church.name.length > rules.displayName.max) {
    throw new Error(`Church name cannot exceed ${rules.displayName.max} characters (current: ${church.name.length})`);
  }

  // Check email
  if (!church.email || church.email.length === 0) {
    throw new Error('Church email is required');
  }
  if (!rules.email.pattern?.test(church.email)) {
    throw new Error(`Email "${church.email}" is not a valid email address`);
  }
  if (church.email.length > rules.email.max) {
    throw new Error(`Email cannot exceed ${rules.email.max} characters`);
  }

  // Check companyName (same as displayName for churches)
  if (church.name.length > rules.companyName.max) {
    throw new Error(`Company name cannot exceed ${rules.companyName.max} characters`);
  }

  // Note: EIN is optional at phone purchase time, but logged for Phase 5 implementation
  // where churches can upgrade their brand with full 10DLC registration
}

/**
 * Map Telnyx error response to user-friendly message
 */
function mapTelnyxError(error: any): string {
  // Handle API error responses
  if (error.response?.data?.detail) {
    const detail = error.response.data.detail;
    if (Array.isArray(detail) && detail.length > 0) {
      return detail[0].msg || 'Request validation failed';
    }
  }

  // Handle generic API errors
  if (error.response?.status === 422) {
    return 'Request validation failed - check all required fields';
  }

  if (error.response?.status === 401) {
    return 'Authentication failed - check API key configuration';
  }

  if (error.response?.status === 403) {
    return 'Authorization failed - insufficient permissions';
  }

  if (error.response?.status === 429) {
    return 'Rate limit exceeded - please try again in a few moments';
  }

  // Check for known error codes in response
  if (error.response?.data?.code) {
    const errorCode = parseInt(error.response.data.code);
    return TELNYX_ERROR_CODES[errorCode] || `Telnyx error code ${errorCode}`;
  }

  // Fallback
  return error.message || 'Unknown error occurred';
}

/**
 * Retry logic for transient failures
 */
async function retryWithBackoff(
  fn: () => Promise<any>,
  maxRetries: number = 3,
  baseDelayMs: number = 1000
): Promise<any> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      // Check if error is rate limiting (429) or temporary server error (5xx)
      const statusCode = error.response?.status;
      const isTemporary = statusCode === 429 || (statusCode >= 500 && statusCode < 600);

      if (!isTemporary || attempt === maxRetries - 1) {
        throw error; // Don't retry for permanent errors or final attempt
      }

      // Exponential backoff with jitter
      const delayMs = baseDelayMs * Math.pow(2, attempt) + Math.random() * 1000;
      console.log(`⏳ Retrying after ${delayMs}ms (attempt ${attempt + 1}/${maxRetries})...`);
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }
}

/**
 * Get Telnyx API client
 */
function getTelnyxClient() {
  const apiKey = process.env.TELNYX_API_KEY;
  if (!apiKey) {
    throw new Error('TELNYX_API_KEY not configured');
  }

  return axios.create({
    baseURL: 'https://api.telnyx.com/v2',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
  });
}

/**
 * Get webhook URLs for 10DLC notifications
 * These are called by Telnyx when brand/campaign approval status changes
 */
function getWebhookURLs() {
  const baseUrl = process.env.WEBHOOK_BASE_URL || 'https://connect-yw-backend.onrender.com';
  return {
    webhookURL: `${baseUrl}/webhooks/10dlc/status`,
    webhookFailoverURL: `${baseUrl}/webhooks/10dlc/status-failover`,
  };
}

/**
 * Register a church's own 10DLC brand with Telnyx
 * This runs asynchronously after phone purchase to avoid blocking the user
 */
export async function registerPersonal10DLCAsync(
  churchId: string,
  phoneNumber: string
): Promise<void> {
  try {
    console.log(`📝 Starting 10DLC registration for church: ${churchId}`);

    // Get church info
    const church = await prisma.church.findUnique({
      where: { id: churchId },
      select: { name: true, email: true, id: true }
    });

    if (!church) {
      console.error(`❌ Church not found: ${churchId}`);
      return;
    }

    // Validate church data before sending to Telnyx
    try {
      validateBrandData(church);
      console.log(`✅ Church data validation passed`);
    } catch (validationError: any) {
      console.error(`❌ Validation error: ${validationError.message}`);
      await prisma.church.update({
        where: { id: churchId },
        data: {
          dlcStatus: 'rejected',
          dlcRejectionReason: `Validation error: ${validationError.message}`,
        },
      }).catch(err => {
        console.error('Failed to update church status:', err);
      });
      return;
    }

    const client = getTelnyxClient();
    const webhooks = getWebhookURLs();

    // Register brand with Telnyx using retry logic
    console.log(`📤 Submitting 10DLC brand to Telnyx: "${church.name}"`);

    const brandResponse = await retryWithBackoff(async () => {
      return await client.post('/10dlc/brand', {
        entityType: 'NON_PROFIT', // Churches are non-profit organizations
        displayName: church.name,
        country: 'US',
        email: church.email,
        vertical: 'RELIGION', // Vertical market
        companyName: church.name, // Required for NON_PROFIT
        webhookURL: webhooks.webhookURL,
        webhookFailoverURL: webhooks.webhookFailoverURL,
      });
    });

    const brandId = brandResponse.data?.brandId;
    if (!brandId) {
      console.error('❌ No brand ID returned from Telnyx');
      console.error('Response:', JSON.stringify(brandResponse.data, null, 2));

      await prisma.church.update({
        where: { id: churchId },
        data: {
          dlcStatus: 'rejected',
          dlcRejectionReason: 'No brand ID returned from Telnyx API',
        },
      }).catch(err => {
        console.error('Failed to update church status:', err);
      });
      return;
    }

    console.log(`✅ Brand registered with Telnyx: ${brandId}`);

    // Store brand ID and mark as pending
    await prisma.church.update({
      where: { id: churchId },
      data: {
        dlcBrandId: brandId,
        dlcStatus: 'pending',
        dlcRegisteredAt: new Date(),
        dlcNextCheckAt: new Date(Date.now() + 15 * 60 * 1000), // Check in 15 minutes
      },
    });

    console.log(`✅ Church ${church.name} (${churchId}) registered for 10DLC`);
    console.log(`   Brand ID: ${brandId}`);
    console.log(`   Next check: 15 minutes`);

    // Start checking approval status
    scheduleApprovalCheck(churchId);

  } catch (error: any) {
    // Map Telnyx error to user-friendly message
    const userFriendlyError = mapTelnyxError(error);
    console.error(`❌ Error registering 10DLC for church ${churchId}:`, userFriendlyError);

    if (error.response?.data) {
      console.error('Full Telnyx response:', JSON.stringify(error.response.data, null, 2));
    }

    // Mark as failed but don't crash the system
    await prisma.church.update({
      where: { id: churchId },
      data: {
        dlcStatus: 'rejected',
        dlcRejectionReason: userFriendlyError,
      },
    }).catch(err => {
      console.error('Failed to update church error status:', err);
    });
  }
}

/**
 * Auto-create a campaign for a church after their brand is verified
 * This runs asynchronously when the brand verification webhook arrives
 */
export async function createCampaignAsync(churchId: string): Promise<void> {
  try {
    console.log(`📋 Starting campaign creation for church: ${churchId}`);

    // Get church info
    const church = await prisma.church.findUnique({
      where: { id: churchId },
      select: { name: true, dlcBrandId: true, id: true }
    });

    if (!church) {
      console.error(`❌ Church not found: ${churchId}`);
      return;
    }

    if (!church.dlcBrandId) {
      console.error(`❌ Church ${churchId} has no brand ID`);
      return;
    }

    const client = getTelnyxClient();

    // Create campaign for notifications use case with retry logic
    console.log(`📤 Creating campaign for ${church.name} (Brand: ${church.dlcBrandId})`);

    const campaignResponse = await retryWithBackoff(async () => {
      return await client.post('/10dlc/campaignBuilder', {
        // Required fields
        brandId: church.dlcBrandId,
        description: `${church.name} Notification Campaign`,
        usecase: 'NOTIFICATIONS', // Churches send notifications/announcements
        termsAndConditions: true,

        // Opt-in configuration (required for many use cases)
        subscriberOptin: true,
        optinKeywords: 'START,JOIN',
        optinMessage: 'You have been added to our mailing list. Reply STOP to unsubscribe.',

        // Opt-out configuration (CTIA requirement)
        subscriberOptout: true,
        optoutKeywords: 'STOP,UNSUBSCRIBE',
        optoutMessage: 'You have been unsubscribed. You will no longer receive messages from us.',

        // Help configuration
        subscriberHelp: true,
        helpKeywords: 'HELP,INFO',
        helpMessage: 'For help, please visit our website or contact support.',

        // Sample messages (churches typically send announcements and events)
        sample1: 'Sunday service at 10 AM. Join us for worship and fellowship.',
        sample2: 'Holiday event this weekend. Bring your family!',
        sample3: 'Prayer meeting scheduled for Wednesday evening at 6 PM.',
        sample4: 'Volunteer opportunity: Help us with community outreach.',
        sample5: 'Your giving record and donation history is available online.',
      });
    });

    const campaignId = campaignResponse.data?.campaignId;
    if (!campaignId) {
      console.error('❌ No campaign ID returned from Telnyx');
      console.error('Response:', JSON.stringify(campaignResponse.data, null, 2));

      await prisma.church.update({
        where: { id: churchId },
        data: {
          dlcStatus: 'rejected',
          dlcRejectionReason: 'No campaign ID returned from Telnyx API',
        },
      }).catch(err => {
        console.error('Failed to update church status:', err);
      });
      return;
    }

    console.log(`✅ Campaign created: ${campaignId}`);

    // Store campaign ID and mark as pending
    await prisma.church.update({
      where: { id: churchId },
      data: {
        dlcStatus: 'campaign_pending',
        dlcCampaignId: campaignId,
        dlcCampaignStatus: 'TCR_PENDING',
      },
    });

    console.log(`✅ Campaign ${campaignId} created for ${church.name}`);
    console.log(`   Status: Pending approval from carriers`);
    console.log(`   Opt-in keywords: START, JOIN`);
    console.log(`   Opt-out keywords: STOP, UNSUBSCRIBE`);

  } catch (error: any) {
    // Map Telnyx error to user-friendly message
    const userFriendlyError = mapTelnyxError(error);
    console.error(`❌ Error creating campaign for church ${churchId}:`, userFriendlyError);

    if (error.response?.data) {
      console.error('Full Telnyx response:', JSON.stringify(error.response.data, null, 2));
    }

    // Mark as failed but don't crash the system
    await prisma.church.update({
      where: { id: churchId },
      data: {
        dlcStatus: 'rejected',
        dlcRejectionReason: userFriendlyError,
      },
    }).catch(err => {
      console.error('Failed to update church error status:', err);
    });
  }
}

/**
 * Check 10DLC approval status and migrate to per-church brand when approved
 * NOTE: With webhooks enabled, this function is mostly a safety net.
 * Real-time updates come via webhook notifications from Telnyx.
 * This still runs periodically to catch any missed webhooks.
 */
export async function checkAndMigrateToPer10DLC(): Promise<void> {
  try {
    console.log('🔍 Checking 10DLC approval statuses (webhook safety check)...');

    // Find churches with pending 10DLC that are due for checking
    const pendingChurches = await prisma.church.findMany({
      where: {
        dlcStatus: 'pending',
        dlcBrandId: { not: null },
        dlcNextCheckAt: { lte: new Date() }, // Due for checking
      },
      select: {
        id: true,
        name: true,
        dlcBrandId: true,
        telnyxPhoneNumber: true,
      },
    });

    console.log(`Found ${pendingChurches.length} churches to check`);

    if (pendingChurches.length === 0) {
      return;
    }

    const client = getTelnyxClient();

    for (const church of pendingChurches) {
      try {
        // Check brand status with Telnyx
        const response = await client.get(`/10dlc/brand/${church.dlcBrandId}`);
        const status = response.data?.status;
        const identityStatus = response.data?.identityStatus;

        console.log(`  Church: ${church.name} - Status: ${status}, Identity: ${identityStatus}`);

        if (status === 'OK' && identityStatus === 'VERIFIED') {
          // UPGRADE to per-church brand!
          console.log(`✅ APPROVED! Migrating ${church.name} to per-church 10DLC`);

          await prisma.church.update({
            where: { id: church.id },
            data: {
              dlcStatus: 'approved',
              dlcApprovedAt: new Date(),
              usingSharedBrand: false, // NOW use their personal brand
              deliveryRate: 0.99, // Upgrade to 99% delivery
            },
          });

          // Notify admin (optional - can send email here)
          console.log(`   🎉 ${church.name} is now optimized for maximum delivery!`);

        } else if (status === 'REGISTRATION_FAILED') {
          // Approval was rejected
          console.log(`❌ REJECTED! ${church.name} - keeping shared brand`);

          const failureReasons = response.data?.failureReasons || 'Unknown reason';

          await prisma.church.update({
            where: { id: church.id },
            data: {
              dlcStatus: 'rejected',
              dlcRejectionReason: failureReasons,
              // Keep using shared brand
            },
          });

        } else if (status === 'REGISTRATION_PENDING') {
          // Still pending, reschedule check for later
          await prisma.church.update({
            where: { id: church.id },
            data: {
              dlcNextCheckAt: new Date(Date.now() + 30 * 60 * 1000), // Check again in 30 minutes
            },
          });
        }
      } catch (error: any) {
        console.error(`   ⚠️  Error checking ${church.name}:`, error.message);
        // Continue with next church
      }
    }

    console.log('✅ Approval check completed');

  } catch (error: any) {
    console.error('❌ Error in approval check job:', error.message);
  }
}

/**
 * Schedule periodic approval checks (for future use with job queue)
 */
function scheduleApprovalCheck(churchId: string): void {
  // This is a placeholder for future implementation
  // In production, this would schedule a background job (e.g., Bull, RabbitMQ)
  // For now, the check happens naturally when checkAndMigrateToPer10DLC runs

  console.log(`📅 Scheduled approval check for church ${churchId}`);
}

/**
 * Export functions that can be called from controllers or scheduled jobs
 */
export { checkAndMigrateToPer10DLC as checkDLCApprovalStatus };
