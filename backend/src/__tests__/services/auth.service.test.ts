import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import * as authService from '../../services/auth.service.js';
import * as passwordUtils from '../../utils/password.utils.js';
import * as jwtUtils from '../../utils/jwt.utils.js';
import * as stripeService from '../../services/stripe.service.js';
import * as cacheService from '../../services/cache.service.js';
import { prisma } from '../../lib/prisma.js';

// Mock dependencies
jest.mock('../../lib/prisma.js');
jest.mock('../../services/stripe.service.js');
jest.mock('../../services/cache.service.js');
jest.mock('../../utils/password.utils.js');
jest.mock('../../utils/jwt.utils.js');

describe('Authentication Service - Unit Tests', () => {
  const mockAdmin = {
    id: 'admin-123',
    email: 'pastor@church.com',
    passwordHash: '$2b$10$hashedPassword123',
    firstName: 'John',
    lastName: 'Doe',
    churchId: 'church-456',
    role: 'PRIMARY',
    welcomeCompleted: false,
    userRole: 'admin',
    lastLoginAt: new Date('2024-01-01'),
  };

  const mockChurch = {
    id: 'church-456',
    name: 'Grace Church',
    email: 'pastor@church.com',
    stripeCustomerId: 'cus_123',
    trialEndsAt: new Date('2024-02-01'),
  };

  beforeEach(() => {
    jest.clearAllMocks();
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
      (passwordUtils.hashPassword as jest.Mock).mockResolvedValue(hashedPassword);

      // Mock Stripe customer creation
      const stripeCustomerId = 'cus_stripe_new';
      (stripeService.createCustomer as jest.Mock).mockResolvedValue(stripeCustomerId);

      // Mock Prisma calls
      (prisma.admin.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.church.create as jest.Mock).mockResolvedValue(mockChurch);
      (prisma.admin.create as jest.Mock).mockResolvedValue({
        ...mockAdmin,
        email: registerInput.email,
        firstName: registerInput.firstName,
        lastName: registerInput.lastName,
      });
      (prisma.admin.update as jest.Mock).mockResolvedValue(mockAdmin);

      // Mock token generation
      (jwtUtils.generateAccessToken as jest.Mock).mockReturnValue('access_token_123');
      (jwtUtils.generateRefreshToken as jest.Mock).mockReturnValue('refresh_token_123');

      // Execute
      const result = await authService.registerChurch(registerInput);

      // Assert
      expect(result).toBeDefined();
      expect(result.churchId).toBe(mockChurch.id);
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

      // Mock existing admin
      (prisma.admin.findUnique as jest.Mock).mockResolvedValue(mockAdmin);

      // Execute & Assert
      await expect(authService.registerChurch(registerInput)).rejects.toThrow();
      expect(prisma.admin.findUnique).toHaveBeenCalledWith({
        where: { email: registerInput.email },
      });
    });
  });

  describe('login', () => {
    it('should login successfully with correct credentials', async () => {
      const loginInput = {
        email: mockAdmin.email,
        password: 'SecurePass123!',
      };

      // Mock Prisma call
      (prisma.admin.findUnique as jest.Mock).mockResolvedValue({
        ...mockAdmin,
        church: mockChurch,
      });

      // Mock password verification
      (passwordUtils.comparePassword as jest.Mock).mockResolvedValue(true);

      // Mock token generation
      (jwtUtils.generateAccessToken as jest.Mock).mockReturnValue('access_token_123');
      (jwtUtils.generateRefreshToken as jest.Mock).mockReturnValue('refresh_token_123');

      // Mock cache invalidation
      (cacheService.invalidateCache as jest.Mock).mockResolvedValue(undefined);

      // Mock lastLoginAt update
      (prisma.admin.update as jest.Mock).mockResolvedValue(mockAdmin);

      // Execute
      const result = await authService.login(loginInput);

      // Assert
      expect(result).toBeDefined();
      expect(result.adminId).toBe(mockAdmin.id);
      expect(result.churchId).toBe(mockChurch.id);
      expect(passwordUtils.comparePassword).toHaveBeenCalledWith(
        loginInput.password,
        mockAdmin.passwordHash
      );
      expect(prisma.admin.update).toHaveBeenCalled();
    });

    it('should reject login with incorrect password', async () => {
      const loginInput = {
        email: mockAdmin.email,
        password: 'WrongPassword123!',
      };

      // Mock Prisma call
      (prisma.admin.findUnique as jest.Mock).mockResolvedValue({
        ...mockAdmin,
        church: mockChurch,
      });

      // Mock password verification (fail)
      (passwordUtils.comparePassword as jest.Mock).mockResolvedValue(false);

      // Execute & Assert
      await expect(authService.login(loginInput)).rejects.toThrow('Invalid email or password');
    });

    it('should reject login with non-existent email', async () => {
      const loginInput = {
        email: 'nonexistent@church.com',
        password: 'SecurePass123!',
      };

      // Mock Prisma call (not found)
      (prisma.admin.findUnique as jest.Mock).mockResolvedValue(null);

      // Execute & Assert
      await expect(authService.login(loginInput)).rejects.toThrow('Invalid email or password');
    });
  });

  describe('refreshAccessToken', () => {
    it('should refresh tokens successfully', async () => {
      const adminId = mockAdmin.id;

      // Mock Prisma call
      (prisma.admin.findUnique as jest.Mock).mockResolvedValue(mockAdmin);

      // Mock token generation
      (jwtUtils.generateAccessToken as jest.Mock).mockReturnValue('new_access_token');
      (jwtUtils.generateRefreshToken as jest.Mock).mockReturnValue('new_refresh_token');

      // Execute
      const result = await authService.refreshAccessToken(adminId);

      // Assert
      expect(result).toBeDefined();
      expect(result.accessToken).toBe('new_access_token');
      expect(result.refreshToken).toBe('new_refresh_token');
      expect(jwtUtils.generateAccessToken).toHaveBeenCalledWith(
        adminId,
        mockAdmin.churchId,
        mockAdmin.role
      );
    });

    it('should throw error if admin not found', async () => {
      const adminId = 'nonexistent-admin';

      // Mock Prisma call (not found)
      (prisma.admin.findUnique as jest.Mock).mockResolvedValue(null);

      // Execute & Assert
      await expect(authService.refreshAccessToken(adminId)).rejects.toThrow('Admin not found');
    });
  });

  describe('getAdmin', () => {
    it('should retrieve admin from cache if available', async () => {
      const adminId = mockAdmin.id;
      const cachedAdmin = {
        ...mockAdmin,
        church: mockChurch,
      };

      // Mock cache hit
      (cacheService.getCached as jest.Mock).mockResolvedValue(cachedAdmin);

      // Execute
      const result = await authService.getAdmin(adminId);

      // Assert
      expect(result).toEqual(cachedAdmin);
      expect(prisma.admin.findUnique).not.toHaveBeenCalled();
    });

    it('should fetch admin from database if not cached', async () => {
      const adminId = mockAdmin.id;

      // Mock cache miss
      (cacheService.getCached as jest.Mock).mockResolvedValue(null);

      // Mock Prisma call
      (prisma.admin.findUnique as jest.Mock).mockResolvedValue({
        ...mockAdmin,
        church: mockChurch,
      });

      // Mock cache set
      (cacheService.setCached as jest.Mock).mockResolvedValue(undefined);

      // Execute
      const result = await authService.getAdmin(adminId);

      // Assert
      expect(result).toBeDefined();
      expect(result.id).toBe(adminId);
      expect(prisma.admin.findUnique).toHaveBeenCalled();
    });

    it('should return null if admin not found', async () => {
      const adminId = 'nonexistent-admin';

      // Mock cache miss
      (cacheService.getCached as jest.Mock).mockResolvedValue(null);

      // Mock Prisma call (not found)
      (prisma.admin.findUnique as jest.Mock).mockResolvedValue(null);

      // Execute
      const result = await authService.getAdmin(adminId);

      // Assert
      expect(result).toBeNull();
    });
  });
});
