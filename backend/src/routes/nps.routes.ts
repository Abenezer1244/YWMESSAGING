/**
 * NPS Survey Routes
 * Endpoints for submitting surveys and retrieving analytics
 */

import { Router } from 'express';
import {
  submitSurvey,
  getAnalytics,
  getRecentSurveys,
  getNPSByCategory,
} from '../controllers/nps.controller.js';
import { authenticate } from '../middleware/auth.js';
import { churchMiddleware } from '../middleware/church.js';

const router = Router();

/**
 * All routes require authentication
 */
router.use(authenticate);
router.use(churchMiddleware);

/**
 * POST /api/nps/submit
 * Submit NPS survey response
 */
router.post('/submit', submitSurvey);

/**
 * GET /api/nps/analytics
 * Get NPS analytics and summary
 */
router.get('/analytics', getAnalytics);

/**
 * GET /api/nps/recent
 * Get recent survey responses
 */
router.get('/recent', getRecentSurveys);

/**
 * GET /api/nps/by-category
 * Get NPS score by category
 */
router.get('/by-category', getNPSByCategory);

export default router;
