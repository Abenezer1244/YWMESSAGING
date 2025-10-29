import twilio from 'twilio';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
/**
 * Send SMS via Twilio
 */
export async function sendSMS(to, message, churchId) {
    // Get church Twilio credentials
    const church = await prisma.church.findUnique({
        where: { id: churchId },
        select: {
            twilioAccountSid: true,
            twilioAuthToken: true,
            twilioPhoneNumber: true,
        },
    });
    if (!church?.twilioAccountSid || !church?.twilioAuthToken || !church?.twilioPhoneNumber) {
        throw new Error('Twilio credentials not configured for this church');
    }
    // Initialize Twilio client
    const client = twilio(church.twilioAccountSid, church.twilioAuthToken);
    try {
        const result = await client.messages.create({
            body: message,
            from: church.twilioPhoneNumber,
            to: to,
        });
        return {
            messageSid: result.sid,
            success: true,
        };
    }
    catch (error) {
        const errorMessage = error.message || 'Failed to send SMS';
        throw new Error(`Twilio error: ${errorMessage}`);
    }
}
/**
 * Validate Twilio credentials
 */
export async function validateTwilioCredentials(accountSid, authToken, phoneNumber) {
    try {
        const client = twilio(accountSid, authToken);
        // Try to fetch the account details to validate credentials
        await client.api.accounts(accountSid).fetch();
        return true;
    }
    catch (error) {
        return false;
    }
}
//# sourceMappingURL=twilio.service.js.map