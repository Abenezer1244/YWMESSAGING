import * as groupService from '../services/group.service.js';
import { PrismaClient } from '@prisma/client';
import { createGroupSchema, updateGroupSchema } from '../lib/validation/schemas.js';
import { safeValidate } from '../lib/validation/schemas.js';
const prisma = new PrismaClient();
/**
 * SECURITY: Verify branch belongs to authenticated user's church
 */
async function verifyBranchOwnership(branchId, churchId) {
    const branch = await prisma.branch.findFirst({
        where: {
            id: branchId,
            churchId,
        },
    });
    return !!branch;
}
/**
 * SECURITY: Verify group belongs to authenticated user's church
 * Checks both direct churchId field AND branch relationship for data integrity
 */
async function verifyGroupOwnership(groupId, churchId) {
    const group = await prisma.group.findFirst({
        where: {
            id: groupId,
            churchId, // Check direct field
            branch: {
                churchId, // Check relationship
            },
        },
    });
    return !!group;
}
/**
 * GET /api/branches/:branchId/groups
 * SECURITY: Verifies branch belongs to authenticated user's church
 */
export async function listGroups(req, res) {
    try {
        const { branchId } = req.params;
        const churchId = req.user?.churchId;
        if (!churchId) {
            return res.status(401).json({
                success: false,
                error: 'Unauthorized',
            });
        }
        // SECURITY: Verify branch ownership
        const hasAccess = await verifyBranchOwnership(branchId, churchId);
        if (!hasAccess) {
            return res.status(403).json({
                success: false,
                error: 'Access denied',
            });
        }
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
 * SECURITY: Verifies branch belongs to authenticated user's church
 */
export async function createGroup(req, res) {
    try {
        const { branchId } = req.params;
        const churchId = req.user?.churchId;
        if (!churchId) {
            return res.status(401).json({
                success: false,
                error: 'Unauthorized',
            });
        }
        // SECURITY: Verify branch ownership
        const hasAccess = await verifyBranchOwnership(branchId, churchId);
        console.log(`Branch ownership verified: ${hasAccess}`);
        if (!hasAccess) {
            // Debug: Check if branch exists at all
            const branch = await prisma.branch.findFirst({
                where: { id: branchId },
                select: { id: true, churchId: true, name: true },
            });
            console.log(`Branch found in database:`, branch);
            console.log(`❌ Access denied - branch not found or doesn't belong to church`);
            return res.status(403).json({
                success: false,
                error: 'Access denied',
            });
        }
        // ✅ SECURITY: Validate request body with Zod schema
        const validationResult = safeValidate(createGroupSchema, req.body);
        if (!validationResult.success) {
            return res.status(400).json({
                success: false,
                error: 'Validation failed',
                details: validationResult.errors,
            });
        }
        const { name, description } = validationResult.data;
        const group = await groupService.createGroup(branchId, {
            name,
            description,
            welcomeMessageEnabled: req.body.welcomeMessageEnabled,
            welcomeMessageText: req.body.welcomeMessageText,
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
 * SECURITY: Verifies group belongs to authenticated user's church
 */
export async function updateGroup(req, res) {
    try {
        const { groupId } = req.params;
        const churchId = req.user?.churchId;
        if (!churchId) {
            return res.status(401).json({
                success: false,
                error: 'Unauthorized',
            });
        }
        // SECURITY: Verify group ownership
        const hasAccess = await verifyGroupOwnership(groupId, churchId);
        if (!hasAccess) {
            return res.status(403).json({
                success: false,
                error: 'Access denied',
            });
        }
        // ✅ SECURITY: Validate request body with Zod schema
        const validationResult = safeValidate(updateGroupSchema, req.body);
        if (!validationResult.success) {
            return res.status(400).json({
                success: false,
                error: 'Validation failed',
                details: validationResult.errors,
            });
        }
        const { name: validatedName, description: validatedDescription } = validationResult.data;
        const group = await groupService.updateGroup(groupId, {
            name: validatedName,
            description: validatedDescription,
            welcomeMessageEnabled: req.body.welcomeMessageEnabled,
            welcomeMessageText: req.body.welcomeMessageText,
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
 * SECURITY: Verifies group belongs to authenticated user's church
 */
export async function deleteGroup(req, res) {
    try {
        const { groupId } = req.params;
        const churchId = req.user?.churchId;
        if (!churchId) {
            return res.status(401).json({
                success: false,
                error: 'Unauthorized',
            });
        }
        // SECURITY: Verify group ownership
        const hasAccess = await verifyGroupOwnership(groupId, churchId);
        if (!hasAccess) {
            return res.status(403).json({
                success: false,
                error: 'Access denied',
            });
        }
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