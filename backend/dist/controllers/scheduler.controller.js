import { checkAndMigrateToPer10DLC } from '../jobs/10dlc-registration.js';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
let metrics = {
    lastRun: null,
    churchesApprovedThisRun: 0,
    totalChecksRun: 0,
    lastError: null,
    nextScheduledRun: new Date(Date.now() + 30 * 60 * 1000),
    isHealthy: true,
};
/**
 * CloudWatch EventBridge Trigger Handler
 * Called by AWS CloudWatch Events every 30 minutes
 *
 * Validates the request came from AWS CloudWatch using API key
 * Runs the 10DLC approval check
 */
export async function handleDLCApprovalCheck(req, res) {
    const startTime = Date.now();
    const requestId = `dlc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    try {
        // Security: Validate API key
        const apiKey = req.headers['x-api-key'];
        const expectedKey = process.env.INTERNAL_SCHEDULER_KEY;
        if (!expectedKey) {
            console.error('❌ INTERNAL_SCHEDULER_KEY not configured in environment');
            return res.status(500).json({
                error: 'Server misconfigured',
                requestId,
            });
        }
        if (!apiKey || apiKey !== expectedKey) {
            console.warn(`⚠️  Unauthorized scheduler request: ${requestId}`);
            return res.status(401).json({
                error: 'Unauthorized',
                requestId,
            });
        }
        console.log(`\n🔔 DLC Approval Check Started [${requestId}]`);
        console.log(`   Time: ${new Date().toISOString()}`);
        console.log(`   Source: AWS CloudWatch EventBridge`);
        // Get count of pending churches before check
        const pendingBefore = await prisma.church.count({
            where: { dlcStatus: 'pending' },
        });
        // Run the approval check
        await checkAndMigrateToPer10DLC();
        // Get count after check
        const pendingAfter = await prisma.church.count({
            where: { dlcStatus: 'pending' },
        });
        const churchesApproved = pendingBefore - pendingAfter;
        const elapsedMs = Date.now() - startTime;
        // Update metrics
        metrics.lastRun = new Date();
        metrics.churchesApprovedThisRun = churchesApproved;
        metrics.totalChecksRun += 1;
        metrics.lastError = null;
        metrics.nextScheduledRun = new Date(Date.now() + 30 * 60 * 1000);
        metrics.isHealthy = true;
        console.log(`✅ DLC Approval Check Completed [${requestId}]`);
        console.log(`   Duration: ${elapsedMs}ms`);
        console.log(`   Churches Upgraded: ${churchesApproved}`);
        console.log(`   Still Pending: ${pendingAfter}`);
        console.log(`   Next Check: ${metrics.nextScheduledRun.toISOString()}\n`);
        // Return success response
        res.json({
            success: true,
            requestId,
            timestamp: new Date().toISOString(),
            metrics: {
                churchesApproved,
                pendingRemaining: pendingAfter,
                elapsedMs,
                totalChecksRun: metrics.totalChecksRun,
            },
        });
    }
    catch (error) {
        const elapsedMs = Date.now() - startTime;
        console.error(`\n❌ DLC Approval Check Failed [${requestId}]`);
        console.error(`   Error: ${error.message}`);
        console.error(`   Duration: ${elapsedMs}ms`);
        console.error(`   Time: ${new Date().toISOString()}\n`);
        // Update metrics
        metrics.lastError = error.message;
        metrics.isHealthy = false;
        // Return error but don't crash
        res.status(500).json({
            error: 'Check failed',
            requestId,
            message: error.message,
            timestamp: new Date().toISOString(),
        });
    }
}
/**
 * Get scheduler status and metrics
 * Can be called by CloudWatch alarms to monitor health
 *
 * GET /admin/scheduler/status
 */
export async function getSchedulerStatus(req, res) {
    try {
        const pendingChurches = await prisma.church.count({
            where: { dlcStatus: 'pending' },
        });
        const approvedChurches = await prisma.church.count({
            where: { dlcStatus: 'approved' },
        });
        const rejectedChurches = await prisma.church.count({
            where: { dlcStatus: 'rejected' },
        });
        const sharedBrandChurches = await prisma.church.count({
            where: { dlcStatus: 'shared_brand' },
        });
        res.json({
            status: metrics.isHealthy ? 'healthy' : 'unhealthy',
            metrics: {
                ...metrics,
                churchesByStatus: {
                    pending: pendingChurches,
                    approved: approvedChurches,
                    rejected: rejectedChurches,
                    sharedBrand: sharedBrandChurches,
                },
                uptime: process.uptime(),
            },
        });
    }
    catch (error) {
        res.status(500).json({
            status: 'error',
            error: error.message,
        });
    }
}
/**
 * Manual trigger for testing (requires same API key)
 *
 * POST /admin/scheduler/trigger
 * Headers: { 'x-api-key': 'your-secret-key' }
 */
export async function manualTriggerDLCCheck(req, res) {
    // Reuse the same handler - same security
    await handleDLCApprovalCheck(req, res);
}
/**
 * Get metrics endpoint for CloudWatch Alarms
 * CloudWatch can query this to check scheduler health
 *
 * GET /admin/scheduler/metrics
 */
export async function getMetrics(req, res) {
    const metricsResponse = {
        isHealthy: metrics.isHealthy ? 1 : 0,
        lastRunAge: metrics.lastRun
            ? Math.round((Date.now() - metrics.lastRun.getTime()) / 1000)
            : -1,
        errorCount: metrics.lastError ? 1 : 0,
        lastError: metrics.lastError,
    };
    res.json(metricsResponse);
}
//# sourceMappingURL=scheduler.controller.js.map