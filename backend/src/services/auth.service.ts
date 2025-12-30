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
import { getRegistryPrisma, getTenantPrisma } from '../lib/tenant-prisma.js';
import {
  provisionTenantDatabase,
  runTenantMigrations,
  deleteTenantDatabase
} from './database-provisioning.service.js';
import {
  createCustomSpan,
  createDatabaseSpan,
  createExternalApiSpan
} from '../utils/apm-instrumentation.js';

const TRIAL_DAYS = parseInt(process.env.TRIAL_DAYS || '14');

export interface RegisterInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  churchName: string;
}

export interface RegisterResponse {
  tenantId: string;
  adminId: string;
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
  tenantId: string;
  adminId: string;
  accessToken: string;
  refreshToken: string;
  admin: any;
  church: any;
}

/**
 * Register a new church and admin
 * PHASE 4: Database-per-tenant provisioning
 *
 * Flow:
 * 1. Generate tenantId
 * 2. Validate email not in use
 * 3. Provision new PostgreSQL database for tenant
 * 4. Run tenant schema migrations
 * 5. Create Church in registry
 * 6. Create Tenant record in registry (links to new database)
 * 7. Create Admin in registry
 * 8. Create AdminEmailIndex for fast email lookup
 * 9. Create Admin in tenant database
 * 10. Generate tokens
 */
