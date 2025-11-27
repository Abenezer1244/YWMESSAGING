import type { CircuitBreakerStats } from './circuit-breaker.service.js';
/**
 * Priority 3.2: Message Delivery Service
 *
 * Handles SMS delivery with reliability features:
 * 1. Exponential backoff retry (1s, 2s, 4s delays)
 * 2. Circuit breaker pattern (prevent Telnyx API overload)
 * 3. Delivery tracking and webhook validation
 * 4. Dead Letter Queue (DLQ) for permanent failures
 *
 * Impact:
 * - 95%+ message delivery success rate
 * - Graceful degradation during API outages
 * - Better visibility into delivery failures
 * - Prevents cascading failures
 */
interface DeliveryOptions {
    maxRetries?: number;
    initialDelay?: number;
    maxDelay?: number;
    backoffMultiplier?: number;
}
interface DeliveryResult {
    success: boolean;
    messageId: string;
    recipient: string;
    attempts: number;
    lastError?: string | undefined;
    timestamp: Date;
}
interface FailedMessage {
    messageId: string;
    recipient: string;
    content: string;
    churchId: string;
    failureReason: string;
    attempts: number;
    timestamp: Date;
}
/**
 * Send SMS with delivery tracking
 */
export declare function sendSMSWithDeliveryTracking(phoneNumber: string, content: string, churchId: string, messageId: string, options?: DeliveryOptions): Promise<DeliveryResult>;
/**
 * Send SMS to multiple recipients with parallel delivery
 * Uses Promise.allSettled to ensure all send attempts complete
 */
export declare function broadcastSMSWithDeliveryTracking(recipients: Array<{
    id: string;
    phone: string;
}>, content: string, churchId: string, messageId: string, options?: DeliveryOptions): Promise<{
    successful: DeliveryResult[];
    failed: DeliveryResult[];
    dlqCount: number;
}>;
/**
 * Get Dead Letter Queue messages for monitoring dashboard
 */
export declare function getDLQMessages(limit?: number): Promise<FailedMessage[]>;
/**
 * Retry a message from Dead Letter Queue
 */
export declare function retryFromDLQ(messageId: string): Promise<DeliveryResult>;
/**
 * Get circuit breaker stats for monitoring
 */
export declare function getCircuitBreakerStats(): CircuitBreakerStats;
export {};
//# sourceMappingURL=message-delivery.service.d.ts.map