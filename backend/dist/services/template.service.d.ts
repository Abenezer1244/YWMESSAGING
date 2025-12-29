import { PrismaClient } from '@prisma/client';
export interface CreateTemplateData {
    name: string;
    content: string;
    category: string;
}
export declare function getTemplates(tenantId: string, tenantPrisma: PrismaClient): Promise<{
    id: string;
    churchId: string;
    name: string;
    content: string;
    category: string;
    isDefault: boolean;
    usageCount: number;
    createdAt: Date;
    updatedAt: Date;
}[]>;
export declare function createTemplate(tenantId: string, tenantPrisma: PrismaClient, data: CreateTemplateData): Promise<{
    id: string;
    churchId: string;
    name: string;
    content: string;
    category: string;
    isDefault: boolean;
    usageCount: number;
    createdAt: Date;
    updatedAt: Date;
}>;
export declare function updateTemplate(tenantId: string, tenantPrisma: PrismaClient, templateId: string, data: Partial<CreateTemplateData>): Promise<{
    id: string;
    churchId: string;
    name: string;
    content: string;
    category: string;
    isDefault: boolean;
    usageCount: number;
    createdAt: Date;
    updatedAt: Date;
}>;
export declare function deleteTemplate(tenantId: string, tenantPrisma: PrismaClient, templateId: string): Promise<{
    id: string;
    churchId: string;
    name: string;
    content: string;
    category: string;
    isDefault: boolean;
    usageCount: number;
    createdAt: Date;
    updatedAt: Date;
}>;
export declare function incrementUsageCount(tenantId: string, tenantPrisma: PrismaClient, templateId: string): Promise<{
    id: string;
    churchId: string;
    name: string;
    content: string;
    category: string;
    isDefault: boolean;
    usageCount: number;
    createdAt: Date;
    updatedAt: Date;
}>;
//# sourceMappingURL=template.service.d.ts.map