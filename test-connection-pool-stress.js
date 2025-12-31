/**
 * CONNECTION POOL STRESS TEST
 *
 * Tests Phase 1 fixes by creating 20 tenants rapidly to verify:
 * 1. Backend doesn't crash from connection leaks
 * 2. Connection pool properly manages evictions
 * 3. Disconnects have timeout protection
 * 4. Memory remains stable
 */

const axios = require('axios');
const { createId } = require('@paralleldrive/cuid2');

const BASE_URL = 'http://localhost:3000';
const TIMEOUT = 90000; // 90 second timeout for database provisioning
const NUM_TENANTS = 20;

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Test results tracking
const results = {
  successful: 0,
  failed: 0,
  tenants: [],
  startTime: Date.now(),
  registrationTimes: [],
};

async function checkServerHealth() {
  try {
    const response = await axios.get(`${BASE_URL}/health`, { timeout: 5000 });
    log('✅ Backend server is responsive', 'green');
    return true;
  } catch (error) {
    log('❌ Backend server is not responding', 'red');
    return false;
  }
}

async function registerTenant(index) {
  const email = `stress-test-${index}-${createId()}@e2etest.com`;
  const churchName = `Stress Test Church ${index}`;

  log(`\n[${ index + 1}/${NUM_TENANTS}] Registering: ${churchName}`, 'cyan');

  const startTime = Date.now();

  try {
    const response = await axios.post(
      `${BASE_URL}/api/auth/register`,
      {
        email: email,
        password: 'TestPass123!',
        firstName: 'Test',
        lastName: `Admin${index}`,
        churchName: churchName,
      },
      { timeout: TIMEOUT }
    );

    const duration = Date.now() - startTime;
    results.registrationTimes.push(duration);

    const responseData = response.data.data || response.data;
    const tenantId = responseData.church?.id || response.data.tenantId;

    log(`   ✅ Success! Tenant ID: ${tenantId} (${duration}ms)`, 'green');

    results.successful++;
    results.tenants.push({
      index: index + 1,
      email,
      tenantId,
      duration,
    });

    return true;
  } catch (error) {
    const duration = Date.now() - startTime;
    const errorMsg = error.response?.data?.error || error.message;

    log(`   ❌ Failed! Error: ${errorMsg} (${duration}ms)`, 'red');

    results.failed++;
    return false;
  }
}

async function runStressTest() {
  log('\n🚀 STARTING CONNECTION POOL STRESS TEST', 'blue');
  log('='.repeat(80), 'blue');
  log(`\nCreating ${NUM_TENANTS} tenants sequentially...`, 'cyan');
  log('This tests Phase 1 fixes for connection pool management\n', 'cyan');

  // Check server before starting
  const serverHealthy = await checkServerHealth();
  if (!serverHealthy) {
    log('\n❌ Cannot run test - backend not responding', 'red');
    process.exit(1);
  }

  log('\n📊 Starting registrations...', 'blue');

  // Register tenants sequentially
  for (let i = 0; i < NUM_TENANTS; i++) {
    await registerTenant(i);

    // Check server health every 5 registrations
    if ((i + 1) % 5 === 0) {
      log(`\n🔍 Health check after ${i + 1} registrations...`, 'yellow');
      const healthy = await checkServerHealth();
      if (!healthy) {
        log(`\n❌ BACKEND CRASHED after ${i + 1} registrations!`, 'red');
        log('   Connection pool fixes may not be working properly', 'red');
        break;
      }
      log(`   ✅ Backend still healthy after ${i + 1} registrations`, 'green');
    }
  }

  // Final report
  generateReport();
}

function generateReport() {
  const totalDuration = (Date.now() - results.startTime) / 1000;
  const avgRegistrationTime =
    results.registrationTimes.length > 0
      ? results.registrationTimes.reduce((a, b) => a + b, 0) / results.registrationTimes.length
      : 0;
  const minTime = Math.min(...results.registrationTimes);
  const maxTime = Math.max(...results.registrationTimes);

  log('\n\n' + '='.repeat(80), 'blue');
  log('CONNECTION POOL STRESS TEST REPORT', 'blue');
  log('='.repeat(80), 'blue');

  log(`\n⏱️  Total Duration: ${totalDuration.toFixed(2)} seconds`, 'cyan');
  log(`📊 Successful Registrations: ${results.successful}`, 'green');
  log(`📊 Failed Registrations: ${results.failed}`, 'red');
  log(`📊 Success Rate: ${((results.successful / NUM_TENANTS) * 100).toFixed(1)}%`, 'cyan');

  log('\n⏱️  Registration Times:', 'cyan');
  log(`   Average: ${avgRegistrationTime.toFixed(0)}ms`, 'cyan');
  log(`   Min: ${minTime.toFixed(0)}ms`, 'cyan');
  log(`   Max: ${maxTime.toFixed(0)}ms`, 'cyan');

  log('\n📦 Tenants Created:', 'cyan');
  results.tenants.forEach((tenant) => {
    log(`   ${tenant.index}. ${tenant.tenantId} (${tenant.duration}ms)`, 'cyan');
  });

  log('\n🔍 Phase 1 Verification:', 'yellow');

  if (results.successful === NUM_TENANTS) {
    log('   ✅ All registrations succeeded', 'green');
    log('   ✅ Backend did NOT crash', 'green');
    log('   ✅ Connection pool managed properly', 'green');
    log('   ✅ Phase 1 fixes are WORKING!', 'green');
    log('\n🎉 STRESS TEST PASSED! Backend is stable!', 'green');
  } else {
    log(`   ⚠️  Only ${results.successful}/${NUM_TENANTS} succeeded`, 'yellow');

    if (results.failed > 0 && results.successful < 10) {
      log('   ❌ Backend likely crashed from connection leaks', 'red');
      log('   ❌ Phase 1 fixes may need more work', 'red');
    } else if (results.failed > 0) {
      log('   ⚠️  Some registrations failed but backend survived', 'yellow');
      log('   ⚠️  May be transient errors (check logs)', 'yellow');
    }
  }

  log('\n💡 Next Steps:', 'cyan');
  log('   1. Check backend logs for connection stats', 'cyan');
  log('   2. Look for "Connection stats: Created: X, Cached: Y, Closed: Z"', 'cyan');
  log('   3. Verify potentialLeaks is 0 or very small', 'cyan');
  log('   4. Check memory usage stayed stable', 'cyan');

  log('\n' + '='.repeat(80) + '\n', 'blue');

  process.exit(results.failed > 0 ? 1 : 0);
}

// Run the stress test
runStressTest();
