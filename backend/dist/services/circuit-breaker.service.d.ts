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
export declare enum CircuitBreakerState {
    CLOSED = "CLOSED",// Normal operation
    OPEN = "OPEN",// Service failing, reject requests
    HALF_OPEN = "HALF_OPEN"
}
export interface CircuitBreakerConfig {
    failureThreshold: number;
    resetTimeout: number;
    monitoringInterval: number;
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
declare class CircuitBreaker {
    private state;
    private failureCount;
    private successCount;
    private totalAttempts;
    private lastFailureTime?;
    private lastSuccessTime?;
    private lastOpenTime?;
    private config;
    private recoveryTimer?;
    constructor(config?: Partial<CircuitBreakerConfig>);
    /**
     * Record a successful call
     */
    recordSuccess(): void;
    /**
     * Record a failed call
     */
    recordFailure(): void;
    /**
     * Check if a call should be allowed through
     */
    canAttempt(): boolean;
    /**
     * Get detailed statistics
     */
    getStats(): CircuitBreakerStats;
    /**
     * Reset circuit to closed state
     */
    private close;
    /**
     * Open circuit to reject calls
     */
    private open;
    /**
     * Get current state
     */
    getState(): CircuitBreakerState;
    /**
     * Destroy circuit breaker (cleanup timers)
     */
    destroy(): void;
}
export declare const telnyxCircuitBreaker: CircuitBreaker;
export { CircuitBreaker };
//# sourceMappingURL=circuit-breaker.service.d.ts.map