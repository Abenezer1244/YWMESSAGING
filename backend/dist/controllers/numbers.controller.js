import { PrismaClient } from '@prisma/client';
import { searchAvailableNumbers, purchasePhoneNumber, releasePhoneNumber, validateTelnyxApiKey, } from '../services/telnyx.service.js';
import { createPhoneNumberSetupPaymentIntent, verifyPaymentIntent, } from '../services/stripe.service.js';
import Stripe from 'stripe';
const prisma = new PrismaClient();
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
        // Get church with Stripe customer ID
        const church = await prisma.church.findUnique({
            where: { id: churchId },
            select: { stripeCustomerId: true, telnyxPhoneNumber: true },
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
        const paymentIntent = await createPhoneNumberSetupPaymentIntent(church.stripeCustomerId, phoneNumber);
        res.json({ success: true, data: paymentIntent });
    }
    catch (error) {
        console.error('Failed to create payment intent:', error);
        res.status(500).json({ error: error.message || 'Failed to create payment intent' });
    }
}
/**
 * POST /api/numbers/confirm-payment
 * Confirm payment intent with card details
 * SECURITY: Creates payment method and confirms payment securely
 */
export async function confirmPayment(req, res) {
    try {
        const churchId = req.user?.churchId;
        if (!churchId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const { paymentIntentId, cardNumber, cardExpiry, cardCvc } = req.body;
        if (!paymentIntentId || !cardNumber || !cardExpiry || !cardCvc) {
            return res.status(400).json({ error: 'Missing payment details' });
        }
        // Get church with Stripe customer ID
        const church = await prisma.church.findUnique({
            where: { id: churchId },
            select: { stripeCustomerId: true },
        });
        if (!church?.stripeCustomerId) {
            return res.status(400).json({ error: 'Stripe customer not configured' });
        }
        // Parse expiry
        const [expiryMonth, expiryYear] = cardExpiry.split('/');
        if (!expiryMonth || !expiryYear || isNaN(parseInt(expiryMonth)) || isNaN(parseInt(expiryYear))) {
            return res.status(400).json({ error: 'Invalid expiry date format' });
        }
        // SECURITY: Create payment method from card details via Stripe API
        // Card details never stored locally
        const paymentMethod = await stripe.paymentMethods.create({
            type: 'card',
            card: {
                number: cardNumber,
                exp_month: parseInt(expiryMonth),
                exp_year: parseInt(expiryYear) + 2000, // Convert YY to YYYY
                cvc: cardCvc,
            },
        });
        // Confirm the payment intent with the payment method
        const confirmedIntent = await stripe.paymentIntents.confirm(paymentIntentId, {
            payment_method: paymentMethod.id,
            return_url: 'https://connect-yw-frontend.onrender.com/admin/settings',
        });
        // Check if payment succeeded or requires action
        if (confirmedIntent.status === 'succeeded') {
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
        return res.status(402).json({
            error: `Payment failed with status: ${confirmedIntent.status}`,
        });
    }
    catch (error) {
        console.error('Payment confirmation failed:', {
            message: error?.message,
            type: error?.type,
            code: error?.code,
            status: error?.status,
            raw_type: error?.raw?.type,
            full_error: error,
        });
        // Handle specific Stripe errors
        if (error.type === 'StripeCardError' || error.raw?.type === 'card_error') {
            return res.status(402).json({
                error: error.message || error.raw?.message || 'Card declined',
            });
        }
        // Handle invalid request errors
        if (error.type === 'StripeInvalidRequestError' || error.raw?.type === 'invalid_request_error') {
            console.error('Invalid request to Stripe:', error.raw?.message);
            return res.status(400).json({
                error: error.raw?.message || 'Invalid payment details',
            });
        }
        res.status(500).json({
            error: error.message || 'Payment confirmation failed',
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
        // Get church with Stripe customer ID
        const church = await prisma.church.findUnique({
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
        const SETUP_FEE_CENTS = 499; // $4.99
        const isPaymentValid = await verifyPaymentIntent(paymentIntentId, church.stripeCustomerId, SETUP_FEE_CENTS, phoneNumber);
        if (!isPaymentValid) {
            console.warn(`⚠️ Payment verification failed for church ${churchId}`);
            return res.status(402).json({
                error: 'Payment verification failed. Please ensure payment was successful.',
            });
        }
        // Purchase the phone number with Telnyx (only after payment verified)
        const result = await purchasePhoneNumber(phoneNumber, churchId, connectionId);
        res.json({ success: true, data: result });
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
        const church = await prisma.church.findUnique({
            where: { id: churchId },
            select: {
                telnyxPhoneNumber: true,
                telnyxNumberSid: true,
                telnyxVerified: true,
                telnyxPurchasedAt: true,
            },
        });
        if (!church?.telnyxPhoneNumber) {
            return res.status(404).json({ error: 'No phone number configured' });
        }
        res.json({ success: true, data: church });
    }
    catch (error) {
        console.error('Failed to get current number:', error);
        res.status(500).json({ error: 'Failed to get current number' });
    }
}
/**
 * DELETE /api/numbers/current
 * Release/delete the church's phone number
 */
export async function releaseCurrentNumber(req, res) {
    try {
        const churchId = req.user?.churchId;
        if (!churchId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const church = await prisma.church.findUnique({
            where: { id: churchId },
            select: { telnyxNumberSid: true },
        });
        if (!church?.telnyxNumberSid) {
            return res.status(404).json({ error: 'No phone number to release' });
        }
        await releasePhoneNumber(church.telnyxNumberSid, churchId);
        res.json({ success: true, message: 'Phone number released' });
    }
    catch (error) {
        console.error('Failed to release number:', error);
        res.status(500).json({ error: error.message || 'Failed to release number' });
    }
}
//# sourceMappingURL=numbers.controller.js.map