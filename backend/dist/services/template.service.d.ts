import type { TenantPrismaClient } from '../lib/tenant-prisma.js';
export interface CreateTemplateData {
    name: string;
    content: string;
    category: string;
}
export declare function getTemplates(tenantId: string, tenantPrisma: TenantPrismaClient): Promise<{
    id: string;
    name: string;
    content: string;
    category: string;
    isDefault: boolean;
    usageCount: number;
    createdAt: Date;
    updatedAt: Date;
}[]>;
export declare function createTemplate(tenantId: string, tenantPrisma: TenantPrismaClient, data: CreateTemplateData): Promise<{
    id: string;
    name: string;
    content: string;
    category: string;
    isDefault: boolean;
    usageCount: number;
    createdAt: Date;
    updatedAt: Date;
}>;
export declare function updateTemplate(tenantId: string, tenantPrisma: TenantPrismaClient, templateId: string, data: Partial<CreateTemplateData>): Promise<{
    id: string;
    name: string;
    content: string;
    category: string;
    isDefault: boolean;
    usageCount: number;
    createdAt: Date;
    updatedAt: Date;
}>;
export declare function deleteTemplate(tenantId: string, tenantPrisma: TenantPrismaClient, templateId: string): Promise<{
    id: string;
    name: string;
    content: string;
    category: string;
    isDefault: boolean;
    usageCount: number;
    createdAt: Date;
    updatedAt: Date;
}>;
export declare function incrementUsageCount(tenantId: string, tenantPrisma: TenantPrismaClient, templateId: string): Promise<{
    id: string;
    name: string;
    content: string;
    category: string;
    isDefault: boolean;
    usageCount: number;
    createdAt: Date;
    updatedAt: Date;
}>;
//# sourceMappingURL=template.service.d.ts.map