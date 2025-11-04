import client from './client';
/**
 * Get all templates (default + custom)
 */
export async function getTemplates() {
    const response = await client.get('/templates/templates');
    return response.data;
}
/**
 * Create custom template
 */
export async function createTemplate(data) {
    const response = await client.post('/templates/templates', data);
    return response.data;
}
/**
 * Update template
 */
export async function updateTemplate(templateId, data) {
    const response = await client.put(`/templates/templates/${templateId}`, data);
    return response.data;
}
/**
 * Delete template (custom only)
 */
export async function deleteTemplate(templateId) {
    const response = await client.delete(`/templates/templates/${templateId}`);
    return response.data;
}
//# sourceMappingURL=templates.js.map