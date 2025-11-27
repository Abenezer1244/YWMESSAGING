import { telnyxCircuitBreaker } from './circuit-breaker.service.js';
import { redisClient } from '../config/redis.config.js';
/**
 * Calculate exponential backoff delay
 * retry=1: 1s, retry=2: 2s, retry=3: 4s, etc.
 */
function calculateBackoffDelay(retryCount, initialDelay = 1000, multiplier = 2) {
    return initialDelay * Math.pow(multiplier, retryCount - 1);
}
/**
 * Store failed message in Dead Letter Queue for manual review
 */
async function storeInDLQ(message) {
    try {
        const dlqKey = `dlq:${message.messageId}`;
        await redisClient.setEx(dlqKey, 24 * 60 * 60, // Keep for 24 hours
        JSON.stringify({
            ...message,
            timestamp: message.timestamp.toISOString(),
            storedAt: new Date().toISOString(),
        }));
        // Add to DLQ list for monitoring
        await redisClient.lPush('dlq:messages', dlqKey);
        console.log(`🗑️ Message added to DLQ: ${message.messageId}`);
    }
    catch (error) {
        console.error('❌ Failed to store message in DLQ:', error.message);
    }
}
/**
 * Send SMS with delivery tracking
 */
export async function sendSMSWithDeliveryTracking(phoneNumber, content, churchId, messageId, options = {}) {
    const config = {
        maxRetries: options.maxRetries || 3,
        initialDelay: options.initialDelay || 1000,
        maxDelay: options.maxDelay || 8000,
        backoffMultiplier: options.backoffMultiplier || 2,
    };
    let lastError;
    let attempt = 0;
    // Try delivery with exponential backoff
    for (attempt = 1; attempt <= config.maxRetries; attempt++) {
        try {
            // Check circuit breaker before attempting
            if (!telnyxCircuitBreaker.canAttempt()) {
                lastError = 'Circuit breaker OPEN - service unavailable';
                console.log(`⚠️ [Attempt ${attempt}] Circuit breaker open, retry after cooldown`);
                // Store in DLQ if all retries exhausted
                if (attempt === config.maxRetries) {
                    await storeInDLQ({
                        messageId,
                        recipient: phoneNumber,
                        content,
                        churchId,
                        failureReason: lastError,
                        attempts: attempt,
                        timestamp: new Date(),
                    });
                }
                continue; // Retry with exponential backoff
            }
            // Attempt to send via Telnyx API
            console.log(`📤 [Attempt ${attempt}/${config.maxRetries}] Sending to ${phoneNumber}`);
            // Import sendSMS directly from telnyx service (avoid circular imports)
            const { sendSMS } = await import('./telnyx.service.js');
            const result = await sendSMS(phoneNumber, content, churchId);
            // Success!
            telnyxCircuitBreaker.recordSuccess();
            console.log(`✅ [Attempt ${attempt}] Delivery successful: ${result}`);
            return {
                success: true,
                messageId,
                recipient: phoneNumber,
                attempts: attempt,
                timestamp: new Date(),
            };
        }
        catch (error) {
            lastError = error.message;
            telnyxCircuitBreaker.recordFailure();
            const delay = calculateBackoffDelay(attempt, config.initialDelay, config.backoffMultiplier);
            console.log(`❌ [Attempt ${attempt}/${config.maxRetries}] Delivery failed: ${lastError}`);
            console.log(`   Retrying in ${delay}ms...`);
            // If this was the last attempt, store in DLQ
            if (attempt === config.maxRetries) {
                await storeInDLQ({
                    messageId,
                    recipient: phoneNumber,
                    content,
                    churchId,
                    failureReason: lastError || 'Unknown error',
                    attempts: attempt,
                    timestamp: new Date(),
                });
                console.log(`📋 Message moved to Dead Letter Queue after ${attempt} failed attempts`);
                return {
                    success: false,
                    messageId,
                    recipient: phoneNumber,
                    attempts: attempt,
                    lastError,
                    timestamp: new Date(),
                };
            }
            // Wait before retrying (exponential backoff)
            await new Promise((resolve) => setTimeout(resolve, delay));
        }
    }
    // All retries exhausted
    return {
        success: false,
        messageId,
        recipient: phoneNumber,
        attempts: attempt,
        lastError,
        timestamp: new Date(),
    };
}
/**
 * Send SMS to multiple recipients with parallel delivery
 * Uses Promise.allSettled to ensure all send attempts complete
 */
