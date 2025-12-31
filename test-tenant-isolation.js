/**
 * Test tenant isolation
 *
 * Verifies that two different accounts have:
 * 1. Different tenant IDs in their JWT tokens
 * 2. Different member lists
 * 3. No data leakage between tenants
 */

const baseURL = 'https://koinoniasms.com';

function decodeJWT(token) {
  const parts = token.split('.');
  if (parts.length !== 3) {
    throw new Error('Invalid JWT format');
  }
  const payload = Buffer.from(parts[1], 'base64').toString('utf-8');
  return JSON.parse(payload);
}

async function testTenantIsolation() {
  console.log('\n🚨 TENANT ISOLATION SECURITY TEST 🚨\n');

  try {
    // Test Account 1: mike@gmail.com
    console.log('=== ACCOUNT 1: mike@gmail.com ===\n');
    const login1Res = await fetch(`${baseURL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'mike@gmail.com',
        password: '12!Michael'
      })
    });

    if (!login1Res.ok) {
      throw new Error(`Account 1 login failed: ${login1Res.status}`);
    }

    const login1Data = await login1Res.json();
    const token1Payload = decodeJWT(login1Data.accessToken);

    console.log('Account 1 Details:');
    console.log(`  Email: mike@gmail.com`);
    console.log(`  Admin ID: ${login1Data.user.id}`);
    console.log(`  Tenant ID (churchId in JWT): ${token1Payload.churchId}`);
    console.log(`  Church Name: ${login1Data.church.name}`);

    // Get members for account 1
    const members1Res = await fetch(`${baseURL}/api/members?page=1&limit=10`, {
      headers: { 'Authorization': `Bearer ${login1Data.accessToken}` }
    });

    if (!members1Res.ok) {
      throw new Error(`Failed to get members for account 1: ${members1Res.status}`);
    }

    const members1Data = await members1Res.json();
    console.log(`  Member Count: ${members1Data.pagination.total}`);
    console.log(`  First 3 members: ${members1Data.data.slice(0, 3).map(m => `${m.firstName} ${m.lastName}`).join(', ')}`);

    // Test Account 2: ja@gmail.com
    console.log('\n=== ACCOUNT 2: ja@gmail.com ===\n');
    const login2Res = await fetch(`${baseURL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'ja@gmail.com',
        password: '12!Michael'
      })
    });

    if (!login2Res.ok) {
      throw new Error(`Account 2 login failed: ${login2Res.status}`);
    }

    const login2Data = await login2Res.json();
    const token2Payload = decodeJWT(login2Data.accessToken);

    console.log('Account 2 Details:');
    console.log(`  Email: ja@gmail.com`);
    console.log(`  Admin ID: ${login2Data.user.id}`);
    console.log(`  Tenant ID (churchId in JWT): ${token2Payload.churchId}`);
    console.log(`  Church Name: ${login2Data.church.name}`);

    // Get members for account 2
    const members2Res = await fetch(`${baseURL}/api/members?page=1&limit=10`, {
      headers: { 'Authorization': `Bearer ${login2Data.accessToken}` }
    });

    if (!members2Res.ok) {
      throw new Error(`Failed to get members for account 2: ${members2Res.status}`);
    }

    const members2Data = await members2Res.json();
    console.log(`  Member Count: ${members2Data.pagination.total}`);
    console.log(`  First 3 members: ${members2Data.data.slice(0, 3).map(m => `${m.firstName} ${m.lastName}`).join(', ')}`);

    // SECURITY ANALYSIS
    console.log('\n=== SECURITY ANALYSIS ===\n');

    // Check 1: Different Tenant IDs
    const tenantIdsDifferent = token1Payload.churchId !== token2Payload.churchId;
    console.log(`✓ Check 1: Different Tenant IDs?`);
    console.log(`  Account 1 Tenant: ${token1Payload.churchId}`);
    console.log(`  Account 2 Tenant: ${token2Payload.churchId}`);
    console.log(`  Result: ${tenantIdsDifferent ? '✅ PASS' : '🚨 FAIL - SAME TENANT ID!'}`);

    // Check 2: Different Admin IDs
    const adminIdsDifferent = login1Data.user.id !== login2Data.user.id;
    console.log(`\n✓ Check 2: Different Admin IDs?`);
    console.log(`  Account 1 Admin: ${login1Data.user.id}`);
    console.log(`  Account 2 Admin: ${login2Data.user.id}`);
    console.log(`  Result: ${adminIdsDifferent ? '✅ PASS' : '🚨 FAIL - SAME ADMIN ID!'}`);

    // Check 3: Different Member Lists
    const member1Ids = new Set(members1Data.data.map(m => m.id));
    const member2Ids = new Set(members2Data.data.map(m => m.id));
    const overlap = [...member1Ids].filter(id => member2Ids.has(id));

    console.log(`\n✓ Check 3: Isolated Member Data?`);
    console.log(`  Account 1 Members: ${members1Data.pagination.total}`);
    console.log(`  Account 2 Members: ${members2Data.pagination.total}`);
    console.log(`  Overlapping Member IDs: ${overlap.length}`);
    console.log(`  Result: ${overlap.length === 0 ? '✅ PASS' : '🚨 FAIL - DATA LEAKAGE!'}`);

    if (overlap.length > 0) {
      console.log(`  🚨 LEAKED MEMBER IDS: ${overlap.slice(0, 5).join(', ')}`);
    }

    // Check 4: Member counts match what user reported
    console.log(`\n✓ Check 4: Member Count Analysis`);
    console.log(`  Account 1 (mike@gmail.com): ${members1Data.pagination.total} members`);
    console.log(`  Account 2 (ja@gmail.com): ${members2Data.pagination.total} members`);
    console.log(`  User reported: ja@gmail.com saw 639 members from mike@gmail.com`);

    const memberCountsMatch = members1Data.pagination.total === members2Data.pagination.total;
    if (memberCountsMatch) {
      console.log(`  🚨 FAIL - BOTH ACCOUNTS HAVE SAME MEMBER COUNT!`);
    } else {
      console.log(`  ✅ PASS - Different member counts`);
    }

    // FINAL VERDICT
    console.log('\n=== FINAL VERDICT ===\n');
    if (!tenantIdsDifferent || overlap.length > 0 || memberCountsMatch) {
      console.log('🚨 CRITICAL SECURITY BREACH DETECTED!');
      console.log('   Tenant isolation is BROKEN');
      console.log('   Users can see other tenants\' data');
      console.log('   IMMEDIATE FIX REQUIRED\n');
      return false;
    } else {
      console.log('✅ TENANT ISOLATION WORKING CORRECTLY');
      console.log('   Each account has unique tenant ID');
      console.log('   No data leakage detected\n');
      return true;
    }

  } catch (error) {
    console.error('\n❌ TEST ERROR:', error.message);
    return false;
  }
}

// Run the test
testTenantIsolation()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
