import Bull from 'bull';
import { PrismaClient } from '@prisma/client';
import * as telnyxService from '../services/telnyx.service.js';
import * as telnyxMMSService from '../services/telnyx-mms.service.js';
const prisma = new PrismaClient();
const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
// DEPRECATED: Queues are no longer used - messages are sent synchronously
// Keep this file for reference only. Queue creation disabled.
// To re-enable queues in the future, uncomment the lines below and set ENABLE_QUEUES=true
let mailQueue = null;
let smsQueue = null;
let mmsQueue = null;
let analyticsQueue = null;
// Only create queues if explicitly enabled via environment variable
if (process.env.ENABLE_QUEUES === 'true') {
    mailQueue = new Bull('mail', redisUrl);
    smsQueue = new Bull('sms', redisUrl);
    mmsQueue = new Bull('mms', redisUrl);
    analyticsQueue = new Bull('analytics', redisUrl);
}
// Export empty objects if queues are disabled
export { mailQueue, smsQueue, mmsQueue, analyticsQueue };
// ============ QUEUE EVENT HANDLERS ============
// Only attach handlers if queues are enabled
if (mailQueue) {
    mailQueue.on('error', (err) => {
        console.error('❌ Mail queue error:', err);
    });
    mailQueue.on('completed', (job) => {
        console.log(`✅ Mail job ${job.id} completed`);
    });
}
if (smsQueue) {
    smsQueue.on('error', (err) => {
        console.error('❌ SMS queue error:', err);
    });
    smsQueue.on('completed', (job) => {
        console.log(`✅ SMS job ${job.id} completed`);
    });
    smsQueue.on('failed', (job, error) => {
        console.error(`❌ SMS job ${job.id} failed: ${error.message}`);
    });
}
if (mmsQueue) {
    mmsQueue.on('error', (err) => {
        console.error('❌ MMS queue error:', err);
    });
    mmsQueue.on('completed', (job) => {
        console.log(`✅ MMS job ${job.id} completed`);
    });
    mmsQueue.on('failed', (job, error) => {
        console.error(`❌ MMS job ${job.id} failed: ${error.message}`);
    });
}
if (analyticsQueue) {
    analyticsQueue.on('error', (err) => {
        console.error('❌ Analytics queue error:', err);
    });
    analyticsQueue.on('completed', (job) => {
        console.log(`✅ Analytics job ${job.id} completed`);
    });
}
// ============ SMS JOB PROCESSOR ============
// Process SMS messages from MessageQueue
// Only register if queues are enabled
if (smsQueue) {
    smsQueue.process(async (job) => {
        const { phone, churchId, content, conversationMessageId } = job.data;
        try {
            console.log(`📤 SMS Queue: Processing job ${job.id}`);
            console.log(`   To: ${phone}`);
            console.log(`   Content: ${content.substring(0, 50)}...`);
            // Send via Telnyx
            const result = await telnyxService.sendSMS(phone, content, churchId);
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
}
// ============ MMS JOB PROCESSOR ============
// Process MMS messages with media attachments from MessageQueue
// Only register if queues are enabled
if (mmsQueue) {
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
}
// ============ QUEUE UTILITIES ============
export async function closeQueues() {
    const closingPromises = [];
    if (mailQueue)
        closingPromises.push(mailQueue.close());
    if (smsQueue)
        closingPromises.push(smsQueue.close());
    if (mmsQueue)
        closingPromises.push(mmsQueue.close());
    if (analyticsQueue)
        closingPromises.push(analyticsQueue.close());
    if (closingPromises.length > 0) {
        await Promise.all(closingPromises);
        console.log('✅ All queues closed');
    }
}
//# sourceMappingURL=queue.js.map