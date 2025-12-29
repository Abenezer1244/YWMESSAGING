/**
 * Authentication Service (Multi-Tenant)
 *
 * Handles:
 * - Church registration (creates Tenant in registry, provisions database, creates Admin)
 * - Admin login (finds tenant via registry, accesses tenant database)
 * - Token management
 */
import { hashPassword, comparePassword } from '../utils/password.utils.js';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt.utils.js';
import { createCustomer } from './stripe.service.js';
import { getCached, setCached, invalidateCache, CACHE_KEYS, CACHE_TTL } from './cache.service.js';
import { encrypt, hashForSearch } from '../utils/encryption.utils.js';
import { createId } from '@paralleldrive/cuid2';
import { prisma } from '../lib/prisma.js';
const TRIAL_DAYS = parseInt(process.env.TRIAL_DAYS || '14');
/**
 * Register a new church and admin
 * Uses single-database setup for MVP
 */
export async function registerChurch(input) {
    const tenantId = createId();
    try {
        // Check if email already exists
        const existingAdmin = await prisma.admin.findFirst({
            where: { email: input.email },
        });
        if (existingAdmin) {
            console.warn(`Registration attempt with existing email: ${input.email}`);
            throw new Error('Email already registered. Please use a different email or contact support.');
        }
        // Create Stripe customer for billing
        const stripeCustomerId = await createCustomer(input.email, input.churchName);
        // Calculate trial end date
        const trialEndsAt = new Date();
        trialEndsAt.setDate(trialEndsAt.getDate() + TRIAL_DAYS);
        // Create Church
        const church = await prisma.church.create({
            data: {
                id: tenantId,
                name: input.churchName,
                email: input.email,
                stripeCustomerId,
                subscriptionStatus: 'trial',
                trialEndsAt,
            },
        });
        // Create Admin
        const passwordHash = await hashPassword(input.password);
        const encryptedEmail = encrypt(input.email);
        const emailHash = hashForSearch(input.email);
        const admin = await prisma.admin.create({
            data: {
                churchId: tenantId,
                email: input.email,
                encryptedEmail,
                emailHash,
                passwordHash,
                firstName: input.firstName,
                lastName: input.lastName,
                role: 'PRIMARY',
            },
        });
        // Generate tokens with tenantId
        const accessToken = generateAccessToken(admin.id, tenantId, admin.role);
        const refreshToken = generateRefreshToken(admin.id, tenantId);
        // Update lastLoginAt
        await prisma.admin.update({
            where: { id: admin.id },
            data: { lastLoginAt: new Date() },
        });
        console.log(`✅ Registration completed: ${tenantId}`);
        return {
            tenantId,
            adminId: admin.id,
            accessToken,
            refreshToken,
            admin: {
                id: admin.id,
                email: admin.email,
                firstName: admin.firstName,
                lastName: admin.lastName,
                role: admin.role,
                welcomeCompleted: admin.welcomeCompleted || false,
                userRole: admin.userRole || null,
            },
            church: {
                id: tenantId,
                name: church.name,
                subscriptionStatus: church.subscriptionStatus,
                trialEndsAt: church.trialEndsAt,
            },
        };
    }
    catch (error) {
        console.error('Registration error:', error);
        throw error;
    }
}
/**
 * Login with email and password
 * 1. Find tenant via email hash in AdminEmailIndex (registry)
 * 2. Get admin from tenant database
 * 3. Verify password
 * 4. Generate tokens
 */
export async function login(input) {
    return new Promise((resolve, reject) => {
        const timeoutId = setTimeout(() => {
            console.error('[LOGIN] FUNCTION TIMEOUT - login exceeded 5 seconds');
            reject(new Error('Login took too long. Please try again.'));
        }, 5000);
        loginInternal(input)
            .then((result) => {
            clearTimeout(timeoutId);
            resolve(result);
        })
            .catch((error) => {
            clearTimeout(timeoutId);
            reject(error);
        });
    });
}
async function loginInternal(input) {
    console.log('[LOGIN] Starting login process for:', input.email);
    // Find admin by email
    console.log('[LOGIN] Looking up admin by email...');
    const admin = await prisma.admin.findUnique({
        where: { email: input.email },
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
    // For MVP, infer tenantId from Church's admin (assuming single admin per church)
    // In future, add explicit tenantId to Admin model
    const church = await prisma.church.findFirst({
        where: {
            email: input.email,
        },
    });
    if (!church) {
        console.log('[LOGIN] Church not found for admin:', input.email);
        throw new Error('Church configuration not found');
    }
    const tenantId = church.id;
    console.log('[LOGIN] Password matched, generating tokens...');
    // Generate tokens
    const accessToken = generateAccessToken(admin.id, tenantId, admin.role);
    const refreshToken = generateRefreshToken(admin.id, tenantId);
    console.log('[LOGIN] Updating lastLoginAt...');
    // Update lastLoginAt
    await prisma.admin.update({
        where: { id: admin.id },
        data: { lastLoginAt: new Date() },
    });
    console.log('[LOGIN] Invalidating cache (non-blocking)...');
    // Invalidate admin cache to refresh permissions (non-blocking)
    invalidateCache(CACHE_KEYS.adminRole(admin.id)).catch((err) => {
        console.error('[LOGIN] Cache invalidation failed:', err.message);
    });
    return {
        tenantId,
        adminId: admin.id,
        accessToken,
        refreshToken,
        admin: {
            id: admin.id,
            email: admin.email,
            firstName: admin.firstName,
            lastName: admin.lastName,
            role: admin.role,
            welcomeCompleted: admin.welcomeCompleted || false,
            userRole: admin.userRole || null,
        },
        church: {
            id: church.id,
            name: church.name,
            subscriptionStatus: church.subscriptionStatus,
            trialEndsAt: church.trialEndsAt,
        },
    };
}
/**
 * Refresh access token
 * Generates new tokens with existing tenantId
 */
export async function refreshAccessToken(adminId, tenantId) {
    try {
        const admin = await prisma.admin.findUnique({
            where: { id: adminId },
        });
        if (!admin) {
            throw new Error('Admin not found');
        }
        const accessToken = generateAccessToken(admin.id, tenantId, admin.role);
        const refreshToken = generateRefreshToken(admin.id, tenantId);
        return {
            accessToken,
            refreshToken,
        };
    }
    catch (error) {
        console.error('Error refreshing access token:', error);
        throw error;
    }
}
/**
 * Get admin by ID
 * Cached for 30 minutes
 */
export async function getAdmin(adminId, tenantId) {
    try {
        // Try cache first
        const cached = await getCached(CACHE_KEYS.adminRole(adminId));
        if (cached) {
            return cached;
        }
        const admin = await prisma.admin.findUnique({
            where: { id: adminId },
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
            welcomeCompleted: admin.welcomeCompleted || false,
            userRole: admin.userRole || null,
            tenantId,
        };
        // Cache for 30 minutes
        await setCached(CACHE_KEYS.adminRole(adminId), result, CACHE_TTL.MEDIUM);
        return result;
    }
    catch (error) {
        console.error('Error getting admin:', error);
        throw error;
    }
}
//# sourceMappingURL=auth.service.js.map