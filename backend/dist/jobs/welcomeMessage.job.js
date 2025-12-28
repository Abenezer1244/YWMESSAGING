import { PrismaClient } from '@prisma/client';
import * as telnyxService from '../services/telnyx.service.js';
import * as billingService from '../services/billing.service.js';
const prisma = new PrismaClient();
/**
 * Send welcome message when a member is added to a church
 * Note: Group functionality has been removed
 */
export async function sendWelcomeMessage(memberId, churchId) {
    try {
        // Fetch member and church details
        const [member, church] = await Promise.all([
            prisma.member.findUnique({
                where: { id: memberId },
            }),
            prisma.church.findUnique({
                where: { id: churchId },
            }),
        ]);
        if (!member || !church) {
            return;
        }
        const welcomeText = `Welcome to ${church.name}!`;
        // Send SMS via Telnyx
        await telnyxService.sendSMS(member.phone, welcomeText, churchId);
        // Record SMS usage for billing (Option 3: $0.02 per SMS)
        const billingResult = await billingService.recordSMSUsage(churchId, 'sent');
        console.log(`[Billing] Welcome SMS recorded: $${billingResult.cost} for church ${churchId}`);
        console.log(`Welcome message sent to ${member.phone} for church ${church.name}`);
    }
    catch (error) {
        console.error('Error sending welcome message:', error);
    }
}
/**
 * Helper to call welcome message job with delay
 */
export async function queueWelcomeMessage(memberId, churchId, delayMs = 60000 // 1 minute default
) {
    // In a real implementation with Bull queue, this would be:
    // await welcomeMessageQueue.add(
    //   { memberId, churchId },
    //   { delay: delayMs }
    // );
    // For now, schedule with setTimeout
    setTimeout(() => {
        sendWelcomeMessage(memberId, churchId).catch((error) => console.error('Welcome message job failed:', error));
    }, delayMs);
}
//# sourceMappingURL=welcomeMessage.job.js.map