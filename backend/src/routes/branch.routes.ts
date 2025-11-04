import express from 'express';
import { authenticateToken } from '../middleware/auth.middleware.js';
import {
  listBranches,
  createBranchHandler,
  updateBranchHandler,
  deleteBranchHandler,
} from '../controllers/branch.controller.js';

const router = express.Router();

// All branch routes require authentication
router.use(authenticateToken);

// Get all branches for a church
router.get('/churches/:churchId/branches', listBranches);

// Create a new branch
router.post('/churches/:churchId/branches', createBranchHandler);

// Update a branch
router.put('/:branchId', updateBranchHandler);

// Delete a branch
router.delete('/:branchId', deleteBranchHandler);

export default router;