export async function broadcastSMSWithDeliveryTracking(recipients, content, churchId, messageId, options = {}) {
    console.log(`📤 Broadcasting message to ${recipients.length} recipients with delivery tracking`);
    // Send to all recipients in parallel
    const sendPromises = recipients.map((recipient) => sendSMSWithDeliveryTracking(recipient.phone, content, churchId, messageId, options));
    const results = await Promise.allSettled(sendPromises);
    // Separate successful and failed deliveries
    const successful = [];
    const failed = [];
    let dlqCount = 0;
    for (const result of results) {
        if (result.status === 'fulfilled') {
            if (result.value.success) {
                successful.push(result.value);
            }
            else {
                failed.push(result.value);
                // Only count those that went to DLQ (maxed out retries)
                if (result.value.attempts >= 3) {
                    dlqCount++;
                }
            }
        }
        else {
            // Promise rejected - treat as delivery failure
            failed.push({
                success: false,
                messageId,
                recipient: 'unknown',
                attempts: 0,
                lastError: result.reason?.message || 'Unknown error',
                timestamp: new Date(),
            });
        }
    }
    const totalDelivered = successful.length;
    const totalFailed = failed.length;
    const successRate = ((totalDelivered / recipients.length) * 100).toFixed(1);
    console.log(`📊 Broadcast complete: ${totalDelivered}/${recipients.length} delivered (${successRate}%)`);
    console.log(`   📋 ${dlqCount} messages in Dead Letter Queue for manual review`);
    return {
        successful,
        failed,
        dlqCount,
    };
}
/**
 * Get Dead Letter Queue messages for monitoring dashboard
 */
export async function getDLQMessages(limit = 100) {
    try {
        const dlqKeys = await redisClient.lRange('dlq:messages', 0, limit - 1);
        const messages = [];
        for (const key of dlqKeys) {
            const data = await redisClient.get(key);
            if (data) {
                messages.push(JSON.parse(data));
            }
        }
        return messages;
    }
    catch (error) {
        console.error('❌ Failed to retrieve DLQ messages:', error.message);
        return [];
    }
}
/**
 * Retry a message from Dead Letter Queue
 */
export async function retryFromDLQ(messageId) {
    try {
        const dlqKey = `dlq:${messageId}`;
        const data = await redisClient.get(dlqKey);
        if (!data) {
            throw new Error('Message not found in DLQ');
        }
        const message = JSON.parse(data);
        console.log(`🔄 Retrying DLQ message: ${messageId}`);
        const result = await sendSMSWithDeliveryTracking(message.recipient, message.content, message.churchId, messageId, {
            maxRetries: 3,
            initialDelay: 1000,
        });
        if (result.success) {
            // Remove from DLQ if successful
            await redisClient.del(dlqKey);
            await redisClient.lRem('dlq:messages', 1, dlqKey);
            console.log(`✅ Successfully retried DLQ message: ${messageId}`);
        }
        return result;
    }
    catch (error) {
        console.error(`❌ Failed to retry DLQ message ${messageId}:`, error.message);
        return {
            success: false,
            messageId,
            recipient: 'unknown',
            attempts: 0,
            lastError: error.message,
            timestamp: new Date(),
        };
    }
}
/**
 * Get circuit breaker stats for monitoring
 */
export function getCircuitBreakerStats() {
    return telnyxCircuitBreaker.getStats();
}
//# sourceMappingURL=message-delivery.service.js.map