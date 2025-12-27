const axios = require('axios');

async function testDataIsolation() {
  console.log('\n🔒 API DATA ISOLATION TEST\n');

  try {
    // ============================================================
    // ACCOUNT 1: DOKaA@GMAIL.COM
    // ============================================================
    console.log('═══════════════════════════════════════════════════════════');
    console.log('ACCOUNT 1: DOKaA@GMAIL.COM');
    console.log('═══════════════════════════════════════════════════════════\n');

    console.log('[1] Authenticating...');
    const login1 = await axios.post('https://api.koinoniasms.com/api/auth/login', {
      email: 'DOKaA@GMAIL.COM',
      password: '12!Michael'
    });

    const token1 = login1.data.data.accessToken;
    const churchId1 = login1.data.data.church.id;
    
    console.log('✅ Authenticated');
    console.log('   Church ID: ' + churchId1);
    console.log('   User: ' + login1.data.data.admin.firstName + ' ' + login1.data.data.admin.lastName);
    console.log('');

    // Get Account 1's branches with CORRECT path
    console.log('[2] Fetching branches...');
    const branchesRes1 = await axios.get(
      `https://api.koinoniasms.com/api/branches/churches/${churchId1}/branches`,
      { headers: { Authorization: `Bearer ${token1}` } }
    );

    const branches1 = branchesRes1.data.data || [];
    console.log('✅ Found ' + branches1.length + ' branches');
    
    let testGroupId = null;
    let account1GroupCount = 0;
    
    if (branches1.length > 0) {
      const branchId = branches1[0].id;
      console.log('   Using branch: ' + branchId);
      
      // Get groups in this branch
      const groupsRes = await axios.get(
        `https://api.koinoniasms.com/api/groups/branches/${branchId}/groups`,
        { headers: { Authorization: `Bearer ${token1}` } }
      );
      
      if (groupsRes.data.data && groupsRes.data.data.length > 0) {
        testGroupId = groupsRes.data.data[0].id;
        account1GroupCount = groupsRes.data.data.length;
        console.log('✅ Found ' + account1GroupCount + ' groups');
        console.log('   Using group: ' + testGroupId);
        
        // Get members
        const membersRes = await axios.get(
          `https://api.koinoniasms.com/api/groups/${testGroupId}/members`,
          { headers: { Authorization: `Bearer ${token1}` } }
        );
        console.log('   Group has ' + membersRes.data.data.length + ' members');
      }
    }
    console.log('');

    // ============================================================
    // ACCOUNT 2: ab@gmail.com
    // ============================================================
    console.log('═══════════════════════════════════════════════════════════');
    console.log('ACCOUNT 2: ab@gmail.com');
    console.log('═══════════════════════════════════════════════════════════\n');

    console.log('[1] Authenticating...');
    const login2 = await axios.post('https://api.koinoniasms.com/api/auth/login', {
      email: 'ab@gmail.com',
      password: '12!Michael'
    });

    const token2 = login2.data.data.accessToken;
    const churchId2 = login2.data.data.church.id;
    
    console.log('✅ Authenticated');
    console.log('   Church ID: ' + churchId2);
    console.log('   User: ' + login2.data.data.admin.firstName + ' ' + login2.data.data.admin.lastName);
    console.log('');

    // Verify they're different accounts
    console.log('[2] Verifying accounts are different...');
    if (churchId1 === churchId2) {
      console.log('❌ ERROR: Both accounts have the same churchId!');
      return;
    }
    console.log('✅ Accounts are independent');
    console.log('   Account 1 Church: ' + churchId1);
    console.log('   Account 2 Church: ' + churchId2);
    console.log('');

    // Get Account 2's branches
    console.log('[3] Fetching Account 2 branches...');
    const branchesRes2 = await axios.get(
      `https://api.koinoniasms.com/api/branches/churches/${churchId2}/branches`,
      { headers: { Authorization: `Bearer ${token2}` } }
    );

    const branches2 = branchesRes2.data.data || [];
    let account2GroupCount = 0;
    
    if (branches2.length > 0) {
      const groupsRes2 = await axios.get(
        `https://api.koinoniasms.com/api/groups/branches/${branches2[0].id}/groups`,
        { headers: { Authorization: `Bearer ${token2}` } }
      );
      account2GroupCount = (groupsRes2.data.data || []).length;
    }

    console.log('✅ Found ' + branches2.length + ' branches');
    console.log('   Account 2 has ' + account2GroupCount + ' groups');
    console.log('');

    // ============================================================
    // CRITICAL TEST: Cross-Account Data Access
    // ============================================================
    if (testGroupId) {
      console.log('═══════════════════════════════════════════════════════════');
      console.log('CRITICAL TEST: Authorization Enforcement');
      console.log('═══════════════════════════════════════════════════════════\n');

      console.log('[TEST] Account 2 trying to access Account 1\'s group');
      console.log('       Group ID: ' + testGroupId);
      console.log('       Owner: Account 1 (churchId: ' + churchId1 + ')');
      console.log('       Accessor: Account 2 (churchId: ' + churchId2 + ')\n');

      const crossAccessTest = await axios.get(
        `https://api.koinoniasms.com/api/groups/${testGroupId}/members`,
        {
          headers: { Authorization: `Bearer ${token2}` },
          validateStatus: () => true
        }
      );

      console.log('[RESULT]');
      console.log('Status: ' + crossAccessTest.status);
      
      if (crossAccessTest.status === 403) {
        console.log('✅ ACCESS DENIED (403)');
        console.log('Error: ' + (crossAccessTest.data.error || 'N/A'));
        console.log('');
        console.log('✅✅✅ SECURITY FIX VERIFIED ✅✅✅');
        console.log('Account 2 CANNOT access Account 1\'s data');
      } else if (crossAccessTest.status === 200) {
        console.log('❌ ACCESS ALLOWED (200)');
        console.log('Members returned: ' + (crossAccessTest.data.data?.length || 0));
        console.log('');
        console.log('❌ SECURITY ISSUE: Data leak is still present!');
      } else {
        console.log('Status: ' + crossAccessTest.status);
        console.log('Response:', JSON.stringify(crossAccessTest.data).substring(0, 200));
      }
    } else {
      console.log('Note: Account 1 has no groups, using alternate test...');
    }

    console.log('');
    console.log('═══════════════════════════════════════════════════════════\n');

  } catch (error) {
    console.error('❌ Test error:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
    }
  }
}

testDataIsolation();
