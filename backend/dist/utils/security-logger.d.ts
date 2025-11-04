/**
 * Security Event Logger
 * Logs security-related events for monitoring and incident response
 */
export type SecurityEventType = 'login_failure' | 'permission_denied' | 'rate_limit_exceeded' | 'invalid_csrf_token' | 'api_error' | 'suspicious_activity';
export interface SecurityEvent {
    timestamp: string;
    eventType: SecurityEventType;
    severity: 'info' | 'warning' | 'critical';
    userId?: string;
    email?: string;
    ipAddress?: string;
    endpoint?: string;
    message: string;
    details?: Record<string, any>;
}
/**
 * Log a security event to file
 */
export declare function logSecurityEvent(event: SecurityEvent): void;
/**
 * Log failed login attempt
 */
export declare function logFailedLogin(email: string, ipAddress: string, reason?: string): void;
/**
 * Log permission denied
 */
export declare function logPermissionDenied(userId: string, resource: string, requiredRole: string, actualRole: string, ipAddress?: string): void;
/**
 * Log rate limit exceeded
 */
export declare function logRateLimitExceeded(endpoint: string, ipAddress: string, limit: number): void;
/**
 * Log invalid CSRF token
 */
export declare function logInvalidCSRFToken(userId?: string, ipAddress?: string, endpoint?: string): void;
/**
 * Log suspicious activity
 */
export declare function logSuspiciousActivity(message: string, userId?: string, ipAddress?: string, details?: Record<string, any>): void;
/**
 * Log API error (4xx/5xx responses)
 */
export declare function logAPIError(endpoint: string, statusCode: number, error: string, userId?: string, ipAddress?: string): void;
/**
 * Get recent security events from log file
 */
export declare function getRecentSecurityEvents(lines?: number): SecurityEvent[];
/**
 * Clear security log file (admin use only)
 */
export declare function clearSecurityLog(): void;
//# sourceMappingURL=security-logger.d.ts.map