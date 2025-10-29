import { Request, Response } from 'express';
import * as templateService from '../services/template.service.js';

export async function getTemplates(req: Request, res: Response) {
  try {
    const churchId = req.user?.churchId;
    if (!churchId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const templates = await templateService.getTemplates(churchId);
    res.json(templates);
  } catch (error) {
    console.error('Error fetching templates:', error);
    res.status(500).json({ error: 'Failed to fetch templates' });
  }
}

export async function createTemplate(req: Request, res: Response) {
  try {
    const churchId = req.user?.churchId;
    if (!churchId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { name, content, category } = req.body;

    if (!name || !content || !category) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const template = await templateService.createTemplate(churchId, {
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
    const { templateId } = req.params;
    const { name, content, category } = req.body;

    const template = await templateService.updateTemplate(templateId, {
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
    const { templateId } = req.params;

    await templateService.deleteTemplate(templateId);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting template:', error);
    res.status(500).json({ error: 'Failed to delete template' });
  }
}
