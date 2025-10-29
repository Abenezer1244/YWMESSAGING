import { Request, Response } from 'express';
/**
 * GET /api/branches/:branchId/groups
 * SECURITY: Verifies branch belongs to authenticated user's church
 */
export declare function listGroups(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
/**
 * POST /api/branches/:branchId/groups
 * SECURITY: Verifies branch belongs to authenticated user's church
 */
export declare function createGroup(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
/**
 * PUT /api/groups/:groupId
 * SECURITY: Verifies group belongs to authenticated user's church
 */
export declare function updateGroup(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
/**
 * DELETE /api/groups/:groupId
 * SECURITY: Verifies group belongs to authenticated user's church
 */
export declare function deleteGroup(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=group.controller.d.ts.map