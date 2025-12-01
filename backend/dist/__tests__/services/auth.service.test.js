import { describe, it, expect } from '@jest/globals';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
// Mock data
const mockUser = {
    id: 'user-123',
    email: 'pastor@church.com',
    password: 'SecurePass123!',
    churchId: 'church-456',
    role: 'admin',
};
const mockTokenPayload = {
    userId: mockUser.id,
    churchId: mockUser.churchId,
    role: mockUser.role,
};
describe('Authentication Service', () => {
    describe('Password Hashing', () => {
        it('should hash password correctly', async () => {
            const hashedPassword = await bcrypt.hash(mockUser.password, 10);
            expect(hashedPassword).not.toBe(mockUser.password);
            expect(hashedPassword.length).toBeGreaterThan(20);
        });
        it('should verify correct password', async () => {
            const hashedPassword = await bcrypt.hash(mockUser.password, 10);
            const isValid = await bcrypt.compare(mockUser.password, hashedPassword);
            expect(isValid).toBe(true);
        });
        it('should reject incorrect password', async () => {
            const hashedPassword = await bcrypt.hash(mockUser.password, 10);
            const isValid = await bcrypt.compare('WrongPassword123!', hashedPassword);
            expect(isValid).toBe(false);
        });
    });
    describe('JWT Token Generation', () => {
        const jwtSecret = 'test-secret-key-super-secure-123';
        it('should create valid access token', () => {
            const token = jwt.sign(mockTokenPayload, jwtSecret, { expiresIn: '15m' });
            expect(token).toBeTruthy();
            const decoded = jwt.verify(token, jwtSecret);
            expect(decoded.userId).toBe(mockUser.id);
            expect(decoded.churchId).toBe(mockUser.churchId);
        });
        it('should create valid refresh token', () => {
            const refreshPayload = { userId: mockUser.id, type: 'refresh' };
            const token = jwt.sign(refreshPayload, jwtSecret, { expiresIn: '7d' });
            expect(token).toBeTruthy();
            const decoded = jwt.verify(token, jwtSecret);
            expect(decoded.type).toBe('refresh');
        });
        it('should reject expired token', () => {
            const expiredPayload = {
                userId: mockUser.id,
                exp: Math.floor(Date.now() / 1000) - 60, // Expired 1 minute ago
            };
            const token = jwt.sign(expiredPayload, jwtSecret);
            expect(() => {
                jwt.verify(token, jwtSecret);
            }).toThrow();
        });
        it('should reject tampered token', () => {
            const token = jwt.sign(mockTokenPayload, jwtSecret);
            const tampered = token.slice(0, -5) + 'xxxxx'; // Tamper with signature
            expect(() => {
                jwt.verify(tampered, jwtSecret);
            }).toThrow();
        });
    });
    describe('Multi-tenancy Security', () => {
        const jwtSecret = 'test-secret-key-super-secure-123';
        it('should include churchId in token', () => {
            const token = jwt.sign(mockTokenPayload, jwtSecret);
            const decoded = jwt.verify(token, jwtSecret);
            expect(decoded.churchId).toBe(mockUser.churchId);
        });
        it('should prevent churchId tampering', () => {
            const token = jwt.sign(mockTokenPayload, jwtSecret);
            const decoded = jwt.verify(token, jwtSecret);
            // Verify churchId matches original
            expect(decoded.churchId).toBe(mockTokenPayload.churchId);
            // Cannot change without invalidating signature
            decoded.churchId = 'hacked-church';
            const tampered = jwt.sign(decoded, 'wrong-secret');
            expect(() => {
                jwt.verify(tampered, jwtSecret);
            }).toThrow();
        });
        it('should validate role-based access', () => {
            const adminToken = jwt.sign({ ...mockTokenPayload, role: 'admin' }, jwtSecret);
            const userToken = jwt.sign({ ...mockTokenPayload, role: 'user' }, jwtSecret);
            const decodedAdmin = jwt.verify(adminToken, jwtSecret);
            const decodedUser = jwt.verify(userToken, jwtSecret);
            expect(decodedAdmin.role).toBe('admin');
            expect(decodedUser.role).toBe('user');
            expect(decodedAdmin.role).not.toBe(decodedUser.role);
        });
    });
});
//# sourceMappingURL=auth.service.test.js.map