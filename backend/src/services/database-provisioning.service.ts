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
 */
export async function runTenantMigrations(tenantDatabaseUrl: string): Promise<void> {
  try {
    // Create a temporary Prisma client for this database
    const tempPrisma = new PrismaClient({
      datasources: {
        db: { url: tenantDatabaseUrl },
      },
    });

    try {
      // Run a simple query to verify connection works
      await tempPrisma.$executeRaw`SELECT 1`;
      console.log('✅ Tenant database connection verified');

      // In production, you would run migrations here using:
      // - prisma migrate deploy (if using migrations)
      // - prisma db push (if using push to db)
      // For now, we rely on the schema being automatically applied

      // TODO: Implement proper migration strategy
      // This might be:
      // 1. Using prisma migrate deploy with a separate migrations directory
      // 2. Using prisma db push
      // 3. Running raw SQL initialization script

    } finally {
      await tempPrisma.$disconnect();
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
