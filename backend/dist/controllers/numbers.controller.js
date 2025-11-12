import { PrismaClient } from '@prisma/client';
import { searchAvailableNumbers, purchasePhoneNumber, releasePhoneNumber, validateTelnyxApiKey, } from '../services/telnyx.service.js';
const prisma = new PrismaClient();
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
 * POST /api/numbers/purchase
 * Purchase a phone number for the church
 * Body: { phoneNumber, connectionId? }
 */
export async function purchaseNumber(req, res) {
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
    }
    catch (error) {
        console.error('Failed to purchase number:', error);
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