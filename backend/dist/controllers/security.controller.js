/**
 * ============================================================================
 * SECURITY MONITORING CONTROLLER
 * ============================================================================
 *
 * Admin endpoints for viewing security alerts and access statistics
 * - View recent security alerts
 * - View EIN access patterns
 * - Monitor user activity
 * - Export audit logs
 */
import { getSecurityAlerts, getUserAccessStats } from '../middleware/security-monitoring.middleware.js';
/**
 * GET /api/security/alerts
 * Get recent security alerts
 */
export async function getAlertsHandler(req, res) {
    try {
        const tenantId = req.tenantId;
        if (!tenantId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const timeframe = req.query.timeframe || '24h';
        const alerts = await getSecurityAlerts(timeframe);
        res.json({
            success: true,
            timeframe,
            count: alerts.length,
            alerts,
        });
    }
    catch (error) {
        console.error('Failed to get security alerts:', error);
        res.status(500).json({ error: 'Failed to get security alerts' });
    }
}
/**
 * GET /api/security/stats/:userId
 * Get access statistics for a specific user
 */
export async function getUserStatsHandler(req, res) {
    try {
        const tenantId = req.tenantId;
        if (!tenantId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const userId = req.params.userId;
        const stats = await getUserAccessStats(userId);
        res.json({
            success: true,
            stats,
        });
    }
    catch (error) {
        console.error('Failed to get user stats:', error);
        res.status(500).json({ error: 'Failed to get user stats' });
    }
}
/**
 * GET /api/security/dashboard
 * Get security dashboard overview
 */
export async function getDashboardHandler(req, res) {
    try {
        const tenantId = req.tenantId;
        if (!tenantId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const alerts24h = await getSecurityAlerts('24h');
        const alerts7d = await getSecurityAlerts('7d');
        // Count alerts by severity
        const alertsBySeverity = {
            critical: alerts24h.filter((a) => a.severity === 'CRITICAL').length,
            high: alerts24h.filter((a) => a.severity === 'HIGH').length,
            medium: alerts24h.filter((a) => a.severity === 'MEDIUM').length,
            low: alerts24h.filter((a) => a.severity === 'LOW').length,
        };
        res.json({
            success: true,
            overview: {
                alerts24h: alerts24h.length,
                alerts7d: alerts7d.length,
                alertsBySeverity,
            },
            recentAlerts: alerts24h.slice(0, 10), // Last 10 alerts
        });
    }
    catch (error) {
        console.error('Failed to get security dashboard:', error);
        res.status(500).json({ error: 'Failed to get security dashboard' });
    }
}
//# sourceMappingURL=security.controller.js.map