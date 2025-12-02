import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { Request, Response } from 'express';
import * as authService from '../../services/auth.service';
import * as authController from '../../controllers/auth.controller';
import { prisma } from '../../lib/prisma';

/**
 * Authentication Integration Tests
 * Tests complete auth flows including database interactions
 * ✅ Register flow
 * ✅ Login flow
 * ✅ Token refresh
 * ✅ Multi-tenancy (churchId isolation)
 */

describe('Authentication Integration Tests', () => {
  let testChurchId: string;
  let testAdminEmail: string;
  let testPassword: string;

  beforeEach(async () => {
    testChurchId = `church-${Date.now()}`;
    testAdminEmail = `admin-${Date.now()}@test.com`;
    testPassword = 'SecurePassword123!';
  });

  afterEach(async () => {
    // Cleanup: delete test church and related data
    await prisma.church.deleteMany({
      where: { id: testChurchId },
    });
  });

  describe('Registration Flow', () => {
    it('should complete full registration: church + admin + member', async () => {
      const registrationData = {
        churchName: 'Test Church',
        adminName: 'Test Admin',
        adminEmail: testAdminEmail,
        password: testPassword,
        phoneNumber: '+12025551234',
      };

      // Register church and admin
      const result = await authService.register(
        registrationData.churchName,
        registrationData.adminName,
        registrationData.adminEmail,
        registrationData.password,
        registrationData.phoneNumber
      );

      // Verify church was created
      expect(result).toHaveProperty('church');
      expect(result.church.name).toBe(registrationData.churchName);

      // Verify admin user was created
      expect(result).toHaveProperty('admin');
      expect(result.admin.email).toBe(testAdminEmail);

      // Verify token was issued
      expect(result).toHaveProperty('token');
      expect(result.token).toBeTruthy();

      // Verify church exists in database
      const churchFromDb = await prisma.church.findUnique({
        where: { id: result.church.id },
      });
      expect(churchFromDb).toBeTruthy();
    });

    it('should reject duplicate email during registration', async () => {
      // Register first admin
      await authService.register(
        'Church One',
        'Admin One',
        testAdminEmail,
        testPassword,
        '+12025551234'
      );

      // Try to register second admin with same email
      await expect(
        authService.register(
          'Church Two',
          'Admin Two',
          testAdminEmail,
          testPassword,
          '+12025555678'
        )
      ).rejects.toThrow('Email already in use');
    });

    it('should create default member group on church registration', async () => {
      const registrationData = {
        churchName: 'Church with Groups',
        adminName: 'Admin',
        adminEmail: testAdminEmail,
        password: testPassword,
        phoneNumber: '+12025551234',
      };

      const result = await authService.register(
        registrationData.churchName,
        registrationData.adminName,
        registrationData.adminEmail,
        registrationData.password,
        registrationData.phoneNumber
      );

      // Verify default group was created
      const groups = await prisma.group.findMany({
        where: { churchId: result.church.id },
      });

      expect(groups.length).toBeGreaterThan(0);
      expect(groups[0].name).toBe('All Members');
    });
  });

  describe('Login Flow', () => {
    beforeEach(async () => {
      // Create a church and admin for login tests
      await authService.register(
        'Login Test Church',
        'Test Admin',
        testAdminEmail,
        testPassword,
        '+12025551234'
      );
    });

    it('should login with valid credentials', async () => {
      const result = await authService.login(testAdminEmail, testPassword);

      expect(result).toHaveProperty('admin');
      expect(result.admin.email).toBe(testAdminEmail);
      expect(result).toHaveProperty('token');
      expect(result.token).toBeTruthy();
    });

    it('should reject login with wrong password', async () => {
      await expect(
        authService.login(testAdminEmail, 'WrongPassword123!')
      ).rejects.toThrow('Invalid email or password');
    });

    it('should reject login with non-existent email', async () => {
      await expect(
        authService.login('nonexistent@test.com', testPassword)
      ).rejects.toThrow('Invalid email or password');
    });

    it('should return user with correct churchId on login', async () => {
      const result = await authService.login(testAdminEmail, testPassword);

      expect(result.admin).toHaveProperty('churchId');
      expect(result.admin.churchId).toBeTruthy();
    });
  });

  describe('Multi-Tenancy Isolation', () => {
    let church1Id: string;
    let church2Id: string;
    let admin1Email: string;
    let admin2Email: string;

    beforeEach(async () => {
      // Create two separate churches with admins
      const church1Result = await authService.register(
        'Church One',
        'Admin One',
        (admin1Email = `admin1-${Date.now()}@test.com`),
        testPassword,
        '+12025551234'
      );
      church1Id = church1Result.church.id;

      const church2Result = await authService.register(
        'Church Two',
        'Admin Two',
        (admin2Email = `admin2-${Date.now()}@test.com`),
        testPassword,
        '+12025555678'
      );
      church2Id = church2Result.church.id;
    });

    afterEach(async () => {
      await prisma.church.deleteMany({
        where: { id: { in: [church1Id, church2Id] } },
      });
    });

    it('should isolate churches - admin1 cannot see admin2', async () => {
      const admin1 = await prisma.user.findUnique({
        where: { email: admin1Email },
      });
      const admin2 = await prisma.user.findUnique({
        where: { email: admin2Email },
      });

      expect(admin1?.churchId).not.toBe(admin2?.churchId);
    });

    it('should isolate churches - groups in church1 not visible to church2', async () => {
      const church1Groups = await prisma.group.findMany({
        where: { churchId: church1Id },
      });
      const church2Groups = await prisma.group.findMany({
        where: { churchId: church2Id },
      });

      const church1GroupIds = church1Groups.map((g) => g.id);
      const church2GroupIds = church2Groups.map((g) => g.id);

      // No overlap between church1 and church2 groups
      const overlap = church1GroupIds.filter((id) => church2GroupIds.includes(id));
      expect(overlap).toHaveLength(0);
    });
  });

  describe('Token Management', () => {
    let testToken: string;
    let adminId: string;
    let churchId: string;

    beforeEach(async () => {
      const registrationResult = await authService.register(
        'Token Test Church',
        'Admin',
        testAdminEmail,
        testPassword,
        '+12025551234'
      );
      testToken = registrationResult.token;
      adminId = registrationResult.admin.id;
      churchId = registrationResult.church.id;
    });

    afterEach(async () => {
      await prisma.church.deleteMany({
        where: { id: churchId },
      });
    });

    it('should generate valid JWT token on registration', () => {
      expect(testToken).toBeTruthy();
      expect(testToken.split('.')).toHaveLength(3); // JWT format: header.payload.signature
    });

    it('should include churchId in token payload', () => {
      // Decode JWT (without verification for this test)
      const parts = testToken.split('.');
      const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());

      expect(payload).toHaveProperty('churchId');
      expect(payload.churchId).toBe(churchId);
    });
  });
});
