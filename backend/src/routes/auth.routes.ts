import express from 'express';
import { register, loginHandler, refreshToken, getMe } from '../controllers/auth.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { registerLimiter, loginLimiter, refreshLimiter } from '../middleware/rateLimit.middleware.js';

const router = express.Router();

// Public routes
router.post('/register', registerLimiter, register);
router.post('/login', loginLimiter, loginHandler);
router.post('/refresh', refreshLimiter, refreshToken);

// Protected routes
router.get('/me', authenticateToken, getMe);

export default router;
