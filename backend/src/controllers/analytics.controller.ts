import { Request, Response } from 'express';
import * as statsService from '../services/stats.service.js';

export async function getMessageStats(req: Request, res: Response) {
  try {
    if (!req.prisma) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const days = req.query.days ? parseInt(req.query.days as string) : 30;

    const stats = await statsService.getMessageStats(req.prisma, days);
    res.json(stats);
  } catch (error: any) {
    console.error('Error fetching message stats:', error.message || error);
    res.status(500).json({ error: 'Failed to fetch message statistics', details: error.message });
  }
}

export async function getBranchStats(req: Request, res: Response) {
  try {
    if (!req.prisma) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const stats = await statsService.getBranchStats(req.prisma);
    res.json(stats);
  } catch (error: any) {
    console.error('Error fetching branch stats:', error.message || error);
    res.status(500).json({ error: 'Failed to fetch branch statistics', details: error.message });
  }
}

export async function getSummaryStats(req: Request, res: Response) {
  try {
    if (!req.prisma) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const stats = await statsService.getSummaryStats(req.prisma);
    res.json(stats);
  } catch (error: any) {
    console.error('Error fetching summary stats:', error.message || error);
    res.status(500).json({ error: 'Failed to fetch summary statistics', details: error.message });
  }
}
