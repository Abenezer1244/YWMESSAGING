import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.middleware.js';
import * as templateController from '../controllers/template.controller.js';
const router = Router();
router.use(authenticateToken);
router.get('/', templateController.getTemplates);
router.post('/', templateController.createTemplate);
router.put('/:templateId', templateController.updateTemplate);
router.delete('/:templateId', templateController.deleteTemplate);
export default router;
//# sourceMappingURL=template.routes.js.map