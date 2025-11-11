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
      return res.status(500).json({ error: 'Telnyx API not configured' });
    }

    const { areaCode, state, contains, quantity } = req.query;

    const numbers = await searchAvailableNumbers({
      areaCode: areaCode as string,
      state: state as string,
      contains: contains as string,
      quantity: quantity ? parseInt(quantity as string) : 10,
    });

    res.json({ success: true, data: numbers });
  } catch (error) {
    console.error('Failed to search numbers:', error);
    res.status(500).json({ error: (error as any).message || 'Failed to search numbers' });
  }
}

/**
 * POST /api/numbers/purchase
 * Purchase a phone number for the church
 * Body: { phoneNumber, connectionId? }
 */
export async function purchaseNumber(req: Request, res: Response) {
  try {
    const churchId = req.user?.churchId;
    if (!churchId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { phoneNumber, connectionId } = req.body;

    if (!phoneNumber || typeof phoneNumber !== 'string') {
      return res.status(400).json({ error: 'Phone number is required' });
    }

    // Check if church already has a number
    const church = await prisma.church.findUnique({
      where: { id: churchId },
      select: { telnyxPhoneNumber: true },
    });

    if (church?.telnyxPhoneNumber) {
      return res.status(400).json({ error: 'Church already has a phone number' });
    }

    const result = await purchasePhoneNumber(phoneNumber, churchId, connectionId);

    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Failed to purchase number:', error);
    res.status(500).json({ error: (error as any).message || 'Failed to purchase number' });
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
