/**
 * Priority 3.2: Circuit Breaker Service
 *
 * Implements the circuit breaker pattern to prevent cascading failures.
 * Protects against repeated calls to failing external services (Telnyx API).
 *
 * States:
 * - CLOSED: Normal operation, requests flow through
 * - OPEN: Service is failing, requests are rejected immediately
 * - HALF_OPEN: Testing if service has recovered, limited requests allowed
 *
 * Benefits:
 * - Prevents overwhelming a failing service with more requests
 * - Faster failure detection and recovery
 * - Graceful degradation instead of cascading failures
 * - Reduces load on both client and service
 *
 * Configuration:
 * - failureThreshold: Number of failures before opening circuit (default: 5)
 * - resetTimeout: Time before attempting recovery (default: 60s)
 * - monitoringInterval: How often to check for recovery (default: 30s)
 */

export enum CircuitBreakerState {
  CLOSED = 'CLOSED',        // Normal operation
  OPEN = 'OPEN',            // Service failing, reject requests
  HALF_OPEN = 'HALF_OPEN', // Testing recovery
}

export interface CircuitBreakerConfig {
  failureThreshold: number;  // Number of failures before opening (default: 5)
  resetTimeout: number;      // Milliseconds before attempting recovery (default: 60000)
  monitoringInterval: number; // Check interval in milliseconds (default: 30000)
}

export interface CircuitBreakerStats {
  state: CircuitBreakerState;
  failures: number;
  successes: number;
  totalAttempts: number;
  lastFailureTime?: Date;
  lastSuccessTime?: Date;
  nextRecoveryAttempt?: Date;
}

class CircuitBreaker {
  private state: CircuitBreakerState = CircuitBreakerState.CLOSED;
  private failureCount: number = 0;
  private successCount: number = 0;
  private totalAttempts: number = 0;
  private lastFailureTime?: Date;
  private lastSuccessTime?: Date;
  private lastOpenTime?: Date;
  private config: CircuitBreakerConfig;
  private recoveryTimer?: NodeJS.Timeout;

  constructor(config: Partial<CircuitBreakerConfig> = {}) {
    this.config = {
      failureThreshold: config.failureThreshold || 5,
      resetTimeout: config.resetTimeout || 60 * 1000, // 1 minute
      monitoringInterval: config.monitoringInterval || 30 * 1000, // 30 seconds
    };

    console.log(`⚡ Circuit breaker initialized: ${this.config.failureThreshold} failures to trip`);
  }

  /**
   * Record a successful call
   */
  recordSuccess(): void {
    this.successCount++;
    this.totalAttempts++;
    this.lastSuccessTime = new Date();

    if (this.state === CircuitBreakerState.HALF_OPEN) {
      // Circuit is recovering - successful call means full recovery
      console.log('✅ Circuit breaker: Service recovered, closing circuit');
      this.close();
    }
  }

  /**
   * Record a failed call
   */
  recordFailure(): void {
    this.failureCount++;
    this.totalAttempts++;
    this.lastFailureTime = new Date();

    if (this.state === CircuitBreakerState.CLOSED) {
      // Normal operation - check if threshold reached
      if (this.failureCount >= this.config.failureThreshold) {
        console.log(
          `🚨 Circuit breaker OPEN: ${this.failureCount} failures detected`
        );
        this.open();
      }
    } else if (this.state === CircuitBreakerState.HALF_OPEN) {
      // Testing recovery - any failure means still broken
      console.log('❌ Circuit breaker: Recovery test failed, staying open');
      this.open();
    }
  }

  /**
   * Check if a call should be allowed through
   */
  canAttempt(): boolean {
    if (this.state === CircuitBreakerState.CLOSED) {
      return true; // Normal operation
    }

    if (this.state === CircuitBreakerState.OPEN) {
      // Check if recovery timeout has passed
      const timeSinceOpen = Date.now() - (this.lastOpenTime?.getTime() || 0);
      if (timeSinceOpen >= this.config.resetTimeout) {
        console.log('🔄 Circuit breaker: Attempting recovery (HALF_OPEN state)');
        this.state = CircuitBreakerState.HALF_OPEN;
        return true; // Allow one attempt to test recovery
      }
      return false; // Still open, reject
    }

    if (this.state === CircuitBreakerState.HALF_OPEN) {
      return true; // Allow recovery test attempts
    }

    return false;
  }

  /**
   * Get detailed statistics
   */
  getStats(): CircuitBreakerStats {
    return {
      state: this.state,
      failures: this.failureCount,
      successes: this.successCount,
      totalAttempts: this.totalAttempts,
      lastFailureTime: this.lastFailureTime,
      lastSuccessTime: this.lastSuccessTime,
      nextRecoveryAttempt:
        this.state === CircuitBreakerState.OPEN
          ? new Date(
              (this.lastOpenTime?.getTime() || 0) + this.config.resetTimeout
            )
          : undefined,
    };
  }

  /**
   * Reset circuit to closed state
   */
  private close(): void {
    this.state = CircuitBreakerState.CLOSED;
    this.failureCount = 0;
    this.successCount = 0;
    console.log('🟢 Circuit breaker: CLOSED (normal operation)');
  }

  /**
   * Open circuit to reject calls
   */
  private open(): void {
    this.state = CircuitBreakerState.OPEN;
    this.lastOpenTime = new Date();
    console.log(
      `🔴 Circuit breaker: OPEN - Rejecting calls until recovery timeout (${this.config.resetTimeout / 1000}s)`
    );
  }

  /**
   * Get current state
   */
  getState(): CircuitBreakerState {
    return this.state;
  }

  /**
   * Destroy circuit breaker (cleanup timers)
   */
  destroy(): void {
    if (this.recoveryTimer) {
      clearTimeout(this.recoveryTimer);
    }
  }
}

// Export singleton instance for Telnyx API calls
export const telnyxCircuitBreaker = new CircuitBreaker({
  failureThreshold: 5, // Open after 5 failures
  resetTimeout: 60 * 1000, // Try recovery after 1 minute
  monitoringInterval: 30 * 1000, // Check every 30 seconds
});

export { CircuitBreaker };
