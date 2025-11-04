import { Router } from 'express';
import multer from 'multer';
import { authenticateToken } from '../middleware/auth.middleware.js';
import * as groupController from '../controllers/group.controller.js';
import * as memberController from '../controllers/member.controller.js';
const router = Router();
const upload = multer({ storage: multer.memoryStorage() });
// Group routes
router.get('/branches/:branchId/groups', authenticateToken, groupController.listGroups);
router.post('/branches/:branchId/groups', authenticateToken, groupController.createGroup);
router.put('/:groupId', authenticateToken, groupController.updateGroup);
router.delete('/:groupId', authenticateToken, groupController.deleteGroup);
// Member routes
router.get('/:groupId/members', authenticateToken, memberController.listMembers);
router.post('/:groupId/members', authenticateToken, memberController.addMember);
router.post('/:groupId/members/import', authenticateToken, upload.single('file'), memberController.importMembers);
router.put('/members/:memberId', authenticateToken, memberController.updateMember);
router.delete('/:groupId/members/:memberId', authenticateToken, memberController.removeMember);
export default router;
//# sourceMappingURL=group.routes.js.map