export async function registerChurch(input: RegisterInput): Promise<RegisterResponse> {
  const tenantId = createId();
  const registryPrisma = getRegistryPrisma();
  let tenantDatabaseUrl: string | null = null;

  try {
    console.log(`[Register] Starting registration for church: ${input.churchName}`);

    // ============================================
    // STEP 1: Validate email not already used
    // ============================================
    console.log('[Register] Validating email availability...');
    const existingChurch = await registryPrisma.church.findFirst({
      where: { email: input.email },
    });

    if (existingChurch) {
      console.warn(`[Register] Email already in use: ${input.email}`);
      throw new Error('Email already registered. Please use a different email or contact support.');
    }

    // ============================================
    // STEP 2: Provision tenant database
    // ============================================
    console.log(`[Register] Provisioning database for tenant ${tenantId}...`);
    try {
      tenantDatabaseUrl = await provisionTenantDatabase(tenantId);
      console.log(`[Register] Database provisioned: ${tenantDatabaseUrl.split('@')[1]}`); // Log without password
    } catch (error: any) {
      throw new Error(`Database provisioning failed: ${error.message}`);
    }

    // ============================================
    // STEP 3: Run migrations on new database
    // ============================================
    console.log(`[Register] Running migrations for tenant ${tenantId}...`);
    try {
      await runTenantMigrations(tenantDatabaseUrl);
      console.log(`[Register] Migrations completed for tenant ${tenantId}`);
    } catch (error: any) {
      // Rollback: Delete database on migration failure
      console.error(`[Register] Migrations failed, rolling back database...`);
      await deleteTenantDatabase(tenantId).catch((err) => {
        console.error(`[Register] Failed to rollback database ${tenantId}: ${err.message}`);
      });
      throw error;
    }

    // ============================================
    // STEP 4: Extract database connection details
    // ============================================
    const dbUrlObj = new URL(tenantDatabaseUrl);
    const databaseHost = dbUrlObj.hostname;
    const databasePort = parseInt(dbUrlObj.port || '5432');
    const databaseName = dbUrlObj.pathname.slice(1);

    // ============================================
    // STEP 5: Create Stripe customer
    // ============================================
    console.log('[Register] Creating Stripe customer...');
    const stripeCustomerId = await createExternalApiSpan(
      'stripe',
      'customer.create',
      () => createCustomer(input.email, input.churchName),
      { email: input.email, churchName: input.churchName }
    );

    // ============================================
    // STEP 6: Calculate trial end date
    // ============================================
    const trialEndsAt = new Date();
    trialEndsAt.setDate(trialEndsAt.getDate() + TRIAL_DAYS);

    // ============================================
    // STEP 7: Create Church record in registry
    // ============================================
    console.log(`[Register] Creating Church record for ${tenantId}...`);
    const church = await registryPrisma.church.create({
      data: {
        id: tenantId,
        name: input.churchName,
        email: input.email,
        stripeCustomerId,
        subscriptionStatus: 'trial',
        trialEndsAt,
      },
    });
    console.log(`[Register] Church created: ${church.id}`);

    // ============================================
    // STEP 8: Create Tenant registry record
    // ============================================
    console.log(`[Register] Creating Tenant registry record for ${tenantId}...`);
    const tenant = await registryPrisma.tenant.create({
      data: {
        id: tenantId,
        churchId: tenantId,
        name: input.churchName,
        email: input.email,
        databaseUrl: tenantDatabaseUrl,
        databaseHost,
        databasePort,
        databaseName,
        status: 'active',
        subscriptionStatus: 'trial',
        subscriptionPlan: 'starter',
      },
    });
    console.log(`[Register] Tenant registry record created: ${tenant.id}`);

    // ============================================
    // STEP 9: Prepare password and email hashes
    // ============================================
    const passwordHash = await hashPassword(input.password);
    const encryptedEmail = encrypt(input.email);
    const emailHash = hashForSearch(input.email);

    // ============================================
    // STEP 10: Create Admin in tenant database
    // ============================================
    console.log(`[Register] Creating Admin in tenant database...`);
    const tenantPrisma = await getTenantPrisma(tenantId);
    const tenantAdmin = await tenantPrisma.admin.create({
      data: {
        email: input.email,
        encryptedEmail,
        emailHash,
        passwordHash,
        firstName: input.firstName,
        lastName: input.lastName,
        role: 'PRIMARY',
      },
    });
    console.log(`[Register] Admin created in tenant database: ${tenantAdmin.id}`);

    // ============================================
    // STEP 11: Create AdminEmailIndex for fast lookup
    // ============================================
    console.log(`[Register] Creating AdminEmailIndex entry...`);
    await registryPrisma.adminEmailIndex.create({
      data: {
        email: input.email,
        emailHash,
        tenantId,
        adminId: tenantAdmin.id,
      },
    });
    console.log(`[Register] AdminEmailIndex entry created`);

    // ============================================
    // STEP 12: Generate tokens
    // ============================================
    const accessToken = generateAccessToken(tenantAdmin.id, tenantId, tenantAdmin.role);
    const refreshToken = generateRefreshToken(tenantAdmin.id, tenantId);

    // ============================================
    // STEP 13: Update last login
    // ============================================
    await tenantPrisma.admin.update({
      where: { id: tenantAdmin.id },
      data: { lastLoginAt: new Date() },
    });

    console.log(`✅ Registration completed successfully: ${tenantId}`);

    return {
      tenantId,
      adminId: tenantAdmin.id,
      accessToken,
      refreshToken,
      admin: {
        id: tenantAdmin.id,
        email: tenantAdmin.email,
        firstName: tenantAdmin.firstName,
        lastName: tenantAdmin.lastName,
        role: tenantAdmin.role,
        welcomeCompleted: tenantAdmin.welcomeCompleted || false,
        userRole: tenantAdmin.userRole || null,
      },
      church: {
        id: tenantId,
        name: church.name,
        subscriptionStatus: church.subscriptionStatus,
        trialEndsAt: church.trialEndsAt,
      },
    };
  } catch (error: any) {
    console.error(`[Register] Registration failed for ${tenantId}: ${error.message}`);

    // Cleanup: Delete database if it was created but signup failed
    if (tenantDatabaseUrl) {
      console.log(`[Register] Cleaning up orphaned database for ${tenantId}...`);
      await deleteTenantDatabase(tenantId).catch((err) => {
        console.error(`[Register] Failed to clean up database ${tenantId}: ${err.message}`);
      });
    }

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
export async function login(input: LoginInput): Promise<LoginResponse> {
  return new Promise<LoginResponse>((resolve, reject) => {
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

async function loginInternal(input: LoginInput): Promise<LoginResponse> {
  return createCustomSpan(
    'admin.login',
    async () => {
      console.log('[LOGIN] Starting login process for:', input.email);

      const registryPrisma = getRegistryPrisma();

      // SECURITY: Find church by email first to identify the tenant
      console.log('[LOGIN] Looking up church by email...');
      const church = await createDatabaseSpan(
        'SELECT',
        'church',
        () => registryPrisma.church.findFirst({
          where: { email: input.email },
        }),
        { email: input.email }
      );

      if (!church) {
        console.log('[LOGIN] Church not found with email:', input.email);
        throw new Error('Invalid email or password');
      }

      const tenantId = church.id;

      // Get tenant-scoped database client
      const tenantPrisma = await getTenantPrisma(tenantId);

      // SECURITY: Find admin by email in tenant database
      console.log('[LOGIN] Looking up admin for church:', tenantId);
      const admin = await createDatabaseSpan(
        'SELECT',
        'admin',
        () => tenantPrisma.admin.findFirst({
          where: {
            email: input.email,
          },
        }),
        { tenantId, email: input.email }
      );

      if (!admin) {
        console.log('[LOGIN] Admin not found for church:', tenantId);
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
      const accessToken = generateAccessToken(admin.id, tenantId, admin.role);
      const refreshToken = generateRefreshToken(admin.id, tenantId);

      console.log('[LOGIN] Updating lastLoginAt...');
      // Update lastLoginAt in tenant database
      await tenantPrisma.admin.update({
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
    },
    { email: input.email }
  );
}

/**
 * Refresh access token
 * Generates new tokens with existing tenantId
 */
export async function refreshAccessToken(
  adminId: string,
  tenantId: string
): Promise<{
  accessToken: string;
  refreshToken: string;
}> {
  try {
    const tenantPrisma = await getTenantPrisma(tenantId);
    const admin = await tenantPrisma.admin.findUnique({
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
  } catch (error: any) {
    console.error('Error refreshing access token:', error);
    throw error;
  }
}

/**
 * Get admin by ID
 * Cached for 30 minutes
 */
export async function getAdmin(adminId: string, tenantId: string) {
  try {
    // Try cache first
    const cached = await getCached<any>(CACHE_KEYS.adminRole(adminId));
    if (cached) {
      return cached;
    }

    const tenantPrisma = await getTenantPrisma(tenantId);
    const admin = await tenantPrisma.admin.findUnique({
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
  } catch (error: any) {
    console.error('Error getting admin:', error);
    throw error;
  }
}
