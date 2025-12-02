/**
 * Retry Utility with Exponential Backoff
 *
 * Handles transient failures with exponential backoff + jitter
 * to prevent thundering herd problem.
 *
 * Transient errors (retried):
 * - Network timeouts
 * - 5xx server errors
 * - 429 rate limit errors
 *
 * Permanent errors (not retried):
 * - 4xx client errors (except 429)
 * - Authentication errors
 * - Validation errors
 */
interface RetryConfig {
    maxRetries: number;
    initialDelayMs: number;
    maxDelayMs: number;
    backoffMultiplier: number;
    jitterFactor: number;
}
/**
 * Default retry config for Telnyx (user-facing, more tolerant)
 */
export declare const TELNYX_RETRY_CONFIG: RetryConfig;
/**
 * Default retry config for Stripe (financial, conservative)
 */
export declare const STRIPE_RETRY_CONFIG: RetryConfig;
/**
 * Retry a function with exponential backoff
 *
 * Example:
 * ```typescript
 * const result = await withRetry(
 *   async () => sendSMS(to, message, churchId),
 *   'sendSMS',
 *   TELNYX_RETRY_CONFIG
 * );
 * ```
 */
export declare function withRetry<T>(fn: () => Promise<T>, operationName: string, config: RetryConfig): Promise<T>;
/**
 * Retry helper that combines circuit breaker check + retry logic
 * Used when you want circuit breaker + retry both active
 */
export declare function withRetryAndCircuitBreaker<T>(fn: () => Promise<T>, operationName: string, retryConfig: RetryConfig): Promise<T>;
export {};
//# sourceMappingURL=retry.d.ts.map