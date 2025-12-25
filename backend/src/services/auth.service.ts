import { prisma } from '../lib/prisma.js';
import { hashPassword, comparePassword } from '../utils/password.utils.js';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt.utils.js';
import { createCustomer } from './stripe.service.js';
import { getCached, setCached, invalidateCache, CACHE_KEYS, CACHE_TTL } from './cache.service.js';
import { encrypt, hashForSearch } from '../utils/encryption.utils.js';

const TRIAL_DAYS = parseInt(process.env.TRIAL_DAYS || '14');

export interface RegisterInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  churchName: string;
}

export interface RegisterResponse {
  adminId: string;
  churchId: string;
  accessToken: string;
  refreshToken: string;
  admin: any;
  church: any;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface LoginResponse {
  adminId: string;
  churchId: string;
  accessToken: string;
  refreshToken: string;
  admin: any;
  church: any;
}

/**
 * Register a new church and admin
 */
export async function registerChurch(input: RegisterInput): Promise<RegisterResponse> {
  // Check if email already exists
  const existingAdmin = await prisma.admin.findUnique({
    where: { email: input.email },
  });

  if (existingAdmin) {
    // Don't leak information about existing emails
    // Log actual error server-side only
    console.warn(`Registration attempt with existing email: ${input.email}`);
    throw new Error('Registration failed. Please try again or contact support.');
  }

  // Hash password
  const passwordHash = await hashPassword(input.password);

  // Create Stripe customer
  const stripeCustomerId = await createCustomer(input.email, input.churchName);

  // Calculate trial end date
  const trialEndsAt = new Date();
  trialEndsAt.setDate(trialEndsAt.getDate() + TRIAL_DAYS);

  // Create church
  const church = await prisma.church.create({
    data: {
      name: input.churchName,
      email: input.email,
      stripeCustomerId,
      trialEndsAt,
    },
  });

  // Create admin with encrypted email
  const encryptedEmail = encrypt(input.email);
  const emailHash = hashForSearch(input.email);

  const admin = await prisma.admin.create({
    data: {
      churchId: church.id,
      email: input.email,
      encryptedEmail,
      emailHash,
      passwordHash,
      firstName: input.firstName,
      lastName: input.lastName,
      role: 'PRIMARY',
    },
  });

  // Generate tokens
  const accessToken = generateAccessToken(admin.id, church.id, admin.role);
  const refreshToken = generateRefreshToken(admin.id);

  // Update lastLoginAt
  await prisma.admin.update({
    where: { id: admin.id },
    data: { lastLoginAt: new Date() },
  });

  return {
    adminId: admin.id,
    churchId: church.id,
    accessToken,
    refreshToken,
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
      id: church.id,
      name: church.name,
      email: church.email,
      trialEndsAt: church.trialEndsAt,
    },
  };
}

/**
 * Login with email and password
 */
export async function login(input: LoginInput): Promise<LoginResponse> {
  console.log('[LOGIN] Starting login process for:', input.email);

  console.log('[LOGIN] Finding admin by email...');
  const admin = await prisma.admin.findUnique({
    where: { email: input.email },
    include: { church: true },
  });

  if (!admin) {
    console.log('[LOGIN] Admin not found:', input.email);
    throw new Error('Invalid email or password');
  }

  console.log('[LOGIN] Admin found, comparing password...');
  // Verify password
  const passwordMatch = await comparePassword(input.password, admin.passwordHash);
  if (!passwordMatch) {
    console.log('[LOGIN] Password does not match');
    throw new Error('Invalid email or password');
  }

  console.log('[LOGIN] Password matched, generating tokens...');
  // Generate tokens
  const accessToken = generateAccessToken(admin.id, admin.churchId, admin.role);
  const refreshToken = generateRefreshToken(admin.id);

  console.log('[LOGIN] Updating lastLoginAt...');
  // Update lastLoginAt
  await prisma.admin.update({
    where: { id: admin.id },
    data: { lastLoginAt: new Date() },
  });

  console.log('[LOGIN] Invalidating cache (non-blocking)...');
  // Invalidate admin cache to refresh permissions (non-blocking - don't await)
  // Cache invalidation is not critical to login success, just an optimization
  invalidateCache(CACHE_KEYS.adminRole(admin.id)).catch((err) => {
    console.error('[LOGIN] Cache invalidation failed:', err.message);
  });

  return {
    adminId: admin.id,
    churchId: admin.churchId,
    accessToken,
    refreshToken,
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
  };
}

/**
 * Refresh access token
 */
export async function refreshAccessToken(adminId: string): Promise<{
  accessToken: string;
  refreshToken: string;
}> {
  const admin = await prisma.admin.findUnique({
    where: { id: adminId },
  });

  if (!admin) {
    throw new Error('Admin not found');
  }

  const accessToken = generateAccessToken(admin.id, admin.churchId, admin.role);
  const refreshToken = generateRefreshToken(admin.id);

  return {
    accessToken,
    refreshToken,
  };
}

/**
 * Get admin by ID (cached for 30 minutes)
 */
export async function getAdmin(adminId: string) {
  // Try cache first
  const cached = await getCached<{
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    welcomeCompleted: boolean;
    userRole: string;
    church: {
      id: string;
      name: string;
      email: string;
      trialEndsAt: Date;
    };
  }>(CACHE_KEYS.adminRole(adminId));
  if (cached) {
    return cached;
  }

  const admin = await prisma.admin.findUnique({
    where: { id: adminId },
    include: { church: true },
  });

  if (!admin) {
    return null;
  }

  const result = {
    id: admin.id,
    email: admin.email,
    firstName: admin.firstName,
    lastName: admin.lastName,
    role: admin.role,
    welcomeCompleted: admin.welcomeCompleted,
    userRole: admin.userRole,
    church: {
      id: admin.church.id,
      name: admin.church.name,
      email: admin.church.email,
      trialEndsAt: admin.church.trialEndsAt,
    },
  };

  // Cache for 30 minutes
  await setCached(CACHE_KEYS.adminRole(adminId), result, CACHE_TTL.MEDIUM);

  return result;
}
