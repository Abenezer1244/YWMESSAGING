import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AccessTokenPayload } from '../utils/jwt.utils.js';
import {
  searchAvailableNumbers,
  purchasePhoneNumber,
  releasePhoneNumber,
  getPhoneNumberDetails,
  validateTelnyxApiKey,
} from '../services/telnyx.service.js';
import {
  createPhoneNumberSetupPaymentIntent,
  verifyPaymentIntent,
} from '../services/stripe.service.js';

const prisma = new PrismaClient();

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

    const paymentIntent = await createPhoneNumberSetupPaymentIntent(
      church.stripeCustomerId,
      phoneNumber
    );

    res.json({ success: true, data: paymentIntent });
  } catch (error: any) {
    console.error('Failed to create payment intent:', error);
    res.status(500).json({ error: error.message || 'Failed to create payment intent' });
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
    const SETUP_FEE_CENTS = 499; // $4.99
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

    // Purchase the phone number with Telnyx (only after payment verified)
    const result = await purchasePhoneNumber(phoneNumber, churchId, connectionId);

    res.json({ success: true, data: result });
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
