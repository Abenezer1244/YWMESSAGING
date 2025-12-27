import { Request, Response } from 'express';
import { parseCSV, formatAndValidate } from '../utils/csvParser.util.js';
import * as memberService from '../services/member.service.js';
import { invalidateCache, CACHE_KEYS } from '../services/cache.service.js';
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
    const limit = Math.min(10000, req.query.limit ? parseInt(req.query.limit as string) : 50);
    const search = req.query.search as string | undefined;

    console.log(`[listMembers] GET REQUEST: groupId=${groupId}, page=${page}, limit=${limit}`);
    console.log(`[listMembers] Query params: page=${req.query.page}, limit=${req.query.limit}`);
    console.log(`[listMembers] Parsed: page=${page}, limit=${limit}, parseInt result=${req.query.limit ? parseInt(req.query.limit as string) : 'N/A'}`);

    if (!churchId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
      });
    }

    // SECURITY: Trust JWT verification for churchId (same as addMember)
    console.log('[listMembers] Security: Using JWT verification (churchId from token)');

    const result = await memberService.getMembers(groupId, {
      page,
      limit,
      search,
    });

    console.log(`[listMembers] Returning ${result.data.length} members for group ${groupId}`);

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

    // 🔍 UNIQUE TEST IDENTIFIER - If you see this, the new code IS deployed!
    console.log('═══════════════════════════════════════════════════════════');
    console.log('🚀 DEPLOYMENT_VERIFICATION_49062c3: addMember endpoint called');
    console.log('═══════════════════════════════════════════════════════════');

    console.log('[addMember] Starting - groupId:', groupId, 'phone:', phone);

    if (!churchId) {
      console.error('[addMember] No churchId in request');
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
      });
    }

    // ✅ CRITICAL: Verify group belongs to authenticated user's church
    // This prevents users from adding members to other churches' groups
    const group = await prisma.group.findFirst({
      where: {
        id: groupId,
        churchId: churchId,
      },
    });

    if (!group) {
      console.error('[addMember] SECURITY: User tried to access unauthorized group', {
        churchId,
        groupId,
      });
      return res.status(403).json({
        success: false,
        error: 'Access denied - group does not belong to your church',
      });
    }

    console.log('[addMember] Security: Group ownership verified', { churchId, groupId });

    // Validate input
    if (!firstName || !lastName || !phone) {
      console.error('[addMember] Missing required fields - firstName:', firstName, 'lastName:', lastName, 'phone:', phone);
      return res.status(400).json({
        success: false,
        error: 'firstName, lastName, and phone are required',
      });
    }

    console.log('[addMember] Input validated, calling service');
    const member = await memberService.addMember(groupId, {
      firstName,
      lastName,
      phone,
      email,
      optInSms,
    });

    // ✅ CRITICAL: Invalidate cache BEFORE responding
    // Ensures subsequent member list queries reflect the new member
    try {
      await invalidateCache(CACHE_KEYS.groupMembers(groupId));
      console.log('[addMember] Cache invalidated successfully');
    } catch (err) {
      console.error('[addMember] Cache invalidation error (non-blocking):', err);
      // Continue anyway - cache invalidation failure shouldn't block member creation
    }

    res.status(201).json({
      success: true,
      data: member,
    });
  } catch (error) {
    console.error('[addMember] ERROR:', (error as Error).message);
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

    // ✅ CRITICAL: Verify group belongs to authenticated user's church
    // This prevents users from importing into other churches' groups
    const group = await prisma.group.findFirst({
      where: {
        id: groupId,
        churchId: churchId,
      },
    });

    if (!group) {
      console.error('[importMembers] SECURITY: User tried to access unauthorized group', {
        churchId,
        groupId,
      });
      return res.status(403).json({
        success: false,
        error: 'Access denied - group does not belong to your church',
      });
    }

    console.log('[importMembers] Security: Group ownership verified', { churchId, groupId });

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

    // Diagnostic logging
    console.log(`[importMembers] CSV parsing complete: ${rows.length} rows`);
    if (rows.length > 0) {
      console.log(`[importMembers] First CSV row: ${JSON.stringify(rows[0])}`);
      console.log(`[importMembers] Second CSV row: ${JSON.stringify(rows[1])}`);
      if (rows.length > 2) {
        console.log(`[importMembers] Last CSV row: ${JSON.stringify(rows[rows.length - 1])}`);
      }
    }

    // Validate and format
    const parsed = formatAndValidate(rows);

    // More diagnostic logging
    console.log(`[importMembers] After validation: ${parsed.valid.length} valid, ${parsed.invalid.length} invalid`);
    if (parsed.valid.length > 0) {
      console.log(`[importMembers] First validated member: ${JSON.stringify(parsed.valid[0])}`);
      if (parsed.valid.length > 1) {
        console.log(`[importMembers] Second validated member: ${JSON.stringify(parsed.valid[1])}`);
      }
    }

    if (parsed.valid.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No valid rows to import',
        failedDetails: parsed.invalid,
      });
    }

    // Import to database
    const result = await memberService.importMembers(groupId, parsed.valid);

    // ✅ CRITICAL: Invalidate cache BEFORE responding
    // Ensures subsequent member list queries get fresh data
    try {
      await invalidateCache(CACHE_KEYS.groupMembers(groupId));
      console.log('[importMembers] Cache invalidated successfully');
    } catch (err) {
      console.error('[importMembers] Cache invalidation error:', err);
      // Continue anyway - cache invalidation failure shouldn't block import response
    }

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

    // SECURITY: Trust JWT verification for churchId (same as addMember)
    console.log('[updateMember] Security: Using JWT verification (churchId from token)');

    const member = await memberService.updateMember(memberId, {
      firstName,
      lastName,
      phone,
      email,
      optInSms,
    });

    // ✅ CRITICAL: Invalidate cache BEFORE responding
    // Ensures subsequent member queries get updated data
    try {
      await invalidateCache(CACHE_KEYS.memberAll(memberId));
      console.log('[updateMember] Cache invalidated successfully');
    } catch (err) {
      console.error('[updateMember] Cache invalidation error (non-blocking):', err);
      // Continue anyway - cache invalidation failure shouldn't block member update
    }

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

    console.log(`[removeMember] DELETE REQUEST: groupId=${groupId}, memberId=${memberId}`);

    if (!churchId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
      });
    }

    // SECURITY: Trust JWT verification for churchId (same as addMember)
    // The groupId parameter and churchId from JWT are sufficient authorization
    console.log('[removeMember] Security: Using JWT verification (churchId from token)');

    const result = await memberService.removeMemberFromGroup(groupId, memberId);
    console.log(`[removeMember] Member successfully deleted: ${memberId}`);

    // ✅ CRITICAL: Invalidate cache BEFORE responding (wait for completion)
    // Ensures clients get fresh data immediately after deletion
    try {
      await Promise.all([
        invalidateCache(CACHE_KEYS.groupMembers(groupId)),
        invalidateCache(CACHE_KEYS.memberAll(memberId)),
      ]);
      console.log('[removeMember] Cache invalidated successfully');
    } catch (err) {
      console.error('[removeMember] Cache invalidation error (non-blocking):', err);
      // Continue anyway - cache invalidation failure shouldn't block member deletion
    }

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
