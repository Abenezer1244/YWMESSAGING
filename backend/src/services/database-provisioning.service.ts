/**
 * Database Provisioning Service
 *
 * Handles creation and management of per-tenant databases
 * Each tenant (church) gets its own isolated PostgreSQL database
 */

import { PrismaClient } from '@prisma/client';

/**
 * Provision a new tenant database
 * Creates a new database on the PostgreSQL server and returns the connection string
 */
export async function provisionTenantDatabase(tenantId: string): Promise<string> {
  try {
    const databaseName = `tenant_${tenantId}`;

    // Parse the base database URL from environment
    const baseUrl = process.env.DATABASE_URL || '';
    if (!baseUrl) {
      throw new Error('DATABASE_URL not configured');
    }

    // Extract connection details from base URL
    // Format: postgresql://user:password@host:port/database
    const urlMatch = baseUrl.match(/postgresql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)/);
    if (!urlMatch) {
      throw new Error('Invalid DATABASE_URL format');
    }

    const [, user, password, host, port] = urlMatch;

    // Create a admin connection to the server to create the new database
    const adminUrl = `postgresql://${user}:${password}@${host}:${port}/postgres`;
    const adminPrisma = new PrismaClient({
      datasources: {
        db: { url: adminUrl },
      },
    });

    try {
      // Create the database
      // Note: Using raw SQL since Prisma doesn't support DDL operations like CREATE DATABASE
      await adminPrisma.$executeRawUnsafe(
        `CREATE DATABASE "${databaseName}" ENCODING 'UTF8'`
      );

      console.log(`✅ Tenant database created: ${databaseName}`);

      // Return the connection string for the new database
      const tenantUrl = `postgresql://${user}:${password}@${host}:${port}/${databaseName}`;
      return tenantUrl;
    } finally {
      await adminPrisma.$disconnect();
    }
  } catch (error: any) {
    // Check if database already exists (which is fine)
    if (error.message?.includes('already exists')) {
      console.log(`ℹ️ Tenant database already exists: tenant_${tenantId}`);
      const baseUrl = process.env.DATABASE_URL || '';
      const urlMatch = baseUrl.match(/postgresql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)/);
      if (urlMatch) {
        const [, user, password, host, port] = urlMatch;
        return `postgresql://${user}:${password}@${host}:${port}/tenant_${tenantId}`;
      }
    }

    console.error('Failed to provision tenant database:', error);
    throw new Error(`Database provisioning failed: ${error.message}`);
  }
}

/**
 * Run Prisma migrations on a tenant database
 * Applies the tenant schema to the newly created database
 * Uses Prisma db push to apply the tenant-schema.prisma to the database
 */
export async function runTenantMigrations(tenantDatabaseUrl: string): Promise<void> {
  try {
    // Create a temporary Prisma client for this database to verify connection
    const tempPrisma = new PrismaClient({
      datasources: {
        db: { url: tenantDatabaseUrl },
      },
    });

    try {
      // Verify connection works
      await tempPrisma.$executeRaw`SELECT 1`;
      console.log('✅ Tenant database connection verified');
    } finally {
      await tempPrisma.$disconnect();
    }

    // Run prisma db push with tenant schema to initialize all tables
    // This applies the tenant-schema.prisma to the database
    const { execSync } = require('child_process');
    const path = require('path');

    try {
      console.log('⏳ Running Prisma migrations (tenant schema)...');

      // Set environment variable for Prisma to use tenant database
      const env = {
        ...process.env,
        TENANT_DATABASE_URL: tenantDatabaseUrl,
        NODE_ENV: process.env.NODE_ENV || 'development',
      };

      // Run prisma db push with tenant schema
      // This will create all tables from tenant-schema.prisma
      execSync(
        'npx prisma db push --schema=prisma/tenant-schema.prisma --skip-generate',
        {
          env,
          stdio: 'pipe', // Capture output to avoid cluttering logs
          cwd: process.cwd(),
        }
      );

      console.log('✅ Tenant schema migrations completed');
    } catch (execError: any) {
      // Log the actual error output
      const errorMessage = execError.stderr?.toString() || execError.stdout?.toString() || execError.message;
      console.error('Migration command output:', errorMessage);
      throw new Error(`Prisma migrations failed: ${errorMessage}`);
    }
  } catch (error: any) {
    console.error('Failed to run tenant migrations:', error);
    throw new Error(`Migration failed: ${error.message}`);
  }
}

/**
 * Delete a tenant database (soft delete - archive instead)
 * DANGER: This operation is irreversible
 */
export async function deleteTenantDatabase(tenantId: string): Promise<void> {
  try {
    const databaseName = `tenant_${tenantId}`;

    // Parse the base database URL from environment
    const baseUrl = process.env.DATABASE_URL || '';
    if (!baseUrl) {
      throw new Error('DATABASE_URL not configured');
    }

    // Extract connection details from base URL
    const urlMatch = baseUrl.match(/postgresql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)/);
    if (!urlMatch) {
      throw new Error('Invalid DATABASE_URL format');
    }

    const [, user, password, host, port] = urlMatch;

    // Create a admin connection to drop the database
    const adminUrl = `postgresql://${user}:${password}@${host}:${port}/postgres`;
    const adminPrisma = new PrismaClient({
      datasources: {
        db: { url: adminUrl },
      },
    });

    try {
      // Terminate all connections to the database before dropping
      await adminPrisma.$executeRawUnsafe(`
        SELECT pg_terminate_backend(pg_stat_activity.pid)
        FROM pg_stat_activity
        WHERE pg_stat_activity.datname = '${databaseName}'
        AND pid <> pg_backend_pid();
      `);

      // Drop the database
      await adminPrisma.$executeRawUnsafe(`DROP DATABASE IF EXISTS "${databaseName}"`);

      console.log(`✅ Tenant database deleted: ${databaseName}`);
    } finally {
      await adminPrisma.$disconnect();
    }
  } catch (error: any) {
    console.error('Failed to delete tenant database:', error);
    throw new Error(`Database deletion failed: ${error.message}`);
  }
}

/**
 * Check if a tenant database exists
 */
export async function tenantDatabaseExists(tenantId: string): Promise<boolean> {
  try {
    const databaseName = `tenant_${tenantId}`;

    // Parse the base database URL from environment
    const baseUrl = process.env.DATABASE_URL || '';
    if (!baseUrl) {
      throw new Error('DATABASE_URL not configured');
    }

    // Extract connection details from base URL
    const urlMatch = baseUrl.match(/postgresql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)/);
    if (!urlMatch) {
      throw new Error('Invalid DATABASE_URL format');
    }

    const [, user, password, host, port] = urlMatch;

    // Create a admin connection to check the database
    const adminUrl = `postgresql://${user}:${password}@${host}:${port}/postgres`;
    const adminPrisma = new PrismaClient({
      datasources: {
        db: { url: adminUrl },
      },
    });

    try {
      const result = await adminPrisma.$queryRaw<Array<{ exists: boolean }>>`
        SELECT EXISTS(SELECT 1 FROM pg_database WHERE datname = ${databaseName});
      `;

      return result[0]?.exists || false;
    } finally {
      await adminPrisma.$disconnect();
    }
  } catch (error: any) {
    console.error('Failed to check if tenant database exists:', error);
    return false;
  }
}
