import Bull from 'bull';
import { getTenantPrisma } from '../lib/tenant-prisma.js';
import * as telnyxService from '../services/telnyx.service.js';
import * as telnyxMMSService from '../services/telnyx-mms.service.js';
import * as rcsService from '../services/telnyx-rcs.service.js';
const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

// ✅ PHASE 1: SMS queue re-enabled for improved reliability and throughput
// Queues are created when ENABLE_QUEUES=true (set in .env or deployment config)
// This provides exponential backoff retry, job tracking, and better error handling

let mailQueue: any = null;
let smsQueue: any = null;
let mmsQueue: any = null;
let analyticsQueue: any = null;

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
// Process SMS messages from message queue
// ✅ PHASE 1: Handles both new broadcast messages and legacy conversation messages
// Only register if queues are enabled
if (smsQueue) {
  smsQueue.process(async (job) => {
  const { phone, churchId, content, recipientId, messageId, conversationMessageId, queueId, richCard } = job.data;

  try {
    console.log(`📤 SMS Queue: Processing job ${job.id}`);
    console.log(`   To: ${phone}`);
    console.log(`   Content: ${content.substring(0, 50)}...`);
    console.log(`   Attempt: ${job.attemptsMade + 1}/${job.opts.attempts}`);
    if (richCard) {
      console.log(`   RCS Rich Card: ${richCard.title}`);
    }

    const tenantPrisma = await getTenantPrisma(churchId);

    let providerMessageId: string;

    // ✅ RCS: Use rich card if data provided (iMessage-style)
    if (richCard && richCard.title) {
      const rcsResult = await rcsService.sendChurchAnnouncement(
        phone,
        churchId,
        {
          title: richCard.title,
          description: richCard.description || content,
          imageUrl: richCard.imageUrl,
          rsvpUrl: richCard.rsvpUrl,
          websiteUrl: richCard.websiteUrl,
          phoneNumber: richCard.phoneNumber,
          location: richCard.location,
          quickReplies: richCard.quickReplies,
        }
      );
      providerMessageId = rcsResult.messageId;
      console.log(`   ✓ Sent via ${rcsResult.channel.toUpperCase()}`);
    } else {
      // Standard SMS
      const result = await telnyxService.sendSMS(phone, content, churchId);
      providerMessageId = result.messageSid;
    }

    // Update messageRecipient with provider message ID (for new broadcast messages)
    if (recipientId) {
      await tenantPrisma.messageRecipient.update({
        where: { id: recipientId },
        data: {
          providerMessageId: providerMessageId,
          status: 'pending',
        },
      }).catch((err) => {
        console.warn(`Warning: Could not update messageRecipient ${recipientId}: ${err.message}`);
      });
    }

    // Update conversationMessage with provider message ID (for legacy conversation messages)
    if (conversationMessageId) {
      await tenantPrisma.conversationMessage.update({
        where: { id: conversationMessageId },
        data: {
          providerMessageId: providerMessageId,
          deliveryStatus: 'pending',
        },
      }).catch((err) => {
        console.warn(`Warning: Could not update conversationMessage ${conversationMessageId}: ${err.message}`);
      });
    }

    // Update legacy messageQueue status if present
    if (queueId) {
      await tenantPrisma.messageQueue.update({
        where: { id: queueId },
        data: {
          status: 'sent',
          sentAt: new Date(),
        },
      }).catch(() => {
        // Ignore if queue record not found
      });
    }

    console.log(`✅ Message sent: ${providerMessageId}`);
    return { success: true, messageSid: providerMessageId };
  } catch (error: any) {
    console.error(`❌ SMS job ${job.id} failed (attempt ${job.attemptsMade + 1}): ${error.message}`);

    const tenantPrisma = await getTenantPrisma(job.data.churchId);

    // Update messageRecipient status on final failure
    if (recipientId && job.attemptsMade + 1 >= job.opts.attempts) {
      await tenantPrisma.messageRecipient.update({
        where: { id: recipientId },
        data: {
          status: 'failed',
          failureReason: error.message,
          failedAt: new Date(),
        },
      }).catch((err) => {
        console.warn(`Warning: Could not mark recipient as failed: ${err.message}`);
      });
    }

    // Update legacy queue with error
    if (queueId) {
      await tenantPrisma.messageQueue.update({
        where: { id: queueId },
        data: {
          status: 'failed',
          lastError: error.message,
          retryCount: job.attemptsMade,
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

    const tenantPrisma = await getTenantPrisma(churchId);

    // Send via Telnyx (with media attachment)
    const result = await telnyxMMSService.sendMMS(
      phone,
      content,
      churchId,
      mediaS3Url
    );

    // Update message with Telnyx ID
    if (conversationMessageId) {
      await tenantPrisma.conversationMessage.update({
        where: { id: conversationMessageId },
        data: {
          providerMessageId: result.messageSid,
          deliveryStatus: 'pending',
        },
      });
    }

    // Update queue status
    await tenantPrisma.messageQueue.update({
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
  } catch (error: any) {
    console.error(`❌ MMS job failed: ${error.message}`);

    const tenantPrisma = await getTenantPrisma(job.data.churchId);

    // Update queue with error
    if (job.data.queueId) {
      await tenantPrisma.messageQueue.update({
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
  const closingPromises: Promise<any>[] = [];

  if (mailQueue) closingPromises.push(mailQueue.close());
  if (smsQueue) closingPromises.push(smsQueue.close());
  if (mmsQueue) closingPromises.push(mmsQueue.close());
  if (analyticsQueue) closingPromises.push(analyticsQueue.close());

  if (closingPromises.length > 0) {
    await Promise.all(closingPromises);
    console.log('✅ All queues closed');
  }
}
