/**
 * Jest Global Setup File
 * Initializes test database connection and global utilities
 *
 * This file runs before all tests and sets up:
 * - Test environment variables
 * - Global Prisma client for database access
 * - Test mode configuration
 */
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import path from 'path';
// Load test environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.test') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
// Ensure we're in test mode
process.env.NODE_ENV = 'test';
// Initialize Prisma client for tests
let prismaClient;
/**
 * Get Prisma client instance for tests
 * Reuses singleton connection across all test files
 */
export function getPrismaClient() {
    if (!prismaClient) {
        prismaClient = new PrismaClient({
            log: process.env.DEBUG_TESTS ? ['query', 'info', 'warn', 'error'] : ['error'],
        });
    }
    return prismaClient;
}
// Initialize global test database
global.testDb = getPrismaClient();
//# sourceMappingURL=setup.js.map