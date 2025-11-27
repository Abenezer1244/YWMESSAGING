import { prisma } from '../lib/prisma.js';

export interface CreateTemplateData {
  name: string;
  content: string;
  category: string;
}

export async function getTemplates(churchId: string) {
  return await prisma.messageTemplate.findMany({
    where: { churchId },
    orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
  });
}

export async function createTemplate(
  churchId: string,
  data: CreateTemplateData
) {
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

export async function updateTemplate(
  templateId: string,
  data: Partial<CreateTemplateData>
) {
  return await prisma.messageTemplate.update({
    where: { id: templateId },
    data,
  });
}

export async function deleteTemplate(templateId: string) {
  return await prisma.messageTemplate.delete({
    where: { id: templateId },
  });
}

export async function incrementUsageCount(templateId: string) {
  return await prisma.messageTemplate.update({
    where: { id: templateId },
    data: { usageCount: { increment: 1 } },
  });
}
