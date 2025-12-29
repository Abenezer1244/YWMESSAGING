import express from 'express';
import multer from 'multer';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { listMembers, addMember, updateMember, deleteMember, importMembers, } from '../controllers/member.controller.js';
const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });
// All member routes require authentication
router.use(authenticateToken);
// Get all members
router.get('/', listMembers);
// Add a single member
router.post('/', addMember);
// Import members from CSV
router.post('/import', upload.single('file'), importMembers);
// Update a member
router.put('/:memberId', updateMember);
// Delete a member
router.delete('/:memberId', deleteMember);
export default router;
//# sourceMappingURL=member.routes.js.map