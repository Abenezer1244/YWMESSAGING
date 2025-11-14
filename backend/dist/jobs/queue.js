import Bull from 'bull';
import { PrismaClient } from '@prisma/client';
import * as telnyxService from '../services/telnyx.service.js';
import * as telnyxMMSService from '../services/telnyx-mms.service.js';
const prisma = new PrismaClient();
const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
// Create job queues
export const mailQueue = new Bull('mail', redisUrl);
export const smsQueue = new Bull('sms', redisUrl);
export const mmsQueue = new Bull('mms', redisUrl);
export const analyticsQueue = new Bull('analytics', redisUrl);
// ============ QUEUE ERROR HANDLERS ============
mailQueue.on('error', (err) => {
    console.error('❌ Mail queue error:', err);
});
smsQueue.on('error', (err) => {
    console.error('❌ SMS queue error:', err);
});
mmsQueue.on('error', (err) => {
    console.error('❌ MMS queue error:', err);
});
analyticsQueue.on('error', (err) => {
    console.error('❌ Analytics queue error:', err);
});
// ============ QUEUE COMPLETION HANDLERS ============
mailQueue.on('completed', (job) => {
    console.log(`✅ Mail job ${job.id} completed`);
});
smsQueue.on('completed', (job) => {
    console.log(`✅ SMS job ${job.id} completed`);
});
mmsQueue.on('completed', (job) => {
    console.log(`✅ MMS job ${job.id} completed`);
});
analyticsQueue.on('completed', (job) => {
    console.log(`✅ Analytics job ${job.id} completed`);
});
// ============ QUEUE FAILURE HANDLERS ============
smsQueue.on('failed', (job, error) => {
    console.error(`❌ SMS job ${job.id} failed: ${error.message}`);
});
mmsQueue.on('failed', (job, error) => {
    console.error(`❌ MMS job ${job.id} failed: ${error.message}`);
});
// ============ SMS JOB PROCESSOR ============
// Process SMS messages from MessageQueue
smsQueue.process(async (job) => {
    const { phone, churchId, content, conversationMessageId } = job.data;
    try {
        console.log(`📤 SMS Queue: Processing job ${job.id}`);
        console.log(`   To: ${phone}`);
        console.log(`   Content: ${content.substring(0, 50)}...`);
        // Send via Telnyx
        const result = await telnyxService.sendSMS(content, phone, churchId);
        // Update message with Telnyx ID
        if (conversationMessageId) {
            await prisma.conversationMessage.update({
                where: { id: conversationMessageId },
                data: {
                    providerMessageId: result.messageSid,
                    deliveryStatus: 'pending',
                },
            });
        }
        // Update queue status
        await prisma.messageQueue.update({
            where: {
                id: job.data.queueId || conversationMessageId,
            },
            data: {
                status: 'sent',
                sentAt: new Date(),
            },
        }).catch(() => {
            // Ignore if queue record not found
        });
        console.log(`✅ SMS sent: ${result.messageSid}`);
        return { success: true, messageSid: result.messageSid };
    }
    catch (error) {
        console.error(`❌ SMS job failed: ${error.message}`);
        // Update queue with error
        if (job.data.queueId) {
            await prisma.messageQueue.update({
                where: { id: job.data.queueId },
                data: {
                    status: 'failed',
                    lastError: error.message,
                    retryCount: (job.data.retryCount || 0) + 1,
                    failedAt: new Date(),
                },
            }).catch(() => {
                // Ignore if queue record not found
            });
        }
        throw error;
    }
});
// ============ MMS JOB PROCESSOR ============
// Process MMS messages with media attachments from MessageQueue
mmsQueue.process(async (job) => {
    const { phone, churchId, content, mediaS3Url, conversationMessageId } = job.data;
    try {
        console.log(`📤 MMS Queue: Processing job ${job.id}`);
        console.log(`   To: ${phone}`);
        console.log(`   Content: ${content.substring(0, 50)}...`);
        if (mediaS3Url) {
            console.log(`   Media: ${mediaS3Url.substring(0, 80)}...`);
        }
        // Send via Telnyx (with media attachment)
        const result = await telnyxMMSService.sendMMS(phone, content, churchId, mediaS3Url);
        // Update message with Telnyx ID
        if (conversationMessageId) {
            await prisma.conversationMessage.update({
                where: { id: conversationMessageId },
                data: {
                    providerMessageId: result.messageSid,
                    deliveryStatus: 'pending',
                },
            });
        }
        // Update queue status
        await prisma.messageQueue.update({
            where: {
                id: job.data.queueId || conversationMessageId,
            },
            data: {
                status: 'sent',
                sentAt: new Date(),
            },
        }).catch(() => {
            // Ignore if queue record not found
        });
        console.log(`✅ MMS sent: ${result.messageSid}`);
        return { success: true, messageSid: result.messageSid };
    }
    catch (error) {
        console.error(`❌ MMS job failed: ${error.message}`);
        // Update queue with error
        if (job.data.queueId) {
            await prisma.messageQueue.update({
                where: { id: job.data.queueId },
                data: {
                    status: 'failed',
                    lastError: error.message,
                    retryCount: (job.data.retryCount || 0) + 1,
                    failedAt: new Date(),
                },
            }).catch(() => {
                // Ignore if queue record not found
            });
        }
        throw error;
    }
});
// ============ QUEUE UTILITIES ============
export async function closeQueues() {
    await Promise.all([
        mailQueue.close(),
        smsQueue.close(),
        mmsQueue.close(),
        analyticsQueue.close(),
    ]);
    console.log('✅ All queues closed');
}
//# sourceMappingURL=queue.js.map