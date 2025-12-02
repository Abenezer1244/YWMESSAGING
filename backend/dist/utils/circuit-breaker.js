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
class CircuitBreaker {
    constructor(config) {
        this.config = config;
        this.state = 'CLOSED';
        this.failureCount = 0;
        this.consecutiveSuccesses = 0;
        this.halfOpenRequestsUsed = 0;
        this.metrics = {
            totalRequests: 0,
            successfulRequests: 0,
            failedRequests: 0,
            rejectedRequests: 0,
            state: 'CLOSED',
            consecutiveFailures: 0,
        };
        this.halfOpenRequestsAllowed = config.halfOpenRequests;
    }
    /**
     * Execute a request through the circuit breaker
     */
    async execute(callback) {
        this.metrics.totalRequests++;
        // Check if circuit should transition from OPEN to HALF_OPEN
        if (this.state === 'OPEN' && this.shouldAttemptReset()) {
            this.state = 'HALF_OPEN';
            this.halfOpenRequestsUsed = 0;
            console.log(`🔄 [CircuitBreaker:${this.config.name}] Transitioning to HALF_OPEN`);
        }
        // Reject requests if circuit is OPEN
        if (this.state === 'OPEN') {
            this.metrics.rejectedRequests++;
            console.warn(`⛔ [CircuitBreaker:${this.config.name}] Circuit is OPEN, rejecting request`);
            throw new Error(`Circuit breaker is OPEN for ${this.config.name}. Service temporarily unavailable.`);
        }
        // Limit requests in HALF_OPEN state
        if (this.state === 'HALF_OPEN') {
            if (this.halfOpenRequestsUsed >= this.halfOpenRequestsAllowed) {
                this.metrics.rejectedRequests++;
                throw new Error(`Circuit breaker in HALF_OPEN state, request limit exceeded for ${this.config.name}`);
            }
            this.halfOpenRequestsUsed++;
        }
        try {
            const result = await callback();
            this.onSuccess();
            this.metrics.successfulRequests++;
            return result;
        }
        catch (error) {
            this.onFailure();
            this.metrics.failedRequests++;
            throw error;
        }
    }
    /**
     * Record a successful request
     */
    onSuccess() {
        this.failureCount = 0;
        if (this.state === 'HALF_OPEN') {
            this.consecutiveSuccesses++;
            // If enough successes in HALF_OPEN, close the circuit
            if (this.consecutiveSuccesses >= 2) {
                this.state = 'CLOSED';
                console.log(`✅ [CircuitBreaker:${this.config.name}] Circuit CLOSED - service recovered`);
                this.consecutiveSuccesses = 0;
            }
        }
    }
    /**
     * Record a failed request
     */
    onFailure() {
        this.failureCount++;
        this.lastFailureTime = new Date();
        this.metrics.lastFailureTime = new Date();
        this.metrics.consecutiveFailures = this.failureCount;
        this.consecutiveSuccesses = 0;
        // If in HALF_OPEN, go back to OPEN
        if (this.state === 'HALF_OPEN') {
            this.state = 'OPEN';
            this.nextAttemptTime = new Date(Date.now() + this.config.resetTimeout);
            console.error(`🔴 [CircuitBreaker:${this.config.name}] Service failed during recovery, returning to OPEN`);
        }
        // If enough failures in CLOSED, go to OPEN
        else if (this.state === 'CLOSED' && this.failureCount >= this.config.failureThreshold) {
            this.state = 'OPEN';
            this.nextAttemptTime = new Date(Date.now() + this.config.resetTimeout);
            console.error(`🔴 [CircuitBreaker:${this.config.name}] Failure threshold reached, circuit OPEN`);
        }
    }
    /**
     * Check if enough time has passed to attempt recovery
     */
    shouldAttemptReset() {
        return this.nextAttemptTime ? new Date() >= this.nextAttemptTime : false;
    }
    /**
     * Get circuit breaker metrics
     */
    getMetrics() {
        return { ...this.metrics, state: this.state };
    }
    /**
     * Get current state
     */
    getState() {
        return this.state;
    }
    /**
     * Reset circuit breaker manually (for testing or admin operations)
     */
    reset() {
        this.state = 'CLOSED';
        this.failureCount = 0;
        this.consecutiveSuccesses = 0;
        this.lastFailureTime = undefined;
        this.nextAttemptTime = undefined;
        this.halfOpenRequestsUsed = 0;
        console.log(`♻️ [CircuitBreaker:${this.config.name}] Manually reset`);
    }
}
// Create and export circuit breakers for each external service
/**
 * Circuit Breaker for Telnyx SMS/MMS API
 * Failure threshold: 5 failures
 * Reset timeout: 1 minute
 * Half-open requests: 2 (test 2 requests before fully recovering)
 */
export const telnyxCircuitBreaker = new CircuitBreaker({
    failureThreshold: 5,
    resetTimeout: 60000, // 1 minute
    halfOpenRequests: 2,
    name: 'Telnyx API',
});
/**
 * Circuit Breaker for Stripe Payment API
 * Failure threshold: 3 failures (more aggressive for payments)
 * Reset timeout: 2 minutes (longer recovery time for payments)
 * Half-open requests: 1 (cautious recovery)
 */
export const stripeCircuitBreaker = new CircuitBreaker({
    failureThreshold: 3,
    resetTimeout: 120000, // 2 minutes
    halfOpenRequests: 1,
    name: 'Stripe API',
});
export default CircuitBreaker;
//# sourceMappingURL=circuit-breaker.js.map