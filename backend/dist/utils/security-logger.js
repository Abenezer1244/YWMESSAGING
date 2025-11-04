/**
 * Security Event Logger
 * Logs security-related events for monitoring and incident response
 */
import fs from 'fs';
import path from 'path';
const LOG_DIR = path.join(process.cwd(), 'logs');
const LOG_FILE = path.join(LOG_DIR, 'security.log');
// Ensure logs directory exists
if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
}
/**
 * Log a security event to file
 */
export function logSecurityEvent(event) {
    try {
        // Ensure timestamp is in ISO format
        if (!event.timestamp) {
            event.timestamp = new Date().toISOString();
        }
        // Serialize event as JSON for structured logging
        const logEntry = JSON.stringify(event) + '\n';
        // Append to log file
        fs.appendFileSync(LOG_FILE, logEntry, { encoding: 'utf8' });
        // Also log to console in development
        if (process.env.NODE_ENV === 'development') {
            const colorizedMessage = colorizeEvent(event);
            console.log(colorizedMessage);
        }
    }
    catch (error) {
        // If logging fails, at least log the error to console
        console.error('Failed to write security log:', error);
    }
}
/**
 * Log failed login attempt
 */
export function logFailedLogin(email, ipAddress, reason = 'Invalid credentials') {
    logSecurityEvent({
        timestamp: new Date().toISOString(),
        eventType: 'login_failure',
        severity: 'warning',
        email,
        ipAddress,
        endpoint: '/auth/login',
        message: `Failed login attempt for ${email}`,
        details: { reason },
    });
}
/**
 * Log permission denied
 */
export function logPermissionDenied(userId, resource, requiredRole, actualRole, ipAddress) {
    logSecurityEvent({
        timestamp: new Date().toISOString(),
        eventType: 'permission_denied',
        severity: 'warning',
        userId,
        ipAddress,
        endpoint: resource,
        message: `Permission denied for user ${userId}`,
        details: {
            resource,
            requiredRole,
            actualRole,
        },
    });
}
/**
 * Log rate limit exceeded
 */
export function logRateLimitExceeded(endpoint, ipAddress, limit) {
    logSecurityEvent({
        timestamp: new Date().toISOString(),
        eventType: 'rate_limit_exceeded',
        severity: 'info',
        ipAddress,
        endpoint,
        message: `Rate limit exceeded on ${endpoint}`,
        details: { limit },
    });
}
/**
 * Log invalid CSRF token
 */
export function logInvalidCSRFToken(userId, ipAddress, endpoint) {
    logSecurityEvent({
        timestamp: new Date().toISOString(),
        eventType: 'invalid_csrf_token',
        severity: 'critical',
        userId,
        ipAddress,
        endpoint,
        message: 'Invalid or missing CSRF token',
    });
}
/**
 * Log suspicious activity
 */
export function logSuspiciousActivity(message, userId, ipAddress, details) {
    logSecurityEvent({
        timestamp: new Date().toISOString(),
        eventType: 'suspicious_activity',
        severity: 'critical',
        userId,
        ipAddress,
        message,
        details,
    });
}
/**
 * Log API error (4xx/5xx responses)
 */
export function logAPIError(endpoint, statusCode, error, userId, ipAddress) {
    if (statusCode >= 500) {
        logSecurityEvent({
            timestamp: new Date().toISOString(),
            eventType: 'api_error',
            severity: 'critical',
            userId,
            ipAddress,
            endpoint,
            message: `API Error: ${statusCode} ${error}`,
            details: { statusCode },
        });
    }
}
/**
 * Colorize event for console output (development only)
 */
function colorizeEvent(event) {
    const colorMap = {
        info: '\x1b[36m', // Cyan
        warning: '\x1b[33m', // Yellow
        critical: '\x1b[31m', // Red
    };
    const reset = '\x1b[0m';
    const color = colorMap[event.severity];
    return (`${color}[SECURITY ${event.severity.toUpperCase()}]${reset} ` +
        `${event.timestamp} - ${event.eventType}: ${event.message}`);
}
/**
 * Get recent security events from log file
 */
export function getRecentSecurityEvents(lines = 100) {
    try {
        if (!fs.existsSync(LOG_FILE)) {
            return [];
        }
        const content = fs.readFileSync(LOG_FILE, 'utf8');
        const allLines = content.trim().split('\n').filter((line) => line.length > 0);
        // Get last N lines
        const recentLines = allLines.slice(Math.max(0, allLines.length - lines));
        return recentLines
            .map((line) => {
            try {
                return JSON.parse(line);
            }
            catch {
                return null;
            }
        })
            .filter((event) => event !== null);
    }
    catch (error) {
        console.error('Failed to read security logs:', error);
        return [];
    }
}
/**
 * Clear security log file (admin use only)
 */
export function clearSecurityLog() {
    try {
        fs.writeFileSync(LOG_FILE, '', { encoding: 'utf8' });
    }
    catch (error) {
        console.error('Failed to clear security log:', error);
    }
}
//# sourceMappingURL=security-logger.js.map