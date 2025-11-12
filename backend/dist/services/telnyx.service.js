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
    }
    catch (error) {
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
export async function purchasePhoneNumber(phoneNumber, churchId, connectionId) {
    try {
        const client = getTelnyxClient();
        // Use /number_orders endpoint to purchase phone numbers
        const response = await client.post('/number_orders', {
            phone_numbers: [{ phone_number: phoneNumber }],
            customer_reference: `church_${churchId}`,
        });
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
 * Release/delete a phone number
 */
export async function releasePhoneNumber(numberSid, churchId) {
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
    }
    catch (error) {
        const errorMessage = error.response?.data?.errors?.[0]?.detail || error.message || 'Failed to release number';
        throw new Error(`Telnyx error: ${errorMessage}`);
    }
}
//# sourceMappingURL=telnyx.service.js.map