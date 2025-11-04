import client from './client';

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
export async function getTemplates(): Promise<MessageTemplate[]> {
  const response = await client.get('/templates');
  return response.data;
}

/**
 * Create custom template
 */
export async function createTemplate(data: CreateTemplateData): Promise<MessageTemplate> {
  const response = await client.post('/templates', data);
  return response.data;
}

/**
 * Update template
 */
export async function updateTemplate(
  templateId: string,
  data: Partial<CreateTemplateData>
): Promise<MessageTemplate> {
  const response = await client.put(`/templates/${templateId}`, data);
  return response.data;
}

/**
 * Delete template (custom only)
 */
export async function deleteTemplate(templateId: string): Promise<any> {
  const response = await client.delete(`/templates/${templateId}`);
  return response.data;
}
