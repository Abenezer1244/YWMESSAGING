import { Request, Response } from 'express';
import * as groupService from '../services/group.service.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * SECURITY: Verify branch belongs to authenticated user's church
 */
async function verifyBranchOwnership(branchId: string, churchId: string): Promise<boolean> {
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
 */
async function verifyGroupOwnership(groupId: string, churchId: string): Promise<boolean> {
  const group = await prisma.group.findFirst({
    where: {
      id: groupId,
      branch: {
        churchId,
      },
    },
  });
  return !!group;
}

/**
 * GET /api/branches/:branchId/groups
 * SECURITY: Verifies branch belongs to authenticated user's church
 */
export async function listGroups(req: Request, res: Response) {
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
  } catch (error) {
    res.status(400).json({
      success: false,
      error: (error as Error).message,
    });
  }
}

/**
 * POST /api/branches/:branchId/groups
 * SECURITY: Verifies branch belongs to authenticated user's church
 */
export async function createGroup(req: Request, res: Response) {
  try {
    const { branchId } = req.params;
    const churchId = req.user?.churchId;
    const { name, description, welcomeMessageEnabled, welcomeMessageText } = req.body;

    console.log(`=== CREATE GROUP DEBUG ===`);
    console.log(`branchId: ${branchId}`);
    console.log(`churchId: ${churchId}`);
    console.log(`name: ${name}`);

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
  } catch (error) {
    const message = (error as Error).message;
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
export async function updateGroup(req: Request, res: Response) {
  try {
    const { groupId } = req.params;
    const churchId = req.user?.churchId;
    const { name, description, welcomeMessageEnabled, welcomeMessageText } = req.body;

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
  } catch (error) {
    res.status(400).json({
      success: false,
      error: (error as Error).message,
    });
  }
}

/**
 * DELETE /api/groups/:groupId
 * SECURITY: Verifies group belongs to authenticated user's church
 */
export async function deleteGroup(req: Request, res: Response) {
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
  } catch (error) {
    res.status(400).json({
      success: false,
      error: (error as Error).message,
    });
  }
}
