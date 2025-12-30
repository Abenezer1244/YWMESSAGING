#!/usr/bin/env node

const { Client } = require('pg');
require('dotenv').config({ path: './backend/.env' });

const DATABASE_URL = process.env.DATABASE_URL;

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
};

async function main() {
  log.title('RECREATING TENANT TABLE WITH COMPLETE SCHEMA');

  const client = new Client({ connectionString: DATABASE_URL });

  try {
    await client.connect();
    log.pass('Connected to registry database');

    log.step(1, 'Dropping existing Tenant table if it exists');
    try {
      // Drop table and cascade to remove dependent records
      await client.query('DROP TABLE IF EXISTS "Tenant" CASCADE');
      log.pass('Dropped existing Tenant table');
    } catch (e) {
      log.info(`Table drop skipped: ${e.message.substring(0, 50)}`);
    }

    log.step(2, 'Creating Tenant table with complete schema');

    const createTableSQL = `
      CREATE TABLE "Tenant" (
        id VARCHAR(255) PRIMARY KEY,
        churchId VARCHAR(255) UNIQUE NOT NULL,

        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,

        "databaseUrl" TEXT NOT NULL,
        "databaseHost" VARCHAR(255) NOT NULL,
        "databasePort" INTEGER DEFAULT 5432,
        "databaseName" VARCHAR(255) NOT NULL,

        "subscriptionStatus" VARCHAR(255) DEFAULT 'trial',
        "subscriptionPlan" VARCHAR(255) DEFAULT 'starter',
        "trialEndsAt" TIMESTAMP NULL,

        "telnyxPhoneNumber" VARCHAR(255) UNIQUE NULL,
        "telnyxNumberSid" VARCHAR(255) UNIQUE NULL,

        status VARCHAR(255) DEFAULT 'active',
        "schemaVersion" VARCHAR(255) DEFAULT '1.0.0',

        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "lastAccessedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

        CONSTRAINT fk_tenant_church FOREIGN KEY (churchId) REFERENCES "Church"(id) ON DELETE CASCADE
      )
    `;

    await client.query(createTableSQL);
    log.pass('Tenant table created with all columns');

    log.step(3, 'Creating indexes for performance');

    const indexes = [
      { name: 'idx_tenant_churchid', column: 'churchId' },
      { name: 'idx_tenant_telnyx_phone', column: '"telnyxPhoneNumber"' },
      { name: 'idx_tenant_status', column: 'status' },
      { name: 'idx_tenant_subscription_plan', column: '"subscriptionPlan"' },
      { name: 'idx_tenant_created_at', column: '"createdAt"' },
    ];

    for (const idx of indexes) {
      await client.query(`CREATE INDEX ${idx.name} ON "Tenant"(${idx.column})`);
      console.log(`  ✓ Created index: ${idx.name}`);
    }

    log.step(4, 'Verifying table structure');

    const result = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'Tenant'
      ORDER BY ordinal_position
    `);

    console.log('\n  Table structure:');
    result.rows.forEach(row => {
      const nullable = row.is_nullable === 'YES' ? 'nullable' : 'required';
      const defaultStr = row.column_default ? ` = ${row.column_default}` : '';
      console.log(`    ${row.column_name}: ${row.data_type} (${nullable})${defaultStr}`);
    });

    log.pass(`Tenant table has ${result.rows.length} columns`);

    // Verify column count matches schema
    const expectedColumns = [
      'id', 'churchId', 'name', 'email',
      'databaseUrl', 'databaseHost', 'databasePort', 'databaseName',
      'subscriptionStatus', 'subscriptionPlan', 'trialEndsAt',
      'telnyxPhoneNumber', 'telnyxNumberSid',
      'status', 'schemaVersion',
      'createdAt', 'updatedAt', 'lastAccessedAt'
    ];

    const actualColumns = result.rows.map(r => r.column_name);
    const missing = expectedColumns.filter(col => !actualColumns.includes(col));
    const extra = actualColumns.filter(col => !expectedColumns.includes(col));

    if (missing.length === 0 && extra.length === 0) {
      log.pass('All expected columns present, no extra columns');
    } else {
      if (missing.length > 0) {
        log.fail(`Missing columns: ${missing.join(', ')}`);
      }
      if (extra.length > 0) {
        log.info(`Extra columns: ${extra.join(', ')}`);
      }
    }

    log.title('TENANT TABLE RECREATION COMPLETE');
    console.log('\n✅ Tenant table is now ready for registration!\n');

  } catch (err) {
    log.fail(`Error: ${err.message}`);
    console.error(err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
