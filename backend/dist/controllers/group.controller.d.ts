import { Request, Response } from 'express';
/**
 * GET /api/branches/:branchId/groups
 */
export declare function listGroups(req: Request, res: Response): Promise<void>;
/**
 * POST /api/branches/:branchId/groups
 */
export declare function createGroup(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
/**
 * PUT /api/groups/:groupId
 */
export declare function updateGroup(req: Request, res: Response): Promise<void>;
/**
 * DELETE /api/groups/:groupId
 */
export declare function deleteGroup(req: Request, res: Response): Promise<void>;
//# sourceMappingURL=group.controller.d.ts.map