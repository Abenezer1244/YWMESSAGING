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
  jitterFactor: number; // 0.0-1.0, recommended 0.1
}

/**
 * Default retry config for Telnyx (user-facing, more tolerant)
 */
export const TELNYX_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  initialDelayMs: 1000, // Start at 1 second
  maxDelayMs: 30000, // Cap at 30 seconds
  backoffMultiplier: 2,
  jitterFactor: 0.1, // 10% jitter
};

/**
 * Default retry config for Stripe (financial, conservative)
 */
export const STRIPE_RETRY_CONFIG: RetryConfig = {
  maxRetries: 2,
  initialDelayMs: 500, // Start at 500ms
  maxDelayMs: 10000, // Cap at 10 seconds
  backoffMultiplier: 2,
  jitterFactor: 0.1,
};

/**
 * Determine if an error is transient (should be retried)
 */
function isTransientError(error: any): boolean {
  // Check for network timeout
  if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
    return true;
  }

  // Check for socket errors
  if (error.code === 'ECONNRESET' || error.code === 'ENOTFOUND') {
    return true;
  }

  // Check HTTP status code
  if (error.response?.status) {
    const status = error.response.status;
    // Retry on 5xx server errors
    if (status >= 500 && status < 600) {
      return true;
    }
    // Retry on 429 rate limit
    if (status === 429) {
      return true;
    }
  }

  // Don't retry circuit breaker errors
  if (error.message?.includes('Circuit breaker')) {
    return false;
  }

  return false;
}

/**
 * Calculate delay with exponential backoff and jitter
 */
function calculateBackoffDelay(
  attempt: number,
  config: RetryConfig
): number {
  // Exponential backoff: initialDelay * (multiplier ^ attempt)
  const exponentialDelay = Math.min(
    config.initialDelayMs * Math.pow(config.backoffMultiplier, attempt),
    config.maxDelayMs
  );

  // Add jitter: ± jitterFactor * exponentialDelay
  const jitterAmount = exponentialDelay * config.jitterFactor;
  const randomJitter = Math.random() * jitterAmount - jitterAmount / 2;

  return Math.max(0, Math.round(exponentialDelay + randomJitter));
}

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
export async function withRetry<T>(
  fn: () => Promise<T>,
  operationName: string,
  config: RetryConfig
): Promise<T> {
  let lastError: any;

  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;

      // If not a transient error, throw immediately
      if (!isTransientError(error)) {
        throw error;
      }

      // If last retry, throw
      if (attempt === config.maxRetries) {
        throw error;
      }

      // Calculate backoff and wait
      const delayMs = calculateBackoffDelay(attempt, config);
      console.warn(
        `⚠️ [RETRY] ${operationName} failed (attempt ${attempt + 1}/${config.maxRetries + 1}). Retrying in ${delayMs}ms...`
      );
      console.warn(`   Error: ${error.message}`);

      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }

  // Should never reach here, but just in case
  throw lastError;
}

/**
 * Retry helper that combines circuit breaker check + retry logic
 * Used when you want circuit breaker + retry both active
 */
export async function withRetryAndCircuitBreaker<T>(
  fn: () => Promise<T>,
  operationName: string,
  retryConfig: RetryConfig
): Promise<T> {
  // The circuit breaker is already applied at the API call level
  // This function just adds retry logic on top
  return withRetry(fn, operationName, retryConfig);
}
