import { Request, Response } from 'express';
/**
 * GET /api/members
 * Get all members for authenticated user's church
 */
export declare function listMembers(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
/**
 * POST /api/members
 * Add a new member
 */
export declare function addMember(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
/**
 * PUT /api/members/:memberId
 * Update a member
 */
export declare function updateMember(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
/**
 * DELETE /api/members/:memberId
 * Delete a member
 */
export declare function deleteMember(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
/**
 * POST /api/members/import
 * Import members from CSV file
 */
export declare function importMembers(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=member.controller.d.ts.map