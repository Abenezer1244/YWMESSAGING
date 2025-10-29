export interface MessageTemplate {
    id: string;
    churchId: string;
    name: string;
    content: string;
    category: string;
    isDefault: boolean;
    usageCount: number;
    createdAt: string;
    updatedAt: string;
}
export interface CreateTemplateData {
    name: string;
    content: string;
    category: string;
}
/**
 * Get all templates (default + custom)
 */
export declare function getTemplates(): Promise<MessageTemplate[]>;
/**
 * Create custom template
 */
export declare function createTemplate(data: CreateTemplateData): Promise<MessageTemplate>;
/**
 * Update template
 */
export declare function updateTemplate(templateId: string, data: Partial<CreateTemplateData>): Promise<MessageTemplate>;
/**
 * Delete template (custom only)
 */
export declare function deleteTemplate(templateId: string): Promise<any>;
//# sourceMappingURL=templates.d.ts.map