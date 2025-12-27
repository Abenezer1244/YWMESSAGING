const https = require('https');

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

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

async function testFullFlow() {
  try {
    console.log('=== STEP 1: LOGIN ===');
    const loginRes = await httpsRequest({
      hostname: 'api.koinoniasms.com',
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    }, {
      email: 'DOKaA@GMAIL.COM',
      password: '12!Michael'
    });

    const token = loginRes.data.data.accessToken;
    const churchId = loginRes.data.data.church.id;
    console.log(`✅ Logged in, churchId: ${churchId}`);

    // Step 2: Get branches
    console.log('\n=== STEP 2: GET BRANCHES ===');
    const branchesRes = await httpsRequest({
      hostname: 'api.koinoniasms.com',
      path: `/api/branches/churches/${churchId}/branches`,
      method: 'GET',
      headers: {
        'Cookie': `accessToken=${token}`,
        'Authorization': `Bearer ${token}`
      }
    });

    console.log(`Status: ${branchesRes.status}`);
    if (branchesRes.status === 200) {
      const branches = branchesRes.data.data || branchesRes.data;
      console.log(`Branches found: ${Array.isArray(branches) ? branches.length : 'unknown'}`);
      if (Array.isArray(branches) && branches[0]) {
        const firstBranch = branches[0];
        console.log(`First branch: ${firstBranch.name} (id: ${firstBranch.id})`);

        // Step 3: Get groups in first branch
        console.log(`\n=== STEP 3: GET GROUPS ===`);
        const groupsRes = await httpsRequest({
          hostname: 'api.koinoniasms.com',
          path: `/api/groups/branches/${firstBranch.id}/groups`,
          method: 'GET',
          headers: {
            'Cookie': `accessToken=${token}`,
            'Authorization': `Bearer ${token}`
          }
        });

        console.log(`Groups status: ${groupsRes.status}`);
        if (groupsRes.status === 200) {
          const groups = groupsRes.data.data || groupsRes.data;
          console.log(`Groups found: ${Array.isArray(groups) ? groups.length : 'unknown'}`);
          if (Array.isArray(groups) && groups[0]) {
            const firstGroup = groups[0];
            console.log(`First group: ${firstGroup.name} (id: ${firstGroup.id})`);

            // Step 4: Get members in first group
            console.log(`\n=== STEP 4: GET MEMBERS ===`);
            const membersRes = await httpsRequest({
              hostname: 'api.koinoniasms.com',
              path: `/api/groups/${firstGroup.id}/members?page=1&limit=50`,
              method: 'GET',
              headers: {
                'Cookie': `accessToken=${token}`,
                'Authorization': `Bearer ${token}`
              }
            });

            console.log(`Members status: ${membersRes.status}`);
            if (membersRes.status === 200) {
              const membersData = membersRes.data;
              console.log(`Total members: ${membersData.pagination?.total || 'unknown'}`);
              const members = membersData.data || [];
              console.log(`Members on page 1: ${members.length}`);

              if (members.length > 0) {
                const firstMember = members[0];
                console.log(`First member: ${firstMember.firstName} ${firstMember.lastName} (id: ${firstMember.id})`);

                // Step 5: Try to delete this member
                console.log(`\n=== STEP 5: DELETE MEMBER ===`);
                const deleteRes = await httpsRequest({
                  hostname: 'api.koinoniasms.com',
                  path: `/api/groups/${firstGroup.id}/members/${firstMember.id}`,
                  method: 'DELETE',
                  headers: {
                    'Cookie': `accessToken=${token}`,
                    'Authorization': `Bearer ${token}`
                  }
                });

                console.log(`Delete status: ${deleteRes.status}`);
                if (deleteRes.status === 200) {
                  console.log(`✅ Member deleted successfully`);

                  // Wait for cache invalidation
                  await sleep(500);

                  // Step 6: Get members again
                  console.log(`\n=== STEP 6: GET MEMBERS AGAIN ===`);
                  const membersRes2 = await httpsRequest({
                    hostname: 'api.koinoniasms.com',
                    path: `/api/groups/${firstGroup.id}/members?page=1&limit=50`,
                    method: 'GET',
                    headers: {
                      'Cookie': `accessToken=${token}`,
                      'Authorization': `Bearer ${token}`
                    }
                  });

                  console.log(`Members status: ${membersRes2.status}`);
                  if (membersRes2.status === 200) {
                    const membersData2 = membersRes2.data;
                    const newTotal = membersData2.pagination?.total || 'unknown';
                    const oldTotal = membersData.pagination?.total || 'unknown';
                    const members2 = membersData2.data || [];

                    console.log(`Previous total: ${oldTotal}, Current total: ${newTotal}`);
                    console.log(`Members on page 1: ${members2.length}`);

                    const deletedMemberStillExists = members2.some(m => m.id === firstMember.id);
                    if (deletedMemberStillExists) {
                      console.log(`❌ BUG: Deleted member still appears in list!`);
                    } else {
                      console.log(`✅ Deleted member removed from list`);
                    }
                  }
                } else {
                  console.log(`❌ Delete failed: ${deleteRes.data.error}`);
                }
              }
            }
          }
        }
      }
    } else {
      console.log(`Error: ${branchesRes.data.error}`);
    }

  } catch (error) {
    console.error('Test error:', error.message);
  }
}

testFullFlow();
