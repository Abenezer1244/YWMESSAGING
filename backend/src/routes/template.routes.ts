import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.middleware.js';
import * as templateController from '../controllers/template.controller.js';

const router = Router();

router.use(authenticateToken);

router.get('/api/templates', templateController.getTemplates);
router.post('/api/templates', templateController.createTemplate);
router.put('/api/templates/:templateId', templateController.updateTemplate);
router.delete('/api/templates/:templateId', templateController.deleteTemplate);

export default router;
