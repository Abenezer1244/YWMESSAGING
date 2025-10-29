import jwt from 'jsonwebtoken';

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'access_secret_key_default';
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'refresh_secret_key_default';

export interface AccessTokenPayload {
  adminId: string;
  churchId: string;
  role: string;
}

export interface RefreshTokenPayload {
  adminId: string;
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
    return jwt.verify(token, ACCESS_SECRET) as AccessTokenPayload;
  } catch (error) {
    return null;
  }
}

/**
 * Verify refresh token
 */
export function verifyRefreshToken(token: string): RefreshTokenPayload | null {
  try {
    return jwt.verify(token, REFRESH_SECRET) as RefreshTokenPayload;
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
