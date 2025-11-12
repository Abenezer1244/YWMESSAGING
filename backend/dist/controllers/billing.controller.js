import * as billingService from '../services/billing.service.js';
/**
 * GET /api/billing/usage
 * Get current usage for the church
 */
export async function getUsageHandler(req, res) {
    try {
        const churchId = req.user?.churchId;
        if (!churchId) {
            return res.status(401).json({
                success: false,
                error: 'Unauthorized',
            });
        }
        // For now, return placeholder usage data
        // This will be populated from SMSUsage table once migration is applied
        const usage = await billingService.getSMSUsageSummary(churchId);
        res.json({
            success: true,
            data: {
                smsUsage: {
                    messagesSent: usage.totalMessages,
                    totalCost: usage.totalCost,
                    costPerMessage: 0.02,
                    currency: usage.currency,
                },
            },
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            error: error.message,
        });
    }
}
/**
 * GET /api/billing/plan
 * Get current plan and limits
 */
export async function getPlanHandler(req, res) {
    try {
        const churchId = req.user?.churchId;
        if (!churchId) {
            return res.status(401).json({
                success: false,
                error: 'Unauthorized',
            });
        }
        const plan = await billingService.getCurrentPlan(churchId);
        const limits = billingService.getPlanLimits(plan);
        if (!limits) {
            return res.status(400).json({
                success: false,
                error: 'Invalid plan type',
            });
        }
        const usage = await billingService.getUsage(churchId);
        // Calculate remaining capacity
        const getRemainingCapacity = (limit, used) => {
            if (limit > 100000)
                return 999999; // unlimited
            return Math.max(0, limit - used);
        };
        res.json({
            success: true,
            data: {
                plan,
                limits: {
                    name: limits.name,
                    price: limits.price,
                    currency: limits.currency,
                    branches: limits.branches,
                    members: limits.members,
                    messagesPerMonth: limits.messagesPerMonth,
                    coAdmins: limits.coAdmins,
                    features: limits.features,
                },
                usage: {
                    branches: usage.branches,
                    members: usage.members,
                    messagesThisMonth: usage.messagesThisMonth,
                    coAdmins: usage.coAdmins,
                },
                remaining: {
                    branches: getRemainingCapacity(limits.branches, usage.branches),
                    members: getRemainingCapacity(limits.members, usage.members),
                    messagesPerMonth: getRemainingCapacity(limits.messagesPerMonth, usage.messagesThisMonth),
                    coAdmins: getRemainingCapacity(limits.coAdmins, usage.coAdmins),
                },
            },
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            error: error.message,
        });
    }
}
/**
 * GET /api/billing/trial
 * Get trial status
 */
export async function getTrialHandler(req, res) {
    try {
        const churchId = req.user?.churchId;
        if (!churchId) {
            return res.status(401).json({
                success: false,
                error: 'Unauthorized',
            });
        }
        res.json({
            success: true,
            data: {
                trialStatus: 'active',
                daysRemaining: 14,
            },
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            error: error.message,
        });
    }
}
/**
 * POST /api/billing/subscribe
 * Subscribe to a plan
 */
export async function subscribeHandler(req, res) {
    try {
        res.status(501).json({
            success: false,
            error: 'Not implemented',
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            error: error.message,
        });
    }
}
/**
 * PUT /api/billing/upgrade
 * Upgrade/downgrade plan
 */
export async function upgradeHandler(req, res) {
    try {
        res.status(501).json({
            success: false,
            error: 'Not implemented',
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            error: error.message,
        });
    }
}
/**
 * DELETE /api/billing/cancel
 * Cancel subscription
 */
export async function cancelHandler(req, res) {
    try {
        res.status(501).json({
            success: false,
            error: 'Not implemented',
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            error: error.message,
        });
    }
}
/**
 * POST /api/billing/payment-intent
 * Create payment intent
 */
export async function createPaymentIntentHandler(req, res) {
    try {
        res.status(501).json({
            success: false,
            error: 'Not implemented',
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            error: error.message,
        });
    }
}
// ========== SMS-Specific Billing Endpoints ==========
/**
 * GET /api/billing/sms-pricing
 * Get current SMS pricing for the church
 */
export async function getSMSPricing(req, res) {
    try {
        const churchId = req.user?.churchId;
        if (!churchId) {
            return res.status(401).json({
                success: false,
                error: 'Unauthorized',
            });
        }
        const pricing = billingService.getSMSPricing();
        res.json({
            success: true,
            data: {
                smsPrice: pricing.costPerSMS,
                setupFee: pricing.setupFee,
                currency: pricing.currency,
                pricePerSMS: `$${pricing.costPerSMS.toFixed(4)}`,
                description: 'Option 3 pricing model for Telnyx SMS',
            },
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            error: error.message,
        });
    }
}
/**
 * GET /api/billing/sms-usage
 * Get SMS usage and costs for the church (30-day default)
 */
export async function getSMSUsage(req, res) {
    try {
        const churchId = req.user?.churchId;
        const startDate = req.query.startDate ? new Date(req.query.startDate) : undefined;
        const endDate = req.query.endDate ? new Date(req.query.endDate) : undefined;
        if (!churchId) {
            return res.status(401).json({
                success: false,
                error: 'Unauthorized',
            });
        }
        const usage = await billingService.getSMSUsageSummary(churchId, startDate, endDate);
        res.json({
            success: true,
            data: {
                period: {
                    startDate: startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                    endDate: endDate || new Date(),
                },
                totalMessagesSent: usage.totalMessages,
                totalCost: usage.totalCost,
                formattedCost: `$${usage.totalCost.toFixed(2)}`,
                costPerMessage: 0.02,
                currency: usage.currency,
            },
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            error: error.message,
        });
    }
}
/**
 * POST /api/billing/calculate-batch
 * Calculate cost for a batch of messages
 */
export async function calculateBatchCost(req, res) {
    try {
        const churchId = req.user?.churchId;
        const { messageCount } = req.body;
        if (!churchId) {
            return res.status(401).json({
                success: false,
                error: 'Unauthorized',
            });
        }
        if (!messageCount || typeof messageCount !== 'number' || messageCount <= 0) {
            return res.status(400).json({
                success: false,
                error: 'messageCount must be a positive number',
            });
        }
        const totalCost = billingService.calculateBatchCost(messageCount);
        res.json({
            success: true,
            data: {
                messageCount,
                costPerMessage: 0.02,
                totalCost,
                formattedTotalCost: `$${totalCost.toFixed(2)}`,
                currency: 'USD',
            },
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            error: error.message,
        });
    }
}
//# sourceMappingURL=billing.controller.js.map