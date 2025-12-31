import { getRegistryPrisma } from '../lib/tenant-prisma.js';
import { searchAvailableNumbers, purchasePhoneNumber, releasePhoneNumber, validateTelnyxApiKey, createWebhook, linkPhoneNumberToMessagingProfile, } from '../services/telnyx.service.js';
import { createPhoneNumberSetupPaymentIntent, verifyPaymentIntent, } from '../services/stripe.service.js';
import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2022-11-15',
});
/**
 * GET /api/numbers/search
 * Search for available phone numbers
 * Query params: areaCode, state, contains, quantity
 */
export async function searchNumbers(req, res) {
    try {
        const churchId = req.user?.churchId;
        if (!churchId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        // Check if Telnyx is configured
        const apiKeyValid = await validateTelnyxApiKey();
        if (!apiKeyValid) {
            const errorMsg = 'Telnyx API not configured or invalid - API key validation failed';
            console.error(errorMsg);
            return res.status(500).json({ error: errorMsg });
        }
        const { areaCode, state, contains, quantity } = req.query;
        console.log('Searching for phone numbers with:', { areaCode, state, contains, quantity });
        const numbers = await searchAvailableNumbers({
            areaCode: areaCode,
            state: state,
            contains: contains,
            quantity: quantity ? parseInt(quantity) : 10,
        });
        console.log(`Found ${numbers.length} available phone numbers`);
        res.json({ success: true, data: numbers });
    }
    catch (error) {
        const errorMessage = error?.message || 'Failed to search numbers';
        console.error('Search numbers error:', {
            message: errorMessage,
            stack: error?.stack,
            status: error?.status,
        });
        res.status(500).json({ error: errorMessage });
    }
}
/**
 * POST /api/numbers/setup-payment-intent
 * Create a payment intent for phone number setup fee
 * Body: { phoneNumber }
 * SECURITY: Validates phone number format and user authorization
 */
export async function setupPaymentIntent(req, res) {
    try {
        const churchId = req.user?.churchId;
        if (!churchId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const { phoneNumber } = req.body;
        if (!phoneNumber || typeof phoneNumber !== 'string') {
            return res.status(400).json({ error: 'Phone number is required' });
        }
        // SECURITY: Validate phone number format (E.164 format: +1234567890)
        const phoneNumberRegex = /^\+?1?[2-9]\d{9}$/;
        if (!phoneNumberRegex.test(phoneNumber.replace(/[^\d]/g, ''))) {
            return res.status(400).json({ error: 'Invalid phone number format' });
        }
        // Get church with Stripe customer ID (query registry database)
        console.log(`[setupPaymentIntent] Starting for church: ${churchId}`);
        const registryPrisma = getRegistryPrisma();
        const church = await registryPrisma.church.findUnique({
            where: { id: churchId },
            select: { stripeCustomerId: true, telnyxPhoneNumber: true },
        });
        if (!church) {
            console.log(`[setupPaymentIntent] Church not found: ${churchId}`);
            return res.status(404).json({ error: 'Church not found' });
        }
        console.log(`[setupPaymentIntent] Church found. Has Stripe ID: ${!!church.stripeCustomerId}, Has phone: ${!!church.telnyxPhoneNumber}`);
        if (church.telnyxPhoneNumber) {
            return res.status(400).json({ error: 'Church already has a phone number' });
        }
        if (!church.stripeCustomerId) {
            console.log(`[setupPaymentIntent] ERROR: Church has no Stripe customer ID!`);
            return res.status(400).json({ error: 'Stripe customer not configured' });
        }
        console.log(`[setupPaymentIntent] Creating payment intent for phone: ${phoneNumber}, customer: ${church.stripeCustomerId}`);
        const paymentIntent = await createPhoneNumberSetupPaymentIntent(church.stripeCustomerId, phoneNumber);
        console.log(`[setupPaymentIntent] SUCCESS: Payment intent created: ${paymentIntent.paymentIntentId}`);
        res.json({ success: true, data: paymentIntent });
    }
    catch (error) {
        console.error('[setupPaymentIntent] ERROR:', {
            message: error.message,
            code: error.code,
            stack: error.stack,
        });
        res.status(500).json({ error: error.message || 'Failed to create payment intent' });
    }
}
/**
 * POST /api/numbers/confirm-payment
 * Confirm payment intent with Stripe payment method token
 * SECURITY: Payment method is created on frontend, never exposes card details to backend
 */
export async function confirmPayment(req, res) {
    try {
        const churchId = req.user?.churchId;
        if (!churchId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const { paymentIntentId, paymentMethodId } = req.body;
        if (!paymentIntentId || !paymentMethodId) {
            return res.status(400).json({ error: 'Missing payment details' });
        }
        // Get church with Stripe customer ID (query registry database)
        const registryPrisma = getRegistryPrisma();
        const church = await registryPrisma.church.findUnique({
            where: { id: churchId },
            select: { stripeCustomerId: true },
        });
        if (!church?.stripeCustomerId) {
            return res.status(400).json({ error: 'Stripe customer not configured' });
        }
        // SECURITY: Confirm payment intent with payment method token from Stripe Elements
        // Card details are handled entirely by Stripe, never exposed to our backend
        const confirmedIntent = await stripe.paymentIntents.confirm(paymentIntentId, {
            payment_method: paymentMethodId,
            return_url: 'https://connect-yw-frontend.onrender.com/admin/settings',
        });
        // Check if payment succeeded or requires action
        if (confirmedIntent.status === 'succeeded') {
            console.log(`✅ Payment confirmed for church ${churchId}: ${paymentIntentId}`);
            return res.json({
                success: true,
                data: {
                    paymentIntentId: confirmedIntent.id,
                    status: 'succeeded',
                },
            });
        }
        else if (confirmedIntent.status === 'requires_action') {
            // This would require 3D Secure or other additional authentication
            return res.status(400).json({
                error: 'Payment requires additional authentication',
                clientSecret: confirmedIntent.client_secret,
            });
        }
        // Payment failed - extract detailed error message from Stripe
        const paymentError = confirmedIntent.last_payment_error;
        let userFriendlyError = 'Payment failed. Please try again.';
        if (paymentError) {
            // Map Stripe error codes to user-friendly messages
            const errorMessages = {
                'card_declined': 'Your card was declined. Please try another card.',
                'insufficient_funds': 'Your card has insufficient funds.',
                'lost_card': 'Your card has been reported as lost.',
                'stolen_card': 'Your card has been reported as stolen.',
                'expired_card': 'Your card has expired.',
                'incorrect_cvc': 'The CVC code is incorrect.',
                'processing_error': 'An error occurred while processing your payment. Please try again.',
                'rate_limit': 'Too many attempts. Please wait before trying again.',
                'authentication_error': 'Authentication failed. Please try again.',
                'invalid_amount': 'Invalid payment amount.',
            };
            userFriendlyError = errorMessages[paymentError.code] || paymentError.message || userFriendlyError;
            console.error(`❌ Payment failed for church ${churchId}:`, {
                code: paymentError.code,
                message: paymentError.message,
                type: paymentError.type,
            });
        }
        return res.status(402).json({
            error: userFriendlyError,
        });
    }
    catch (error) {
        console.error('Payment confirmation failed:', {
            message: error?.message,
            type: error?.type,
            code: error?.code,
            raw_type: error?.raw?.type,
            charge_error: error?.raw?.charge?.outcome?.reason,
        });
        // Map Stripe error codes to user-friendly messages
        const errorMessages = {
            'card_declined': 'Your card was declined. Please try another card.',
            'insufficient_funds': 'Your card has insufficient funds.',
            'lost_card': 'Your card has been reported as lost.',
            'stolen_card': 'Your card has been reported as stolen.',
            'expired_card': 'Your card has expired.',
            'incorrect_cvc': 'The CVC code is incorrect.',
            'processing_error': 'An error occurred while processing your payment. Please try again.',
            'rate_limit': 'Too many attempts. Please wait before trying again.',
            'authentication_error': 'Authentication failed. Please try again.',
        };
        // Handle Stripe card errors
        if (error.type === 'StripeCardError' || error.raw?.type === 'card_error') {
            const errorCode = error.code || error.raw?.code;
            const userMessage = errorMessages[errorCode] || error.message || error.raw?.message || 'Card declined';
            return res.status(402).json({
                error: userMessage,
            });
        }
        // Handle Stripe invalid request errors
        if (error.type === 'StripeInvalidRequestError' || error.raw?.type === 'invalid_request_error') {
            return res.status(400).json({
                error: error.raw?.message || 'Invalid payment details. Please check your information.',
            });
        }
        // Handle generic errors with fallback message
        const userMessage = error.message || 'Payment processing failed. Please try again.';
        res.status(500).json({
            error: userMessage,
        });
    }
}
/**
 * POST /api/numbers/purchase
 * Purchase a phone number for the church (after payment is confirmed)
 * Body: { phoneNumber, paymentIntentId, connectionId? }
 * SECURITY: Verifies payment before allowing purchase
 */
export async function purchaseNumber(req, res) {
    try {
        const churchId = req.user?.churchId;
        if (!churchId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const { phoneNumber, paymentIntentId, connectionId } = req.body;
        if (!phoneNumber || typeof phoneNumber !== 'string') {
            return res.status(400).json({ error: 'Phone number is required' });
        }
        if (!paymentIntentId || typeof paymentIntentId !== 'string') {
            return res.status(400).json({ error: 'Payment intent ID is required' });
        }
        // Get church with Stripe customer ID (query registry database)
        const registryPrisma = getRegistryPrisma();
        const church = await registryPrisma.church.findUnique({
            where: { id: churchId },
            select: { telnyxPhoneNumber: true, stripeCustomerId: true },
        });
        if (!church) {
            return res.status(404).json({ error: 'Church not found' });
        }
        if (church.telnyxPhoneNumber) {
            return res.status(400).json({ error: 'Church already has a phone number' });
        }
        if (!church.stripeCustomerId) {
            return res.status(400).json({ error: 'Stripe customer not configured' });
        }
        // SECURITY: Verify payment intent before purchasing
        // This prevents fraud where someone could use a payment intent from another user
        const SETUP_FEE_CENTS = 50; // $0.50 (Stripe minimum)
        const isPaymentValid = await verifyPaymentIntent(paymentIntentId, church.stripeCustomerId, SETUP_FEE_CENTS, phoneNumber);
        if (!isPaymentValid) {
            console.warn(`⚠️ Payment verification failed for church ${churchId}`);
            return res.status(402).json({
                error: 'Payment verification failed. Please ensure payment was successful.',
            });
        }
        // Create messaging profile with webhook - REQUIRED for SMS to work
        let webhookId = null;
        let webhookAttempts = 0;
        const maxWebhookAttempts = 3;
        while (webhookAttempts < maxWebhookAttempts && !webhookId) {
            try {
                webhookAttempts++;
                const webhookUrl = `${process.env.BACKEND_URL || 'https://api.koinoniasms.com'}/api/webhooks/telnyx/mms`;
                console.log(`📝 Attempt ${webhookAttempts}/${maxWebhookAttempts}: Creating messaging profile with webhook...`);
                const webhook = await createWebhook(webhookUrl);
                webhookId = webhook.id;
                console.log(`✅ Messaging profile created: ${webhookId}`);
            }
            catch (webhookError) {
                console.error(`❌ Webhook creation attempt ${webhookAttempts} failed: ${webhookError.message}`);
                if (webhookAttempts >= maxWebhookAttempts) {
                    throw new Error(`Failed to create messaging profile after ${maxWebhookAttempts} attempts. ` +
                        `Cannot purchase phone number without a messaging profile for SMS. ${webhookError.message}`);
                }
                // Wait 1 second before retrying
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }
        // Purchase the phone number with Telnyx and link to messaging profile
        const result = await purchasePhoneNumber(phoneNumber, churchId, connectionId, webhookId || undefined);
        // Verify and link the number to messaging profile (required for SMS to work)
        if (!webhookId) {
            throw new Error(`Failed to create messaging profile for phone number. Cannot purchase number without SMS capability. ` +
                `Please try again or contact support.`);
        }
        // Attempt to link the phone number to messaging profile
        // This is critical - without linking, SMS sending will fail
        let linkingResult = await linkPhoneNumberToMessagingProfile(phoneNumber, webhookId, churchId);
        // Enterprise-grade linking: Log result for monitoring and future recovery
        if (linkingResult.success) {
            console.log(`✅ Successfully linked ${phoneNumber} to messaging profile via method: ${linkingResult.method}. Duration: ${linkingResult.duration}ms`);
        }
        else {
            console.error(`⚠️ Linking failed after both methods. Error: ${linkingResult.error?.code} - ${linkingResult.error?.message}`);
        }
        // Update church with purchased phone number, webhook ID, and linking status (in registry database)
        // Phase 2: Track linking status for automatic recovery
        const updated = await registryPrisma.church.update({
            where: { id: churchId },
            data: {
                telnyxPhoneNumber: phoneNumber,
                telnyxNumberSid: result.numberSid,
                telnyxVerified: true,
                telnyxWebhookId: webhookId,
                telnyxPurchasedAt: new Date(),
                // Enterprise: Track linking status for background verification job
                telnyxPhoneLinkingStatus: linkingResult.success ? 'linked' : 'failed',
                telnyxPhoneLinkingLastAttempt: new Date(),
                telnyxPhoneLinkingRetryCount: linkingResult.success ? 0 : 1,
                telnyxPhoneLinkingError: linkingResult.success ? null : `${linkingResult.error?.code}: ${linkingResult.error?.message}`,
            },
            select: {
                id: true,
                telnyxPhoneNumber: true,
                telnyxWebhookId: true,
                telnyxVerified: true,
                telnyxPhoneLinkingStatus: true,
                telnyxPhoneLinkingRetryCount: true,
            },
        });
        if (linkingResult.success) {
            console.log(`✅ Phone number purchase completed with messaging profile linked for church ${churchId}: ${phoneNumber}`);
            res.json({
                success: true,
                data: {
                    ...result,
                    phoneNumber: updated.telnyxPhoneNumber,
                    webhookId: updated.telnyxWebhookId,
                    verified: updated.telnyxVerified,
                    linked: true,
                    linkingMethod: linkingResult.method,
                    linkingDuration: linkingResult.duration,
                    message: `✅ Phone number purchased and automatically linked to messaging profile via ${linkingResult.method} method! SMS is ready to use.`,
                },
            });
        }
        else {
            // Phone number was purchased but linking failed
            // Will be retried by background job (Phase 2)
            console.log(`⚠️ Phone number purchased but NOT automatically linked for church ${churchId}: ${phoneNumber}`);
            res.status(201).json({
                success: false,
                requiresAction: true,
                data: {
                    ...result,
                    phoneNumber: updated.telnyxPhoneNumber,
                    webhookId: updated.telnyxWebhookId,
                    verified: updated.telnyxVerified,
                    linked: false,
                    linkingError: linkingResult.error,
                    message: `⚠️ Phone number purchased but automatic linking failed. ${linkingResult.error?.code}: ${linkingResult.error?.message}. System will retry automatically. If problem persists, manual linking may be required.`,
                    retryInfo: {
                        note: 'This will be automatically retried by the system',
                        manualLinkingSteps: [
                            '1. Go to Telnyx Dashboard → Real-Time Communications → Messaging → Phone Numbers',
                            `2. Find phone number ${phoneNumber}`,
                            '3. Click on the number to edit',
                            `4. In the "Messaging profile" dropdown, select the profile (should be "Mike" or similar)`,
                            '5. Click Save',
                            '6. SMS sending will then be enabled',
                        ],
                    },
                },
            });
        }
    }
    catch (error) {
        console.error('Failed to purchase number:', {
            message: error.message,
            stack: error.stack,
            fullError: error,
        });
        res.status(500).json({ error: error.message || 'Failed to purchase number' });
    }
}
/**
 * GET /api/numbers/current
 * Get the church's current phone number
 */
export async function getCurrentNumber(req, res) {
    try {
        const churchId = req.user?.churchId;
        if (!churchId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        console.log(`[getCurrentNumber] Querying registry database for churchId: ${churchId}`);
        // Query registry database (same as linkPhoneNumber uses)
        const registryPrisma = getRegistryPrisma();
        const church = await registryPrisma.church.findUnique({
            where: { id: churchId },
            select: {
                id: true,
                telnyxPhoneNumber: true,
                telnyxNumberSid: true,
                telnyxVerified: true,
                telnyxPurchasedAt: true,
            },
        });
        console.log(`[getCurrentNumber] Found church:`, {
            id: church?.id,
            hasPhone: !!church?.telnyxPhoneNumber,
            phone: church?.telnyxPhoneNumber || 'none',
        });
        if (!church?.telnyxPhoneNumber) {
            console.log(`[getCurrentNumber] No phone number found for church ${churchId}`);
            return res.status(404).json({ error: 'No phone number configured' });
        }
        console.log(`[getCurrentNumber] Returning phone number: ${church.telnyxPhoneNumber}`);
        res.json({ success: true, data: church });
    }
    catch (error) {
        console.error('[getCurrentNumber] ERROR:', error);
        res.status(500).json({ error: 'Failed to get current number' });
    }
}
/**
 * DELETE /api/numbers/current
 * Release/delete the church's phone number with soft-delete (30-day recovery window)
 *
 * Body (optional): { confirm: true, confirmPhone: "+1918..." }
 * - confirm: User must explicitly confirm
 * - confirmPhone: User must type the phone number exactly
 */
export async function releaseCurrentNumber(req, res) {
    try {
        const churchId = req.user?.churchId;
        const adminId = req.user?.adminId;
        if (!churchId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const { confirm, confirmPhone } = req.body;
        // Query registry database (same as linkPhoneNumber and getCurrentNumber use)
        const registryPrisma = getRegistryPrisma();
        const church = await registryPrisma.church.findUnique({
            where: { id: churchId },
            select: { telnyxNumberSid: true, telnyxPhoneNumber: true },
        });
        if (!church?.telnyxPhoneNumber) {
            return res.status(404).json({ error: 'No phone number to release' });
        }
        // Step 1: Validate confirmation (safety check)
        if (!confirm) {
            return res.status(400).json({
                error: 'Deletion requires explicit confirmation',
                requiresConfirmation: true,
                phoneNumber: church.telnyxPhoneNumber,
                message: 'This action cannot be undone. All SMS conversations on this number will end.',
            });
        }
        // Step 2: Verify user typed the phone number correctly
        if (!confirmPhone || confirmPhone !== church.telnyxPhoneNumber) {
            return res.status(400).json({
                error: 'Phone number confirmation mismatch',
                message: `Please type the phone number exactly: ${church.telnyxPhoneNumber}`,
            });
        }
        // Step 3: Soft-delete the number (30-day recovery window)
        console.log(`[DELETE_NUMBER] User ${adminId} requesting deletion of phone ${church.telnyxPhoneNumber} for church ${churchId}`);
        // If number was purchased through app (has telnyxNumberSid), release from Telnyx
        // If manually linked (no telnyxNumberSid), just clear from database
        if (church.telnyxNumberSid) {
            await releasePhoneNumber(church.telnyxNumberSid, churchId, {
                softDelete: true,
                deletedBy: adminId,
            });
        }
        else {
            // Manually linked number - just clear from database
            console.log(`[DELETE_NUMBER] Manually linked number, clearing from database only`);
            await registryPrisma.church.update({
                where: { id: churchId },
                data: {
                    telnyxPhoneNumber: null,
                    telnyxNumberSid: null,
                    telnyxVerified: false,
                    telnyxWebhookId: null,
                    telnyxPurchasedAt: null,
                },
            });
        }
        res.json({
            success: true,
            message: 'Phone number deleted (30-day recovery window)',
            data: {
                phoneNumber: church.telnyxPhoneNumber,
                status: 'archived',
                recoveryWindow: '30 days',
                note: 'You can contact support to restore this number within 30 days',
            },
        });
    }
    catch (error) {
        console.error('Failed to delete number:', error);
        res.status(500).json({ error: error.message || 'Failed to delete number' });
    }
}
//# sourceMappingURL=numbers.controller.js.map