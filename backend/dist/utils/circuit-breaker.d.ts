/**
 * Circuit Breaker Pattern Implementation
 *
 * Prevents cascading failures by detecting when a service is failing and
 * temporarily stopping requests to it. States:
 *
 * CLOSED: Normal operation, requests pass through
 * OPEN: Service is failing, requests rejected immediately
 * HALF_OPEN: Testing if service recovered, limited requests allowed
 */
type CircuitBreakerState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';
interface CircuitBreakerConfig {
    failureThreshold: number;
    resetTimeout: number;
    halfOpenRequests: number;
    name: string;
}
interface CircuitBreakerMetrics {
    totalRequests: number;
    successfulRequests: number;
    failedRequests: number;
    rejectedRequests: number;
    state: CircuitBreakerState;
    lastFailureTime?: Date;
    consecutiveFailures: number;
}
declare class CircuitBreaker {
    private config;
    private state;
    private failureCount;
    private consecutiveSuccesses;
    private lastFailureTime?;
    private nextAttemptTime?;
    private halfOpenRequestsAllowed;
    private halfOpenRequestsUsed;
    private metrics;
    constructor(config: CircuitBreakerConfig);
    /**
     * Execute a request through the circuit breaker
     */
    execute<T>(callback: () => Promise<T>): Promise<T>;
    /**
     * Record a successful request
     */
    private onSuccess;
    /**
     * Record a failed request
     */
    private onFailure;
    /**
     * Check if enough time has passed to attempt recovery
     */
    private shouldAttemptReset;
    /**
     * Get circuit breaker metrics
     */
    getMetrics(): CircuitBreakerMetrics;
    /**
     * Get current state
     */
    getState(): CircuitBreakerState;
    /**
     * Reset circuit breaker manually (for testing or admin operations)
     */
    reset(): void;
}
/**
 * Circuit Breaker for Telnyx SMS/MMS API
 * Failure threshold: 5 failures
 * Reset timeout: 1 minute
 * Half-open requests: 2 (test 2 requests before fully recovering)
 */
export declare const telnyxCircuitBreaker: CircuitBreaker;
/**
 * Circuit Breaker for Stripe Payment API
 * Failure threshold: 3 failures (more aggressive for payments)
 * Reset timeout: 2 minutes (longer recovery time for payments)
 * Half-open requests: 1 (cautious recovery)
 */
export declare const stripeCircuitBreaker: CircuitBreaker;
export default CircuitBreaker;
//# sourceMappingURL=circuit-breaker.d.ts.map