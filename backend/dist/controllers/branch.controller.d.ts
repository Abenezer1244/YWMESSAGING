import { Request, Response } from 'express';
/**
 * GET /api/branches
 */
export declare function listBranches(req: Request, res: Response): Promise<void>;
/**
 * POST /api/branches
 */
export declare function createBranchHandler(req: Request, res: Response): Promise<void>;
/**
 * PUT /api/branches/:branchId
 */
export declare function updateBranchHandler(req: Request, res: Response): Promise<void>;
/**
 * DELETE /api/branches/:branchId
 */
export declare function deleteBranchHandler(req: Request, res: Response): Promise<void>;
//# sourceMappingURL=branch.controller.d.ts.map