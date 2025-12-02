/**
 * Planning Center Controller
 * Handles OAuth2 connection, member syncing, and integration management
 */

import { Request, Response } from 'express';
import * as planningCenterService from '../services/planning-center.service.js';
import { z } from 'zod';

// ============================================================================
// Zod Schemas for Input Validation
// ============================================================================

const ConnectPlanningCenterSchema = z.object({
  accessToken: z.string().min(1, 'Access token is required'),
  refreshToken: z.string().optional(),
  expiresIn: z.number().optional(),
});

const SyncMembersRequestSchema = z.object({
  churchId: z.string(),
});

// ============================================================================
// Controllers
// ============================================================================

/**
 * GET /api/integrations/planning-center/status
 * Get Planning Center integration status for the church
 */
export async function getPlanningCenterStatus(req: Request, res: Response) {
  try {
    const churchId = req.user?.churchId;

    if (!churchId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
      });
    }

    const status = await planningCenterService.getPlanningCenterStatus(churchId);

    if (!status) {
      return res.json({
        success: true,
        data: {
          isConnected: false,
          isEnabled: false,
        },
      });
    }

    res.json({
      success: true,
      data: {
        isConnected: status.isEnabled,
        isEnabled: status.isEnabled,
        organizationId: status.organizationId,
        lastSyncAt: status.lastSyncAt,
        syncStatus: status.syncStatus,
        memberSyncEnabled: status.memberSyncEnabled,
        serviceSyncEnabled: status.serviceSyncEnabled,
        errorMessage: status.errorMessage,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: (error as Error).message || 'Failed to get Planning Center status',
    });
  }
}

/**
 * POST /api/integrations/planning-center/connect
 * Connect church to Planning Center using OAuth2 token
 */
export async function connectPlanningCenter(req: Request, res: Response) {
  try {
    const churchId = req.user?.churchId;

    if (!churchId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
      });
    }

    // Validate request body
    const validationResult = ConnectPlanningCenterSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        error: validationResult.error.errors[0].message,
      });
    }

    const { accessToken, refreshToken, expiresIn } = validationResult.data;

    // Connect to Planning Center
    const integration = await planningCenterService.connectPlanningCenter(
      churchId,
      accessToken,
      refreshToken,
      expiresIn
    );

    res.json({
      success: true,
      data: {
        isConnected: integration.isEnabled,
        organizationId: integration.organizationId,
        message: `Successfully connected to Planning Center organization ${integration.organizationId}`,
      },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: (error as Error).message || 'Failed to connect Planning Center',
    });
  }
}

/**
 * POST /api/integrations/planning-center/sync-members
 * Sync members from Planning Center
 */
export async function syncPlanningCenterMembers(req: Request, res: Response) {
  try {
    const churchId = req.user?.churchId;

    if (!churchId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
      });
    }

    // Trigger member sync
    const result = await planningCenterService.syncPlanningCenterMembers(churchId);

    res.json({
      success: result.success,
      data: {
        itemsProcessed: result.itemsProcessed,
        itemsCreated: result.itemsCreated,
        itemsUpdated: result.itemsUpdated,
        itemsFailed: result.itemsFailed,
        duration: result.duration,
        error: result.error,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: (error as Error).message || 'Failed to sync members',
    });
  }
}

/**
 * DELETE /api/integrations/planning-center
 * Disconnect Planning Center
 */
export async function disconnectPlanningCenter(req: Request, res: Response) {
  try {
    const churchId = req.user?.churchId;

    if (!churchId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
      });
    }

    await planningCenterService.disconnectPlanningCenter(churchId);

    res.json({
      success: true,
      data: {
        message: 'Planning Center integration disconnected',
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: (error as Error).message || 'Failed to disconnect Planning Center',
    });
  }
}

/**
 * POST /api/integrations/planning-center/validate
 * Validate Planning Center connection
 */
export async function validatePlanningCenterConnection(req: Request, res: Response) {
  try {
    const churchId = req.user?.churchId;

    if (!churchId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
      });
    }

    const validation = await planningCenterService.validatePlanningCenterSetup(churchId);

    res.json({
      success: validation.valid,
      data: {
        isValid: validation.valid,
        error: validation.error,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: (error as Error).message || 'Failed to validate connection',
    });
  }
}
