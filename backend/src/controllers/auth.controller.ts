import { Request, Response } from 'express';
import { registerChurch, login, refreshAccessToken, getAdmin } from '../services/auth.service.js';
import { verifyRefreshToken } from '../utils/jwt.utils.js';

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

    // Set httpOnly cookies for tokens
    res.cookie('accessToken', result.accessToken, {
      httpOnly: true,
      secure: true, // Required for sameSite: none (HTTPS only)
      sameSite: 'none', // Allow cross-origin cookie sending
      domain: '.onrender.com', // Share cookies across all onrender.com subdomains
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: true, // Required for sameSite: none (HTTPS only)
      sameSite: 'none', // Allow cross-origin cookie sending
      domain: '.onrender.com', // Share cookies across all onrender.com subdomains
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(201).json({
      success: true,
      data: {
        adminId: result.adminId,
        churchId: result.churchId,
        admin: result.admin,
        church: result.church,
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

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password required' });
      return;
    }

    const result = await login({ email, password });

    // Set httpOnly cookies for tokens
    res.cookie('accessToken', result.accessToken, {
      httpOnly: true,
      secure: true, // Required for sameSite: none (HTTPS only)
      sameSite: 'none', // Allow cross-origin cookie sending
      domain: '.onrender.com', // Share cookies across all onrender.com subdomains
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: true, // Required for sameSite: none (HTTPS only)
      sameSite: 'none', // Allow cross-origin cookie sending
      domain: '.onrender.com', // Share cookies across all onrender.com subdomains
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(200).json({
      success: true,
      data: {
        adminId: result.adminId,
        churchId: result.churchId,
        admin: result.admin,
        church: result.church,
      },
    });
  } catch (error: any) {
    console.error('Login error:', error);
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

    // Set new httpOnly cookies for tokens
    res.cookie('accessToken', result.accessToken, {
      httpOnly: true,
      secure: true, // Required for sameSite: none (HTTPS only)
      sameSite: 'none', // Allow cross-origin cookie sending
      domain: '.onrender.com', // Share cookies across all onrender.com subdomains
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: true, // Required for sameSite: none (HTTPS only)
      sameSite: 'none', // Allow cross-origin cookie sending
      domain: '.onrender.com', // Share cookies across all onrender.com subdomains
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(200).json({
      success: true,
      data: {
        success: true,
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
