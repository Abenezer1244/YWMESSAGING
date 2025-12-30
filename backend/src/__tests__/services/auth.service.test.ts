import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';

// Set up required environment variables before importing modules that check them
process.env.JWT_ACCESS_SECRET = 'test_access_secret_key_32_chars_minimum';
process.env.JWT_REFRESH_SECRET = 'test_refresh_secret_key_32_chars_minimum';
process.env.DATABASE_URL = 'postgresql://test:test@localhost/test';
process.env.STRIPE_SECRET_KEY = 'sk_test_123456789';
process.env.TELNYX_API_KEY = 'telnyx_test_key';
process.env.ENCRYPTION_KEY = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
process.env.NODE_ENV = 'test';

import * as authService from '../../services/auth.service.js';
import * as passwordUtils from '../../utils/password.utils.js';
import * as jwtUtils from '../../utils/jwt.utils.js';
import * as stripeService from '../../services/stripe.service.js';
import * as cacheService from '../../services/cache.service.js';
import * as tenantPrismaLib from '../../lib/tenant-prisma.js';
import * as databaseProvisioningService from '../../services/database-provisioning.service.js';
import { createId } from '@paralleldrive/cuid2';

// Mock dependencies
jest.mock('../../lib/tenant-prisma.js');
jest.mock('../../services/database-provisioning.service.js');
jest.mock('../../services/stripe.service.js');
jest.mock('../../services/cache.service.js');
jest.mock('../../utils/password.utils.js');
jest.mock('../../utils/jwt.utils.js');
jest.mock('@paralleldrive/cuid2');

