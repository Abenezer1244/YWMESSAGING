export async function getTemplates(tenantId, tenantPrisma) {
    return await tenantPrisma.messageTemplate.findMany({
        orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });
}
export async function createTemplate(tenantId, tenantPrisma, data) {
    return await tenantPrisma.messageTemplate.create({
        data: {
            churchId: tenantId,
            name: data.name,
            content: data.content,
            category: data.category,
            isDefault: false,
        },
    });
}
export async function updateTemplate(tenantId, tenantPrisma, templateId, data) {
    return await tenantPrisma.messageTemplate.update({
        where: { id: templateId },
        data,
    });
}
export async function deleteTemplate(tenantId, tenantPrisma, templateId) {
    return await tenantPrisma.messageTemplate.delete({
        where: { id: templateId },
    });
}
export async function incrementUsageCount(tenantId, tenantPrisma, templateId) {
    return await tenantPrisma.messageTemplate.update({
        where: { id: templateId },
        data: { usageCount: { increment: 1 } },
    });
}
//# sourceMappingURL=template.service.js.map