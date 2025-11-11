import { Request, Response } from 'express';
import { registerChurch, login, refreshAccessToken, getAdmin } from '../services/auth.service.js';
import { verifyRefreshToken } from '../utils/jwt.utils.js';
import { logFailedLogin } from '../utils/security-logger.js';

/**
 * POST /api/auth/register
 */
export async function register(req: Request, res: Response): Promise<void> {
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
  } catch (error: any) {
    // Log detailed error server-side only
    console.error('Registration error:', error);
    // Return generic message to client
    res.status(400).json({ error: 'Registration failed. Please try again later or contact support.' });
  }
}

/**
 * POST /api/auth/login
 */
export async function loginHandler(req: Request, res: Response): Promise<void> {
  try {
    const { email, password } = req.body;
    const ipAddress = (req.ip || req.socket.remoteAddress || 'unknown') as string;

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
  } catch (error: any) {
    const { email, password } = req.body;
    const ipAddress = (req.ip || req.socket.remoteAddress || 'unknown') as string;

    console.error('Login error:', error);
    logFailedLogin(email || 'unknown', ipAddress, error.message || 'Authentication failed');
    res.status(401).json({ error: error.message || 'Login failed' });
  }
}

/**
 * POST /api/auth/refresh
 */
export async function refreshToken(req: Request, res: Response): Promise<void> {
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
  } catch (error: any) {
    console.error('Token refresh error:', error);
    res.status(401).json({ error: error.message || 'Token refresh failed' });
  }
}

/**
 * GET /api/auth/me
 */
export async function getMe(req: Request, res: Response): Promise<void> {
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

    res.status(200).json({
      success: true,
      data: admin,
    });
  } catch (error: any) {
    console.error('Get admin error:', error);
    res.status(500).json({ error: 'Failed to fetch admin' });
  }
}

/**
 * POST /api/auth/logout
 */
export async function logout(req: Request, res: Response): Promise<void> {
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
  } catch (error: any) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Logout failed' });
  }
}
