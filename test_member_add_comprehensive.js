const https = require('https');

/**
 * Comprehensive Member Add Flow Test
 * This script:
 * 1. Creates a test church account (or uses existing if available)
 * 2. Creates a test branch
 * 3. Creates a test group
 * 4. Adds a test member
 * 5. Verifies the member appears in the list
 */

function makeRequest(method, path, body = null, authToken = null) {
  return new Promise((resolve) => {
    const startTime = Date.now();
    const options = {
      hostname: 'api.koinoniasms.com',
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (authToken) {
      options.headers['Authorization'] = `Bearer ${authToken}`;
    }

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const duration = Date.now() - startTime;
        try {
          resolve({
            status: res.statusCode,
            duration,
            body: JSON.parse(data),
            headers: res.headers
          });
        } catch {
          resolve({
            status: res.statusCode,
            duration,
            body: data,
            headers: res.headers
          });
        }
      });
    });

    req.on('error', (err) => {
      resolve({ error: err.message, duration: Date.now() - startTime });
    });

    req.setTimeout(10000, () => {
      req.abort();
      resolve({ error: 'timeout', duration: 10000 });
    });

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function testMemberAddFlow() {
  console.log('╔═══════════════════════════════════════════════════════════╗');
  console.log('║    Testing Add Member Flow - Comprehensive E2E Test       ║');
  console.log('║    Verifying fix from commit a1ff2d3                      ║');
  console.log('╚═══════════════════════════════════════════════════════════╝\n');

  let authToken = null;
  let churchId = null;
  let branchId = null;
  let groupId = null;

  const testTimestamp = Date.now();
  const testChurchName = `TestChurch_${testTimestamp}`;
  const testChurchEmail = `church_${testTimestamp}@test.example.com`;
  const testChurchPassword = 'TestPass@123456';

  // Step 1: Register a test church
  console.log('STEP 1: Register a test church account');
  console.log('─'.repeat(50));
  const registerRes = await makeRequest('POST', '/api/auth/register', {
    churchName: testChurchName,
    firstName: 'Test',
    lastName: 'Church',
    email: testChurchEmail,
    password: testChurchPassword,
    confirmPassword: testChurchPassword
  });

  if (registerRes.status !== 201 && registerRes.status !== 200) {
    console.log('❌ Registration failed');
    console.log('Status:', registerRes.status);
    console.log('Response:', JSON.stringify(registerRes.body, null, 2));
    return;
  }

  authToken = registerRes.body.data?.accessToken;
  churchId = registerRes.body.data?.church?.id;
  console.log('✅ Registration successful');
  console.log('   Church Name:', testChurchName);
  console.log('   Church ID:', churchId);
  console.log('   Response time:', registerRes.duration + 'ms\n');

  // Step 2: Create a test branch
  console.log('STEP 2: Create a test branch');
  console.log('─'.repeat(50));
  const branchRes = await makeRequest(
    'POST',
    `/api/branches/churches/${churchId}/branches`,
    {
      name: `TestBranch_${testTimestamp}`
    },
    authToken
  );

  if (branchRes.status !== 201 && branchRes.status !== 200) {
    console.log('❌ Failed to create branch');
    console.log('Status:', branchRes.status);
    console.log('Response:', JSON.stringify(branchRes.body, null, 2));
    return;
  }

  branchId = branchRes.body.data?.id || branchRes.body.id;
  console.log('✅ Branch created successfully');
  console.log('   Branch ID:', branchId);
  console.log('   Response time:', branchRes.duration + 'ms\n');

  // Step 3: Create a test group
  console.log('STEP 3: Create a test group');
  console.log('─'.repeat(50));
  const groupRes = await makeRequest(
    'POST',
    `/api/groups/branches/${branchId}/groups`,
    {
      name: `TestGroup_${testTimestamp}`
    },
    authToken
  );

  if (groupRes.status !== 201 && groupRes.status !== 200) {
    console.log('❌ Failed to create group');
    console.log('Status:', groupRes.status);
    console.log('Response:', JSON.stringify(groupRes.body, null, 2));
    return;
  }

  groupId = groupRes.body.data?.id || groupRes.body.id;
  console.log('✅ Group created successfully');
  console.log('   Group ID:', groupId);
  console.log('   Response time:', groupRes.duration + 'ms\n');

  // Step 4: Get initial member count
  console.log('STEP 4: Get initial members count (should be 0)');
  console.log('─'.repeat(50));
  const membersBefore = await makeRequest(
    'GET',
    `/api/groups/${groupId}/members?page=1&limit=50`,
    null,
    authToken
  );

  if (membersBefore.status !== 200) {
    console.log('❌ Failed to fetch members');
    console.log('Status:', membersBefore.status);
    console.log('Response:', JSON.stringify(membersBefore.body, null, 2));
    return;
  }

  const countBefore = membersBefore.body.pagination?.total || membersBefore.body.data?.length || 0;
  console.log('✅ Fetched initial member count');
  console.log('   Members before:', countBefore);
  console.log('   Response time:', membersBefore.duration + 'ms\n');

  // Step 5: Add first test member
  console.log('STEP 5: Add first test member');
  console.log('─'.repeat(50));
  const member1Name = `TestUser1_${testTimestamp}`;
  const member1Phone = '+12025551001';

  const addMember1Res = await makeRequest(
    'POST',
    `/api/groups/${groupId}/members`,
    {
      firstName: member1Name,
      lastName: 'Test',
      phone: member1Phone,
      email: `user1_${testTimestamp}@test.example.com`,
      optInSms: true
    },
    authToken
  );

  if (addMember1Res.error) {
    console.log('❌ Failed to add member 1 - Request error');
    console.log('   Error:', addMember1Res.error);
    console.log('   Duration:', addMember1Res.duration + 'ms\n');
    return;
  }

  if (addMember1Res.status === 201 || addMember1Res.status === 200) {
    console.log('✅ Member 1 added successfully');
    console.log('   Name:', member1Name);
    console.log('   Phone:', member1Phone);
    console.log('   Response time:', addMember1Res.duration + 'ms\n');
  } else {
    console.log('❌ Failed to add member 1');
    console.log('   Status:', addMember1Res.status);
    console.log('   Error:', addMember1Res.body?.error || JSON.stringify(addMember1Res.body));
    console.log('   Response time:', addMember1Res.duration + 'ms\n');
    return;
  }

  // Step 6: Add second test member
  console.log('STEP 6: Add second test member');
  console.log('─'.repeat(50));
  const member2Name = `TestUser2_${testTimestamp}`;
  const member2Phone = '+12025551002';

  const addMember2Res = await makeRequest(
    'POST',
    `/api/groups/${groupId}/members`,
    {
      firstName: member2Name,
      lastName: 'Test',
      phone: member2Phone,
      email: `user2_${testTimestamp}@test.example.com`,
      optInSms: true
    },
    authToken
  );

  if (addMember2Res.error) {
    console.log('❌ Failed to add member 2 - Request error');
    console.log('   Error:', addMember2Res.error);
    console.log('   Duration:', addMember2Res.duration + 'ms\n');
    return;
  }

  if (addMember2Res.status === 201 || addMember2Res.status === 200) {
    console.log('✅ Member 2 added successfully');
    console.log('   Name:', member2Name);
    console.log('   Phone:', member2Phone);
    console.log('   Response time:', addMember2Res.duration + 'ms\n');
  } else {
    console.log('❌ Failed to add member 2');
    console.log('   Status:', addMember2Res.status);
    console.log('   Error:', addMember2Res.body?.error || JSON.stringify(addMember2Res.body));
    console.log('   Response time:', addMember2Res.duration + 'ms\n');
    return;
  }

  // Step 7: Fetch members list immediately
  console.log('STEP 7: Fetch members list immediately after adding');
  console.log('─'.repeat(50));
  const membersImmediate = await makeRequest(
    'GET',
    `/api/groups/${groupId}/members?page=1&limit=50`,
    null,
    authToken
  );

  if (membersImmediate.status !== 200) {
    console.log('❌ Failed to fetch members');
    console.log('Status:', membersImmediate.status);
    console.log('Response:', JSON.stringify(membersImmediate.body, null, 2));
    return;
  }

  const countImmediate = membersImmediate.body.pagination?.total || membersImmediate.body.data?.length || 0;
  const memberNamesImmediate = (membersImmediate.body.data || []).map(m => `${m.firstName} ${m.lastName}`);

  console.log('✅ Members fetched immediately after adding');
  console.log('   Total members:', countImmediate);
  console.log('   Member names:');
  memberNamesImmediate.forEach((name, idx) => {
    console.log(`     ${idx + 1}. ${name}`);
  });
  console.log('   Response time:', membersImmediate.duration + 'ms\n');

  // Step 8: Verification - Check if members appear
  console.log('STEP 8: Verification - Did added members appear in the list?');
  console.log('─'.repeat(50));

  const member1Found = memberNamesImmediate.some(name => name.includes(member1Name));
  const member2Found = memberNamesImmediate.some(name => name.includes(member2Name));

  if (member1Found && member2Found) {
    console.log('✅ SUCCESS: Both members ARE visible in the members list!');
    console.log('   Member 1 found:', member1Found);
    console.log('   Member 2 found:', member2Found);
    console.log('   Count before:', countBefore);
    console.log('   Count after:', countImmediate);
    console.log('   Members added:', countImmediate - countBefore);
  } else {
    console.log('❌ FAILURE: Members are NOT visible in the members list');
    console.log('   Member 1 found:', member1Found);
    console.log('   Member 2 found:', member2Found);
    console.log('   Count before:', countBefore);
    console.log('   Count after:', countImmediate);
    console.log('\n   This indicates the fix from commit a1ff2d3 is NOT working');
    console.log('   The loadMembers function is not refetching fresh data\n');
  }

  // Summary
  console.log('\n╔═══════════════════════════════════════════════════════════╗');
  console.log('║                    TEST SUMMARY                           ║');
  console.log('╚═══════════════════════════════════════════════════════════╝');
  console.log(`Registration: ✅ Successful`);
  console.log(`Branch creation: ✅ Successful`);
  console.log(`Group creation: ✅ Successful`);
  console.log(`Member 1 add: ✅ Successful`);
  console.log(`Member 2 add: ✅ Successful`);
  console.log(`Members visible: ${(member1Found && member2Found) ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`\nCONCLUSION: ${(member1Found && member2Found) ? '✅ Fix is WORKING!' : '❌ Fix is NOT WORKING'}`);
  console.log('');
}

testMemberAddFlow().catch(console.error);
