import { registerChurch, login, refreshAccessToken, getAdmin } from '../services/auth.service.js';
import { verifyRefreshToken } from '../utils/jwt.utils.js';
import { logFailedLogin } from '../utils/security-logger.js';
/**
 * POST /api/auth/register
 */
export async function register(req, res) {
    try {
        const { email, password, firstName, lastName, churchName } = req.body;
        // Validate required fields
        if (!email || !password || !firstName || !lastName || !churchName) {
            res.status(400).json({ error: 'Registration failed. Please check your input and try again.' });
            return;
        }
        // Validate email format
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            res.status(400).json({ error: 'Registration failed. Please check your input and try again.' });
            return;
        }
        // Validate password length
        if (password.length < 8) {
            res.status(400).json({ error: 'Registration failed. Please check your input and try again.' });
            return;
        }
        const result = await registerChurch({ email, password, firstName, lastName, churchName });
        // ✅ SECURITY: Determine cookie domain based on environment
        // Production: .koinoniasms.com (shared across subdomains)
        // Development: undefined (localhost only)
        const cookieDomain = process.env.NODE_ENV === 'production' ? '.koinoniasms.com' : undefined;
        // Set httpOnly cookies for tokens (secure, cannot be accessed via JavaScript)
        res.cookie('accessToken', result.accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', // HTTPS only in production
            sameSite: 'none', // Allow cross-origin cookie sending
            domain: cookieDomain,
            maxAge: 15 * 60 * 1000, // 15 minutes
        });
        res.cookie('refreshToken', result.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', // HTTPS only in production
            sameSite: 'none', // Allow cross-origin cookie sending
            domain: cookieDomain,
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });
        // ✅ SECURITY: Return tokens for frontend Zustand state (also in HTTPOnly cookies for security)
        res.status(201).json({
            success: true,
            data: {
                admin: result.admin,
                church: result.church,
                accessToken: result.accessToken,
                refreshToken: result.refreshToken,
            },
        });
    }
    catch (error) {
        // Log detailed error server-side only
        console.error('Registration error:', error);
        // Return generic message to client
        res.status(400).json({ error: 'Registration failed. Please try again later or contact support.' });
    }
}
/**
 * POST /api/auth/login
 */
export async function loginHandler(req, res) {
    try {
        const { email, password } = req.body;
        const ipAddress = (req.ip || req.socket.remoteAddress || 'unknown');
        if (!email || !password) {
            logFailedLogin(email || 'unknown', ipAddress, 'Missing email or password');
            res.status(400).json({ error: 'Email and password required' });
            return;
        }
        const result = await login({ email, password });
        // ✅ SECURITY: Determine cookie domain based on environment
        const cookieDomain = process.env.NODE_ENV === 'production' ? '.koinoniasms.com' : undefined;
        // Set httpOnly cookies for tokens
        res.cookie('accessToken', result.accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', // HTTPS only in production
            sameSite: 'none', // Allow cross-origin cookie sending
            domain: cookieDomain,
            maxAge: 15 * 60 * 1000, // 15 minutes
        });
        res.cookie('refreshToken', result.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', // HTTPS only in production
            sameSite: 'none', // Allow cross-origin cookie sending
            domain: cookieDomain,
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });
        // ✅ SECURITY: Return tokens for frontend Zustand state (also in HTTPOnly cookies for security)
        res.status(200).json({
            success: true,
            data: {
                admin: result.admin,
                church: result.church,
                accessToken: result.accessToken,
                refreshToken: result.refreshToken,
            },
        });
    }
    catch (error) {
        const { email, password } = req.body;
        const ipAddress = (req.ip || req.socket.remoteAddress || 'unknown');
        console.error('Login error:', error);
        logFailedLogin(email || 'unknown', ipAddress, error.message || 'Authentication failed');
        res.status(401).json({ error: error.message || 'Login failed' });
    }
}
/**
 * POST /api/auth/refresh
 */
