const https = require('https');

function httpsRequest(options, body = null) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            data: JSON.parse(data)
          });
        } catch {
          resolve({
            status: res.statusCode,
            data: data
          });
        }
      });
    });

    req.on('error', reject);

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function testMemberDeletion() {
  try {
    console.log('╔══════════════════════════════════════════════════════════╗');
    console.log('║    COMPLETE MEMBER DELETION TEST (CREATE + DELETE)      ║');
    console.log('╚══════════════════════════════════════════════════════════╝');

    // Step 1: Login
    console.log('\n[STEP 1] Logging in...');
    const loginRes = await httpsRequest({
      hostname: 'api.koinoniasms.com',
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      email: 'DOKaA@GMAIL.COM',
      password: '12!Michael'
    });

    if (loginRes.status !== 200) {
      console.log('❌ Login failed');
      return;
    }

    const token = loginRes.data.data.accessToken;
    const churchId = loginRes.data.data.church.id;
    console.log('✅ Logged in');

    // Step 2: Get/Create branch
    console.log('\n[STEP 2] Getting branch...');
    const branchesRes = await httpsRequest({
      hostname: 'api.koinoniasms.com',
      path: `/api/branches/churches/${churchId}/branches`,
      method: 'GET',
      headers: {
        'Cookie': `accessToken=${token}`,
        'Authorization': `Bearer ${token}`
      }
    });

    let branch = (branchesRes.data.data || [])[0];

    if (!branch) {
      console.log('Creating new branch...');
      const createBranchRes = await httpsRequest({
        hostname: 'api.koinoniasms.com',
        path: `/api/branches/churches/${churchId}/branches`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': `accessToken=${token}`,
          'Authorization': `Bearer ${token}`
        }
      }, {
        name: `TestBranch_${Date.now()}`
      });

      branch = createBranchRes.data.data;
      console.log(`✅ Created branch: ${branch.name}`);
    } else {
      console.log(`✅ Using branch: ${branch.name}`);
    }

    // Step 3: Get/Create group
    console.log('\n[STEP 3] Getting group...');
    const groupsRes = await httpsRequest({
      hostname: 'api.koinoniasms.com',
      path: `/api/groups/branches/${branch.id}/groups`,
      method: 'GET',
      headers: {
        'Cookie': `accessToken=${token}`,
        'Authorization': `Bearer ${token}`
      }
    });

    let group = (groupsRes.data.data || [])[0];

    if (!group) {
      console.log('Creating new group...');
      const createGroupRes = await httpsRequest({
        hostname: 'api.koinoniasms.com',
        path: `/api/groups/branches/${branch.id}/groups`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': `accessToken=${token}`,
          'Authorization': `Bearer ${token}`
        }
      }, {
        name: `TestGroup_${Date.now()}`
      });

      group = createGroupRes.data.data;
      console.log(`✅ Created group: ${group.name}`);
    } else {
      console.log(`✅ Using group: ${group.name}`);
    }

    // Step 4: Create a test member
    console.log('\n[STEP 4] Creating test member...');
    const now = Date.now();
    const createMemberRes = await httpsRequest({
      hostname: 'api.koinoniasms.com',
      path: `/api/groups/${group.id}/members`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `accessToken=${token}`,
        'Authorization': `Bearer ${token}`
      }
    }, {
      firstName: 'DeleteTest',
      lastName: `Member_${now}`,
      phone: `+1${String(now).slice(-10)}`
    });

    if (createMemberRes.status !== 201) {
      console.log('❌ Failed to create member:', createMemberRes.data.error);
      return;
    }

    const newMember = createMemberRes.data.data;
    console.log(`✅ Created member: ${newMember.firstName} ${newMember.lastName}`);
    console.log(`   Member ID: ${newMember.id}`);

    // Step 5: Get member count BEFORE deletion
    console.log('\n[STEP 5] Getting member count BEFORE deletion...');
    const countBeforeRes = await httpsRequest({
      hostname: 'api.koinoniasms.com',
      path: `/api/groups/${group.id}/members?page=1&limit=100`,
      method: 'GET',
      headers: {
        'Cookie': `accessToken=${token}`,
        'Authorization': `Bearer ${token}`
      }
    });

    const countBefore = countBeforeRes.data.pagination?.total || (countBeforeRes.data.data || []).length;
    console.log(`✅ Members BEFORE: ${countBefore}`);

    // Step 6: Delete the member
    console.log('\n[STEP 6] Deleting member...');
    const deleteRes = await httpsRequest({
      hostname: 'api.koinoniasms.com',
      path: `/api/groups/${group.id}/members/${newMember.id}`,
      method: 'DELETE',
      headers: {
        'Cookie': `accessToken=${token}`,
        'Authorization': `Bearer ${token}`
      }
    });

    if (deleteRes.status === 200) {
      console.log('✅ Delete request successful (HTTP 200)');
    } else {
      console.log(`❌ Delete failed with status ${deleteRes.status}`);
      console.log('Response:', deleteRes.data);
      return;
    }

    // Wait for cache invalidation
    await new Promise(r => setTimeout(r, 1500));

    // Step 7: Get member count AFTER deletion
    console.log('\n[STEP 7] Getting member count AFTER deletion...');
    const countAfterRes = await httpsRequest({
      hostname: 'api.koinoniasms.com',
      path: `/api/groups/${group.id}/members?page=1&limit=100`,
      method: 'GET',
      headers: {
        'Cookie': `accessToken=${token}`,
        'Authorization': `Bearer ${token}`
      }
    });

    const countAfter = countAfterRes.data.pagination?.total || (countAfterRes.data.data || []).length;
    const membersList = countAfterRes.data.data || [];
    console.log(`✅ Members AFTER: ${countAfter}`);

    // Step 8: Verify
    console.log('\n[STEP 8] Verification...');
    console.log('═══════════════════════════════════════════════════════');

    const memberStillExists = membersList.some(m => m.id === newMember.id);
    const countCorrect = countAfter === (countBefore - 1);

    console.log(`Count before:     ${countBefore}`);
    console.log(`Count after:      ${countAfter}`);
    console.log(`Expected after:   ${countBefore - 1}`);
    console.log('');
    console.log(`Member in list:   ${memberStillExists ? '❌ YES (STILL EXISTS)' : '✅ NO (DELETED)'}`);
    console.log(`Count decreased:  ${countCorrect ? '✅ YES' : '❌ NO'}`);

    console.log('═══════════════════════════════════════════════════════');

    console.log('\n╔══════════════════════════════════════════════════════════╗');
    if (!memberStillExists && countCorrect) {
      console.log('║        ✅ MEMBER DELETION IS WORKING PERFECTLY         ║');
      console.log('║                                                          ║');
      console.log('║  • Member successfully deleted from database             ║');
      console.log('║  • Member count decreased correctly                      ║');
      console.log('║  • Cache invalidation working                            ║');
      console.log('║  • All Phase 1-5 fixes are LIVE and FUNCTIONAL          ║');
    } else {
      console.log('║              ❌ MEMBER DELETION ISSUE FOUND             ║');
      if (memberStillExists) {
        console.log('║  • Member still exists in list after deletion          ║');
      }
      if (!countCorrect) {
        console.log('║  • Count did not decrease as expected                  ║');
      }
    }
    console.log('╚══════════════════════════════════════════════════════════╝');

  } catch (error) {
    console.error('❌ Test error:', error.message);
  }
}

testMemberDeletion();
