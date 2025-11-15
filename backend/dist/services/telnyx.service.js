import axios from 'axios';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
const TELNYX_BASE_URL = 'https://api.telnyx.com/v2';
// ============================================================================
// Utility Functions (Phase 1: Monitoring & Logging)
// ============================================================================
/**
 * Structured logging for linking operations
 * Outputs JSON format for ELK/Datadog/CloudWatch integration
 */
function logLinkingOperation(entry) {
    const logLevel = entry.result === 'failure' ? 'error' : 'info';
    const logEntry = {
        ...entry,
        timestamp: new Date().toISOString(),
    };
    if (logLevel === 'error') {
        console.error('[TELNYX_LINKING]', JSON.stringify(logEntry));
    }
    else {
        console.log('[TELNYX_LINKING]', JSON.stringify(logEntry));
    }
}
/**
 * Validate phone number format (E.164)
 */
function validatePhoneNumber(phoneNumber) {
    // E.164 format: +1234567890 or variations
    const e164Regex = /^\+?[1-9]\d{1,14}$/;
    return e164Regex.test(phoneNumber.replace(/\D/g, ''));
}
/**
 * Validate Telnyx ID format (UUID-like)
 */
function validateTelnyxId(id) {
    // Telnyx IDs are typically UUIDs or numeric strings
    return /^[a-f0-9\-\d]{8,}$/i.test(id);
}
/**
 * Generate error code for structured logging
 */
function generateErrorCode(status, message) {
    if (!status)
        return 'UNKNOWN_ERROR';
    if (status === 422)
        return 'UNPROCESSABLE_ENTITY_PHONE_NUMBER';
    if (status === 400)
        return 'BAD_REQUEST_INVALID_FORMAT';
    if (status === 429)
        return 'RATE_LIMIT_EXCEEDED';
    if (status === 401 || status === 403)
        return 'AUTHENTICATION_ERROR';
    if (status === 404)
        return 'NOT_FOUND';
    if (status >= 500)
        return 'TELNYX_SERVICE_ERROR';
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
/**
 * Send SMS via Telnyx
 */
export async function sendSMS(to, message, churchId) {
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
        // Log outbound SMS attempt
        console.log(`📤 Sending SMS: from ${church.telnyxPhoneNumber} to ${to}`);
        console.log(`   Message: "${message.substring(0, 80)}${message.length > 80 ? '...' : ''}"`);
        const client = getTelnyxClient();
        const response = await client.post('/messages', {
            from: church.telnyxPhoneNumber,
            to: to,
            text: message,
            type: 'SMS',
            dlr_type: 'dlr', // Request delivery receipt notifications
            webhook_url: `${process.env.BACKEND_URL || 'https://api.koinoniasms.com'}/api/webhooks/telnyx/status`,
            webhook_failover_url: `${process.env.BACKEND_URL || 'https://api.koinoniasms.com'}/api/webhooks/telnyx/status`,
        });
        const messageId = response.data?.data?.id;
        const messageStatus = response.data?.data?.status;
        if (!messageId) {
            console.error('❌ No message ID returned from Telnyx');
            console.error('   Telnyx Response:', JSON.stringify(response.data, null, 2));
            throw new Error('No message ID returned from Telnyx');
        }
        console.log(`✅ SMS accepted by Telnyx: ${messageId}`);
        console.log(`   Status: ${messageStatus}, Recipient: ${to}`);
        return {
            messageSid: messageId,
            success: true,
        };
    }
    catch (error) {
        console.error(`❌ Failed to send SMS to ${to}`);
        // Log detailed error information from Telnyx
        if (error.response?.data) {
            console.error('   Telnyx Response:', JSON.stringify(error.response.data, null, 2));
            const errors = error.response.data?.errors;
            if (Array.isArray(errors) && errors.length > 0) {
                errors.forEach((err, idx) => {
                    console.error(`   Error ${idx + 1}: [${err.code}] ${err.title} - ${err.detail}`);
                });
            }
        }
        else if (error.message) {
            console.error('   Error:', error.message);
        }
        const errorMessage = error.response?.data?.errors?.[0]?.detail || error.message || 'Failed to send SMS';
        throw new Error(`Telnyx error: ${errorMessage}`);
    }
}
/**
 * Validate Telnyx API key
 */
