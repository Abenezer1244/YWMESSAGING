/**
 * NPS Controller
 * Handles NPS survey submission and analytics endpoints
 */
import * as npsService from '../services/nps.service.js';
import { z } from 'zod';
// ============================================================================
// Zod Schemas for Input Validation
// ============================================================================
const SubmitSurveySchema = z.object({
    score: z.number().int().min(0).max(10, 'Score must be between 0 and 10'),
    category: z.enum(['feedback', 'feature_request', 'bug', 'general', 'other']),
    feedback: z.string().max(1000, 'Feedback must be less than 1000 characters').optional(),
    followupEmail: z.string().email().optional(),
});
const AnalyticsQuerySchema = z.object({
    daysBack: z.number().int().min(1).max(365).optional().default(30),
});
// ============================================================================
// Controllers
// ============================================================================
/**
 * POST /api/nps/submit
 * Submit NPS survey response
 */
export async function submitSurvey(req, res) {
    try {
        const churchId = req.user?.churchId;
        const responderId = req.user?.id;
        if (!churchId) {
            return res.status(401).json({
                success: false,
                error: 'Unauthorized',
            });
        }
        // Validate request body
        const validationResult = SubmitSurveySchema.safeParse(req.body);
        if (!validationResult.success) {
            return res.status(400).json({
                success: false,
                error: validationResult.error.errors[0].message,
            });
        }
        const input = validationResult.data;
        // Submit survey
        const survey = await npsService.submitNPSSurvey(churchId, responderId, input);
        res.status(201).json({
            success: true,
            data: {
                id: survey.id,
                score: survey.score,
                category: survey.category,
                message: 'Thank you for your feedback!',
            },
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to submit survey',
        });
    }
}
/**
 * GET /api/nps/analytics
 * Get NPS analytics for current church
 */
export async function getAnalytics(req, res) {
    try {
        const churchId = req.user?.churchId;
        if (!churchId) {
            return res.status(401).json({
                success: false,
                error: 'Unauthorized',
            });
        }
        // Parse query parameters
        const query = AnalyticsQuerySchema.safeParse(req.query);
        if (!query.success) {
            return res.status(400).json({
                success: false,
                error: query.error.errors[0].message,
            });
        }
        const daysBack = query.data.daysBack || 30;
        // Get analytics
        const analytics = await npsService.getNPSAnalytics(churchId, daysBack);
        res.json({
            success: true,
            data: {
                ...analytics,
                period: `Last ${daysBack} days`,
            },
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to fetch analytics',
        });
    }
}
/**
 * GET /api/nps/recent
 * Get recent survey responses
 */
export async function getRecentSurveys(req, res) {
    try {
        const churchId = req.user?.churchId;
        if (!churchId) {
            return res.status(401).json({
                success: false,
                error: 'Unauthorized',
            });
        }
        const limit = Math.min(parseInt(req.query.limit) || 20, 100);
        const offset = parseInt(req.query.offset) || 0;
        const surveys = await npsService.getRecentSurveys(churchId, limit, offset);
        res.json({
            success: true,
            data: {
                surveys,
                count: surveys.length,
                limit,
                offset,
            },
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to fetch surveys',
        });
    }
}
/**
 * GET /api/nps/by-category
 * Get NPS score by feedback category
 */
export async function getNPSByCategory(req, res) {
    try {
        const churchId = req.user?.churchId;
        if (!churchId) {
            return res.status(401).json({
                success: false,
                error: 'Unauthorized',
            });
        }
        const query = AnalyticsQuerySchema.safeParse(req.query);
        if (!query.success) {
            return res.status(400).json({
                success: false,
                error: query.error.errors[0].message,
            });
        }
        const daysBack = query.data.daysBack || 30;
        const categoryScores = await npsService.getNPSByCategory(churchId, daysBack);
        res.json({
            success: true,
            data: {
                categories: categoryScores,
                period: `Last ${daysBack} days`,
            },
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to fetch category scores',
        });
    }
}
//# sourceMappingURL=nps.controller.js.map