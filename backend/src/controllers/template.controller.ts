import { Request, Response } from 'express';
import * as templateService from '../services/template.service.js';

export async function getTemplates(req: Request, res: Response) {
  try {
    const tenantId = req.tenantId;
    const tenantPrisma = req.prisma;
    if (!tenantId || !tenantPrisma) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const templates = await templateService.getTemplates(tenantId, tenantPrisma);
    res.json(templates);
  } catch (error) {
    console.error('Error fetching templates:', error);
    res.status(500).json({ error: 'Failed to fetch templates' });
  }
}

export async function createTemplate(req: Request, res: Response) {
  try {
    const tenantId = req.tenantId;
    const tenantPrisma = req.prisma;
    if (!tenantId || !tenantPrisma) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { name, content, category } = req.body;

    if (!name || !content || !category) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const template = await templateService.createTemplate(tenantId, tenantPrisma, {
      name,
      content,
      category,
    });

    res.status(201).json(template);
  } catch (error) {
    console.error('Error creating template:', error);
    res.status(500).json({ error: 'Failed to create template' });
  }
}

export async function updateTemplate(req: Request, res: Response) {
  try {
    const tenantId = req.tenantId;
    const tenantPrisma = req.prisma;
    if (!tenantId || !tenantPrisma) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { templateId } = req.params;
    const { name, content, category } = req.body;

    const template = await templateService.updateTemplate(tenantId, tenantPrisma, templateId, {
      name,
      content,
      category,
    });

    res.json(template);
  } catch (error) {
    console.error('Error updating template:', error);
    res.status(500).json({ error: 'Failed to update template' });
  }
}

export async function deleteTemplate(req: Request, res: Response) {
  try {
    const tenantId = req.tenantId;
    const tenantPrisma = req.prisma;
    if (!tenantId || !tenantPrisma) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { templateId } = req.params;

    await templateService.deleteTemplate(tenantId, tenantPrisma, templateId);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting template:', error);
    res.status(500).json({ error: 'Failed to delete template' });
  }
}
