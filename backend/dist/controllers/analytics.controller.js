import * as statsService from '../services/stats.service.js';
export async function getMessageStats(req, res) {
    try {
        if (!req.prisma) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const days = req.query.days ? parseInt(req.query.days) : 30;
        const stats = await statsService.getMessageStats(req.prisma, days);
        res.json(stats);
    }
    catch (error) {
        console.error('Error fetching message stats:', error.message || error);
        res.status(500).json({ error: 'Failed to fetch message statistics', details: error.message });
    }
}
export async function getBranchStats(req, res) {
    try {
        if (!req.prisma) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const stats = await statsService.getBranchStats(req.prisma);
        res.json(stats);
    }
    catch (error) {
        console.error('Error fetching branch stats:', error.message || error);
        res.status(500).json({ error: 'Failed to fetch branch statistics', details: error.message });
    }
}
export async function getSummaryStats(req, res) {
    try {
        if (!req.prisma || !req.tenantId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const stats = await statsService.getSummaryStats(req.prisma, req.tenantId);
        res.json(stats);
    }
    catch (error) {
        console.error('Error fetching summary stats:', error.message || error);
        res.status(500).json({ error: 'Failed to fetch summary statistics', details: error.message });
    }
}
//# sourceMappingURL=analytics.controller.js.map