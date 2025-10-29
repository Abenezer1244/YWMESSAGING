import { Request, Response } from 'express';
export declare function getTemplates(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
export declare function createTemplate(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
export declare function updateTemplate(req: Request, res: Response): Promise<void>;
export declare function deleteTemplate(req: Request, res: Response): Promise<void>;
//# sourceMappingURL=template.controller.d.ts.map