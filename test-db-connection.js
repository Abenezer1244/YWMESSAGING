#!/usr/bin/env node

/**
 * Test Database Connection
 * Tests PostgreSQL connection without requiring psql
 * Run with: node test-db-connection.js
 */

const { Client } = require('pg');
require('dotenv').config({ path: './backend/.env' });

async function testConnection() {
  console.log('\n================================');
  console.log('PostgreSQL Connection Tester');
  console.log('================================\n');

  // Get DATABASE_URL from environment
  const DATABASE_URL = process.env.DATABASE_URL;

  if (!DATABASE_URL) {
    console.error('❌ ERROR: DATABASE_URL not set');
    console.log('Set it with:');
    console.log('  $env:DATABASE_URL = "postgresql://user:password@host:port/database"');
    process.exit(1);
  }

  console.log('Testing connection to:', DATABASE_URL.replace(/:[^:@]*@/, ':****@'));
  console.log('');

  const client = new Client({ connectionString: DATABASE_URL });

  try {
    // Test 1: Connect
    console.log('Test 1: Connecting to PostgreSQL...');
    await client.connect();
    console.log('✅ Connected successfully\n');

    // Test 2: Simple query
    console.log('Test 2: Running simple query (SELECT 1)...');
    const result = await client.query('SELECT 1');
    console.log('✅ Query successful:', result.rows[0]);
    console.log('');

    // Test 3: CREATE DATABASE permission
    console.log('Test 3: Testing CREATE DATABASE permission...');
    const testDbName = `test_permissions_${Date.now()}`;
    try {
      await client.query(`CREATE DATABASE "${testDbName}"`);
      console.log(`✅ CREATE DATABASE works - created "${testDbName}"`);

      // Clean up
      await client.query(`DROP DATABASE "${testDbName}"`);
      console.log(`✅ Cleaned up test database\n`);
    } catch (createError) {
      console.error('❌ CREATE DATABASE failed');
      console.error('   Error:', createError.message);
      console.log('\n⚠️  CRITICAL: Your PostgreSQL user cannot CREATE DATABASE');
      console.log('   This is REQUIRED for the multi-tenant system to work.');
      console.log('   Ask your Render PostgreSQL admin user to grant this permission.\n');
    }

    // Test 4: List existing databases
    console.log('Test 4: Listing existing databases...');
    const dbResult = await client.query(
      "SELECT datname FROM pg_database WHERE datname NOT IN ('postgres', 'template0', 'template1') ORDER BY datname"
    );
    console.log(`✅ Found ${dbResult.rows.length} user databases:`);
    dbResult.rows.forEach(row => {
      console.log(`   - ${row.datname}`);
    });
    console.log('');

    // Test 5: Check schema
    console.log('Test 5: Checking for Prisma schema tables...');
    const schemaResult = await client.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema='public' ORDER BY table_name"
    );
    console.log(`✅ Found ${schemaResult.rows.length} tables in public schema:`);
    schemaResult.rows.slice(0, 10).forEach(row => {
      console.log(`   - ${row.table_name}`);
    });
    if (schemaResult.rows.length > 10) {
      console.log(`   ... and ${schemaResult.rows.length - 10} more`);
    }
    console.log('');

    console.log('================================');
    console.log('✅ ALL TESTS PASSED');
    console.log('================================\n');
    console.log('Your database is ready for the E2E tests!');
    console.log('Next: Run the E2E test suite with: bash RUN_REAL_TESTS.sh\n');

  } catch (error) {
    console.error('❌ Connection failed');
    console.error('Error:', error.message);
    console.log('\nTroubleshooting:');
    console.log('1. Verify DATABASE_URL format: postgresql://user:password@host:port/database');
    console.log('2. Check username and password are correct');
    console.log('3. Verify host and port are accessible');
    console.log('4. Ask your Render admin if they blocked the connection\n');
    process.exit(1);

  } finally {
    await client.end();
  }
}

testConnection();
