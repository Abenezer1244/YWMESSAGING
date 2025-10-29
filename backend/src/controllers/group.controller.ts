import { Request, Response } from 'express';
import * as groupService from '../services/group.service.js';

/**
 * GET /api/branches/:branchId/groups
 */
export async function listGroups(req: Request, res: Response) {
  try {
    const { branchId } = req.params;

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
 */
export async function createGroup(req: Request, res: Response) {
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
 */
export async function updateGroup(req: Request, res: Response) {
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
  } catch (error) {
    res.status(400).json({
      success: false,
      error: (error as Error).message,
    });
  }
}

/**
 * DELETE /api/groups/:groupId
 */
export async function deleteGroup(req: Request, res: Response) {
  try {
    const { groupId } = req.params;

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
