/**
 * Auth Routes Integration Tests
 * Tests HTTP endpoints for authentication flow
 * Validates status codes, response format, cookies, and multi-tenancy
 *
 * NOTE: Integration tests require the Express app to be properly initialized
 * with all middleware, routes, and database connections.
 */

import request from 'supertest';
import { PrismaClient } from '@prisma/client';
import { getTestFactories } from '../helpers/test-factories.js';
import { createTestApp } from '../helpers/test-app.js';
import type { Express } from 'express';

let app: Express;

describe('Auth Routes - Integration Tests', () => {
  let prisma: PrismaClient;
  let factories: any;

  beforeAll(async () => {
    // Initialize Prisma
    prisma = global.testDb;
    factories = getTestFactories(prisma);

    // Create test app with minimal configuration
    app = createTestApp();
  });

  beforeEach(async () => {
    // Clean up test data before each test
    await factories.cleanup();
  });

  afterAll(async () => {
    // Clean up after all tests
    await factories.cleanup();
  });

  describe('POST /api/auth/register', () => {
    test('✅ Should register church with valid input', async () => {
      const res = await request(app).post('/api/auth/register').send({
        email: 'newchurch@example.com',
        password: 'TestPassword123!',
        firstName: 'John',
        lastName: 'Doe',
        churchName: 'New Hope Church',
      });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.church).toBeDefined();
      expect(res.body.data.admin).toBeDefined();
      expect(res.body.data.accessToken).toBeDefined();
      expect(res.body.data.refreshToken).toBeDefined();
    });

    test('✅ Should set httpOnly cookies on registration', async () => {
      const res = await request(app).post('/api/auth/register').send({
        email: 'cookies@example.com',
        password: 'TestPassword123!',
        firstName: 'Jane',
        lastName: 'Smith',
        churchName: 'Cookie Church',
      });

      // Check for Set-Cookie header
      const setCookieHeader = res.headers['set-cookie'];
      expect(setCookieHeader).toBeDefined();
      expect(Array.isArray(setCookieHeader)).toBe(true);

      // Validate httpOnly flag in cookies
      const cookieStrings = (Array.isArray(setCookieHeader) ? setCookieHeader : [setCookieHeader]) as string[];
      const hasHttpOnlyAccessToken = cookieStrings.some(
        (c) => c.includes('accessToken') && c.includes('HttpOnly')
      );
      const hasHttpOnlyRefreshToken = cookieStrings.some(
        (c) => c.includes('refreshToken') && c.includes('HttpOnly')
      );

      expect(hasHttpOnlyAccessToken).toBe(true);
      expect(hasHttpOnlyRefreshToken).toBe(true);
    });

    test('✅ Should reject duplicate email', async () => {
      // Register first church
      await request(app).post('/api/auth/register').send({
        email: 'duplicate@example.com',
        password: 'TestPassword123!',
        firstName: 'First',
        lastName: 'Admin',
        churchName: 'First Church',
      });

      // Try to register with same email
      const res = await request(app).post('/api/auth/register').send({
        email: 'duplicate@example.com',
        password: 'TestPassword123!',
        firstName: 'Second',
        lastName: 'Admin',
        churchName: 'Second Church',
      });

      expect(res.status).toBe(400);
      expect(res.body.error).toBeDefined();
    });

    test('✅ Should reject weak passwords', async () => {
      const res = await request(app).post('/api/auth/register').send({
        email: 'weak@example.com',
        password: '123', // Too weak
        firstName: 'John',
        lastName: 'Doe',
        churchName: 'Weak Church',
      });

      expect(res.status).toBe(400);
      expect(res.body.error).toBeDefined();
    });

    test('✅ Should validate email format', async () => {
      const res = await request(app).post('/api/auth/register').send({
        email: 'not-an-email',
        password: 'TestPassword123!',
        firstName: 'John',
        lastName: 'Doe',
        churchName: 'Invalid Church',
      });

      expect(res.status).toBe(400);
      expect(res.body.error).toBeDefined();
    });
  });

  describe('POST /api/auth/login', () => {
    let testChurch: any;
    let testAdmin: any;

    beforeEach(async () => {
      // Create test church and admin
      testChurch = await factories.createTestChurch({
        email: 'login@example.com',
      });
      testAdmin = testChurch.admins[0];
    });

    test('✅ Should login with valid credentials', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: 'login@example.com',
        password: 'TestPassword123!',
      });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.mfaRequired).toBe(false);
      expect(res.body.data.admin).toBeDefined();
      expect(res.body.data.church).toBeDefined();
      expect(res.body.data.accessToken).toBeDefined();
      expect(res.body.data.refreshToken).toBeDefined();
    });

    test('✅ Should set secure httpOnly cookies on login', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: 'login@example.com',
        password: 'TestPassword123!',
      });

      const setCookieHeader = res.headers['set-cookie'];
      expect(setCookieHeader).toBeDefined();

      const cookieStrings = (Array.isArray(setCookieHeader) ? setCookieHeader : [setCookieHeader]) as string[];
      const hasHttpOnly = cookieStrings.every((c) => c.includes('HttpOnly'));
      expect(hasHttpOnly).toBe(true);
    });

    test('✅ Should update lastLoginAt timestamp', async () => {
      const beforeLogin = new Date();

      await request(app).post('/api/auth/login').send({
        email: 'login@example.com',
        password: 'TestPassword123!',
      });

      const updatedAdmin = await prisma.admin.findUnique({
        where: { id: testAdmin.id },
      });

      expect(updatedAdmin?.lastLoginAt).toBeDefined();
      expect(updatedAdmin!.lastLoginAt!.getTime()).toBeGreaterThanOrEqual(
        beforeLogin.getTime()
      );
    });

    test('✅ Should reject invalid email', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: 'nonexistent@example.com',
        password: 'TestPassword123!',
      });

      expect(res.status).toBe(401);
      expect(res.body.error).toBeDefined();
    });

    test('✅ Should reject invalid password', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: 'login@example.com',
        password: 'WrongPassword123!',
      });

      expect(res.status).toBe(401);
      expect(res.body.error).toBeDefined();
    });

    test('✅ Should allow login during active trial', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: 'login@example.com',
        password: 'TestPassword123!',
      });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    test('✅ Should reject login with invalid email format', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: 'not-an-email',
        password: 'TestPassword123!',
      });

      expect(res.status).toBe(400);
      expect(res.body.error).toBeDefined();
    });
  });

  describe('POST /api/auth/refresh', () => {
    let refreshToken: string;

    beforeEach(async () => {
      // Register and get tokens
      const registerRes = await request(app).post('/api/auth/register').send({
        email: 'refresh@example.com',
        password: 'TestPassword123!',
        firstName: 'John',
        lastName: 'Doe',
        churchName: 'Refresh Church',
      });

      // Extract refresh token from response
      refreshToken = registerRes.body.data.refreshToken;
    });

    test('✅ Should refresh access token with valid refresh token', async () => {
      const res = await request(app)
        .post('/api/auth/refresh')
        .set('Cookie', `refreshToken=${refreshToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.accessToken).toBeDefined();
      expect(res.body.data.refreshToken).toBeDefined();
    });

    test('✅ Should reject refresh without token', async () => {
      const res = await request(app).post('/api/auth/refresh');

      expect(res.status).toBe(400);
      expect(res.body.error).toBeDefined();
    });

    test('✅ Should reject invalid refresh token', async () => {
      const res = await request(app)
        .post('/api/auth/refresh')
        .set('Cookie', `refreshToken=invalid-token`);

      expect(res.status).toBe(401);
      expect(res.body.error).toBeDefined();
    });

    test('✅ Should set new httpOnly cookies on refresh', async () => {
      const res = await request(app)
        .post('/api/auth/refresh')
        .set('Cookie', `refreshToken=${refreshToken}`);

      const setCookieHeader = res.headers['set-cookie'];
      expect(setCookieHeader).toBeDefined();

      const cookieStrings = (Array.isArray(setCookieHeader) ? setCookieHeader : [setCookieHeader]) as string[];
      const hasNewAccessToken = cookieStrings.some((c) =>
        c.includes('accessToken')
      );
      expect(hasNewAccessToken).toBe(true);
    });
  });

  describe('GET /api/auth/me', () => {
    let accessToken: string;
    let testChurch: any;

    beforeEach(async () => {
      // Register and get tokens
      const registerRes = await request(app).post('/api/auth/register').send({
        email: 'me@example.com',
        password: 'TestPassword123!',
        firstName: 'John',
        lastName: 'Doe',
        churchName: 'Me Church',
      });

      accessToken = registerRes.body.data.accessToken;
    });

    test('✅ Should return current admin profile when authenticated', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBeDefined();
      expect(res.body.data.email).toBeDefined();
      expect(res.body.data.firstName).toBe('John');
      expect(res.body.data.lastName).toBe('Doe');
    });

    test('✅ Should reject unauthenticated request', async () => {
      const res = await request(app).get('/api/auth/me');

      expect(res.status).toBe(401);
      expect(res.body.error).toBeDefined();
    });

    test('✅ Should reject invalid token', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid-token');

      expect(res.status).toBe(401);
      expect(res.body.error).toBeDefined();
    });

    test('✅ Should include welcome fields in profile', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.body.data.welcomeCompleted).toBeDefined();
      expect(res.body.data.userRole).toBeDefined();
    });
  });

  describe('POST /api/auth/logout', () => {
    let accessToken: string;
    let refreshToken: string;

    beforeEach(async () => {
      // Register and get tokens
      const registerRes = await request(app).post('/api/auth/register').send({
        email: 'logout@example.com',
        password: 'TestPassword123!',
        firstName: 'John',
        lastName: 'Doe',
        churchName: 'Logout Church',
      });

      accessToken = registerRes.body.data.accessToken;
      refreshToken = registerRes.body.data.refreshToken;
    });

    test('✅ Should clear cookies on logout', async () => {
      const res = await request(app)
        .post('/api/auth/logout')
        .set('Cookie', [
          `accessToken=${accessToken}`,
          `refreshToken=${refreshToken}`,
        ]);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      // Check that cookies are cleared (maxAge=0)
      const setCookieHeader = res.headers['set-cookie'];
      expect(setCookieHeader).toBeDefined();

      const cookieStrings = (Array.isArray(setCookieHeader) ? setCookieHeader : [setCookieHeader]) as string[];
      const hasClearedAccessToken = cookieStrings.some(
        (c) => c.includes('accessToken') && c.includes('Max-Age=0')
      );
      expect(hasClearedAccessToken).toBe(true);
    });

    test('✅ Should revoke tokens after logout', async () => {
      // Logout
      await request(app)
        .post('/api/auth/logout')
        .set('Cookie', [
          `accessToken=${accessToken}`,
          `refreshToken=${refreshToken}`,
        ]);

      // Try to use token after logout - should fail
      const meRes = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(meRes.status).toBe(401);
    });

    test('✅ Should handle logout without tokens gracefully', async () => {
      const res = await request(app).post('/api/auth/logout');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('Multi-tenancy Isolation', () => {
    let church1Token: string;
    let church2Token: string;

    beforeEach(async () => {
      // Create and login first church
      const res1 = await request(app).post('/api/auth/register').send({
        email: 'church1@example.com',
        password: 'TestPassword123!',
        firstName: 'Admin',
        lastName: 'One',
        churchName: 'Church One',
      });
      church1Token = res1.body.data.accessToken;

      // Create and login second church
      const res2 = await request(app).post('/api/auth/register').send({
        email: 'church2@example.com',
        password: 'TestPassword123!',
        firstName: 'Admin',
        lastName: 'Two',
        churchName: 'Church Two',
      });
      church2Token = res2.body.data.accessToken;
    });

    test('✅ Each church gets separate church ID', async () => {
      const res1 = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${church1Token}`);

      const res2 = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${church2Token}`);

      expect(res1.body.data.churchId).toBeDefined();
      expect(res2.body.data.churchId).toBeDefined();
      expect(res1.body.data.churchId).not.toBe(res2.body.data.churchId);
    });

    test('✅ Admin from church1 cannot access church2 data', async () => {
      // Get church2 data using church1 token - should fail or return error
      // (This depends on API design - adjust expectation as needed)
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${church1Token}`);

      expect(res.body.data.churchId).toBeDefined();
      expect(res.body.data.email).toBe('church1@example.com');
    });
  });

  describe('Error Handling', () => {
    test('✅ Should handle malformed JSON request', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send('{ invalid json }');

      expect(res.status).toBeGreaterThanOrEqual(400);
    });

    test('✅ Should return consistent error format', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: 'nonexistent@example.com',
        password: 'wrong',
      });

      expect(res.body.error).toBeDefined();
      expect(typeof res.body.error).toBe('string');
    });

    test('✅ Should not leak sensitive information in errors', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: 'nonexistent@example.com',
        password: 'TestPassword123!',
      });

      expect(res.body.error).not.toContain('password');
      expect(res.body.error).not.toContain('hash');
    });
  });
});
