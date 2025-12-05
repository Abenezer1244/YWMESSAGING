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
/**
 * Get Prisma client instance for tests
 * Reuses singleton connection across all test files
 */
export declare function getPrismaClient(): PrismaClient;
declare global {
    var testDb: PrismaClient;
}
export {};
//# sourceMappingURL=setup.d.ts.map