/**
 * Rate Limit Analytics Service
 * Tracks and analyzes rate limit violations for abuse detection
 *
 * Monitors:
 * - Per-user usage patterns
 * - Abuse attempts (rate limit violations)
 * - Peak usage times
 * - Anomalies and suspicious activity
 */
export interface AbuseReport {
    userId: string;
    violationCount: number;
    lastViolation: string;
    endpoints: string[];
    severity: 'low' | 'medium' | 'high';
}
export interface UsageStats {
    userId: string;
    requestCount: number;
    violationCount: number;
    period: string;
    endpoints: Map<string, number>;
}
/**
 * Record a rate limit violation for abuse detection
 */
export declare function recordViolation(userId: string, endpoint: string): Promise<void>;
/**
 * Get violation history for a user
 */
export declare function getViolationHistory(userId: string, limit?: number): Promise<any[]>;
/**
 * Get abuse report for a user
 * Identifies suspicious activity patterns
 */
export declare function getAbuseReport(userId: string): Promise<AbuseReport | null>;
/**
 * Get top abusers (users with most violations)
 * Used for monitoring and security audits
 */
export declare function getTopAbusers(limit?: number): Promise<AbuseReport[]>;
/**
 * Record successful request for user (analytics)
 */
export declare function recordSuccess(userId: string, endpoint: string): Promise<void>;
/**
 * Get usage stats for a user in last 24 hours
 */
export declare function getUserUsageStats(userId: string): Promise<UsageStats>;
/**
 * Detect anomalies in usage patterns
 * Identifies sudden spikes or unusual behavior
 */
export declare function detectAnomalies(): Promise<string[]>;
/**
 * Clean up old analytics data (maintenance)
 * Called periodically to free up Redis space
 */
export declare function cleanupOldData(): Promise<void>;
//# sourceMappingURL=rate-limit-analytics.service.d.ts.map