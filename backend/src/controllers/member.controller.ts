import { Request, Response } from 'express';
import { parseCSV, formatAndValidate } from '../utils/csvParser.util.js';
import * as memberService from '../services/member.service.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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
 * SECURITY: Verify member belongs to authenticated user's church
 */
async function verifyMemberOwnership(memberId: string, churchId: string): Promise<boolean> {
  const member = await prisma.member.findFirst({
    where: {
      id: memberId,
      groups: {
        some: {
          group: {
            churchId,
          },
        },
      },
    },
  });
  return !!member;
}

/**
 * GET /api/groups/:groupId/members
 * SECURITY: Verifies group belongs to authenticated user's church
 */
export async function listMembers(req: Request, res: Response) {
  try {
    const { groupId } = req.params;
    const churchId = req.user?.churchId;
    const page = Math.max(1, req.query.page ? parseInt(req.query.page as string) : 1);
    const limit = Math.min(100, req.query.limit ? parseInt(req.query.limit as string) : 50);
    const search = req.query.search as string | undefined;

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

    const result = await memberService.getMembers(groupId, {
      page,
      limit,
      search,
    });

    res.json({
      success: true,
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: (error as Error).message,
    });
  }
}

/**
 * POST /api/groups/:groupId/members
 * SECURITY: Verifies group belongs to authenticated user's church
 */
export async function addMember(req: Request, res: Response) {
  try {
    const { groupId } = req.params;
    const churchId = req.user?.churchId;
    const { firstName, lastName, phone, email, optInSms } = req.body;

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

    // Validate input
    if (!firstName || !lastName || !phone) {
      return res.status(400).json({
        success: false,
        error: 'firstName, lastName, and phone are required',
      });
    }

    const member = await memberService.addMember(groupId, {
      firstName,
      lastName,
      phone,
      email,
      optInSms,
    });

    res.status(201).json({
      success: true,
      data: member,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: (error as Error).message,
    });
  }
}

/**
 * POST /api/groups/:groupId/members/import
 * SECURITY: Verifies group belongs to authenticated user's church
 */
export async function importMembers(req: Request, res: Response) {
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

    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'CSV file is required',
      });
    }

    // SECURITY: Validate file size (max 5MB)
    if (req.file.size > 5 * 1024 * 1024) {
      return res.status(400).json({
        success: false,
        error: 'File size exceeds 5MB limit',
      });
    }

    // Parse CSV
    const rows = parseCSV(req.file.buffer);

    // Validate and format
    const parsed = formatAndValidate(rows);

    if (parsed.valid.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No valid rows to import',
        failedDetails: parsed.invalid,
      });
    }

    // Import to database
    const result = await memberService.importMembers(groupId, parsed.valid);

    res.json({
      success: true,
      data: {
        imported: result.imported,
        failed: result.failed,
        ...(result.failedDetails.length > 0 && {
          failedDetails: result.failedDetails,
        }),
      },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: (error as Error).message,
    });
  }
}

/**
 * PUT /api/members/:memberId
 * SECURITY: Verifies member belongs to authenticated user's church
 */
export async function updateMember(req: Request, res: Response) {
  try {
    const { memberId } = req.params;
    const churchId = req.user?.churchId;
    const { firstName, lastName, phone, email, optInSms } = req.body;

    if (!churchId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
      });
    }

    // SECURITY: Verify member ownership
    const hasAccess = await verifyMemberOwnership(memberId, churchId);
    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        error: 'Access denied',
      });
    }

    const member = await memberService.updateMember(memberId, {
      firstName,
      lastName,
      phone,
      email,
      optInSms,
    });

    res.json({
      success: true,
      data: member,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: (error as Error).message,
    });
  }
}

/**
 * DELETE /api/groups/:groupId/members/:memberId
 * SECURITY: Verifies member belongs to authenticated user's church
 */
export async function removeMember(req: Request, res: Response) {
  try {
    const { groupId, memberId } = req.params;
    const churchId = req.user?.churchId;

    if (!churchId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
      });
    }

    // SECURITY: Verify member ownership
    const hasAccess = await verifyMemberOwnership(memberId, churchId);
    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        error: 'Access denied',
      });
    }

    const result = await memberService.removeMemberFromGroup(groupId, memberId);

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
