import { Request, Response } from 'express';
import {
  getBranches,
  createBranch,
  updateBranch,
  deleteBranch,
  CreateBranchInput,
  UpdateBranchInput,
} from '../services/branch.service.js';

/**
 * GET /api/branches
 */
export async function listBranches(req: Request, res: Response): Promise<void> {
  try {
    const tenantId = req.tenantId;
    const tenantPrisma = req.prisma;

    // Verify tenant context is available
    if (!tenantId || !tenantPrisma) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const branches = await getBranches(tenantId, tenantPrisma);
    res.status(200).json({
      success: true,
      data: branches,
    });
  } catch (error: any) {
    console.error('Error listing branches:', error);
    res.status(500).json({ error: 'Failed to fetch branches' });
  }
}

/**
 * POST /api/branches
 */
export async function createBranchHandler(req: Request, res: Response): Promise<void> {
  try {
    const tenantId = req.tenantId;
    const tenantPrisma = req.prisma;
    const { name, address, phone, description } = req.body;

    // Verify tenant context is available
    if (!tenantId || !tenantPrisma) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // Validate required fields
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      res.status(400).json({ error: 'Branch name is required' });
      return;
    }

    const input: CreateBranchInput = {
      name: name.trim(),
      address: address ? String(address).trim() : undefined,
      phone: phone ? String(phone).trim() : undefined,
      description: description ? String(description).trim() : undefined,
    };

    const branch = await createBranch(tenantId, tenantPrisma, input);

    res.status(201).json({
      success: true,
      data: branch,
    });
  } catch (error: any) {
    console.error('Error creating branch:', error);
    const message = error.message || 'Failed to create branch';
    res.status(400).json({ error: message });
  }
}

/**
 * PUT /api/branches/:branchId
 */
export async function updateBranchHandler(req: Request, res: Response): Promise<void> {
  try {
    const { branchId } = req.params;
    const tenantId = req.tenantId;
    const tenantPrisma = req.prisma;
    const { name, address, phone, description, isActive } = req.body;

    // Verify tenant context is available
    if (!tenantId || !tenantPrisma) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const input: UpdateBranchInput = {
      ...(name !== undefined && { name: String(name).trim() }),
      ...(address !== undefined && { address: address ? String(address).trim() : undefined }),
      ...(phone !== undefined && { phone: phone ? String(phone).trim() : undefined }),
      ...(description !== undefined && { description: description ? String(description).trim() : undefined }),
      ...(isActive !== undefined && { isActive: Boolean(isActive) }),
    };

    const updated = await updateBranch(tenantId, tenantPrisma, branchId, input);

    res.status(200).json({
      success: true,
      data: updated,
    });
  } catch (error: any) {
    console.error('Error updating branch:', error);
    res.status(500).json({ error: error.message || 'Failed to update branch' });
  }
}

/**
 * DELETE /api/branches/:branchId
 */
export async function deleteBranchHandler(req: Request, res: Response): Promise<void> {
  try {
    const { branchId } = req.params;
    const tenantId = req.tenantId;
    const tenantPrisma = req.prisma;

    // Verify tenant context is available
    if (!tenantId || !tenantPrisma) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const result = await deleteBranch(tenantId, tenantPrisma, branchId);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error('Error deleting branch:', error);
    res.status(400).json({ error: error.message || 'Failed to delete branch' });
  }
}
