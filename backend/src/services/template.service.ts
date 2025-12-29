import { PrismaClient } from '@prisma/client';

export interface CreateTemplateData {
  name: string;
  content: string;
  category: string;
}

export async function getTemplates(tenantId: string, tenantPrisma: PrismaClient) {
  return await tenantPrisma.messageTemplate.findMany({
    orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
  });
}

export async function createTemplate(
  tenantId: string,
  tenantPrisma: PrismaClient,
  data: CreateTemplateData
) {
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

export async function updateTemplate(
  tenantId: string,
  tenantPrisma: PrismaClient,
  templateId: string,
  data: Partial<CreateTemplateData>
) {
  return await tenantPrisma.messageTemplate.update({
    where: { id: templateId },
    data,
  });
}

export async function deleteTemplate(tenantId: string, tenantPrisma: PrismaClient, templateId: string) {
  return await tenantPrisma.messageTemplate.delete({
    where: { id: templateId },
  });
}

export async function incrementUsageCount(tenantId: string, tenantPrisma: PrismaClient, templateId: string) {
  return await tenantPrisma.messageTemplate.update({
    where: { id: templateId },
    data: { usageCount: { increment: 1 } },
  });
}
