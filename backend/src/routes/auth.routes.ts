import express from 'express';
import { register, loginHandler, refreshToken, getMe, logout, completeWelcome, verifyMFAHandler } from '../controllers/auth.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = express.Router();

// Public routes (rate limiting handled by app.ts authLimiter)
router.post('/register', register);
router.post('/login', loginHandler);
router.post('/verify-mfa', verifyMFAHandler);
router.post('/refresh', refreshToken);
router.post('/logout', logout);

// Protected routes
router.get('/me', authenticateToken, getMe);
router.post('/complete-welcome', authenticateToken, completeWelcome);

export default router;
