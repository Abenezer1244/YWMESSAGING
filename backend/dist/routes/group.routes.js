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
router.put('/groups/:groupId', authenticateToken, groupController.updateGroup);
router.delete('/groups/:groupId', authenticateToken, groupController.deleteGroup);
// Member routes
router.get('/groups/:groupId/members', authenticateToken, memberController.listMembers);
router.post('/groups/:groupId/members', authenticateToken, memberController.addMember);
router.post('/groups/:groupId/members/import', authenticateToken, upload.single('file'), memberController.importMembers);
router.put('/members/:memberId', authenticateToken, memberController.updateMember);
router.delete('/groups/:groupId/members/:memberId', authenticateToken, memberController.removeMember);
export default router;
//# sourceMappingURL=group.routes.js.map