export async function refreshToken(req, res) {
    try {
        // Get refresh token from cookie
        const refreshTokenFromCookie = req.cookies.refreshToken;
        if (!refreshTokenFromCookie) {
            res.status(400).json({ error: 'Refresh token required' });
            return;
        }
        const payload = verifyRefreshToken(refreshTokenFromCookie);
        if (!payload) {
            res.status(401).json({ error: 'Invalid or expired refresh token' });
            return;
        }
        const result = await refreshAccessToken(payload.adminId);
        // ✅ SECURITY: Determine cookie domain based on environment
        const cookieDomain = process.env.NODE_ENV === 'production' ? '.koinoniasms.com' : undefined;
        // Set new httpOnly cookies for tokens
        res.cookie('accessToken', result.accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', // HTTPS only in production
            sameSite: 'none', // Allow cross-origin cookie sending
            domain: cookieDomain,
            maxAge: 15 * 60 * 1000, // 15 minutes
        });
        res.cookie('refreshToken', result.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', // HTTPS only in production
            sameSite: 'none', // Allow cross-origin cookie sending
            domain: cookieDomain,
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });
        // ✅ SECURITY: Return tokens for frontend Zustand state (also in HTTPOnly cookies for security)
        res.status(200).json({
            success: true,
            data: {
                accessToken: result.accessToken,
                refreshToken: result.refreshToken,
            },
        });
    }
    catch (error) {
        console.error('Token refresh error:', error);
        res.status(401).json({ error: error.message || 'Token refresh failed' });
    }
}
/**
 * GET /api/auth/me
 */
export async function getMe(req, res) {
    try {
        if (!req.user) {
            res.status(401).json({ error: 'Not authenticated' });
            return;
        }
        const admin = await getAdmin(req.user.adminId);
        if (!admin) {
            res.status(404).json({ error: 'Admin not found' });
            return;
        }
        // Include welcome fields in response
        const response = {
            ...admin,
            welcomeCompleted: admin.welcomeCompleted,
            userRole: admin.userRole,
        };
        res.status(200).json({
            success: true,
            data: response,
        });
    }
    catch (error) {
        console.error('Get admin error:', error);
        res.status(500).json({ error: 'Failed to fetch admin' });
    }
}
/**
 * POST /api/auth/logout
 */
export async function logout(req, res) {
    try {
        // ✅ SECURITY: Determine cookie domain based on environment
        const cookieDomain = process.env.NODE_ENV === 'production' ? '.koinoniasms.com' : undefined;
        // Clear httpOnly cookies by setting maxAge to 0
        res.clearCookie('accessToken', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'none',
            domain: cookieDomain,
        });
        res.clearCookie('refreshToken', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'none',
            domain: cookieDomain,
        });
        res.status(200).json({ success: true });
    }
    catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({ error: 'Logout failed' });
    }
}
/**
 * POST /api/auth/complete-welcome
 * Mark user's welcome modal as completed and store their role
 */
export async function completeWelcome(req, res) {
    try {
        if (!req.user) {
            res.status(401).json({ error: 'Not authenticated' });
            return;
        }
        const { userRole } = req.body;
        // Validate role
        const validRoles = ['pastor', 'admin', 'communications', 'volunteer', 'other'];
        if (!userRole || !validRoles.includes(userRole)) {
            res.status(400).json({ error: 'Invalid user role' });
            return;
        }
        // Update admin record
        const { PrismaClient } = await import('@prisma/client');
        const prisma = new PrismaClient();
        const updatedAdmin = await prisma.admin.update({
            where: { id: req.user.adminId },
            data: {
                welcomeCompleted: true,
                userRole: userRole,
            },
        });
        res.status(200).json({
            success: true,
            data: {
                id: updatedAdmin.id,
                email: updatedAdmin.email,
                firstName: updatedAdmin.firstName,
                lastName: updatedAdmin.lastName,
                role: updatedAdmin.role,
                welcomeCompleted: updatedAdmin.welcomeCompleted,
                userRole: updatedAdmin.userRole,
            },
        });
    }
    catch (error) {
        console.error('Complete welcome error:', error);
        res.status(500).json({ error: 'Failed to complete welcome' });
    }
}
//# sourceMappingURL=auth.controller.js.map