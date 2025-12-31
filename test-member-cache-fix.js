/**
 * Test member persistence after cache fix
 *
 * This test verifies that the evictTenantClient() fix properly awaits
 * disconnect, preventing the race condition where members disappear on reload.
 */

const baseURL = 'https://koinoniasms.com';
const testEmail = 'mike@gmail.com';
const testPassword = '12!Michael';

async function testMemberCacheFix() {
  console.log('\n=== MEMBER CACHE FIX TEST ===\n');

  let accessToken;
  let tenantId;

  try {
    // Step 1: Login
    console.log('Step 1: Logging in...');
    const loginRes = await fetch(`${baseURL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail, password: testPassword })
    });

    if (!loginRes.ok) {
      throw new Error(`Login failed: ${loginRes.status}`);
    }

    const loginData = await loginRes.json();
    accessToken = loginData.accessToken;
    tenantId = loginData.user.tenantId;
    console.log(`✅ Login successful (Tenant: ${tenantId})`);

    // Step 2: Get member count before
    console.log('\nStep 2: Getting member count before...');
    const beforeRes = await fetch(`${baseURL}/api/members?page=1&limit=100`, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });

    if (!beforeRes.ok) {
      throw new Error(`Failed to get members: ${beforeRes.status}`);
    }

    const beforeData = await beforeRes.json();
    const countBefore = beforeData.pagination.total;
    console.log(`✅ Members before: ${countBefore}`);

    // Step 3: Add a new member
    console.log('\nStep 3: Adding new member...');
    const timestamp = Date.now();
    const newMember = {
      firstName: 'CacheTest',
      lastName: `User${timestamp}`,
      phone: `+1${Math.floor(Math.random() * 9000000000 + 1000000000)}`,
      email: `cachetest${timestamp}@test.com`,
      optInSms: true
    };

    const addRes = await fetch(`${baseURL}/api/members`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(newMember)
    });

    if (!addRes.ok) {
      const errorData = await addRes.json();
      throw new Error(`Failed to add member: ${addRes.status} - ${JSON.stringify(errorData)}`);
    }

    const addedMember = await addRes.json();
    console.log(`✅ Member added: ${addedMember.firstName} ${addedMember.lastName} (ID: ${addedMember.id})`);

    // Step 4: IMMEDIATELY fetch members again (this is where the bug occurred)
    console.log('\nStep 4: Fetching members IMMEDIATELY after add...');
    console.log('   (This tests if cache eviction properly awaited disconnect)');

    const afterRes = await fetch(`${baseURL}/api/members?page=1&limit=100`, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });

    if (!afterRes.ok) {
      throw new Error(`Failed to get members after add: ${afterRes.status}`);
    }

    const afterData = await afterRes.json();
    const countAfter = afterData.pagination.total;
    const foundMember = afterData.data.find(m => m.id === addedMember.id);

    console.log(`✅ Members after: ${countAfter}`);
    console.log(`   Expected count: ${countBefore + 1}`);
    console.log(`   Member found in list: ${foundMember ? 'YES' : 'NO'}`);

    // Step 5: Verify the fix
    console.log('\n=== TEST RESULT ===');
    if (countAfter === countBefore + 1 && foundMember) {
      console.log('✅ CACHE FIX VERIFIED!');
      console.log('   - Member count increased correctly');
      console.log('   - Member appears in list immediately');
      console.log('   - No cache race condition detected');
      return true;
    } else {
      console.log('❌ CACHE ISSUE STILL EXISTS!');
      console.log(`   - Expected count: ${countBefore + 1}, Got: ${countAfter}`);
      console.log(`   - Member in list: ${foundMember ? 'YES' : 'NO'}`);
      return false;
    }

  } catch (error) {
    console.error('\n❌ TEST ERROR:', error.message);
    return false;
  }
}

// Run the test
testMemberCacheFix()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
