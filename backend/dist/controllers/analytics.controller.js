import * as statsService from '../services/stats.service.js';
export async function getMessageStats(req, res) {
    try {
        const churchId = req.user?.churchId;
        if (!churchId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const days = req.query.days ? parseInt(req.query.days) : 30;
        const stats = await statsService.getMessageStats(churchId, days);
        res.json(stats);
    }
    catch (error) {
        console.error('Error fetching message stats:', error);
        res.status(500).json({ error: 'Failed to fetch message statistics' });
    }
}
export async function getBranchStats(req, res) {
    try {
        const churchId = req.user?.churchId;
        if (!churchId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const stats = await statsService.getBranchStats(churchId);
        res.json(stats);
    }
    catch (error) {
        console.error('Error fetching branch stats:', error);
        res.status(500).json({ error: 'Failed to fetch branch statistics' });
    }
}
export async function getSummaryStats(req, res) {
    try {
        const churchId = req.user?.churchId;
        if (!churchId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const stats = await statsService.getSummaryStats(churchId);
        res.json(stats);
    }
    catch (error) {
        console.error('Error fetching summary stats:', error);
        res.status(500).json({ error: 'Failed to fetch summary statistics' });
    }
}
//# sourceMappingURL=analytics.controller.js.map