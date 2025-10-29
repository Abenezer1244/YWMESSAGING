import * as groupService from '../services/group.service.js';
/**
 * GET /api/branches/:branchId/groups
 */
export async function listGroups(req, res) {
    try {
        const { branchId } = req.params;
        const groups = await groupService.getGroups(branchId);
        res.json({
            success: true,
            data: groups,
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
 * POST /api/branches/:branchId/groups
 */
export async function createGroup(req, res) {
    try {
        const { branchId } = req.params;
        const { name, description, welcomeMessageEnabled, welcomeMessageText } = req.body;
        // Validate input
        if (!name || typeof name !== 'string') {
            return res.status(400).json({
                success: false,
                error: 'name is required and must be a string',
            });
        }
        const group = await groupService.createGroup(branchId, {
            name,
            description,
            welcomeMessageEnabled,
            welcomeMessageText,
        });
        res.status(201).json({
            success: true,
            data: group,
        });
    }
    catch (error) {
        const message = error.message;
        const statusCode = message.includes('limit') ? 400 : 500;
        res.status(statusCode).json({
            success: false,
            error: message,
        });
    }
}
/**
 * PUT /api/groups/:groupId
 */
export async function updateGroup(req, res) {
    try {
        const { groupId } = req.params;
        const { name, description, welcomeMessageEnabled, welcomeMessageText } = req.body;
        const group = await groupService.updateGroup(groupId, {
            name,
            description,
            welcomeMessageEnabled,
            welcomeMessageText,
        });
        res.json({
            success: true,
            data: group,
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
 * DELETE /api/groups/:groupId
 */
export async function deleteGroup(req, res) {
    try {
        const { groupId } = req.params;
        const result = await groupService.deleteGroup(groupId);
        res.json({
            success: true,
            data: result,
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            error: error.message,
        });
    }
}
//# sourceMappingURL=group.controller.js.map