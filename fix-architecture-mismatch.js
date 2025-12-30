#!/usr/bin/env node

const { Client } = require('pg');
require('dotenv').config({ path: './backend/.env' });

const REGISTRY_URL = process.env.DATABASE_URL;

// Tables that should be in tenant databases, not registry
const TENANT_TABLES = [
  'Admin',
  'AdminMFA',
  'Member',
  'Branch',
  'Message',
  'MessageQueue',
  'MessageRecipient',
  'MessageTemplate',
  'Conversation',
  'ConversationMessage',
  'RecurringMessage',
  'MFARecoveryCode',
  'ChatConversation',
  'ChatMessage',
  'Subscription',
  'OnboardingProgress',
  'AnalyticsEvent',
  'DeadLetterQueue',
  'AgentAudit',
  'PlanningCenterIntegration',
  'DataExport',
  'AccountDeletionRequest',
  'NPSSurvey',
  'ConsentLog'
];

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

const log = {
  title: (text) => console.log(`${colors.blue}==============================\n${text}\n==============================${colors.reset}\n`),
  step: (num, text) => console.log(`${colors.yellow}[${num}] ${text}${colors.reset}`),
  pass: (text) => console.log(`${colors.green}✅ ${text}${colors.reset}`),
  fail: (text) => console.log(`${colors.red}❌ ${text}${colors.reset}`),
  info: (text) => console.log(`ℹ️  ${text}`),
  warn: (text) => console.log(`⚠️  ${text}`),
};

async function getRegistryClient() {
  const client = new Client({ connectionString: REGISTRY_URL });
  await client.connect();
  return client;
}

async function getTenantClient(tenantDatabaseUrl) {
  const client = new Client({ connectionString: tenantDatabaseUrl });
  await client.connect();
  return client;
}

async function migrateTableData(registryClient, tenantDatabaseUrl, tableName, churchId) {
  const tenantClient = await getTenantClient(tenantDatabaseUrl);

  try {
    // Get all rows from registry table for this church
    const result = await registryClient.query(
      `SELECT * FROM "${tableName}" WHERE "churchId" = $1`,
      [churchId]
    );

    if (result.rows.length === 0) {
      return 0;
    }

    const rows = result.rows;
    const columns = Object.keys(rows[0]);
    const columnStr = columns.map(col => `"${col}"`).join(', ');
    const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');

    // Insert into tenant database
    for (const row of rows) {
      const values = columns.map(col => row[col]);
      await tenantClient.query(
        `INSERT INTO "${tableName}" (${columnStr}) VALUES (${placeholders})
         ON CONFLICT ("id") DO UPDATE SET ${columns.map(col => `"${col}" = EXCLUDED."${col}"`).join(', ')}`,
        values
      );
    }

    return rows.length;
  } finally {
    await tenantClient.end();
  }
}

async function main() {
  log.title('FIXING ARCHITECTURE MISMATCH: Moving Tenant Data');

  const registryClient = await getRegistryClient();

  try {
    log.step(1, 'Fetching Tenant Registry Records');

    // Get all tenants with their database URLs
    const tenantResult = await registryClient.query(
      'SELECT id, "churchId", "databaseUrl", name FROM "Tenant" ORDER BY "createdAt" DESC'
    );

    if (tenantResult.rows.length === 0) {
      log.warn('No tenants found in registry');
      log.info('This is expected for a fresh setup. Skipping migration.');
      return;
    }

    log.pass(`Found ${tenantResult.rows.length} tenants to migrate`);
    const tenants = tenantResult.rows;

    log.step(2, 'Migrating Tenant-Specific Data');

    let totalMigrated = 0;

    for (const tenant of tenants) {
      console.log(`\n  Processing: ${tenant.name} (${tenant.id.substring(0, 8)}...)`);

      // Verify tenant database exists
      try {
        const testConn = await getTenantClient(tenant.databaseUrl);
        await testConn.end();
      } catch (e) {
        log.warn(`    Tenant database not accessible: ${e.message}`);
        continue;
      }

      // Migrate each table
      let tenantMigrated = 0;
      for (const table of TENANT_TABLES) {
        try {
          const count = await migrateTableData(
            registryClient,
            tenant.databaseUrl,
            table,
            tenant.churchId
          );

          if (count > 0) {
            console.log(`    ✓ ${table}: ${count} rows`);
            tenantMigrated += count;
          }
        } catch (e) {
          if (e.message.includes('does not exist')) {
            // Table doesn't exist in registry, skip
            continue;
          }
          log.warn(`    Failed to migrate ${table}: ${e.message}`);
        }
      }

      if (tenantMigrated > 0) {
        log.pass(`  Migrated ${tenantMigrated} rows for ${tenant.name}`);
        totalMigrated += tenantMigrated;
      }
    }

    log.step(3, 'Removing Wrong Tables from Registry');

    // Check which tables exist and have data
    for (const table of TENANT_TABLES) {
      try {
        const countResult = await registryClient.query(`SELECT COUNT(*) as cnt FROM "${table}"`);
        const count = parseInt(countResult.rows[0].cnt);

        if (count === 0) {
          // Delete empty table
          await registryClient.query(`DROP TABLE IF EXISTS "${table}" CASCADE`);
          console.log(`  ✓ Dropped empty table: ${table}`);
        } else {
          log.warn(`  Table '${table}' still has ${count} rows - NOT dropping`);
        }
      } catch (e) {
        if (!e.message.includes('does not exist')) {
          console.log(`  ℹ️  ${table}: ${e.message.substring(0, 50)}...`);
        }
      }
    }

    log.step(4, 'Verifying Registry Schema');

    const registryTables = await registryClient.query(
      `SELECT table_name FROM information_schema.tables WHERE table_schema='public' ORDER BY table_name`
    );

    console.log(`\n  Registry now contains ${registryTables.rows.length} tables:`);
    registryTables.rows.forEach(row => {
      console.log(`    - ${row.table_name}`);
    });

    const expectedTables = ['Church', 'Tenant', 'PhoneNumberRegistry', 'AdminEmailIndex', '_prisma_migrations'];
    const actualTables = registryTables.rows.map(r => r.table_name);
    const correct = expectedTables.every(t => actualTables.includes(t));

    if (correct) {
      log.pass('Registry schema is correct!');
    } else {
      log.fail('Registry schema still has issues');
      log.info('Expected: ' + expectedTables.join(', '));
      log.info('Got: ' + actualTables.join(', '));
    }

    log.title('MIGRATION COMPLETE');
    console.log(`Total rows migrated: ${totalMigrated}`);
    console.log(`\nNext steps:`);
    console.log(`  1. Restart the backend: npm run dev`);
    console.log(`  2. Test registration with: node test-registration.js`);
    console.log(`  3. Verify multi-tenant isolation\n`);

  } finally {
    await registryClient.end();
  }
}

main().catch(err => {
  log.fail(`Error: ${err.message}`);
  console.error(err);
  process.exit(1);
});
