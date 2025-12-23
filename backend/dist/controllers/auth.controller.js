import { registerChurch, login, refreshAccessToken, getAdmin } from '../services/auth.service.js';
import { verifyRefreshToken, generateMFASessionToken, verifyMFASessionToken } from '../utils/jwt.utils.js';
import { logFailedLogin } from '../utils/security-logger.js';
import { registerSchema, loginSchema, completeWelcomeSchema } from '../lib/validation/schemas.js';
import { safeValidate } from '../lib/validation/schemas.js';
import { revokeAllTokens } from '../services/token-revocation.service.js';
import * as mfaService from '../services/mfa.service.js';
import { prisma } from '../lib/prisma.js';
/**
 * POST /api/auth/register
 */
export async function register(req, res) {
    try {
        // ✅ SECURITY: Validate request body with Zod schema (blocks 60-80% of injection attacks)
        const validationResult = safeValidate(registerSchema, req.body);
        if (!validationResult.success) {
            console.error('Registration validation failed:', {
                errors: validationResult.errors,
                receivedFields: Object.keys(req.body),
                receivedData: { email: req.body.email, firstName: req.body.firstName, lastName: req.body.lastName, churchName: req.body.churchName }
            });
            res.status(400).json({ error: 'Validation failed', details: validationResult.errors });
            return;
        }
        const { email, password, firstName, lastName, churchName } = validationResult.data;
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
        const ipAddress = (req.ip || req.socket.remoteAddress || 'unknown');
        // ✅ SECURITY: Validate request body with Zod schema
        const validationResult = safeValidate(loginSchema, req.body);
        if (!validationResult.success) {
            logFailedLogin(req.body.email || 'unknown', ipAddress, 'Validation failed');
            res.status(400).json({ error: 'Invalid email or password format' });
            return;
        }
        const { email, password } = validationResult.data;
        const result = await login({ email, password });
        // ✅ SECURITY: Check if MFA is enabled
        const mfaRecord = await prisma.adminMFA.findUnique({
            where: { adminId: result.adminId },
        });
        // If MFA is enabled, require MFA verification
        if (mfaRecord?.mfaEnabled) {
            const mfaSessionToken = generateMFASessionToken(result.adminId, result.churchId);
            res.status(200).json({
                success: true,
                mfaRequired: true,
                mfaSessionToken,
                data: {
                    admin: result.admin,
                    message: 'Enter your 6-digit authentication code',
                },
            });
            return;
        }
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
            mfaRequired: false,
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
        // ✅ SECURITY: Revoke tokens immediately (prevents further use even if cookies somehow persist)
        const accessToken = req.cookies.accessToken;
        const refreshToken = req.cookies.refreshToken;
        if (accessToken && refreshToken) {
            try {
                await revokeAllTokens(accessToken, refreshToken);
            }
            catch (revocationError) {
                console.error('⚠️ Failed to revoke tokens:', revocationError);
                // Continue with logout even if revocation fails
                // (user cookies will be cleared as fallback)
            }
        }
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
 * POST /api/auth/verify-mfa
 * Verify MFA code (TOTP or recovery code) and complete login
 * Body: { mfaSessionToken: string, code: string }
 */
export async function verifyMFAHandler(req, res) {
    try {
        const { mfaSessionToken, code } = req.body;
        if (!mfaSessionToken || !code) {
            res.status(400).json({ error: 'MFA session token and code are required' });
            return;
        }
        // ✅ SECURITY: Verify the MFA session token
        const payload = verifyMFASessionToken(mfaSessionToken);
        if (!payload) {
            res.status(401).json({ error: 'Invalid or expired MFA session token' });
            return;
        }
        const { adminId, churchId } = payload;
        // ✅ SECURITY: Verify TOTP code first
        let isValidCode = await mfaService.verifyTOTPCode(adminId, code);
        // If TOTP verification fails, try recovery code
        if (!isValidCode) {
            isValidCode = await mfaService.verifyRecoveryCode(adminId, code);
        }
        if (!isValidCode) {
            res.status(400).json({ error: 'Invalid authentication code' });
            return;
        }
        // ✅ SECURITY: Get admin data and church info
        const admin = await prisma.admin.findUnique({
            where: { id: adminId },
            include: { church: true },
        });
        if (!admin) {
            res.status(404).json({ error: 'Admin not found' });
            return;
        }
        // Generate final access and refresh tokens
        const { generateAccessToken, generateRefreshToken } = await import('../utils/jwt.utils.js');
        const accessToken = generateAccessToken(adminId, churchId, admin.role);
        const refreshToken = generateRefreshToken(adminId);
        // ✅ SECURITY: Determine cookie domain based on environment
        const cookieDomain = process.env.NODE_ENV === 'production' ? '.koinoniasms.com' : undefined;
        // Set httpOnly cookies for tokens
        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', // HTTPS only in production
            sameSite: 'none', // Allow cross-origin cookie sending
            domain: cookieDomain,
            maxAge: 15 * 60 * 1000, // 15 minutes
        });
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', // HTTPS only in production
            sameSite: 'none', // Allow cross-origin cookie sending
            domain: cookieDomain,
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });
        // ✅ SECURITY: Return tokens for frontend Zustand state
        res.status(200).json({
            success: true,
            data: {
                admin: {
                    id: admin.id,
                    email: admin.email,
                    firstName: admin.firstName,
                    lastName: admin.lastName,
                    role: admin.role,
                    welcomeCompleted: admin.welcomeCompleted,
                    userRole: admin.userRole,
                },
                church: {
                    id: admin.church.id,
                    name: admin.church.name,
                    email: admin.church.email,
                    trialEndsAt: admin.church.trialEndsAt,
                },
                accessToken,
                refreshToken,
            },
        });
    }
    catch (error) {
        console.error('MFA verification error:', error);
        res.status(400).json({ error: error.message || 'MFA verification failed' });
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
        // ✅ SECURITY: Validate request body with Zod schema
        const validationResult = safeValidate(completeWelcomeSchema, req.body);
        if (!validationResult.success) {
            res.status(400).json({ error: 'Validation failed', details: validationResult.errors });
            return;
        }
        const { userRole } = validationResult.data;
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