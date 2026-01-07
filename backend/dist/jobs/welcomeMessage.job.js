import { getTenantPrisma, getRegistryPrisma } from '../lib/tenant-prisma.js';
import * as telnyxService from '../services/telnyx.service.js';
import * as billingService from '../services/billing.service.js';
/**
 * Send welcome message when a member is added to a church
 * PHASE 5: Multi-tenant refactoring
 * - Uses tenantPrisma for member (tenant-scoped)
 * - Uses registryPrisma for church (shared registry)
 */
export async function sendWelcomeMessage(memberId, churchId // Actually tenantId
) {
    try {
        // Get tenant-scoped and registry clients
        const tenantPrisma = await getTenantPrisma(churchId);
        const registryPrisma = getRegistryPrisma();
        // Fetch member from tenant database and church from registry
        const [member, church] = await Promise.all([
            tenantPrisma.member.findUnique({
                where: { id: memberId },
            }),
            registryPrisma.church.findUnique({
                where: { id: churchId },
            }),
        ]);
        if (!member || !church) {
            return;
        }
        // 10DLC Compliant welcome message with opt-out instructions
        const welcomeText = `KoinoniaSMS: Thanks for subscribing to church updates! Reply HELP for help. Message frequency may vary. Msg&data rates may apply. Consent is not a condition of purchase. Reply STOP to opt out.`;
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