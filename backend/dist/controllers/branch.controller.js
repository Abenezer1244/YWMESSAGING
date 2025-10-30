import { getBranches, createBranch, updateBranch, deleteBranch, } from '../services/branch.service.js';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
/**
 * GET /api/churches/:churchId/branches
 */
export async function listBranches(req, res) {
    try {
        const { churchId } = req.params;
        // Verify user has access to this church
        if (req.user?.churchId !== churchId) {
            res.status(403).json({ error: 'Unauthorized' });
            return;
        }
        const branches = await getBranches(churchId);
        res.status(200).json({
            success: true,
            data: branches,
        });
    }
    catch (error) {
        console.error('Error listing branches:', error);
        res.status(500).json({ error: 'Failed to fetch branches' });
    }
}
/**
 * POST /api/churches/:churchId/branches
 */
export async function createBranchHandler(req, res) {
    try {
        const { churchId } = req.params;
        const { name, address, phone, description } = req.body;
        // DEBUG: Log authorization details
        console.log('=== CREATE BRANCH DEBUG ===');
        console.log('req.user:', req.user);
        console.log('churchId from params:', churchId);
        console.log('req.user?.churchId:', req.user?.churchId);
        console.log('Match:', req.user?.churchId === churchId);
        console.log('req.cookies:', Object.keys(req.cookies));
        // Verify user has access to this church
        if (req.user?.churchId !== churchId) {
            console.log('AUTHORIZATION FAILED: churchId mismatch');
            res.status(403).json({ error: 'Unauthorized' });
            return;
        }
        console.log('AUTHORIZATION PASSED');
        // Validate required fields
        if (!name || typeof name !== 'string' || name.trim().length === 0) {
            res.status(400).json({ error: 'Branch name is required' });
            return;
        }
        const input = {
            name: name.trim(),
            address: address ? String(address).trim() : undefined,
            phone: phone ? String(phone).trim() : undefined,
            description: description ? String(description).trim() : undefined,
        };
        const branch = await createBranch(churchId, input);
        res.status(201).json({
            success: true,
            data: branch,
        });
    }
    catch (error) {
        console.error('Error creating branch:', error);
        const message = error.message || 'Failed to create branch';
        res.status(400).json({ error: message });
    }
}
/**
 * PUT /api/branches/:branchId
 */
export async function updateBranchHandler(req, res) {
    try {
        const { branchId } = req.params;
        const { name, address, phone, description, isActive } = req.body;
        // Verify user owns this branch
        const branch = await prisma.branch.findUnique({
            where: { id: branchId },
        });
        if (!branch) {
            res.status(404).json({ error: 'Branch not found' });
            return;
        }
        if (req.user?.churchId !== branch.churchId) {
            res.status(403).json({ error: 'Unauthorized' });
            return;
        }
        const input = {
            ...(name !== undefined && { name: String(name).trim() }),
            ...(address !== undefined && { address: address ? String(address).trim() : undefined }),
            ...(phone !== undefined && { phone: phone ? String(phone).trim() : undefined }),
            ...(description !== undefined && { description: description ? String(description).trim() : undefined }),
            ...(isActive !== undefined && { isActive: Boolean(isActive) }),
        };
        const updated = await updateBranch(branchId, branch.churchId, input);
        res.status(200).json({
            success: true,
            data: updated,
        });
    }
    catch (error) {
        console.error('Error updating branch:', error);
        res.status(500).json({ error: error.message || 'Failed to update branch' });
    }
}
/**
 * DELETE /api/branches/:branchId
 */
export async function deleteBranchHandler(req, res) {
    try {
        const { branchId } = req.params;
        // Verify user owns this branch
        const branch = await prisma.branch.findUnique({
            where: { id: branchId },
        });
        if (!branch) {
            res.status(404).json({ error: 'Branch not found' });
            return;
        }
        if (req.user?.churchId !== branch.churchId) {
            res.status(403).json({ error: 'Unauthorized' });
            return;
        }
        const result = await deleteBranch(branchId, branch.churchId);
        res.status(200).json({
            success: true,
            data: result,
        });
    }
    catch (error) {
        console.error('Error deleting branch:', error);
        res.status(400).json({ error: error.message || 'Failed to delete branch' });
    }
}
//# sourceMappingURL=branch.controller.js.map