import { Request, Response } from 'express';
/**
 * GET /api/groups/:groupId/members
 */
export declare function listMembers(req: Request, res: Response): Promise<void>;
/**
 * POST /api/groups/:groupId/members
 */
export declare function addMember(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
/**
 * POST /api/groups/:groupId/members/import
 */
export declare function importMembers(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
/**
 * PUT /api/members/:memberId
 */
export declare function updateMember(req: Request, res: Response): Promise<void>;
/**
 * DELETE /api/groups/:groupId/members/:memberId
 */
export declare function removeMember(req: Request, res: Response): Promise<void>;
//# sourceMappingURL=member.controller.d.ts.map