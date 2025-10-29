import { Request, Response } from 'express';
import { AccessTokenPayload } from '../utils/jwt.utils.js';
import {
  updateChurchProfile,
  getChurchProfile,
  getCoAdmins,
  removeCoAdmin,
  logActivity,
  getActivityLogs,
  getActivityLogCount,
} from '../services/admin.service.js';

declare global {
  namespace Express {
    interface Request {
      user?: AccessTokenPayload;
    }
  }
}

/**
 * GET /api/admin/profile
 * Get church profile
 */
export async function getProfileHandler(req: Request, res: Response) {
  try {
    const churchId = req.user?.churchId;
    if (!churchId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const profile = await getChurchProfile(churchId);
    res.json(profile);
  } catch (error) {
    console.error('Failed to get profile:', error);
    res.status(500).json({ error: 'Failed to get profile' });
  }
}

/**
 * PUT /api/admin/profile
 * Update church profile
 */
export async function updateProfileHandler(req: Request, res: Response) {
  try {
    const churchId = req.user?.churchId;
    if (!churchId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { name, email, description } = req.body;

    const updated = await updateChurchProfile(churchId, {
      name,
      email,
      description,
    });

    // Log activity
    await logActivity(churchId, req.user?.adminId || '', 'Update Profile', {
      name,
      email,
    });

    res.json({
      success: true,
      profile: updated,
    });
  } catch (error) {
    console.error('Failed to update profile:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
}

/**
 * GET /api/admin/co-admins
 * Get all co-admins
 */
export async function getCoAdminsHandler(req: Request, res: Response) {
  try {
    const churchId = req.user?.churchId;
    if (!churchId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const coAdmins = await getCoAdmins(churchId);
    res.json(coAdmins);
  } catch (error) {
    console.error('Failed to get co-admins:', error);
    res.status(500).json({ error: 'Failed to get co-admins' });
  }
}

/**
 * DELETE /api/admin/co-admins/:adminId
 * Remove a co-admin
 */
export async function removeCoAdminHandler(req: Request, res: Response) {
  try {
    const churchId = req.user?.churchId;
    if (!churchId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { adminId } = req.params;

    if (!adminId) {
      return res.status(400).json({ error: 'Admin ID required' });
    }

    await removeCoAdmin(churchId, adminId);

    // Log activity
    await logActivity(churchId, req.user?.adminId || '', 'Remove Co-Admin', {
      adminId,
    });

    res.json({
      success: true,
      message: 'Co-admin removed',
    });
  } catch (error) {
    console.error('Failed to remove co-admin:', error);
    res.status(500).json({ error: (error as Error).message || 'Failed to remove co-admin' });
  }
}

/**
 * GET /api/admin/activity-logs
 * Get activity logs
 * Query params: ?page=1&limit=50
 */
export async function getActivityLogsHandler(req: Request, res: Response) {
  try {
    const churchId = req.user?.churchId;
    if (!churchId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, parseInt(req.query.limit as string) || 50);
    const offset = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      getActivityLogs(churchId, limit, offset),
      getActivityLogCount(churchId),
    ]);

    res.json({
      logs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Failed to get activity logs:', error);
    res.status(500).json({ error: 'Failed to get activity logs' });
  }
}

/**
 * POST /api/admin/activity-log
 * Log an activity (internal use)
 */
export async function logActivityHandler(req: Request, res: Response) {
  try {
    const churchId = req.user?.churchId;
    if (!churchId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { action, details } = req.body;

    await logActivity(churchId, req.user?.adminId || '', action, details);

    res.json({ success: true });
  } catch (error) {
    console.error('Failed to log activity:', error);
    res.status(500).json({ error: 'Failed to log activity' });
  }
}
