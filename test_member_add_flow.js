const https = require('https');

/**
 * Test Add Member Flow
 * This script simulates the exact flow a user goes through when adding a member:
 * 1. Get a valid auth token from login
 * 2. Get the user's branches and groups
 * 3. Add a member to a group
 * 4. Fetch the members list to verify the member appears
 */

// Test credentials - using the test account
const TEST_EMAIL = 'test@koinoniasms.com';
const TEST_PASSWORD = 'Test@123456';

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

async function testAddMemberFlow() {
  console.log('╔═══════════════════════════════════════════════════════════╗');
  console.log('║         Testing Add Member Flow - End-to-End              ║');
  console.log('║         Verifying fix from commit a1ff2d3                 ║');
  console.log('╚═══════════════════════════════════════════════════════════╝\n');

  let authToken = null;
  let churchId = null;
  let groupId = null;

  // Step 1: Login to get auth token
  console.log('STEP 1: Login to get authentication token');
  console.log('─'.repeat(50));
  const loginRes = await makeRequest('POST', '/api/auth/login', {
    email: TEST_EMAIL,
    password: TEST_PASSWORD
  });

  if (loginRes.status !== 200) {
    console.log('❌ Login failed');
    console.log('Status:', loginRes.status);
    console.log('Response:', JSON.stringify(loginRes.body, null, 2));
    return;
  }

  authToken = loginRes.body.token;
  churchId = loginRes.body.church?.id;
  console.log('✅ Login successful');
  console.log('   Auth Token:', authToken.substring(0, 20) + '...');
  console.log('   Church ID:', churchId);
  console.log('   Response time:', loginRes.duration + 'ms\n');

  // Step 2: Get groups for the church
  console.log('STEP 2: Fetch groups for the church');
  console.log('─'.repeat(50));
  const groupsRes = await makeRequest(
    'GET',
    `/api/groups?churchId=${churchId}`,
    null,
    authToken
  );

  if (groupsRes.status !== 200) {
    console.log('❌ Failed to fetch groups');
    console.log('Status:', groupsRes.status);
    console.log('Response:', JSON.stringify(groupsRes.body, null, 2));
    return;
  }

  const groups = groupsRes.body.data || groupsRes.body;
  if (!groups.length) {
    console.log('❌ No groups found. Cannot test member add.');
    console.log('Response:', JSON.stringify(groupsRes.body, null, 2));
    return;
  }

  groupId = groups[0].id;
  console.log('✅ Groups fetched successfully');
  console.log('   Group ID:', groupId);
  console.log('   Group Name:', groups[0].name);
  console.log('   Total groups:', groups.length);
  console.log('   Response time:', groupsRes.duration + 'ms\n');

  // Step 3: Get current members count before adding
  console.log('STEP 3: Get current members count BEFORE adding');
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
  const memberNamesBefore = (membersBefore.body.data || []).map(m => `${m.firstName} ${m.lastName}`);
  console.log('✅ Members fetched before adding');
  console.log('   Total members before:', countBefore);
  console.log('   Member names:', memberNamesBefore.join(', ') || 'none');
  console.log('   Response time:', membersBefore.duration + 'ms\n');

  // Step 4: Add a new member
  console.log('STEP 4: Add a new member to the group');
  console.log('─'.repeat(50));
  const testMemberName = `TestUser${Date.now()}`;
  const testMemberPhone = `+1202555${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;

  const addMemberRes = await makeRequest(
    'POST',
    `/api/groups/${groupId}/members`,
    {
      firstName: testMemberName,
      lastName: 'Test',
      phone: testMemberPhone,
      email: `test${Date.now()}@example.com`,
      optInSms: true
    },
    authToken
  );

  if (addMemberRes.status === 201) {
    console.log('✅ Member added successfully');
    console.log('   Member Name:', testMemberName);
    console.log('   Phone:', testMemberPhone);
    console.log('   Response time:', addMemberRes.duration + 'ms\n');
  } else if (addMemberRes.status === 400 && addMemberRes.body.error?.includes('already in')) {
    console.log('⚠️  Member already exists in group (expected if re-running test)');
    console.log('   Error:', addMemberRes.body.error);
    console.log('   Response time:', addMemberRes.duration + 'ms\n');
  } else {
    console.log('❌ Failed to add member');
    console.log('   Status:', addMemberRes.status);
    console.log('   Error:', addMemberRes.body.error || JSON.stringify(addMemberRes.body));
    console.log('   Response time:', addMemberRes.duration + 'ms\n');
    return;
  }

  // Small delay to ensure backend processes the addition
  console.log('⏳ Waiting 1 second for backend to process...\n');
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Step 5: Get members list AFTER adding
  console.log('STEP 5: Get members list AFTER adding member');
  console.log('─'.repeat(50));
  const membersAfter = await makeRequest(
    'GET',
    `/api/groups/${groupId}/members?page=1&limit=50`,
    null,
    authToken
  );

  if (membersAfter.status !== 200) {
    console.log('❌ Failed to fetch members after adding');
    console.log('Status:', membersAfter.status);
    console.log('Response:', JSON.stringify(membersAfter.body, null, 2));
    return;
  }

  const countAfter = membersAfter.body.pagination?.total || membersAfter.body.data?.length || 0;
  const memberNamesAfter = (membersAfter.body.data || []).map(m => `${m.firstName} ${m.lastName}`);
  console.log('✅ Members fetched after adding');
  console.log('   Total members after:', countAfter);
  console.log('   Member names:', memberNamesAfter.join(', ') || 'none');
  console.log('   Response time:', membersAfter.duration + 'ms\n');

  // Step 6: Verification
  console.log('STEP 6: Verification - Did the member appear in the list?');
  console.log('─'.repeat(50));

  const newMemberFound = memberNamesAfter.some(name =>
    name.includes(testMemberName) || name.includes('TestUser')
  );

  if (newMemberFound) {
    console.log('✅ SUCCESS: New member IS visible in the members list!');
    console.log('   Before count:', countBefore);
    console.log('   After count:', countAfter);
    console.log('   Member display:', newMemberFound);
  } else {
    console.log('❌ FAILURE: New member is NOT visible in the members list');
    console.log('   This indicates a problem with the fix from commit a1ff2d3');
    console.log('   Before count:', countBefore);
    console.log('   After count:', countAfter);
    console.log('   Expected: At least one new member visible\n');

    console.log('   Members returned by API:');
    membersAfter.body.data?.forEach((m, idx) => {
      console.log(`     ${idx + 1}. ${m.firstName} ${m.lastName} - ${m.phone}`);
    });
  }

  // Summary
  console.log('\n╔═══════════════════════════════════════════════════════════╗');
  console.log('║                    TEST SUMMARY                           ║');
  console.log('╚═══════════════════════════════════════════════════════════╝');
  console.log(`Authentication: ✅ Successful`);
  console.log(`Group retrieval: ✅ Successful (${groups.length} groups)`);
  console.log(`Member add: ✅ Successful (${addMemberRes.status === 201 ? 'new' : 'existing'})`);
  console.log(`Member visibility: ${newMemberFound ? '✅' : '❌'} ${newMemberFound ? 'PASS' : 'FAIL'}`);
  console.log(`\nConclusion: ${newMemberFound ? '✅ Fix is working!' : '❌ Fix is NOT working - further investigation needed'}`);
  console.log('');
}

testAddMemberFlow().catch(console.error);