export async function validateTelnyxApiKey() {
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
export async function searchAvailableNumbers(options) {
    try {
        const params = {
            filter: {
                national_destination_code: options.areaCode,
                administrative_area: options.state,
                contains: options.contains,
            },
            limit: options.quantity || 10,
        };
        // Remove undefined filters
        Object.keys(params.filter).forEach(key => params.filter[key] === undefined && delete params.filter[key]);
        const client = getTelnyxClient();
        const response = await client.get('/available_phone_numbers', {
            params,
        });
        const numbers = response.data?.data || [];
        // Option 3 pricing: $0.02 per SMS, $0.01 per minute for voice
        const SMS_COST_PER_MESSAGE = 0.02;
        const VOICE_COST_PER_MINUTE = 0.01;
        return numbers.map((num) => ({
            id: num.id,
            phoneNumber: num.phone_number,
            formattedNumber: num.phone_number || num.formatted_number, // Use phone_number as primary
            costPerMinute: VOICE_COST_PER_MINUTE,
            costPerSms: SMS_COST_PER_MESSAGE,
            region: `${num.administrative_area || 'US'}, ${num.country_code || 'US'}`, // Provide defaults
            capabilities: num.capabilities || [],
        }));
    }
    catch (error) {
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
export async function purchasePhoneNumber(phoneNumber, churchId, connectionId, messagingProfileId) {
    try {
        const client = getTelnyxClient();
        // Use /number_orders endpoint to purchase phone numbers
        const phoneNumberData = { phone_number: phoneNumber };
        // Link to messaging profile during purchase if provided
        if (messagingProfileId) {
            phoneNumberData.messaging_profile_id = messagingProfileId;
        }
        const orderData = {
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
    }
    catch (error) {
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
export async function getPhoneNumberDetails(numberSid) {
    try {
        const client = getTelnyxClient();
        const response = await client.get(`/phone_numbers/${numberSid}`);
        return response.data?.data;
    }
    catch (error) {
        const errorMessage = error.response?.data?.errors?.[0]?.detail || error.message || 'Failed to get number details';
        throw new Error(`Telnyx error: ${errorMessage}`);
    }
}
/**
 * Release/delete a phone number with soft-delete support
 *
 * Soft-delete: Phone number is marked as archived with 30-day recovery window
 * - Telnyx release is called immediately (can't undo with Telnyx)
 * - DB marks number as "archived" instead of clearing it
 * - Conversations stay but show "archived number" status
 * - Can be restored within 30 days
 */
export async function releasePhoneNumber(numberSid, churchId, options) {
    try {
        const client = getTelnyxClient();
        // Step 1: Release from Telnyx (immediate, cannot be undone with Telnyx)
        console.log(`[PHONE_RELEASE] Releasing phone number ${numberSid} from Telnyx...`);
        await client.delete(`/phone_numbers/${numberSid}`);
        console.log(`[PHONE_RELEASE] Successfully released from Telnyx`);
        // Step 2: Update database
        const now = new Date();
        const recoveryDeadline = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days
        if (options?.softDelete) {
            // Soft-delete: Archive the number, keep conversation history
            console.log(`[PHONE_RELEASE] Soft-deleting number for church ${churchId} (30-day recovery window)`);
            await prisma.church.update({
                where: { id: churchId },
                data: {
                    telnyxNumberStatus: 'archived',
                    telnyxNumberDeletedAt: now,
                    telnyxNumberDeletedBy: options.deletedBy || 'system',
                    telnyxNumberRecoveryDeadline: recoveryDeadline,
                    // Keep the phone number and SID for potential recovery
                    // telnyxPhoneNumber and telnyxNumberSid remain unchanged
                    telnyxVerified: false, // Can't use for messaging anymore
                },
            });
            console.log(`[PHONE_RELEASE] Number archived. Recovery available until ${recoveryDeadline.toISOString()}`);
        }
        else {
            // Hard-delete: Clear all phone data (for cleanup after recovery window expires)
            console.log(`[PHONE_RELEASE] Hard-deleting number for church ${churchId}`);
            await prisma.church.update({
                where: { id: churchId },
                data: {
                    telnyxPhoneNumber: null,
                    telnyxNumberSid: null,
                    telnyxVerified: false,
                    telnyxNumberStatus: 'archived', // Mark as archived even when hard-deleted
                    // Keep deletion metadata for audit trail
                },
            });
            console.log(`[PHONE_RELEASE] Number hard-deleted from database`);
        }
        return true;
    }
    catch (error) {
        const errorMessage = error.response?.data?.errors?.[0]?.detail || error.message || 'Failed to release number';
        console.error(`[PHONE_RELEASE] Error releasing number: ${errorMessage}`);
        throw new Error(`Telnyx error: ${errorMessage}`);
    }
}
/**
 * Create webhook for incoming messages (auto-setup)
 */
export async function createWebhook(webhookUrl) {
    try {
        console.log(`🔗 Creating webhook with URL: ${webhookUrl}`);
        const client = getTelnyxClient();
        // First, try to get existing messaging profiles
        let messagingProfileId = null;
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
        }
        catch (error) {
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
        }
        else {
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
    }
    catch (error) {
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
export async function deleteWebhook(webhookId) {
    try {
        const client = getTelnyxClient();
        await client.delete(`/webhooks/${webhookId}`);
        console.log(`✅ Webhook deleted: ${webhookId}`);
        return true;
    }
    catch (error) {
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
export async function linkPhoneNumberToMessagingProfile(phoneNumber, messagingProfileId, churchId) {
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
        let phoneNumberRecord = null;
        let lastSearchError = null;
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
                    // Log detailed phone number info to understand its state
                    console.log('[TELNYX_LINKING] Phone number found with details:', {
                        id: phoneNumberRecord.id,
                        phone_number: phoneNumberRecord.phone_number,
                        status: phoneNumberRecord.status,
                        messaging_profile_id: phoneNumberRecord.messaging_profile_id,
                        requirements_met: phoneNumberRecord.requirements_met,
                        record_type: phoneNumberRecord.record_type,
                    });
                    // Only proceed if phone is active and requirements are met
                    if (phoneNumberRecord.status === 'active' && phoneNumberRecord.requirements_met !== false) {
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
                    else {
                        // Phone number not ready yet, wait and retry
                        console.log(`[TELNYX_LINKING] Phone number found but not ready. Status: ${phoneNumberRecord.status}, Requirements met: ${phoneNumberRecord.requirements_met}`);
                        if (searchAttempt < 5) {
                            const delayMs = Math.pow(2, searchAttempt) * 1000;
                            await new Promise(resolve => setTimeout(resolve, delayMs));
                        }
                    }
                }
                if (searchAttempt < 5) {
                    // Exponential backoff: 2s, 4s, 8s, 16s, etc.
                    const delayMs = Math.pow(2, searchAttempt) * 1000;
                    await new Promise(resolve => setTimeout(resolve, delayMs));
                }
            }
            catch (searchError) {
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
            // CORRECTED: Use PATCH /phone_numbers/{id}/messaging endpoint
            // This is the correct endpoint to link a phone number to a messaging profile
            console.log(`[TELNYX_LINKING] Method 1: Linking phone to messaging profile via PATCH /messaging`);
            const addPhoneResponse = await client.patch(`/phone_numbers/${phoneNumberRecord.id}/messaging`, {
                messaging_profile_id: messagingProfileId,
            });
            // Log full response to understand structure
            console.log('[TELNYX_LINKING] Method 1 - Full response:', {
                status: addPhoneResponse.status,
                dataKeys: Object.keys(addPhoneResponse.data || {}),
                dataDataKeys: Object.keys(addPhoneResponse.data?.data || {}),
                fullData: addPhoneResponse.data,
            });
            // Check if we got success (2xx status means it worked)
            if (addPhoneResponse.status >= 200 && addPhoneResponse.status < 300) {
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
                    messagingProfileId,
                    phoneNumber,
                };
            }
            else {
                throw new Error(`Failed to link phone to messaging profile`);
            }
        }
        catch (method1Error) {
            const errorCode = generateErrorCode(method1Error.response?.status);
            // Enhanced error logging to capture full Telnyx response
            const errorDetail = method1Error.response?.data?.errors?.[0];
            console.error('[TELNYX_LINKING] Method 1 Error Details:', {
                status: method1Error.response?.status,
                statusText: method1Error.response?.statusText,
                errorTitle: errorDetail?.title,
                errorDetail: errorDetail?.detail,
                errorSource: errorDetail?.source,
                fullResponse: JSON.stringify(method1Error.response?.data),
                message: method1Error.message,
            });
            logLinkingOperation({
                timestamp: new Date().toISOString(),
                churchId,
                phoneNumber,
                messagingProfileId,
                step: `${currentStep}_failed`,
                result: 'failure',
                errorCode,
                errorDetails: method1Error.message || method1Error.response?.data?.errors?.[0]?.detail || JSON.stringify(method1Error.response?.data),
                duration: Date.now() - method1StartTime,
            });
            // ====================================================================
            // Phase 1: Step 3 - Method 2: Aggressive search + retry direct link
            // ====================================================================
            currentStep = 'method_2_aggressive_search_retry';
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
                // Method 2: More aggressive search with longer delays for newly purchased numbers
                // Wait additional time for Telnyx to index the phone number
                let retryPhoneNumberRecord = null;
                const additionalSearchAttempts = 3;
                for (let i = 0; i < additionalSearchAttempts; i++) {
                    // Exponential backoff: 3s, 6s, 12s
                    const delayMs = Math.pow(2, i + 1) * 1500;
                    if (i > 0) {
                        console.log(`[TELNYX_LINKING] Method 2: Waiting ${delayMs}ms before search attempt ${i + 1}...`);
                        await new Promise(resolve => setTimeout(resolve, delayMs));
                    }
                    const searchResponse = await client.get('/phone_numbers', {
                        params: {
                            filter: {
                                phone_number: phoneNumber,
                            },
                            limit: 10,
                        },
                    });
                    retryPhoneNumberRecord = searchResponse.data?.data?.[0] || null;
                    if (retryPhoneNumberRecord?.id && validateTelnyxId(retryPhoneNumberRecord.id)) {
                        // Log detailed phone number info to understand its state
                        console.log(`[TELNYX_LINKING] Method 2: Found phone number on attempt ${i + 1} with details:`, {
                            id: retryPhoneNumberRecord.id,
                            phone_number: retryPhoneNumberRecord.phone_number,
                            status: retryPhoneNumberRecord.status,
                            messaging_profile_id: retryPhoneNumberRecord.messaging_profile_id,
                            requirements_met: retryPhoneNumberRecord.requirements_met,
                            record_type: retryPhoneNumberRecord.record_type,
                        });
                        // Only break if phone is active and requirements are met
                        if (retryPhoneNumberRecord.status === 'active' && retryPhoneNumberRecord.requirements_met !== false) {
                            break;
                        }
                        else {
                            console.log(`[TELNYX_LINKING] Method 2: Phone not ready yet. Status: ${retryPhoneNumberRecord.status}, Requirements: ${retryPhoneNumberRecord.requirements_met}`);
                            // Continue searching, will retry with longer delays
                            retryPhoneNumberRecord = null;
                        }
                    }
                }
                if (!retryPhoneNumberRecord?.id) {
                    throw new Error(`Phone number still not indexed after ${additionalSearchAttempts} additional search attempts`);
                }
                // Retry using the correct endpoint: PATCH /phone_numbers/{id}/messaging
                const retryUpdateResponse = await client.patch(`/phone_numbers/${retryPhoneNumberRecord.id}/messaging`, {
                    messaging_profile_id: messagingProfileId,
                });
                // Log full response to understand structure
                console.log('[TELNYX_LINKING] Method 2 - Full response:', {
                    status: retryUpdateResponse.status,
                    dataKeys: Object.keys(retryUpdateResponse.data || {}),
                    dataDataKeys: Object.keys(retryUpdateResponse.data?.data || {}),
                    fullData: retryUpdateResponse.data,
                });
                // Check 2xx status for success
                if (retryUpdateResponse.status >= 200 && retryUpdateResponse.status < 300) {
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
                        method: 'aggressive_search_retry',
                        duration: Date.now() - operationStartTime,
                        phoneNumberId: retryPhoneNumberRecord.id,
                        messagingProfileId,
                        phoneNumber,
                    };
                }
                else {
                    throw new Error(`Failed to link phone to messaging profile`);
                }
            }
            catch (method2Error) {
                const errorCode = generateErrorCode(method2Error.response?.status);
                // Enhanced error logging to capture full Telnyx response
                const method2ErrorDetail = method2Error.response?.data?.errors?.[0];
                console.error('[TELNYX_LINKING] Method 2 Error Details:', {
                    status: method2Error.response?.status,
                    statusText: method2Error.response?.statusText,
                    errorTitle: method2ErrorDetail?.title,
                    errorDetail: method2ErrorDetail?.detail,
                    errorSource: method2ErrorDetail?.source,
                    fullResponse: JSON.stringify(method2Error.response?.data),
                    message: method2Error.message,
                });
                logLinkingOperation({
                    timestamp: new Date().toISOString(),
                    churchId,
                    phoneNumber,
                    messagingProfileId,
                    step: `${currentStep}_failed`,
                    result: 'failure',
                    errorCode,
                    errorDetails: method2Error.message || method2Error.response?.data?.errors?.[0]?.detail || JSON.stringify(method2Error.response?.data),
                    duration: Date.now() - method2StartTime,
                });
                // Both methods failed - prepare comprehensive error for retry logic
                const finalError = {
                    success: false,
                    method: null,
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
                return finalError;
            }
        }
    }
    catch (error) {
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
//# sourceMappingURL=telnyx.service.js.map