#!/usr/bin/env node

const { Client } = require('pg');
const { exec } = require('child_process');
const { promisify } = require('util');
const path = require('path');

const execAsync = promisify(exec);
require('dotenv').config({ path: './backend/.env' });

const DATABASE_URL = process.env.DATABASE_URL;
const BACKEND_PORT = 5000;

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

const log = {
  title: (text) => console.log(`${colors.blue}==============================\n${text}\n==============================${colors.reset}\n`),
  phase: (text) => console.log(`${colors.yellow}[${text}]${colors.reset}`),
  pass: (text) => console.log(`${colors.green}✅ PASS${colors.reset} - ${text}`),
  fail: (text) => console.log(`${colors.red}❌ FAIL${colors.reset} - ${text}`),
  error: (text) => console.error(`${colors.red}❌ ERROR${colors.reset}: ${text}`),
  info: (text) => console.log(`ℹ️  ${text}`),
};

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function testDatabaseConnection() {
  log.phase('PHASE 1: Database Connection Test');
  
  if (!DATABASE_URL) {
    log.fail('DATABASE_URL not set in environment');
    return false;
  }
  
  const client = new Client({ connectionString: DATABASE_URL });
  
  try {
    await client.connect();
    log.pass('Connected to PostgreSQL');
    
    // Test query
    await client.query('SELECT 1');
    log.pass('Query execution works');
    
    // Test CREATE DATABASE
    const testDbName = `test_db_${Date.now()}`;
    try {
      await client.query(`CREATE DATABASE "${testDbName}"`);
      log.pass('CREATE DATABASE permission verified');
      
      // Cleanup
      await client.query(`DROP DATABASE "${testDbName}"`);
      log.pass('Database cleanup works');
    } catch (createErr) {
      log.fail(`CREATE DATABASE permission denied: ${createErr.message}`);
      return false;
    }
    
    return true;
  } catch (err) {
    log.fail(`Database connection: ${err.message}`);
    return false;
  } finally {
    await client.end();
  }
}

async function testSchemaPresence() {
  log.phase('PHASE 2: Registry Schema Verification');
  
  const client = new Client({ connectionString: DATABASE_URL });
  
  try {
    await client.connect();
    
    const result = await client.query(
      "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='public'"
    );
    
    const tableCount = parseInt(result.rows[0].count);
    
    if (tableCount < 5) {
      log.fail(`Expected at least 5 tables, found ${tableCount}`);
      return false;
    }
    
    log.pass(`Schema present with ${tableCount} tables`);
    return true;
  } catch (err) {
    log.fail(`Schema check: ${err.message}`);
    return false;
  } finally {
    await client.end();
  }
}

async function buildBackend() {
  log.phase('PHASE 3: Building Backend');
  
  try {
    const { stdout, stderr } = await execAsync('npm run build', { 
      cwd: './backend',
      timeout: 120000 
    });
    log.pass('Backend build successful');
    return true;
  } catch (err) {
    log.fail(`Build failed: ${err.message.split('\n')[0]}`);
    return false;
  }
}

async function testBackendStarts() {
  log.phase('PHASE 4: Backend Startup Test');
  
  try {
    // Start backend
    const proc = exec('npm run dev', { 
      cwd: './backend',
      env: { ...process.env, DATABASE_URL }
    });
    
    let output = '';
    proc.stdout.on('data', (data) => {
      output += data.toString();
    });
    
    // Wait for server to start
    await sleep(5000);
    
    // Check if process is still running
    if (proc.killed) {
      log.fail('Backend crashed during startup');
      return false;
    }
    
    log.pass('Backend started successfully');
    
    // Kill the process
    proc.kill();
    await sleep(1000);
    
    return true;
  } catch (err) {
    log.fail(`Backend startup: ${err.message}`);
    return false;
  }
}

async function runTests() {
  log.title('KOINONIA MULTI-TENANT E2E TESTS');
  
  const tests = [
    { name: 'Database Connection', fn: testDatabaseConnection },
    { name: 'Schema Verification', fn: testSchemaPresence },
    { name: 'Backend Build', fn: buildBackend },
    { name: 'Backend Startup', fn: testBackendStarts },
  ];
  
  const results = [];
  
  for (const test of tests) {
    console.log('');
    try {
      const passed = await test.fn();
      results.push({ name: test.name, passed });
    } catch (err) {
      log.error(`${test.name}: ${err.message}`);
      results.push({ name: test.name, passed: false });
    }
  }
  
  // Summary
  console.log('');
  log.title('TEST SUMMARY');
  
  const passed = results.filter(r => r.passed).length;
  const total = results.length;
  
  results.forEach(r => {
    if (r.passed) {
      log.pass(r.name);
    } else {
      log.fail(r.name);
    }
  });
  
  console.log('');
  console.log(`${colors.blue}Results: ${colors.green}${passed}/${total}${colors.reset} tests passed\n`);
  
  if (passed === total) {
    log.info('All tests passed! System is ready for production testing.');
    process.exit(0);
  } else {
    log.error(`${total - passed} test(s) failed`);
    process.exit(1);
  }
}

runTests().catch(err => {
  log.error(err.message);
  process.exit(1);
});
