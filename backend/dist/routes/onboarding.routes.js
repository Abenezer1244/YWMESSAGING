import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { getOnboardingProgress, completeOnboardingTask, getOnboardingProgressPercentage, getOnboardingSummary, } from '../services/onboarding.service.js';
const router = Router();
// All routes require authentication
router.use(authenticateToken);
/**
 * GET /api/onboarding/progress
 * Get all onboarding tasks and their completion status
 */
router.get('/progress', async (req, res) => {
    try {
        const churchId = req.user.churchId;
        const progress = await getOnboardingProgress(churchId);
        res.json({ success: true, data: progress });
    }
    catch (error) {
        console.error('Failed to get onboarding progress:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get onboarding progress',
        });
    }
});
/**
 * GET /api/onboarding/percentage
 * Get onboarding completion percentage (0-100)
 */
router.get('/percentage', async (req, res) => {
    try {
        const churchId = req.user.churchId;
        const percentage = await getOnboardingProgressPercentage(churchId);
        res.json({ success: true, data: { percentage } });
    }
    catch (error) {
        console.error('Failed to get onboarding percentage:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get onboarding percentage',
        });
    }
});
/**
 * GET /api/onboarding/summary
 * Get comprehensive onboarding status summary
 */
router.get('/summary', async (req, res) => {
    try {
        const churchId = req.user.churchId;
        const summary = await getOnboardingSummary(churchId);
        res.json({ success: true, data: summary });
    }
    catch (error) {
        console.error('Failed to get onboarding summary:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get onboarding summary',
        });
    }
});
/**
 * POST /api/onboarding/complete/:taskId
 * Mark a task as completed (after verifying it's actually been done)
 * Returns error if task hasn't been completed yet
 */
router.post('/complete/:taskId', async (req, res) => {
    try {
        const churchId = req.user.churchId;
        const { taskId } = req.params;
        // Validate taskId
        const validTasks = ['create_branch', 'create_group', 'add_members', 'send_message'];
        if (!validTasks.includes(taskId)) {
            return res.status(400).json({
                success: false,
                error: `Invalid task ID. Must be one of: ${validTasks.join(', ')}`,
            });
        }
        const result = await completeOnboardingTask(churchId, taskId);
        if (!result.success) {
            return res.status(400).json({
                success: false,
                error: result.message,
            });
        }
        // Get updated summary
        const summary = await getOnboardingSummary(churchId);
        res.json({
            success: true,
            message: result.message,
            data: summary,
        });
    }
    catch (error) {
        console.error('Failed to complete onboarding task:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to complete onboarding task',
        });
    }
});
export default router;
//# sourceMappingURL=onboarding.routes.js.map