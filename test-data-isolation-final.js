const axios = require('axios');

async function testDataIsolation() {
  console.log('\n🔒 API DATA ISOLATION TEST - AUTHORIZATION FIX VERIFICATION\n');

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
    console.log('   Church ID:', churchId1);
    console.log('');

    // Get Account 1's branches
    console.log('[2] Fetching branches...');
    const branchesRes1 = await axios.get(
      `https://api.koinoniasms.com/api/churches/${churchId1}/branches`,
      { headers: { Authorization: `Bearer ${token1}` } }
    );

    const branches1 = branchesRes1.data.data || [];
    console.log('✅ Found ' + branches1.length + ' branches');
    
    let testGroupId = null;
    let testGroupMembers = 0;
    
    if (branches1.length > 0) {
      const branchId = branches1[0].id;
      console.log('   Using branch:', branchId);
      
      // Get groups in this branch
      const groupsRes = await axios.get(
        `https://api.koinoniasms.com/api/branches/${branchId}/groups`,
        { headers: { Authorization: `Bearer ${token1}` } }
      );
      
      if (groupsRes.data.data && groupsRes.data.data.length > 0) {
        testGroupId = groupsRes.data.data[0].id;
        console.log('   Using group:', testGroupId);
        
        // Get members
        const membersRes = await axios.get(
          `https://api.koinoniasms.com/api/groups/${testGroupId}/members`,
          { headers: { Authorization: `Bearer ${token1}` } }
        );
        testGroupMembers = membersRes.data.data.length;
        console.log('   Group has ' + testGroupMembers + ' members');
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
    console.log('   Church ID:', churchId2);
    console.log('');

    // Verify they're different accounts
    console.log('[2] Verifying accounts are different...');
    if (churchId1 === churchId2) {
      console.log('❌ ERROR: Both accounts have the same churchId!');
      console.log('   This should not happen for new accounts!');
      return;
    }
    console.log('✅ Accounts are different');
    console.log('   Account 1 Church ID: ' + churchId1);
    console.log('   Account 2 Church ID: ' + churchId2);
    console.log('');

    // ============================================================
    // CRITICAL TEST: Cross-Account Data Access
    // ============================================================
    if (testGroupId) {
      console.log('═══════════════════════════════════════════════════════════');
      console.log('CRITICAL TEST: Can Account 2 Access Account 1\'s Group?');
      console.log('═══════════════════════════════════════════════════════════\n');

      console.log('[TEST] Account 2 attempting to access Account 1\'s group');
      console.log('        Group ID: ' + testGroupId);
      console.log('        Account 2 Token: Bearer ' + token2.substring(0, 20) + '...\n');

      const crossAccessTest = await axios.get(
        `https://api.koinoniasms.com/api/groups/${testGroupId}/members`,
        {
          headers: { Authorization: `Bearer ${token2}` },
          validateStatus: () => true // Don't throw on any status
        }
      );

      console.log('[RESULT] Status: ' + crossAccessTest.status);
      
      if (crossAccessTest.status === 403) {
        console.log('✅ ACCESS DENIED - SECURITY FIX WORKING!');
        console.log('   Error message: ' + crossAccessTest.data.error);
        console.log('');
        console.log('✅ PASS: Authorization check is working correctly');
        console.log('   Account 2 cannot access Account 1\'s groups');
      } else if (crossAccessTest.status === 200) {
        console.log('❌ ACCESS ALLOWED - SECURITY BREACH!');
        console.log('   Members found: ' + crossAccessTest.data.data.length);
        console.log('');
        console.log('❌ FAIL: Authorization check is NOT working');
        console.log('   Account 2 was able to access Account 1\'s members!');
      } else {
        console.log('⚠️  Unexpected status: ' + crossAccessTest.status);
        console.log('   Response:', crossAccessTest.data);
      }
    } else {
      console.log('⚠️  Could not find a test group in Account 1');
      console.log('   Cannot perform cross-account access test');
    }

    console.log('');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('DATA ISOLATION TEST COMPLETE');
    console.log('═══════════════════════════════════════════════════════════\n');

  } catch (error) {
    console.error('❌ Test error:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    }
  }
}

testDataIsolation();
