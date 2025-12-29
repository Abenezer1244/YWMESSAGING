import { Request, Response } from 'express';
export declare function getRecurringMessages(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
export declare function createRecurringMessage(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
export declare function updateRecurringMessage(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
export declare function deleteRecurringMessage(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
export declare function toggleRecurringMessage(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=recurring.controller.d.ts.map