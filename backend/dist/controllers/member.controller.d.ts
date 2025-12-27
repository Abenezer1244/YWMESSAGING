import { Request, Response } from 'express';
/**
 * GET /api/groups/:groupId/members
 * SECURITY: Verifies group belongs to authenticated user's church
 */
export declare function listMembers(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
/**
 * POST /api/groups/:groupId/members
 * SECURITY: Verifies group belongs to authenticated user's church
 */
export declare function addMember(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
/**
 * POST /api/groups/:groupId/members/import
 * SECURITY: Verifies group belongs to authenticated user's church
 */
export declare function importMembers(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
/**
 * PUT /api/members/:memberId
 * SECURITY: Verifies member belongs to authenticated user's church
 */
export declare function updateMember(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
/**
 * DELETE /api/groups/:groupId/members/:memberId
 * SECURITY: Verifies group and member belong to authenticated user's church
 */
export declare function removeMember(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=member.controller.d.ts.map