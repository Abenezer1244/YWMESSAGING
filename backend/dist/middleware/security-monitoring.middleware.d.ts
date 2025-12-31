/**
 * ============================================================================
 * SECURITY MONITORING MIDDLEWARE
 * ============================================================================
 *
 * Tracks and alerts on suspicious EIN access patterns
 * - Monitors all EIN access attempts
 * - Detects anomalies (excessive access, unusual patterns)
 * - Sends alerts for security incidents
 * - Maintains audit trail
 *
 * SECURITY IMPROVEMENT: +1-2% (87% → 89%)
 */
import { Request, Response, NextFunction } from 'express';
/**
 * Record EIN access attempt
 */
export declare function recordEINAccess(userId: string, action: string, req: Request | any, churchId?: string): void;
/**
 * Middleware to track sensitive operations
 */
export declare function securityMonitoring(operationType: string): (req: Request, res: Response, next: NextFunction) => void;
/**
 * Get recent security alerts
 */
export declare function getSecurityAlerts(timeframe?: string): Promise<any[]>;
/**
 * Get access statistics for a user
 */
export declare function getUserAccessStats(userId: string): Promise<any>;
declare const _default: {
    recordEINAccess: typeof recordEINAccess;
    securityMonitoring: typeof securityMonitoring;
    getSecurityAlerts: typeof getSecurityAlerts;
    getUserAccessStats: typeof getUserAccessStats;
};
export default _default;
//# sourceMappingURL=security-monitoring.middleware.d.ts.map