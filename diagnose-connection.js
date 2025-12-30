#!/usr/bin/env node

const { Client } = require('pg');
require('dotenv').config({ path: './backend/.env' });

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://connect_yw_user:RkFG9qz5nL5wF22BuKEYngvLhsHVyfgP@dpg-d41af09r0fns73c9i010-a.oregon-postgres.render.com/connect_yw_production';

console.log('\n=== PostgreSQL Connection Diagnostics ===\n');

// Parse the connection string
const url = new URL(DATABASE_URL);
console.log('Connection Details:');
console.log(`  Host: ${url.hostname}`);
console.log(`  Port: ${url.port || 5432}`);
console.log(`  Database: ${url.pathname.replace('/', '')}`);
console.log(`  User: ${url.username}`);
console.log('');

// Try connection with extended timeout
const client = new Client({ 
  connectionString: DATABASE_URL,
  connectionTimeoutMillis: 10000, // 10 second timeout
  statement_timeout: 5000 // 5 second statement timeout
});

console.log('Attempting to connect...');
console.log('(This will wait up to 10 seconds)\n');

client.connect((err) => {
  if (err) {
    console.log(`❌ CONNECTION FAILED\n`);
    console.log(`Error Type: ${err.code}`);
    console.log(`Error Message: ${err.message}`);
    console.log(`Error Details: ${JSON.stringify(err, null, 2)}\n`);
    
    // Diagnose the specific error
    if (err.code === 'ECONNREFUSED') {
      console.log('DIAGNOSIS: Connection refused - PostgreSQL is not listening on this port');
      console.log('POSSIBLE CAUSES:');
      console.log('  - PostgreSQL instance is stopped');
      console.log('  - PostgreSQL crashed');
      console.log('  - Wrong host/port');
    } else if (err.code === 'ECONNRESET') {
      console.log('DIAGNOSIS: Connection reset - server actively closed the connection');
      console.log('POSSIBLE CAUSES:');
      console.log('  - Render instance is suspended (free tier auto-suspend)');
      console.log('  - Server is overloaded/crashing');
      console.log('  - Firewall blocking connection');
      console.log('  - Render having network issues');
    } else if (err.code === 'ETIMEDOUT') {
      console.log('DIAGNOSIS: Connection timed out - no response from server');
      console.log('POSSIBLE CAUSES:');
      console.log('  - Network unreachable');
      console.log('  - Firewall blocking port 5432');
      console.log('  - DNS not resolving hostname');
    } else if (err.code === 'ENOTFOUND') {
      console.log('DIAGNOSIS: DNS lookup failed');
      console.log('POSSIBLE CAUSES:');
      console.log('  - Invalid hostname');
      console.log('  - Network DNS issue');
    }
    
    console.log('\n📋 RECOMMENDED ACTIONS:');
    console.log('1. Go to https://dashboard.render.com');
    console.log('2. Click your PostgreSQL instance (dpg-d41af09r0fns73c9i010-a)');
    console.log('3. Check the Status tab - should say "Available"');
    console.log('4. If it says "Suspended", click Resume to restart it');
    console.log('5. Check the Logs tab for any error messages');
    console.log('6. If all looks good, try connecting again in 1-2 minutes\n');
    
    process.exit(1);
  } else {
    console.log('✅ CONNECTION SUCCESSFUL!\n');
    
    // Now test the important permissions
    console.log('Testing CREATE DATABASE permission...');
    const testDbName = `test_db_${Date.now()}`;
    
    client.query(`CREATE DATABASE "${testDbName}"`, (createErr) => {
      if (createErr) {
        console.log(`❌ CREATE DATABASE failed: ${createErr.message}\n`);
        client.end();
        process.exit(1);
      }
      
      console.log(`✅ CREATE DATABASE works\n`);
      
      // Clean up
      client.query(`DROP DATABASE "${testDbName}"`, (dropErr) => {
        if (dropErr) {
          console.log(`⚠️ Warning: Could not clean up test database: ${dropErr.message}`);
        } else {
          console.log(`✅ Cleanup successful\n`);
        }
        
        console.log('================================');
        console.log('✅ ALL TESTS PASSED');
        console.log('================================\n');
        console.log('Your Render PostgreSQL is ready for multi-tenant setup!');
        console.log('You can now run: bash RUN_REAL_TESTS.sh\n');
        
        client.end();
        process.exit(0);
      });
    });
  }
});
