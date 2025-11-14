import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AccessTokenPayload } from '../utils/jwt.utils.js';
import {
  searchAvailableNumbers,
  purchasePhoneNumber,
  releasePhoneNumber,
  getPhoneNumberDetails,
  validateTelnyxApiKey,
  createWebhook,
  linkPhoneNumberToMessagingProfile,
} from '../services/telnyx.service.js';
import {
  createPhoneNumberSetupPaymentIntent,
  verifyPaymentIntent,
  getCustomer,
} from '../services/stripe.service.js';
import Stripe from 'stripe';

const prisma = new PrismaClient();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2022-11-15',
});

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: AccessTokenPayload;
    }
  }
}

/**
 * GET /api/numbers/search
 * Search for available phone numbers
 * Query params: areaCode, state, contains, quantity
 */
export async function searchNumbers(req: Request, res: Response) {
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
      areaCode: areaCode as string,
      state: state as string,
      contains: contains as string,
      quantity: quantity ? parseInt(quantity as string) : 10,
    });

    console.log(`Found ${numbers.length} available phone numbers`);
    res.json({ success: true, data: numbers });
  } catch (error: any) {
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
export async function setupPaymentIntent(req: Request, res: Response) {
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
    console.log(`[setupPaymentIntent] Starting for church: ${churchId}`);

    const church = await prisma.church.findUnique({
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

    const paymentIntent = await createPhoneNumberSetupPaymentIntent(
      church.stripeCustomerId,
      phoneNumber
    );

    console.log(`[setupPaymentIntent] SUCCESS: Payment intent created: ${paymentIntent.paymentIntentId}`);
    res.json({ success: true, data: paymentIntent });
  } catch (error: any) {
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
export async function confirmPayment(req: Request, res: Response) {
  try {
    const churchId = req.user?.churchId;
    if (!churchId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { paymentIntentId, paymentMethodId } = req.body;

    if (!paymentIntentId || !paymentMethodId) {
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
    } else if (confirmedIntent.status === 'requires_action') {
      // This would require 3D Secure or other additional authentication
      return res.status(400).json({
        error: 'Payment requires additional authentication',
        clientSecret: confirmedIntent.client_secret,
      });
    }

    // Payment failed - extract detailed error message from Stripe
    const paymentError = (confirmedIntent as any).last_payment_error;
    let userFriendlyError = 'Payment failed. Please try again.';

    if (paymentError) {
      // Map Stripe error codes to user-friendly messages
      const errorMessages: Record<string, string> = {
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
  } catch (error: any) {
    console.error('Payment confirmation failed:', {
      message: error?.message,
      type: error?.type,
      code: error?.code,
      raw_type: error?.raw?.type,
      charge_error: error?.raw?.charge?.outcome?.reason,
    });

    // Map Stripe error codes to user-friendly messages
    const errorMessages: Record<string, string> = {
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
export async function purchaseNumber(req: Request, res: Response) {
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
    const SETUP_FEE_CENTS = 50; // $0.50 (Stripe minimum)
    const isPaymentValid = await verifyPaymentIntent(
      paymentIntentId,
      church.stripeCustomerId,
      SETUP_FEE_CENTS,
      phoneNumber
    );

    if (!isPaymentValid) {
      console.warn(`⚠️ Payment verification failed for church ${churchId}`);
      return res.status(402).json({
        error: 'Payment verification failed. Please ensure payment was successful.',
      });
    }

    // Create webhook first to get messaging profile ID
    let webhookId: string | null = null;
    try {
      const webhookUrl = `${process.env.BACKEND_URL || 'https://api.koinoniasms.com'}/api/webhooks/telnyx/mms`;
      const webhook = await createWebhook(webhookUrl);
      webhookId = webhook.id;
      console.log(`✅ Webhook auto-created for purchased number, church ${churchId}: ${webhookId}`);
    } catch (webhookError: any) {
      console.warn(`⚠️ Webhook creation failed for purchased number, but continuing: ${webhookError.message}`);
    }

    // Purchase the phone number with Telnyx and link to messaging profile
    const result = await purchasePhoneNumber(phoneNumber, churchId, connectionId, webhookId || undefined);

    // Update church with purchased phone number and webhook ID
    const updated = await prisma.church.update({
      where: { id: churchId },
      data: {
        telnyxPhoneNumber: phoneNumber,
        telnyxNumberSid: result.numberSid,
        telnyxVerified: true,
        telnyxWebhookId: webhookId,
        telnyxPurchasedAt: new Date(),
      },
      select: {
        id: true,
        telnyxPhoneNumber: true,
        telnyxWebhookId: true,
        telnyxVerified: true,
      },
    });

    console.log(`✅ Phone number purchase completed and auto-linked for church ${churchId}: ${phoneNumber}`);

    res.json({
      success: true,
      data: {
        ...result,
        phoneNumber: updated.telnyxPhoneNumber,
        webhookId: updated.telnyxWebhookId,
        verified: updated.telnyxVerified,
        autoLinked: true,
        message: webhookId
          ? 'Phone number purchased and automatically linked with webhook!'
          : 'Phone number purchased and linked! Please configure webhook manually in Telnyx dashboard.',
      },
    });
  } catch (error: any) {
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
export async function getCurrentNumber(req: Request, res: Response) {
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
  } catch (error) {
    console.error('Failed to get current number:', error);
    res.status(500).json({ error: 'Failed to get current number' });
  }
}

/**
 * DELETE /api/numbers/current
 * Release/delete the church's phone number
 */
export async function releaseCurrentNumber(req: Request, res: Response) {
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
  } catch (error) {
    console.error('Failed to release number:', error);
    res.status(500).json({ error: (error as any).message || 'Failed to release number' });
  }
}
