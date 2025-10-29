export interface CreateTemplateData {
    name: string;
    content: string;
    category: string;
}
export declare function getTemplates(churchId: string): Promise<{
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
export declare function createTemplate(churchId: string, data: CreateTemplateData): Promise<{
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
export declare function updateTemplate(templateId: string, data: Partial<CreateTemplateData>): Promise<{
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
export declare function deleteTemplate(templateId: string): Promise<{
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
export declare function incrementUsageCount(templateId: string): Promise<{
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