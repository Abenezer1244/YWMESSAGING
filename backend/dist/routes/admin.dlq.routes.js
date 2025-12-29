import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { isAdmin } from '../middleware/admin.middleware.js';
import * as dlqService from '../utils/dead-letter-queue.js';
const router = Router();
/**
 * Admin-only routes for managing the Dead Letter Queue
 * All routes require admin authentication
 */
/**
 * GET /api/admin/dlq/stats
 * Get dead letter queue statistics
 */
router.get('/stats', authenticateToken, isAdmin, async (req, res) => {
    try {
        const stats = await dlqService.getDLQStats();
        res.json({
            success: true,
            data: stats,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
});
/**
 * GET /api/admin/dlq/pending
 * List pending dead letter queue items
 * Query params: category, churchId, limit, offset
 */
router.get('/pending', authenticateToken, isAdmin, async (req, res) => {
    try {
        const { category, churchId, limit, offset } = req.query;
        const result = await dlqService.listPendingDLQ({
            category: category,
            limit: limit ? parseInt(limit) : undefined,
            offset: offset ? parseInt(offset) : undefined,
        });
        res.json({
            success: true,
            data: result.items,
            pagination: result.pagination,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
});
/**
 * GET /api/admin/dlq/:id
 * Get a specific dead letter queue item
 */
router.get('/:id', authenticateToken, isAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const item = await dlqService.getDLQItem(id);
        if (!item) {
            return res.status(404).json({
                success: false,
                error: 'DLQ item not found',
            });
        }
        res.json({
            success: true,
            data: item,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
});
/**
 * POST /api/admin/dlq/:id/resolve
 * Mark a DLQ item as resolved (successful replay)
 */
router.post('/:id/resolve', authenticateToken, isAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { metadata } = req.body;
        const item = await dlqService.getDLQItem(id);
        if (!item) {
            return res.status(404).json({
                success: false,
                error: 'DLQ item not found',
            });
        }
        await dlqService.resolveDLQItem(id, metadata);
        res.json({
            success: true,
            message: 'DLQ item marked as resolved',
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
});
/**
 * POST /api/admin/dlq/:id/dead-letter
 * Mark a DLQ item as permanently dead
 */
router.post('/:id/dead-letter', authenticateToken, isAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;
        if (!reason) {
            return res.status(400).json({
                success: false,
                error: 'Reason is required',
            });
        }
        const item = await dlqService.getDLQItem(id);
        if (!item) {
            return res.status(404).json({
                success: false,
                error: 'DLQ item not found',
            });
        }
        await dlqService.deadLetterDLQItem(id, reason);
        res.json({
            success: true,
            message: 'DLQ item marked as dead letter',
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
});
/**
 * DELETE /api/admin/dlq/:id
 * Delete a DLQ item
 */
router.delete('/:id', authenticateToken, isAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const item = await dlqService.getDLQItem(id);
        if (!item) {
            return res.status(404).json({
                success: false,
                error: 'DLQ item not found',
            });
        }
        await dlqService.deleteDLQItem(id);
        res.json({
            success: true,
            message: 'DLQ item deleted',
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
});
export default router;
//# sourceMappingURL=admin.dlq.routes.js.map