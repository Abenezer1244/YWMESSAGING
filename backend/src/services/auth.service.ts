import { PrismaClient } from '@prisma/client';
import { hashPassword, comparePassword } from '../utils/password.utils.js';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt.utils.js';
import { createCustomer } from './stripe.service.js';

const prisma = new PrismaClient();

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

  // Create admin
  const admin = await prisma.admin.create({
    data: {
      churchId: church.id,
      email: input.email,
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
  const admin = await prisma.admin.findUnique({
    where: { email: input.email },
    include: { church: true },
  });

  if (!admin) {
    throw new Error('Invalid email or password');
  }

  // Verify password
  const passwordMatch = await comparePassword(input.password, admin.passwordHash);
  if (!passwordMatch) {
    throw new Error('Invalid email or password');
  }

  // Generate tokens
  const accessToken = generateAccessToken(admin.id, admin.churchId, admin.role);
  const refreshToken = generateRefreshToken(admin.id);

  // Update lastLoginAt
  await prisma.admin.update({
    where: { id: admin.id },
    data: { lastLoginAt: new Date() },
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
 * Get admin by ID
 */
export async function getAdmin(adminId: string) {
  const admin = await prisma.admin.findUnique({
    where: { id: adminId },
    include: { church: true },
  });

  if (!admin) {
    return null;
  }

  return {
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
}
