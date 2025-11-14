import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AccessTokenPayload } from '../utils/jwt.utils.js';
import {
  updateChurchProfile,
  getChurchProfile,
  getCoAdmins,
  removeCoAdmin,
  inviteCoAdmin,
  logActivity,
  getActivityLogs,
  getActivityLogCount,
} from '../services/admin.service.js';
import * as telnyxService from '../services/telnyx.service.js';

const prisma = new PrismaClient();

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
 * POST /api/admin/co-admins
 * Invite a new co-admin
 */
export async function inviteCoAdminHandler(req: Request, res: Response) {
  try {
    const churchId = req.user?.churchId;
    if (!churchId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { email, firstName, lastName } = req.body;

    // Validate required fields
    if (!email || !firstName || !lastName) {
      return res.status(400).json({ error: 'Email, first name, and last name required' });
    }

    // Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    const result = await inviteCoAdmin(churchId, email, firstName, lastName);

    // Log activity
    await logActivity(churchId, req.user?.adminId || '', 'Invite Co-Admin', {
      email,
      firstName,
      lastName,
    });

    res.status(201).json({
      success: true,
      data: {
        admin: result.admin,
        tempPassword: result.tempPassword,
      },
    });
  } catch (error) {
    console.error('Failed to invite co-admin:', error);
    const errorMessage = (error as Error).message;

    if (errorMessage === 'Email already in use') {
      return res.status(400).json({ error: 'Email already in use' });
    }

    res.status(500).json({ error: errorMessage || 'Failed to invite co-admin' });
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

/**
 * POST /api/admin/phone-numbers/link
 * Link a phone number and auto-create webhook
 */
export async function linkPhoneNumberHandler(req: Request, res: Response) {
  try {
    const churchId = req.user?.churchId;
    if (!churchId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { phoneNumber } = req.body;

    if (!phoneNumber) {
      return res.status(400).json({ error: 'Phone number required' });
    }

    // Normalize phone number to E.164 format
    const normalizedPhone = phoneNumber.replace(/\D/g, '');
    if (normalizedPhone.length < 10) {
      return res.status(400).json({ error: 'Invalid phone number format' });
    }

    const formattedPhone = `+1${normalizedPhone.slice(-10)}`;

    // Check if number already linked to another church
    const existingChurch = await prisma.church.findFirst({
      where: { telnyxPhoneNumber: formattedPhone },
    });

    if (existingChurch && existingChurch.id !== churchId) {
      return res.status(400).json({ error: 'Phone number already linked to another church' });
    }

    // Auto-create webhook
    let webhookId: string | null = null;
    try {
      const webhookUrl = `${process.env.BACKEND_URL || 'https://api.koinoniasms.com'}/api/webhooks/telnyx/mms`;
      const webhook = await telnyxService.createWebhook(webhookUrl);
      webhookId = webhook.id;
      console.log(`✅ Webhook auto-created for church ${churchId}: ${webhookId}`);

      // Link the phone number to the messaging profile so webhooks are routed
      try {
        await telnyxService.linkPhoneNumberToMessagingProfile(formattedPhone, webhookId);
        console.log(`✅ Phone number ${formattedPhone} linked to messaging profile ${webhookId}`);
      } catch (linkError: any) {
        console.error(`⚠️ Failed to link phone number to messaging profile: ${linkError.message}`);
        // Continue - webhook might still work if phone number is properly associated
      }
    } catch (webhookError: any) {
      console.warn(`⚠️ Webhook creation failed, but continuing: ${webhookError.message}`);
      // Don't fail the whole request if webhook creation fails
      // User can manually create it if needed
    }

    // Update church with phone number and webhook ID
    const updated = await prisma.church.update({
      where: { id: churchId },
      data: {
        telnyxPhoneNumber: formattedPhone,
        telnyxVerified: true,
        telnyxWebhookId: webhookId,
        telnyxPurchasedAt: new Date(),
      },
      select: {
        id: true,
        telnyxPhoneNumber: true,
        telnyxWebhookId: true,
        telnyxVerified: true,
      },
    });

    // Log activity
    await logActivity(churchId, req.user?.adminId || '', 'Link Phone Number', {
      phoneNumber: formattedPhone,
      webhookId: webhookId || 'manual',
    });

    res.json({
      success: true,
      data: {
        phoneNumber: updated.telnyxPhoneNumber,
        webhookId: updated.telnyxWebhookId,
        verified: updated.telnyxVerified,
        message: webhookId
          ? 'Phone number linked and webhook auto-created successfully!'
          : 'Phone number linked! Please configure webhook manually in Telnyx dashboard.',
      },
    });
  } catch (error) {
    console.error('Failed to link phone number:', error);
    const errorMessage = (error as Error).message;
    res.status(500).json({ error: errorMessage || 'Failed to link phone number' });
  }
}
