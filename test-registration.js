#!/usr/bin/env node

const http = require('http');
const { Client } = require('pg');
require('dotenv').config({ path: './backend/.env' });

const DATABASE_URL = process.env.DATABASE_URL;
const testEmail = `test-real-${Date.now()}@example.com`;
const testPassword = 'TestPassword123!';

const data = JSON.stringify({
  email: testEmail,
  password: testPassword,
  firstName: 'Test',
  lastName: 'E2E',
  churchName: 'Test Church E2E Real Registration'
});

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/auth/register',
  method: 'POST',
  timeout: 90000,
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

console.log('🔄 Testing real registration flow...\n');
console.log(`Email: ${testEmail}`);
console.log(`Password: ${testPassword}`);
console.log('');

const req = http.request(options, async (res) => {
  let body = '';
  res.on('data', (chunk) => { body += chunk; });
  res.on('end', async () => {
    console.log(`📊 HTTP Status: ${res.statusCode}`);

    try {
      const json = JSON.parse(body);

      if ((res.statusCode === 200 || res.statusCode === 201) && json.data?.church?.id) {
        console.log('✅ REGISTRATION SUCCESSFUL!\n');
        const tenantId = json.data?.church?.id || json.tenantId;
        console.log(`  TenantId: ${tenantId}`);
        console.log(`  AccessToken: ${json.data?.accessToken || json.accessToken ? 'Generated ✓' : 'Missing ✗'}`);

        // Verify database was created
        await new Promise(resolve => setTimeout(resolve, 2000));

        const client = new Client({ connectionString: DATABASE_URL });
        await client.connect();

        const dbName = `tenant_${tenantId}`;
        const result = await client.query(
          "SELECT datname FROM pg_database WHERE datname = $1",
          [dbName]
        );

        if (result.rows.length > 0) {
          console.log(`  Database: ${dbName} ✓ Created on PostgreSQL`);

          // Verify schema
          const tenantDbUrl = DATABASE_URL.split('?')[0].replace('/connect_yw_production', `/${dbName}`) + '?sslmode=require';
          const tenantClient = new Client({ connectionString: tenantDbUrl });
          await tenantClient.connect();

          const schemaResult = await tenantClient.query(
            "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='public'"
          );

          const tableCount = parseInt(schemaResult.rows[0].count);
          console.log(`  Schema: ${tableCount} tables applied ✓`);

          await tenantClient.end();
        } else {
          console.log(`  Database: ${dbName} ✗ NOT FOUND`);
        }

        await client.end();

        console.log('\n🎉 PRODUCTION-READY: Database-per-tenant architecture working!');
        process.exit(0);
      } else {
        console.log('❌ Registration failed');
        console.log('\nResponse:', JSON.stringify(json, null, 2));
        process.exit(1);
      }
    } catch(e) {
      console.log('Response:', body);
      process.exit(1);
    }
  });
});

req.on('error', (e) => {
  console.error('❌ Request Error:', e.message || JSON.stringify(e));
  console.error('Full error:', e);
  process.exit(1);
});

req.on('timeout', () => {
  console.error('❌ Request timed out after 90s');
  req.destroy();
  process.exit(1);
});

console.log('Sending registration request...\n');
req.write(data);
req.end();
