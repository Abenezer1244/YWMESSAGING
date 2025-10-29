import express from 'express';
import { register, loginHandler, refreshToken, getMe } from '../controllers/auth.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', loginHandler);
router.post('/refresh', refreshToken);

// Protected routes
router.get('/me', authenticateToken, getMe);

export default router;
