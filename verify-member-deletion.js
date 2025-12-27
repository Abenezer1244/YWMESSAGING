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
    console.log('║        MEMBER DELETION TEST - LIVE VERIFICATION          ║');
    console.log('╚══════════════════════════════════════════════════════════╝');

    // Step 1: Login with your account
    console.log('\n[STEP 1] Logging in with DOKaA@GMAIL.COM...');
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
      console.log('❌ Login failed:', loginRes.data.error);
      return;
    }

    const token = loginRes.data.data.accessToken;
    const churchId = loginRes.data.data.church.id;
    console.log('✅ Logged in successfully');
    console.log(`   Church ID: ${churchId}`);

    // Step 2: Get branches
    console.log('\n[STEP 2] Getting branches...');
    const branchesRes = await httpsRequest({
      hostname: 'api.koinoniasms.com',
      path: `/api/branches/churches/${churchId}/branches`,
      method: 'GET',
      headers: {
        'Cookie': `accessToken=${token}`,
        'Authorization': `Bearer ${token}`
      }
    });

    if (branchesRes.status !== 200) {
      console.log('❌ Failed to get branches:', branchesRes.data.error);
      return;
    }

    const branches = branchesRes.data.data || [];
    if (branches.length === 0) {
      console.log('❌ No branches found');
      return;
    }

    const branch = branches[0];
    console.log(`✅ Found branch: ${branch.name}`);
    console.log(`   Branch ID: ${branch.id}`);

    // Step 3: Get groups
    console.log('\n[STEP 3] Getting groups...');
    const groupsRes = await httpsRequest({
      hostname: 'api.koinoniasms.com',
      path: `/api/groups/branches/${branch.id}/groups`,
      method: 'GET',
      headers: {
        'Cookie': `accessToken=${token}`,
        'Authorization': `Bearer ${token}`
      }
    });

    if (groupsRes.status !== 200) {
      console.log('❌ Failed to get groups:', groupsRes.data.error);
      return;
    }

    const groups = groupsRes.data.data || [];
    if (groups.length === 0) {
      console.log('❌ No groups found');
      return;
    }

    const group = groups[0];
    console.log(`✅ Found group: ${group.name}`);
    console.log(`   Group ID: ${group.id}`);

    // Step 4: Get members BEFORE deletion
    console.log('\n[STEP 4] Getting members list (BEFORE deletion)...');
    const membersBefore = await httpsRequest({
      hostname: 'api.koinoniasms.com',
      path: `/api/groups/${group.id}/members?page=1&limit=100`,
      method: 'GET',
      headers: {
        'Cookie': `accessToken=${token}`,
        'Authorization': `Bearer ${token}`
      }
    });

    if (membersBefore.status !== 200) {
      console.log('❌ Failed to get members:', membersBefore.data.error);
      return;
    }

    const membersBeforeList = membersBefore.data.data || [];
    const countBefore = membersBefore.data.pagination?.total || membersBeforeList.length;

    console.log(`✅ Members BEFORE deletion: ${countBefore}`);
    console.log(`   Total on page 1: ${membersBeforeList.length}`);

    if (membersBeforeList.length === 0) {
      console.log('❌ No members to delete');
      return;
    }

    const memberToDelete = membersBeforeList[0];
    console.log(`   Member to delete: ${memberToDelete.firstName} ${memberToDelete.lastName}`);
    console.log(`   Member ID: ${memberToDelete.id}`);

    // Step 5: Delete the member
    console.log('\n[STEP 5] Deleting member...');
    const deleteRes = await httpsRequest({
      hostname: 'api.koinoniasms.com',
      path: `/api/groups/${group.id}/members/${memberToDelete.id}`,
      method: 'DELETE',
      headers: {
        'Cookie': `accessToken=${token}`,
        'Authorization': `Bearer ${token}`
      }
    });

    console.log(`Delete response status: ${deleteRes.status}`);

    if (deleteRes.status === 200) {
      console.log('✅ Member deleted successfully');
    } else {
      console.log('❌ Delete failed:', deleteRes.data.error);
      return;
    }

    // Wait for cache to clear
    await new Promise(r => setTimeout(r, 1000));

    // Step 6: Get members AFTER deletion
    console.log('\n[STEP 6] Getting members list (AFTER deletion)...');
    const membersAfter = await httpsRequest({
      hostname: 'api.koinoniasms.com',
      path: `/api/groups/${group.id}/members?page=1&limit=100`,
      method: 'GET',
      headers: {
        'Cookie': `accessToken=${token}`,
        'Authorization': `Bearer ${token}`
      }
    });

    if (membersAfter.status !== 200) {
      console.log('❌ Failed to get members after deletion:', membersAfter.data.error);
      return;
    }

    const membersAfterList = membersAfter.data.data || [];
    const countAfter = membersAfter.data.pagination?.total || membersAfterList.length;

    console.log(`✅ Members AFTER deletion: ${countAfter}`);
    console.log(`   Total on page 1: ${membersAfterList.length}`);

    // Step 7: Verification
    console.log('\n[STEP 7] Verification...');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    const countDecreased = countAfter === (countBefore - 1);
    const memberGone = !membersAfterList.find(m => m.id === memberToDelete.id);

    console.log(`Before: ${countBefore} members`);
    console.log(`After:  ${countAfter} members`);
    console.log(`Expected: ${countBefore - 1} members`);
    console.log('');

    if (countDecreased) {
      console.log('✅ Count decreased correctly');
    } else {
      console.log('❌ Count did NOT decrease');
    }

    if (memberGone) {
      console.log('✅ Deleted member is gone from list');
    } else {
      console.log('❌ Deleted member STILL in list (cache issue?)');
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    // Final result
    console.log('\n╔══════════════════════════════════════════════════════════╗');
    if (countDecreased && memberGone) {
      console.log('║           ✅ MEMBER DELETION WORKING PERFECTLY           ║');
    } else if (!countDecreased && !memberGone) {
      console.log('║         ❌ MEMBER DELETION NOT WORKING AT ALL           ║');
    } else {
      console.log('║       ⚠️  PARTIAL ISSUE - CHECK DETAILS ABOVE           ║');
    }
    console.log('╚══════════════════════════════════════════════════════════╝');

  } catch (error) {
    console.error('❌ Test error:', error.message);
  }
}

testMemberDeletion();
