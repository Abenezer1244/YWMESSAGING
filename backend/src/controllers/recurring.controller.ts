import { Request, Response } from 'express';
import * as recurringService from '../services/recurring.service.js';

export async function getRecurringMessages(req: Request, res: Response) {
  try {
    const churchId = req.user?.churchId;
    if (!churchId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const messages = await recurringService.getRecurringMessages(churchId);
    res.json(messages);
  } catch (error) {
    console.error('Error fetching recurring messages:', error);
    res.status(500).json({ error: 'Failed to fetch recurring messages' });
  }
}

export async function createRecurringMessage(req: Request, res: Response) {
  try {
    const churchId = req.user?.churchId;
    if (!churchId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { name, content, targetType, targetIds, frequency, dayOfWeek, timeOfDay } = req.body;

    if (!name || !content || !targetType || !frequency || !timeOfDay) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const message = await recurringService.createRecurringMessage(churchId, {
      name,
      content,
      targetType,
      targetIds,
      frequency,
      dayOfWeek,
      timeOfDay,
    });

    res.status(201).json(message);
  } catch (error) {
    console.error('Error creating recurring message:', error);
    res.status(500).json({ error: 'Failed to create recurring message' });
  }
}

export async function updateRecurringMessage(req: Request, res: Response) {
  try {
    const { messageId } = req.params;
    const { name, content, targetType, targetIds, frequency, dayOfWeek, timeOfDay } = req.body;

    const message = await recurringService.updateRecurringMessage(messageId, {
      name,
      content,
      targetType,
      targetIds,
      frequency,
      dayOfWeek,
      timeOfDay,
    });

    res.json(message);
  } catch (error) {
    console.error('Error updating recurring message:', error);
    res.status(500).json({ error: 'Failed to update recurring message' });
  }
}

export async function deleteRecurringMessage(req: Request, res: Response) {
  try {
    const { messageId } = req.params;

    await recurringService.deleteRecurringMessage(messageId);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting recurring message:', error);
    res.status(500).json({ error: 'Failed to delete recurring message' });
  }
}

export async function toggleRecurringMessage(req: Request, res: Response) {
  try {
    const { messageId } = req.params;
    const { isActive } = req.body;

    if (typeof isActive !== 'boolean') {
      return res.status(400).json({ error: 'isActive must be a boolean' });
    }

    const message = await recurringService.toggleRecurringMessage(messageId, isActive);
    res.json(message);
  } catch (error) {
    console.error('Error toggling recurring message:', error);
    res.status(500).json({ error: 'Failed to toggle recurring message' });
  }
}