describe('Authentication Service - Unit Tests', () => {
  const mockTenantId = 'church-456';

  // Tenant-level admin (no churchId in tenant schema)
  const mockTenantAdmin = {
    id: 'admin-123',
    email: 'pastor@church.com',
    encryptedEmail: 'encrypted_email',
    emailHash: 'email_hash',
    passwordHash: '$2b$10$hashedPassword123',
    firstName: 'John',
    lastName: 'Doe',
    role: 'PRIMARY',
    welcomeCompleted: false,
    userRole: 'admin',
    lastLoginAt: new Date('2024-01-01'),
  };

  // Registry-level church
  const mockChurch = {
    id: mockTenantId,
    name: 'Grace Church',
    email: 'pastor@church.com',
    stripeCustomerId: 'cus_123',
    trialEndsAt: new Date('2024-02-01'),
    subscriptionStatus: 'trial',
  };

  // Mock Prisma clients
  const mockRegistryPrisma = {
    church: {
      findFirst: jest.fn() as jest.Mock<any>,
      create: jest.fn() as jest.Mock<any>,
      update: jest.fn() as jest.Mock<any>,
    },
    tenant: {
      create: jest.fn() as jest.Mock<any>,
    },
    adminEmailIndex: {
      create: jest.fn() as jest.Mock<any>,
    },
  };

  const mockTenantPrisma = {
    admin: {
      create: jest.fn() as jest.Mock<any>,
      findFirst: jest.fn() as jest.Mock<any>,
      findUnique: jest.fn() as jest.Mock<any>,
      update: jest.fn() as jest.Mock<any>,
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (tenantPrismaLib.getRegistryPrisma as jest.Mock<any>).mockReturnValue(mockRegistryPrisma);
    (tenantPrismaLib.getTenantPrisma as jest.Mock<any>).mockResolvedValue(mockTenantPrisma);
    (createId as jest.Mock<any>).mockReturnValue(mockTenantId);
  });

  describe('registerChurch', () => {
    it('should register a new church successfully', async () => {
      const registerInput = {
        email: 'newpastor@church.com',
        password: 'SecurePass123!',
        firstName: 'Jane',
        lastName: 'Smith',
        churchName: 'New Grace Church',
      };

      // Mock password hashing
      const hashedPassword = '$2b$10$newHashedPassword';
      (passwordUtils.hashPassword as jest.Mock<any>).mockResolvedValue(hashedPassword);

      // Mock Stripe customer creation
      const stripeCustomerId = 'cus_stripe_new';
      (stripeService.createCustomer as jest.Mock<any>).mockResolvedValue(stripeCustomerId);

      // Mock database provisioning
      const tenantDatabaseUrl = 'postgresql://user:pass@host/tenant_db_new';
      (databaseProvisioningService.provisionTenantDatabase as jest.Mock<any>).mockResolvedValue(tenantDatabaseUrl);
      (databaseProvisioningService.runTenantMigrations as jest.Mock<any>).mockResolvedValue(undefined);

      // Mock registry Prisma calls
      (mockRegistryPrisma.church.findFirst as jest.Mock<any>).mockResolvedValue(null);
      (mockRegistryPrisma.church.create as jest.Mock<any>).mockResolvedValue(mockChurch);
      (mockRegistryPrisma.tenant.create as jest.Mock<any>).mockResolvedValue({ id: mockTenantId });
      (mockRegistryPrisma.adminEmailIndex.create as jest.Mock<any>).mockResolvedValue({});

      // Mock tenant Prisma calls
      (mockTenantPrisma.admin.create as jest.Mock<any>).mockResolvedValue({
        ...mockTenantAdmin,
        email: registerInput.email,
        firstName: registerInput.firstName,
        lastName: registerInput.lastName,
      });
      (mockTenantPrisma.admin.update as jest.Mock<any>).mockResolvedValue(mockTenantAdmin);

      // Mock token generation
      (jwtUtils.generateAccessToken as jest.Mock<any>).mockReturnValue('access_token_123');
      (jwtUtils.generateRefreshToken as jest.Mock<any>).mockReturnValue('refresh_token_123');

      // Execute
      const result = await authService.registerChurch(registerInput);

      // Assert
      expect(result).toBeDefined();
      expect(result.tenantId).toBe(mockTenantId);
      expect(result.admin.email).toBe(registerInput.email);
      expect(passwordUtils.hashPassword).toHaveBeenCalledWith(registerInput.password);
      expect(stripeService.createCustomer).toHaveBeenCalled();
    });

    it('should prevent registration with existing email', async () => {
      const registerInput = {
        email: 'existing@church.com',
        password: 'SecurePass123!',
        firstName: 'John',
        lastName: 'Doe',
        churchName: 'Existing Church',
      };

      // Mock existing church
      mockRegistryPrisma.church.findFirst.mockResolvedValue(mockChurch);

      // Execute & Assert
      await expect(authService.registerChurch(registerInput)).rejects.toThrow();
      expect(mockRegistryPrisma.church.findFirst).toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('should login successfully with correct credentials', async () => {
      const loginInput = {
        email: mockTenantAdmin.email,
        password: 'SecurePass123!',
      };

      // Mock registry church lookup
      (mockRegistryPrisma.church.findFirst as jest.Mock<any>).mockResolvedValue(mockChurch);

      // Mock tenant admin lookup
      (mockTenantPrisma.admin.findFirst as jest.Mock<any>).mockResolvedValue(mockTenantAdmin);

      // Mock password verification
      (passwordUtils.comparePassword as jest.Mock<any>).mockResolvedValue(true);

      // Mock token generation
      (jwtUtils.generateAccessToken as jest.Mock<any>).mockReturnValue('access_token_123');
      (jwtUtils.generateRefreshToken as jest.Mock<any>).mockReturnValue('refresh_token_123');

      // Mock cache invalidation
      (cacheService.invalidateCache as jest.Mock<any>).mockResolvedValue(undefined);

      // Mock lastLoginAt update
      (mockTenantPrisma.admin.update as jest.Mock<any>).mockResolvedValue(mockTenantAdmin);

      // Execute
      const result = await authService.login(loginInput);

      // Assert
      expect(result).toBeDefined();
      expect(result.adminId).toBe(mockTenantAdmin.id);
      expect(result.tenantId).toBe(mockTenantId);
      expect(passwordUtils.comparePassword).toHaveBeenCalledWith(
        loginInput.password,
        mockTenantAdmin.passwordHash
      );
      expect(mockTenantPrisma.admin.update).toHaveBeenCalled();
    });

    it('should reject login with incorrect password', async () => {
      const loginInput = {
        email: mockTenantAdmin.email,
        password: 'WrongPassword123!',
      };

      // Mock registry church lookup
      (mockRegistryPrisma.church.findFirst as jest.Mock<any>).mockResolvedValue(mockChurch);

      // Mock tenant admin lookup
      (mockTenantPrisma.admin.findFirst as jest.Mock<any>).mockResolvedValue(mockTenantAdmin);

      // Mock password verification (fail)
      (passwordUtils.comparePassword as jest.Mock<any>).mockResolvedValue(false);

      // Execute & Assert
      await expect(authService.login(loginInput)).rejects.toThrow('Invalid email or password');
    });

    it('should reject login with non-existent email', async () => {
      const loginInput = {
        email: 'nonexistent@church.com',
        password: 'SecurePass123!',
      };

      // Mock church not found
      (mockRegistryPrisma.church.findFirst as jest.Mock<any>).mockResolvedValue(null);

      // Execute & Assert
      await expect(authService.login(loginInput)).rejects.toThrow('Invalid email or password');
    });
  });

  describe('refreshAccessToken', () => {
    it('should refresh tokens successfully', async () => {
      const adminId = mockTenantAdmin.id;

      // Mock tenant admin lookup
      (mockTenantPrisma.admin.findUnique as jest.Mock<any>).mockResolvedValue(mockTenantAdmin);

      // Mock token generation
      (jwtUtils.generateAccessToken as jest.Mock<any>).mockReturnValue('new_access_token');
      (jwtUtils.generateRefreshToken as jest.Mock<any>).mockReturnValue('new_refresh_token');

      // Execute
      const result = await authService.refreshAccessToken(adminId, mockTenantId);

      // Assert
      expect(result).toBeDefined();
      expect(result.accessToken).toBe('new_access_token');
      expect(result.refreshToken).toBe('new_refresh_token');
      expect(jwtUtils.generateAccessToken).toHaveBeenCalledWith(
        adminId,
        mockTenantId,
        mockTenantAdmin.role
      );
    });

    it('should throw error if admin not found', async () => {
      const adminId = 'nonexistent-admin';

      // Mock tenant admin not found
      (mockTenantPrisma.admin.findUnique as jest.Mock<any>).mockResolvedValue(null);

      // Execute & Assert
      await expect(authService.refreshAccessToken(adminId, mockTenantId)).rejects.toThrow('Admin not found');
    });
  });

  describe('getAdmin', () => {
    it('should retrieve admin from cache if available', async () => {
      const adminId = mockTenantAdmin.id;
      const cachedAdmin = {
        ...mockTenantAdmin,
        tenantId: mockTenantId,
      };

      // Mock cache hit
      (cacheService.getCached as jest.Mock<any>).mockResolvedValue(cachedAdmin);

      // Execute
      const result = await authService.getAdmin(adminId, mockTenantId);

      // Assert
      expect(result).toEqual(cachedAdmin);
      expect(mockTenantPrisma.admin.findUnique).not.toHaveBeenCalled();
    });

    it('should fetch admin from database if not cached', async () => {
      const adminId = mockTenantAdmin.id;

      // Mock cache miss
      (cacheService.getCached as jest.Mock<any>).mockResolvedValue(null);

      // Mock tenant Prisma call
      (mockTenantPrisma.admin.findUnique as jest.Mock<any>).mockResolvedValue(mockTenantAdmin);

      // Mock cache set
      (cacheService.setCached as jest.Mock<any>).mockResolvedValue(undefined);

      // Execute
      const result = await authService.getAdmin(adminId, mockTenantId);

      // Assert
      expect(result).toBeDefined();
      expect(result.id).toBe(adminId);
      expect(mockTenantPrisma.admin.findUnique).toHaveBeenCalledWith({
        where: { id: adminId },
      });
      expect(cacheService.setCached).toHaveBeenCalled();
    });

    it('should return null if admin not found', async () => {
      const adminId = 'nonexistent-admin';

      // Mock cache miss
      (cacheService.getCached as jest.Mock<any>).mockResolvedValue(null);

      // Mock tenant Prisma call (not found)
      (mockTenantPrisma.admin.findUnique as jest.Mock<any>).mockResolvedValue(null);

      // Execute
      const result = await authService.getAdmin(adminId, mockTenantId);

      // Assert
      expect(result).toBeNull();
    });
  });
});
