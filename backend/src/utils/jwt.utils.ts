import jwt from 'jsonwebtoken';

const ACCESS_SECRET: string = process.env.JWT_ACCESS_SECRET || '';
const REFRESH_SECRET: string = process.env.JWT_REFRESH_SECRET || '';

// Validate secrets are set at startup
if (!ACCESS_SECRET) {
  throw new Error('JWT_ACCESS_SECRET environment variable is required');
}
if (!REFRESH_SECRET) {
  throw new Error('JWT_REFRESH_SECRET environment variable is required');
}

export interface AccessTokenPayload {
  adminId: string;
  churchId: string;
  role: string;
}

export interface RefreshTokenPayload {
  adminId: string;
}

export interface MFASessionTokenPayload {
  adminId: string;
  churchId: string;
}

/**
 * Generate access token (short-lived: 15 minutes)
 */
export function generateAccessToken(adminId: string, churchId: string, role: string): string {
  return jwt.sign(
    { adminId, churchId, role },
    ACCESS_SECRET,
    { expiresIn: '15m' }
  );
}

/**
 * Generate refresh token (long-lived: 7 days)
 */
export function generateRefreshToken(adminId: string): string {
  return jwt.sign(
    { adminId },
    REFRESH_SECRET,
    { expiresIn: '7d' }
  );
}

/**
 * Verify access token
 */
export function verifyAccessToken(token: string): AccessTokenPayload | null {
  try {
    const payload = jwt.verify(token, ACCESS_SECRET) as unknown;
    return payload as AccessTokenPayload;
  } catch (error) {
    return null;
  }
}

/**
 * Verify refresh token
 */
export function verifyRefreshToken(token: string): RefreshTokenPayload | null {
  try {
    const payload = jwt.verify(token, REFRESH_SECRET) as unknown;
    return payload as RefreshTokenPayload;
  } catch (error) {
    return null;
  }
}

/**
 * Generate MFA session token (very short-lived: 5 minutes)
 * Used during MFA verification step in login flow
 */
export function generateMFASessionToken(adminId: string, churchId: string): string {
  return jwt.sign(
    { adminId, churchId },
    ACCESS_SECRET, // Reuse access secret
    { expiresIn: '5m' }
  );
}

/**
 * Verify MFA session token
 */
export function verifyMFASessionToken(token: string): MFASessionTokenPayload | null {
  try {
    const payload = jwt.verify(token, ACCESS_SECRET) as unknown;
    return payload as MFASessionTokenPayload;
  } catch (error) {
    return null;
  }
}

/**
 * Decode token without verification (for debugging)
 */
export function decodeToken(token: string): any {
  try {
    return jwt.decode(token);
  } catch (error) {
    return null;
  }
}
