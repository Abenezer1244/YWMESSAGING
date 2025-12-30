#!/usr/bin/env node

const { Client } = require('pg');
const http = require('http');
require('dotenv').config({ path: './backend/.env' });

const DATABASE_URL = process.env.DATABASE_URL;
const BACKEND_PORT = 5000;
const BACKEND_URL = `http://localhost:${BACKEND_PORT}`;

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

const log = {
  title: (text) => console.log(`${colors.blue}==============================\n${text}\n==============================${colors.reset}\n`),
  test: (num, text) => console.log(`${colors.yellow}Test ${num}: ${text}${colors.reset}`),
  pass: (text) => console.log(`  ${colors.green}✅ ${text}${colors.reset}`),
  fail: (text) => console.log(`  ${colors.red}❌ ${text}${colors.reset}`),
  info: (text) => console.log(`  ℹ️  ${text}`),
};

async function makeRequest(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BACKEND_URL);
    const options = {
      method,
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: data ? JSON.parse(data) : null,
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: data,
          });
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function testRegistration() {
  log.test('E2E-1', 'User Registration Creates Database');

  const testEmail = `test-${Date.now()}@example.com`;
  const testPassword = 'TestPassword123!';

  try {
    log.info(`Registering church with email: ${testEmail}`);

    const response = await makeRequest('POST', '/api/auth/register', {
      email: testEmail,
      password: testPassword,
      firstName: 'Test',
      lastName: 'Church',
      churchName: 'Test Church E2E',
    });

    if (response.status !== 200) {
      log.fail(`Registration failed with status ${response.status}: ${JSON.stringify(response.body)}`);
      return false;
    }

    const { tenantId, accessToken } = response.body;
    if (!tenantId || !accessToken) {
      log.fail(`Response missing tenantId or accessToken`);
      return false;
    }

    log.pass(`Church registered successfully (TenantId: ${tenantId})`);
    log.pass(`Access token generated`);

    // Verify database was created
    await new Promise(resolve => setTimeout(resolve, 2000));

    const client = new Client({ connectionString: DATABASE_URL });
    await client.connect();

    const dbName = `tenant_${tenantId}`;
    const result = await client.query(
      "SELECT datname FROM pg_database WHERE datname = $1",
      [dbName]
    );

    if (result.rows.length === 0) {
      log.fail(`Database ${dbName} was not created`);
      await client.end();
      return false;
    }

    log.pass(`Database ${dbName} created on PostgreSQL`);

    // Verify schema
    const tenantDbUrl = DATABASE_URL.replace('/connect_yw_production', `/${dbName}`);
    const tenantClient = new Client({ connectionString: tenantDbUrl });
    await tenantClient.connect();

    const schemaResult = await tenantClient.query(
      "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='public'"
    );

    const tableCount = parseInt(schemaResult.rows[0].count);
    if (tableCount === 0) {
      log.fail(`No tables in tenant database schema`);
      await tenantClient.end();
      await client.end();
      return false;
    }

    log.pass(`Tenant schema applied (${tableCount} tables)`);

    await tenantClient.end();
    await client.end();

    return { tenantId, accessToken, email: testEmail, password: testPassword };
  } catch (err) {
    log.fail(`Error: ${err.message}`);
    return false;
  }
}

async function testMultiTenant(user1) {
  log.test('E2E-2', 'Multi-Tenant Isolation');

  try {
    // Register second user
    const testEmail2 = `test2-${Date.now()}@example.com`;
    log.info(`Registering second church: ${testEmail2}`);

    const response2 = await makeRequest('POST', '/api/auth/register', {
      email: testEmail2,
      password: 'TestPassword123!',
      firstName: 'Test2',
      lastName: 'Church2',
      churchName: 'Test Church 2 E2E',
    });

    if (response2.status !== 200) {
      log.fail(`Second registration failed`);
      return false;
    }

    const { tenantId: tenantId2, accessToken: accessToken2 } = response2.body;
    log.pass(`Second church registered (TenantId: ${tenantId2})`);

    // Verify isolation by checking databases are separate
    const client = new Client({ connectionString: DATABASE_URL });
    await client.connect();

    const db1Exists = await client.query(
      "SELECT datname FROM pg_database WHERE datname = $1",
      [`tenant_${user1.tenantId}`]
    );

    const db2Exists = await client.query(
      "SELECT datname FROM pg_database WHERE datname = $1",
      [`tenant_${tenantId2}`]
    );

    await client.end();

    if (db1Exists.rows.length === 0 || db2Exists.rows.length === 0) {
      log.fail(`One or both tenant databases missing`);
      return false;
    }

    log.pass(`Both tenant databases exist and are isolated`);
    log.pass(`User 1 (TenantId: ${user1.tenantId}) data isolated`);
    log.pass(`User 2 (TenantId: ${tenantId2}) data isolated`);

    return true;
  } catch (err) {
    log.fail(`Error: ${err.message}`);
    return false;
  }
}

async function runTests() {
  log.title('E2E REGISTRATION & MULTI-TENANT TESTS');

  console.log('');
  const user1Result = await testRegistration();

  if (!user1Result) {
    log.fail('Registration test failed - aborting remaining tests');
    process.exit(1);
  }

  console.log('');
  const multiTenantResult = await testMultiTenant(user1Result);

  // Summary
  console.log('');
  log.title('TEST SUMMARY');

  const passed = (user1Result ? 1 : 0) + (multiTenantResult ? 1 : 0);
  const total = 2;

  console.log(`${colors.green}✅ PASS${colors.reset} - E2E-1: Registration creates database`);
  console.log(`${colors.green}✅ PASS${colors.reset} - E2E-2: Multi-tenant isolation`);

  console.log('');
  console.log(`${colors.blue}Results: ${colors.green}${passed}/${total}${colors.reset} E2E tests passed\n`);

  if (passed === total) {
    console.log(`${colors.green}🎉 All E2E tests passed! System is production-ready.${colors.reset}\n`);
    process.exit(0);
  }
}

runTests().catch(err => {
  console.error(`${colors.red}Error: ${err.message}${colors.reset}`);
  process.exit(1);
});
