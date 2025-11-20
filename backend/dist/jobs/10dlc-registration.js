import { PrismaClient } from '@prisma/client';
import axios from 'axios';
const prisma = new PrismaClient();
/**
 * Telnyx Error Code Mapping
 * Maps error codes from Telnyx API to user-friendly messages
 */
const TELNYX_ERROR_CODES = {
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
 * Supported Brand Types for Telnyx 10DLC Registration
 * SOLE_PROPRIETOR is NOT supported per Telnyx support (20 Nov 2025)
 */
const SUPPORTED_ENTITY_TYPES = [
    'NON_PROFIT', // ✓ Supported - for churches/nonprofits
    'PRIVATE_CORPORATION', // ✓ Supported
    'PUBLIC_CORPORATION', // ✓ Supported
    'GOVERNMENT_ENTITY', // ✓ Supported
    // Not supported:
    // 'SOLE_PROPRIETOR',       // ✗ NOT SUPPORTED per Telnyx
];
/**
 * Validation Rules from Telnyx API Documentation
 * Required fields for 10DLC brand registration per Telnyx UI form
 */
const VALIDATION_RULES = {
    // Church identity
    displayName: { min: 1, max: 100, required: true },
    companyName: { min: 1, max: 100, required: true },
    // 10DLC Required Fields
    ein: { min: 9, max: 20, required: true, pattern: /^\d+$/ },
    email: { max: 100, required: true, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
    brandPhoneNumber: { max: 20, required: true, pattern: /^\+1\d{10}$/ }, // Brand contact phone (US format)
    // Business Address (All required per Telnyx form)
    streetAddress: { max: 100, required: true },
    city: { max: 100, required: true },
    state: { max: 2, required: true, pattern: /^[A-Z]{2}$/ }, // 2-letter state code
    postalCode: { max: 10, required: true, pattern: /^\d{5}(-\d{4})?$/ }, // 5 or 9-digit US zipcode
    // Optional
    website: { max: 2000, required: false },
    entityType: { required: false }, // NON_PROFIT, PRIVATE_CORPORATION, PUBLIC_CORPORATION, GOVERNMENT_ENTITY
    vertical: { required: false }, // RELIGION, EDUCATION, HEALTHCARE, etc.
};
/**
 * Validate brand data before sending to Telnyx
 * Throws descriptive error if any required field is missing or invalid
 */
function validateBrandData(church) {
    const rules = VALIDATION_RULES;
    // Helper: Validate string field
    function validateField(fieldName, value, rule) {
        const fieldLabel = fieldName
            .replace(/([A-Z])/g, ' $1')
            .replace(/^./, (s) => s.toUpperCase())
            .trim();
        if (rule.required && !value) {
            throw new Error(`${fieldLabel} is required`);
        }
        if (value) {
            if (rule.min && value.length < rule.min) {
                throw new Error(`${fieldLabel} must be at least ${rule.min} characters`);
            }
            if (rule.max && value.length > rule.max) {
                throw new Error(`${fieldLabel} cannot exceed ${rule.max} characters (current: ${value.length})`);
            }
            if (rule.pattern && !rule.pattern.test(value)) {
                throw new Error(`${fieldLabel} format is invalid: "${value}"`);
            }
        }
    }
    // Validate church name (displayName)
    validateField('displayName', church.name, rules.displayName);
    // Validate company name (usually same as displayName for churches)
    validateField('companyName', church.name, rules.companyName);
    // Validate email
    validateField('email', church.email, rules.email);
    // 10DLC Required Fields
    validateField('ein', church.ein, rules.ein);
    validateField('brandPhoneNumber', church.brandPhoneNumber, rules.brandPhoneNumber);
    // Business Address (All required)
    validateField('streetAddress', church.streetAddress, rules.streetAddress);
    validateField('city', church.city, rules.city);
    validateField('state', church.state, rules.state);
    validateField('postalCode', church.postalCode, rules.postalCode);
    // Optional fields
    if (church.website) {
        validateField('website', church.website, rules.website);
    }
}
/**
 * Map Telnyx error response to user-friendly message
 */
function mapTelnyxError(error) {
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
    // ✅ IMPROVED: Generic fallback based on HTTP status code
    // This avoids leaking error.message which could contain sensitive information
    if (error.response?.status) {
        const status = error.response.status;
        if (status >= 500) {
            return 'Telnyx API server error - please try again in a few moments';
        }
        if (status >= 400) {
            return 'Invalid request to Telnyx API - please verify your information';
        }
    }
    // Safe fallback - never exposes raw error.message
    return 'Unable to process Telnyx request - please try again later';
}
/**
 * Retry logic for transient failures
 */
async function retryWithBackoff(fn, maxRetries = 3, baseDelayMs = 1000) {
    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            return await fn();
        }
        catch (error) {
            // CRITICAL FIX: Also retry on network errors (no response = network issue)
            const statusCode = error.response?.status;
            const isNetworkError = !error.response; // Network errors have no response object
            const isTemporary = isNetworkError || statusCode === 429 || (statusCode >= 500 && statusCode < 600);
            if (!isTemporary || attempt === maxRetries - 1) {
                throw error; // Don't retry for permanent errors or final attempt
            }
            // Exponential backoff with jitter
            const delayMs = baseDelayMs * Math.pow(2, attempt) + Math.random() * 1000;
            const errorType = isNetworkError ? 'network error' : `HTTP ${statusCode}`;
            console.log(`⏳ Retrying after ${delayMs}ms (attempt ${attempt + 1}/${maxRetries}) - ${errorType}...`);
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
        webhookURL: `${baseUrl}/api/webhooks/10dlc/status`,
        webhookFailoverURL: `${baseUrl}/api/webhooks/10dlc/status-failover`,
    };
}
/**
 * Register a church's own 10DLC brand with Telnyx
 * This runs asynchronously after phone purchase to avoid blocking the user
 */
export async function registerPersonal10DLCAsync(churchId, phoneNumber) {
    try {
        console.log(`📝 Starting 10DLC registration for church: ${churchId}`);
        // Get church info (including 10DLC brand data)
        const church = await prisma.church.findUnique({
            where: { id: churchId },
            select: {
                id: true,
                name: true,
                email: true,
                ein: true,
                brandPhoneNumber: true,
                streetAddress: true,
                city: true,
                state: true,
                postalCode: true,
                website: true,
                entityType: true,
                vertical: true,
            }
        });
        if (!church) {
            console.error(`❌ Church not found: ${churchId}`);
            return;
        }
        // Validate church data before sending to Telnyx
        try {
            validateBrandData(church);
            console.log(`✅ Church data validation passed`);
        }
        catch (validationError) {
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
        // CRITICAL FIX: Validate entityType - only supported types allowed
        // Telnyx support confirmed SOLE_PROPRIETOR is NOT supported (20 Nov 2025)
        let validatedEntityType = church.entityType || 'NON_PROFIT';
        if (!SUPPORTED_ENTITY_TYPES.includes(validatedEntityType)) {
            console.warn(`⚠️ Entity type "${validatedEntityType}" is not supported by Telnyx. ` +
                `Defaulting to "NON_PROFIT" for church registration.`);
            validatedEntityType = 'NON_PROFIT'; // Default to NON_PROFIT for churches
        }
        const brandResponse = await retryWithBackoff(async () => {
            return await client.post('/10dlc/brand', {
                // Required fields
                entityType: validatedEntityType,
                displayName: church.name,
                country: 'US',
                email: church.email,
                vertical: church.vertical === 'RELIGION' ? 'NGO' : (church.vertical || 'NGO'), // Convert RELIGION to NGO (only valid Telnyx value)
                companyName: church.name,
                // 10DLC Required Fields (per Telnyx form)
                ein: church.ein,
                ...(church.brandPhoneNumber && { phone: church.brandPhoneNumber }), // Optional in Telnyx API but we provide it
                ...(church.streetAddress && { street: church.streetAddress }),
                ...(church.city && { city: church.city }),
                ...(church.state && { state: church.state }),
                postalCode: church.postalCode, // REQUIRED - must always send, not conditional (correct field name for Telnyx)
                // Optional
                ...(church.website && { website: church.website }),
                // Webhook URLs
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
    }
    catch (error) {
        // Map Telnyx error to user-friendly message
        const userFriendlyError = mapTelnyxError(error);
        console.error(`❌ Error registering 10DLC for church ${churchId}:`, userFriendlyError);
        // Log detailed Telnyx error for debugging
        if (error.response?.data) {
            console.error(`   Telnyx API Response:`, JSON.stringify(error.response.data, null, 2));
        }
        if (error.response?.status) {
            console.error(`   HTTP Status: ${error.response.status}`);
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
export async function createCampaignAsync(churchId) {
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
    }
    catch (error) {
        // Map Telnyx error to user-friendly message
        const userFriendlyError = mapTelnyxError(error);
        console.error(`❌ Error creating campaign for church ${churchId}:`, userFriendlyError);
        // MEDIUM FIX: Complete the error logging block to show API response details
        if (error.response?.data) {
            console.error(`   Telnyx API Response:`, JSON.stringify(error.response.data, null, 2));
        }
        if (error.response?.status) {
            console.error(`   HTTP Status: ${error.response.status}`);
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
export async function checkAndMigrateToPer10DLC() {
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
                }
                else if (status === 'REGISTRATION_FAILED') {
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
                }
                else if (status === 'REGISTRATION_PENDING') {
                    // Still pending, reschedule check for later
                    await prisma.church.update({
                        where: { id: church.id },
                        data: {
                            dlcNextCheckAt: new Date(Date.now() + 30 * 60 * 1000), // Check again in 30 minutes
                        },
                    });
                }
            }
            catch (error) {
                console.error(`   ⚠️  Error checking ${church.name}:`, error.message);
                // Continue with next church
            }
        }
        console.log('✅ Approval check completed');
    }
    catch (error) {
        console.error('❌ Error in approval check job:', error.message);
    }
}
/**
 * Schedule periodic approval checks (for future use with job queue)
 */
function scheduleApprovalCheck(churchId) {
    // This is a placeholder for future implementation
    // In production, this would schedule a background job (e.g., Bull, RabbitMQ)
    // For now, the check happens naturally when checkAndMigrateToPer10DLC runs
    console.log(`📅 Scheduled approval check for church ${churchId}`);
}
/**
 * Export functions that can be called from controllers or scheduled jobs
 */
export { checkAndMigrateToPer10DLC as checkDLCApprovalStatus };
//# sourceMappingURL=10dlc-registration.js.map