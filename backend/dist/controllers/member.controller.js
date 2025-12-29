import { parseCSV, formatAndValidate } from '../utils/csvParser.util.js';
import * as memberService from '../services/member.service.js';
/**
 * GET /api/members
 * Get all members for authenticated user's church
 */
export async function listMembers(req, res) {
    try {
        const churchId = req.user?.churchId;
        const page = Math.max(1, req.query.page ? parseInt(req.query.page) : 1);
        const limit = Math.min(10000, req.query.limit ? parseInt(req.query.limit) : 50);
        const search = req.query.search;
        console.log(`[listMembers] GET REQUEST: page=${page}, limit=${limit}, search=${search}`);
        if (!churchId) {
            return res.status(401).json({
                success: false,
                error: 'Unauthorized',
            });
        }
        const result = await memberService.getMembers({
            page,
            limit,
            search,
        });
        console.log(`[listMembers] Returning ${result.data.length} members`);
        res.json({
            success: true,
            data: result.data,
            pagination: result.pagination,
        });
    }
    catch (error) {
        console.error('[listMembers] ERROR:', error.message);
        res.status(400).json({
            success: false,
            error: error.message,
        });
    }
}
/**
 * POST /api/members
 * Add a new member
 */
export async function addMember(req, res) {
    try {
        const churchId = req.user?.churchId;
        const { firstName, lastName, phone, email, optInSms } = req.body;
        console.log('[addMember] Starting - phone:', phone);
        if (!churchId) {
            console.error('[addMember] No churchId in request');
            return res.status(401).json({
                success: false,
                error: 'Unauthorized',
            });
        }
        // Validate input
        if (!firstName || !lastName || !phone) {
            console.error('[addMember] Missing required fields - firstName:', firstName, 'lastName:', lastName, 'phone:', phone);
            return res.status(400).json({
                success: false,
                error: 'firstName, lastName, and phone are required',
            });
        }
        console.log('[addMember] Input validated, calling service');
        const member = await memberService.addMember({
            firstName,
            lastName,
            phone,
            email,
            optInSms,
        });
        console.log('[addMember] Member created successfully');
        res.status(201).json({
            success: true,
            data: member,
        });
    }
    catch (error) {
        console.error('[addMember] ERROR:', error.message);
        res.status(400).json({
            success: false,
            error: error.message,
        });
    }
}
/**
 * PUT /api/members/:memberId
 * Update a member
 */
export async function updateMember(req, res) {
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
        if (!firstName && !lastName && !phone && email === undefined && optInSms === undefined) {
            return res.status(400).json({
                success: false,
                error: 'At least one field must be provided to update',
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
    }
    catch (error) {
        console.error('[updateMember] ERROR:', error.message);
        const statusCode = error.message.includes('not found') ? 404 : 400;
        res.status(statusCode).json({
            success: false,
            error: error.message,
        });
    }
}
/**
 * DELETE /api/members/:memberId
 * Delete a member
 */
export async function deleteMember(req, res) {
    try {
        const { memberId } = req.params;
        const churchId = req.user?.churchId;
        console.log(`[deleteMember] Deleting member: ${memberId}`);
        if (!churchId) {
            return res.status(401).json({
                success: false,
                error: 'Unauthorized',
            });
        }
        await memberService.deleteMember(memberId);
        res.json({
            success: true,
            data: { id: memberId },
        });
    }
    catch (error) {
        console.error('[deleteMember] ERROR:', error.message);
        const statusCode = error.message.includes('not found') ? 404 : 400;
        res.status(statusCode).json({
            success: false,
            error: error.message,
        });
    }
}
/**
 * POST /api/members/import
 * Import members from CSV file
 */
export async function importMembers(req, res) {
    try {
        const churchId = req.user?.churchId;
        console.log('[importMembers] Starting import');
        if (!churchId) {
            return res.status(401).json({
                success: false,
                error: 'Unauthorized',
            });
        }
        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: 'No file uploaded',
            });
        }
        // Parse CSV
        console.log('[importMembers] CSV received, parsing...');
        const parsed = parseCSV(req.file.buffer);
        console.log(`[importMembers] Parsed ${parsed.length} rows from CSV`);
        // Format and validate members
        const validationResult = formatAndValidate(parsed);
        console.log(`[importMembers] Validated ${validationResult.valid.length} members, ${validationResult.invalid.length} invalid`);
        if (validationResult.valid.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'No valid members found in CSV',
                invalid: validationResult.invalid,
            });
        }
        // Import members
        console.log(`[importMembers] Importing ${validationResult.valid.length} members...`);
        const result = await memberService.importMembers(validationResult.valid);
        console.log(`[importMembers] Import complete: ${result.imported} imported, ${result.failed} failed`);
        res.json({
            success: true,
            data: result,
        });
    }
    catch (error) {
        console.error('[importMembers] ERROR:', error.message);
        res.status(400).json({
            success: false,
            error: error.message,
        });
    }
}
//# sourceMappingURL=member.controller.js.map