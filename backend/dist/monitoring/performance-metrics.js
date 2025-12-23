// Optional: Newrelic integration (only if installed)
let newrelic = null;
try {
    newrelic = require('newrelic');
}
catch (e) {
    // newrelic is optional - if not installed, metrics still work locally
    newrelic = null;
}
/**
 * Performance Metrics Module
 *
 * Phase 2 Task 2.2: Custom performance metrics tracking
 * Records critical metrics for:
 * - Database query latency
 * - API endpoint performance
 * - Message delivery success rates
 * - Billing operation metrics
 */
export class PerformanceMetrics {
    /**
     * Record database query performance
     * @param duration - Query execution time in milliseconds
     * @param query - Query name/identifier
     * @param success - Whether the query succeeded
     */
    static recordDatabaseQuery(duration, query, success = true) {
        // Record overall database latency
        if (newrelic) {
            newrelic.recordMetric('Custom/Database/Query/Latency', duration);
        }
        // Track slow queries (>500ms)
        if (duration > 500) {
            if (newrelic) {
                newrelic.recordMetric('Custom/Database/SlowQuery/Count', 1);
            }
            if (duration > 1000) {
                // Very slow query (>1s)
                console.warn(`Slow database query detected: ${query} took ${duration}ms`);
            }
        }
        // Track errors
        if (!success) {
            if (newrelic) {
                newrelic.recordMetric('Custom/Database/Query/Error/Count', 1);
            }
        }
    }
    /**
     * Record API endpoint performance
     * @param endpoint - API route (e.g., POST /api/auth/login)
     * @param duration - Request duration in milliseconds
     * @param statusCode - HTTP status code
     */
    static recordApiEndpoint(endpoint, duration, statusCode) {
        if (newrelic) {
            const metricName = `Custom/API/${endpoint}/Latency`;
            newrelic.recordMetric(metricName, duration);
            // Track errors (status >= 400)
            if (statusCode >= 400) {
                newrelic.recordMetric(`Custom/API/${endpoint}/Error/Count`, 1);
            }
            // Track slow endpoints (>3000ms)
            if (duration > 3000) {
                newrelic.recordMetric(`Custom/API/${endpoint}/Slow/Count`, 1);
            }
        }
        // Always log slow endpoints
        if (duration > 3000) {
            console.warn(`Slow API endpoint detected: ${endpoint} took ${duration}ms`);
        }
    }
    /**
     * Record message delivery metrics
     * @param count - Number of messages processed
     * @param successCount - Number of successful deliveries
     * @param failureCount - Number of failed deliveries
     * @param averageLatency - Average delivery latency in seconds
     */
    static recordMessageDelivery(count, successCount, failureCount, averageLatency) {
        // Success rate percentage
        const successRate = count > 0 ? (successCount / count) * 100 : 0;
        if (newrelic) {
            newrelic.recordMetric('Custom/Messages/Delivery/Success/Rate', successRate);
            // Failed delivery count
            if (failureCount > 0) {
                newrelic.recordMetric('Custom/Messages/Delivery/Failed/Count', failureCount);
            }
            // Average delivery latency
            newrelic.recordMetric('Custom/Messages/Average/Latency', averageLatency);
        }
        // Log warning if success rate drops below 95%
        if (successRate < 95) {
            console.warn(`Message delivery rate degradation: ${successRate.toFixed(1)}% (target: 98%)`);
        }
    }
    /**
     * Record billing metrics
     * @param planName - Subscription plan (starter, growth, pro)
     * @param smsCost - Total SMS cost in cents
     * @param usage - Usage object with messagesThisMonth, etc.
     */
    static recordBillingMetrics(planName, smsCost, usage) {
        if (newrelic) {
            // Record SMS costs
            newrelic.recordMetric('Custom/Billing/SMS/Cost/Total', smsCost / 100); // Convert to dollars
            // Record plan usage
            if (usage.messagesThisMonth) {
                newrelic.recordMetric('Custom/Billing/Messages/Usage/Month', usage.messagesThisMonth);
            }
            if (usage.membersThisMonth) {
                newrelic.recordMetric('Custom/Billing/Members/Usage/Month', usage.membersThisMonth);
            }
        }
    }
    /**
     * Record subscription metrics
     * @param activeCount - Count of active paid subscriptions
     * @param trialCount - Count of active trials
     * @param expiringSoonCount - Count of trials expiring within 7 days
     */
    static recordSubscriptionMetrics(activeCount, trialCount, expiringSoonCount) {
        if (newrelic) {
            newrelic.recordMetric('Custom/Billing/Plan/Active/Count', activeCount);
            newrelic.recordMetric('Custom/Billing/Trial/Active/Count', trialCount);
            newrelic.recordMetric('Custom/Billing/Trial/Expiring/Count', expiringSoonCount);
        }
        // Alert if trials are about to expire
        if (expiringSoonCount > 0) {
            console.info(`${expiringSoonCount} trial(s) expiring within 7 days - consider outreach`);
        }
    }
    /**
     * Record cache performance
     * @param cacheKey - Cache key identifier
     * @param hit - true if cache hit, false if miss
     * @param duration - Operation duration in milliseconds
     */
    static recordCacheMetric(cacheKey, hit, duration) {
        if (newrelic) {
            if (hit) {
                newrelic.recordMetric('Custom/Cache/Hit/Count', 1);
            }
            else {
                newrelic.recordMetric('Custom/Cache/Miss/Count', 1);
            }
            newrelic.recordMetric(`Custom/Cache/${cacheKey}/Latency`, duration);
        }
    }
    /**
     * Record error metrics
     * @param errorType - Type of error (Database, Payment, MessageDelivery, etc.)
     * @param errorCode - Error code or name
     */
    static recordError(errorType, errorCode) {
        if (newrelic) {
            newrelic.recordMetric(`Custom/Errors/${errorType}/Count`, 1);
            if (newrelic.recordCustomMetric) {
                newrelic.recordCustomMetric(`Custom/Errors/${errorType}/${errorCode}`, 1);
            }
        }
        // Send alert for critical errors
        if (['Payment', 'Database', 'MessageDelivery'].includes(errorType)) {
            console.error(`Critical error detected: ${errorType} - ${errorCode}`);
            if (newrelic && newrelic.noticeError) {
                newrelic.noticeError(new Error(`${errorType}: ${errorCode}`));
            }
        }
    }
    /**
     * Middleware to track API endpoint performance
     * @returns Express middleware function
     */
    static expressMiddleware() {
        return (req, res, next) => {
            const startTime = Date.now();
            // Capture the original send function
            const originalSend = res.send;
            // Override send to track response time
            res.send = function (data) {
                const duration = Date.now() - startTime;
                // Format endpoint name for metric
                const endpoint = `${req.method}/${req.path
                    .split('/')
                    .slice(0, 4)
                    .join('/')}`;
                // Record the metric
                PerformanceMetrics.recordApiEndpoint(endpoint.replace(/\//g, '_'), duration, res.statusCode);
                // Call original send
                return originalSend.call(this, data);
            };
            next();
        };
    }
    /**
     * Timer utility for async operations
     * @param name - Operation name for logging
     * @param fn - Async function to time
     * @returns Result of the function
     */
    static async timeAsync(name, fn) {
        const startTime = Date.now();
        try {
            return await fn();
        }
        catch (error) {
            const duration = Date.now() - startTime;
            console.error(`${name} failed after ${duration}ms:`, error);
            throw error;
        }
        finally {
            const duration = Date.now() - startTime;
            if (newrelic) {
                newrelic.recordMetric(`Custom/Operation/${name}/Latency`, duration);
            }
        }
    }
    /**
     * Timer utility for sync operations
     * @param name - Operation name for logging
     * @param fn - Sync function to time
     * @returns Result of the function
     */
    static timeSync(name, fn) {
        const startTime = Date.now();
        try {
            return fn();
        }
        finally {
            const duration = Date.now() - startTime;
            if (newrelic) {
                newrelic.recordMetric(`Custom/Operation/${name}/Latency`, duration);
            }
        }
    }
}
/**
 * Helper function to track database operations
 * Usage: await trackDatabaseOperation('getUserById', () => prisma.user.findUnique(...))
 */
export async function trackDatabaseOperation(operationName, operation) {
    const startTime = Date.now();
    try {
        const result = await operation();
        const duration = Date.now() - startTime;
        PerformanceMetrics.recordDatabaseQuery(duration, operationName, true);
        return result;
    }
    catch (error) {
        const duration = Date.now() - startTime;
        PerformanceMetrics.recordDatabaseQuery(duration, operationName, false);
        PerformanceMetrics.recordError('Database', operationName);
        throw error;
    }
}
//# sourceMappingURL=performance-metrics.js.map