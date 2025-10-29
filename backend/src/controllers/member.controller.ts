import { Request, Response } from 'express';
import { parseCSV, formatAndValidate } from '../utils/csvParser.util.js';
import * as memberService from '../services/member.service.js';

/**
 * GET /api/groups/:groupId/members
 */
export async function listMembers(req: Request, res: Response) {
  try {
    const { groupId } = req.params;
    const page = req.query.page ? parseInt(req.query.page as string) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
    const search = req.query.search as string | undefined;

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
 */
export async function addMember(req: Request, res: Response) {
  try {
    const { groupId } = req.params;
    const { firstName, lastName, phone, email, optInSms } = req.body;

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
 */
export async function importMembers(req: Request, res: Response) {
  try {
    const { groupId } = req.params;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'CSV file is required',
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
 */
export async function updateMember(req: Request, res: Response) {
  try {
    const { memberId } = req.params;
    const { firstName, lastName, phone, email, optInSms } = req.body;

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
 */
export async function removeMember(req: Request, res: Response) {
  try {
    const { groupId, memberId } = req.params;

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
