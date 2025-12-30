/**
 * Database Provisioning Service
 *
 * Handles creation and management of per-tenant databases
 * Each tenant (church) gets its own isolated PostgreSQL database
 */
/**
 * Provision a new tenant database
 * Creates a new database on the PostgreSQL server and returns the connection string
 */
export declare function provisionTenantDatabase(tenantId: string): Promise<string>;
/**
 * Run Prisma migrations on a tenant database
 * Applies the tenant schema to the newly created database
 * Uses Prisma db push to apply the tenant-schema.prisma to the database
 */
export declare function runTenantMigrations(tenantDatabaseUrl: string): Promise<void>;
/**
 * Delete a tenant database (soft delete - archive instead)
 * DANGER: This operation is irreversible
 */
export declare function deleteTenantDatabase(tenantId: string): Promise<void>;
/**
 * Check if a tenant database exists
 */
export declare function tenantDatabaseExists(tenantId: string): Promise<boolean>;
//# sourceMappingURL=database-provisioning.service.d.ts.map