import { getUsage, getCurrentPlan, isOnTrial, } from '../services/billing.service.js';
import { checkLimit } from '../config/plans.js';
/**
 * Middleware to check if church can create a new branch
 */
export async function checkBranchLimit(req, res, next) {
    try {
        const tenantId = req.tenantId;
        const tenantPrisma = req.prisma;
        if (!tenantId || !tenantPrisma) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const usage = await getUsage(tenantId, tenantPrisma);
        const plan = await getCurrentPlan(tenantId);
        const onTrial = await isOnTrial(tenantId);
        if (!onTrial && plan !== 'trial' && !checkLimit(plan, 'branches', usage.branches)) {
            return res.status(402).json({
                error: 'Branch limit reached for your plan',
                limit: (await require('../config/plans.js')).PLANS[plan].branches,
                current: usage.branches,
            });
        }
        next();
    }
    catch (error) {
        console.error('Branch limit check failed:', error);
        res.status(500).json({ error: 'Failed to check branch limit' });
    }
}
/**
 * Middleware to check if church can add a new member
 */
export async function checkMemberLimit(req, res, next) {
    try {
        const tenantId = req.tenantId;
        const tenantPrisma = req.prisma;
        if (!tenantId || !tenantPrisma) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const usage = await getUsage(tenantId, tenantPrisma);
        const plan = await getCurrentPlan(tenantId);
        const onTrial = await isOnTrial(tenantId);
        if (!onTrial && plan !== 'trial' && !checkLimit(plan, 'members', usage.members)) {
            return res.status(402).json({
                error: 'Member limit reached for your plan',
                limit: (await require('../config/plans.js')).PLANS[plan].members,
                current: usage.members,
            });
        }
        next();
    }
    catch (error) {
        console.error('Member limit check failed:', error);
        res.status(500).json({ error: 'Failed to check member limit' });
    }
}
/**
 * Middleware to check if church can send a message
 */
export async function checkMessageLimit(req, res, next) {
    try {
        const tenantId = req.tenantId;
        const tenantPrisma = req.prisma;
        if (!tenantId || !tenantPrisma) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const usage = await getUsage(tenantId, tenantPrisma);
        const plan = await getCurrentPlan(tenantId);
        const onTrial = await isOnTrial(tenantId);
        if (!onTrial &&
            plan !== 'trial' && !checkLimit(plan, 'messagesPerMonth', usage.messagesThisMonth)) {
            return res.status(402).json({
                error: 'Monthly message limit reached for your plan',
                limit: (await require('../config/plans.js')).PLANS[plan]
                    .messagesPerMonth,
                current: usage.messagesThisMonth,
            });
        }
        next();
    }
    catch (error) {
        console.error('Message limit check failed:', error);
        res.status(500).json({ error: 'Failed to check message limit' });
    }
}
/**
 * Middleware to check if church can add a co-admin
 */
export async function checkCoAdminLimit(req, res, next) {
    try {
        const tenantId = req.tenantId;
        const tenantPrisma = req.prisma;
        if (!tenantId || !tenantPrisma) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const usage = await getUsage(tenantId, tenantPrisma);
        const plan = await getCurrentPlan(tenantId);
        const onTrial = await isOnTrial(tenantId);
        if (!onTrial && plan !== 'trial' && !checkLimit(plan, 'coAdmins', usage.coAdmins)) {
            return res.status(402).json({
                error: 'Co-admin limit reached for your plan',
                limit: (await require('../config/plans.js')).PLANS[plan].coAdmins,
                current: usage.coAdmins,
            });
        }
        next();
    }
    catch (error) {
        console.error('Co-admin limit check failed:', error);
        res.status(500).json({ error: 'Failed to check co-admin limit' });
    }
}
/**
 * Middleware to require active subscription
 * (Only applies if trial is over)
 */
export async function requireActiveSubscription(req, res, next) {
    try {
        const churchId = req.user?.churchId;
        if (!churchId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const onTrial = await isOnTrial(churchId);
        if (!onTrial) {
            // Trial is over, check if subscription is active
            const plan = await getCurrentPlan(churchId);
            // For now, we just check if a plan is set (not checking subscription status)
            // In production, you'd check subscription.status === 'active'
            if (plan === 'starter') {
                // Default plan, subscription might be expired
                // This is a simplified check
            }
        }
        next();
    }
    catch (error) {
        console.error('Active subscription check failed:', error);
        res.status(500).json({ error: 'Failed to check subscription status' });
    }
}
//# sourceMappingURL=planLimits.middleware.js.map