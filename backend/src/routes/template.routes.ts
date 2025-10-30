import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.middleware.js';
import * as templateController from '../controllers/template.controller.js';

const router = Router();

router.use(authenticateToken);

router.get('/templates', templateController.getTemplates);
router.post('/templates', templateController.createTemplate);
router.put('/templates/:templateId', templateController.updateTemplate);
router.delete('/templates/:templateId', templateController.deleteTemplate);

export default router;
