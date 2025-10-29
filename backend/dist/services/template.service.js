import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
export async function getTemplates(churchId) {
    return await prisma.messageTemplate.findMany({
        where: { churchId },
        orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });
}
export async function createTemplate(churchId, data) {
    return await prisma.messageTemplate.create({
        data: {
            churchId,
            name: data.name,
            content: data.content,
            category: data.category,
            isDefault: false,
        },
    });
}
export async function updateTemplate(templateId, data) {
    return await prisma.messageTemplate.update({
        where: { id: templateId },
        data,
    });
}
export async function deleteTemplate(templateId) {
    return await prisma.messageTemplate.delete({
        where: { id: templateId },
    });
}
export async function incrementUsageCount(templateId) {
    return await prisma.messageTemplate.update({
        where: { id: templateId },
        data: { usageCount: { increment: 1 } },
    });
}
//# sourceMappingURL=template.service.js.map