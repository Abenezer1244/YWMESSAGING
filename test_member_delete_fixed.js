const https = require('https');

const BASE_URL = 'https://api.koinoniasms.com';

async function makeRequest(method, path, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    const url = new URL(path, BASE_URL);

    const options = {
      hostname: url.hostname,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    if (body) {
      const bodyStr = JSON.stringify(body);
      options.headers['Content-Length'] = Buffer.byteLength(bodyStr);
    }

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        const elapsed = Date.now() - startTime;
        try {
          const parsed = JSON.parse(data);
          resolve({
            status: res.statusCode,
            time: elapsed,
            data: parsed,
            success: res.statusCode >= 200 && res.statusCode < 300,
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            time: elapsed,
            data: data,
            success: false,
            parseError: true,
          });
        }
      });
    });

    req.on('timeout', () => {
      req.abort();
      reject({ error: 'Request timeout', time: Date.now() - startTime });
    });

    req.on('error', (err) => {
      reject({ error: err.message, time: Date.now() - startTime });
    });

    if (body) {
      req.write(JSON.stringify(body));
    }

    req.end();
  });
}

async function test() {
  console.log('🎯 MEMBER DELETE TEST - Verify 403 Fix\n');

  try {
    // 1. Register
    console.log('1️⃣ Registering test user...');
    const email = `testuser${Date.now()}@test.com`;
    const registerResp = await makeRequest('POST', '/api/auth/register', {
      email,
      password: 'Test123!@',
      firstName: 'Test',
      lastName: 'User',
      churchName: 'Test Church',
    });

    if (!registerResp.success) {
      console.log('❌ Register failed:', registerResp.data);
      return;
    }

    const token = registerResp.data?.data?.accessToken;
    const churchId = registerResp.data?.data?.church?.id;
    console.log(`✅ Registered in ${registerResp.time}ms\n`);

    // 2. Create branch
    console.log('2️⃣ Creating branch...');
    const branchResp = await makeRequest('POST', `/api/branches/churches/${churchId}/branches`, {
      name: 'Test Branch',
    }, token);

    if (!branchResp.success) {
      console.log('❌ Branch failed:', branchResp.data);
      return;
    }

    const branchId = branchResp.data?.data?.id;
    console.log(`✅ Branch created in ${branchResp.time}ms\n`);

    // 3. Create group
    console.log('3️⃣ Creating group...');
    const groupResp = await makeRequest('POST', `/api/groups/branches/${branchId}/groups`, {
      name: 'Test Group',
    }, token);

    if (!groupResp.success) {
      console.log('❌ Group failed:', groupResp.data);
      return;
    }

    const groupId = groupResp.data?.data?.id;
    console.log(`✅ Group created in ${groupResp.time}ms\n`);

    // 4. Add multiple members
    console.log('4️⃣ Adding 3 members...');
    const memberIds = [];
    const members = [
      { firstName: 'John', lastName: 'Doe', phone: '2061233212' },
      { firstName: 'Jane', lastName: 'Smith', phone: '2065554433' },
      { firstName: 'Bob', lastName: 'Johnson', phone: '2065556666' },
    ];

    for (const member of members) {
      const addResp = await makeRequest('POST', `/api/groups/${groupId}/members`, {
        firstName: member.firstName,
        lastName: member.lastName,
        phone: member.phone,
      }, token);

      if (!addResp.success) {
        console.log(`❌ Failed to add ${member.firstName}:`, addResp.data);
        return;
      }

      const memberId = addResp.data?.data?.id;
      memberIds.push(memberId);
      console.log(`   ✅ ${member.firstName} added: ${memberId}`);
    }

    console.log();

    // 5. List members before delete
    console.log('5️⃣ Listing members (before delete)...');
    let membersResp = await makeRequest('GET', `/api/groups/${groupId}/members`, null, token);
    if (!membersResp.success) {
      console.log('❌ Get members failed:', membersResp.data);
      return;
    }
    const countBefore = membersResp.data?.data?.length || 0;
    console.log(`✅ Members count: ${countBefore}\n`);

    // 6. Delete first member
    console.log('6️⃣ Deleting member (testing 403 fix)...');
    const deleteResp = await makeRequest(
      'DELETE',
      `/api/groups/${groupId}/members/${memberIds[0]}`,
      null,
      token
    );

    if (!deleteResp.success) {
      console.log(`❌ DELETE FAILED with status ${deleteResp.status}:`);
      console.log(`   Error: ${deleteResp.data?.error || deleteResp.data}`);
      console.log(`   This means the 403 fix didn't work`);
      return;
    }

    console.log(`✅ Member deleted successfully in ${deleteResp.time}ms\n`);

    // 7. List members after delete
    console.log('7️⃣ Listing members (after delete)...');
    membersResp = await makeRequest('GET', `/api/groups/${groupId}/members`, null, token);
    if (!membersResp.success) {
      console.log('❌ Get members failed:', membersResp.data);
      return;
    }
    const countAfter = membersResp.data?.data?.length || 0;
    console.log(`✅ Members count: ${countAfter}\n`);

    // 8. Summary
    console.log('📊 RESULTS:\n');
    console.log(`   Members before delete: ${countBefore}`);
    console.log(`   Members after delete: ${countAfter}`);
    console.log(`   ✅ Delete successful: ${countAfter === countBefore - 1 ? 'YES' : 'NO'}`);
    console.log(`   ✅ 403 error fixed: YES ✓\n`);

    if (countAfter === countBefore - 1) {
      console.log('🎉 SUCCESS! Member delete is now working correctly!\n');
    }

  } catch (err) {
    console.log('💥 FATAL ERROR:', err);
  }
}

test();
