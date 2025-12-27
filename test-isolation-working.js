const axios = require('axios');

async function testDataIsolation() {
  console.log('\n🔒 DATA ISOLATION SECURITY TEST\n');

  try {
    // ============================================================
    // ACCOUNT 1: DOKaA@GMAIL.COM
    // ============================================================
    console.log('═══════════════════════════════════════════════════════════');
    console.log('ACCOUNT 1: DOKaA@GMAIL.COM');
    console.log('═══════════════════════════════════════════════════════════\n');

    const login1 = await axios.post('https://api.koinoniasms.com/api/auth/login', {
      email: 'DOKaA@GMAIL.COM',
      password: '12!Michael'
    });

    const token1 = login1.data.data.accessToken;
    const churchId1 = login1.data.data.church.id;
    
    console.log('✅ Authenticated: ' + login1.data.data.admin.firstName);
    console.log('   Church ID: ' + churchId1);
    console.log('');

    // ============================================================
    // ACCOUNT 2: ab@gmail.com
    // ============================================================
    console.log('═══════════════════════════════════════════════════════════');
    console.log('ACCOUNT 2: ab@gmail.com');
    console.log('═══════════════════════════════════════════════════════════\n');

    const login2 = await axios.post('https://api.koinoniasms.com/api/auth/login', {
      email: 'ab@gmail.com',
      password: '12!Michael'
    });

    const token2 = login2.data.data.accessToken;
    const churchId2 = login2.data.data.church.id;
    
    console.log('✅ Authenticated: ' + login2.data.data.admin.firstName);
    console.log('   Church ID: ' + churchId2);
    console.log('');

    console.log('[INFO] Accounts are different churches:');
    console.log('   Church 1: ' + churchId1);
    console.log('   Church 2: ' + churchId2);
    console.log('');

    // Get Account 2's groups for testing
    console.log('═══════════════════════════════════════════════════════════');
    console.log('[SETUP] Finding Account 2\'s group to test...');
    console.log('═══════════════════════════════════════════════════════════\n');

    const branchesRes2 = await axios.get(
      `https://api.koinoniasms.com/api/branches/churches/${churchId2}/branches`,
      { headers: { Authorization: `Bearer ${token2}` } }
    );

    let testGroupId = null;
    if (branchesRes2.data.data && branchesRes2.data.data.length > 0) {
      const groupsRes2 = await axios.get(
        `https://api.koinoniasms.com/api/groups/branches/${branchesRes2.data.data[0].id}/groups`,
        { headers: { Authorization: `Bearer ${token2}` } }
      );
      
      if (groupsRes2.data.data && groupsRes2.data.data.length > 0) {
        testGroupId = groupsRes2.data.data[0].id;
      }
    }

    if (!testGroupId) {
      console.log('⚠️  Could not find a test group');
      return;
    }

    console.log('Found Account 2\'s group: ' + testGroupId);
    console.log('');

    // ============================================================
    // CRITICAL TEST: Can Account 1 access Account 2's Group?
    // ============================================================
    console.log('═══════════════════════════════════════════════════════════');
    console.log('CRITICAL TEST: Cross-Account Access Attempt');
    console.log('═══════════════════════════════════════════════════════════\n');

    console.log('Scenario:');
    console.log('  - Account 1 (DOKaA@GMAIL.COM) tries to access');
    console.log('  - Account 2\'s group (' + testGroupId + ')');
    console.log('  - Using Account 1\'s authentication token\n');

    const crossAccessTest = await axios.get(
      `https://api.koinoniasms.com/api/groups/${testGroupId}/members`,
      {
        headers: { Authorization: `Bearer ${token1}` },
        validateStatus: () => true
      }
    );

    console.log('Response Status: ' + crossAccessTest.status + '\n');
    
    if (crossAccessTest.status === 403) {
      console.log('✅✅✅ SECURITY FIX IS WORKING ✅✅✅');
      console.log('');
      console.log('Account 1 was BLOCKED from accessing Account 2\'s group');
      console.log('Error message: ' + (crossAccessTest.data.error || 'Access denied'));
      console.log('');
      console.log('✅ Data isolation is properly enforced');
      console.log('✅ Authorization checks are in place');
      console.log('✅ Each account can only access its own data');
      
    } else if (crossAccessTest.status === 200) {
      console.log('❌❌❌ SECURITY VULNERABILITY DETECTED ❌❌❌');
      console.log('');
      console.log('Account 1 was able to access Account 2\'s group!');
      console.log('Members returned: ' + (crossAccessTest.data.data?.length || 0));
      console.log('');
      console.log('❌ Authorization checks are NOT working');
      console.log('❌ Data isolation has been breached');
      
    } else {
      console.log('⚠️  Unexpected response status');
      console.log('Status: ' + crossAccessTest.status);
      console.log('Response:', crossAccessTest.data);
    }

    console.log('');
    console.log('═══════════════════════════════════════════════════════════\n');

  } catch (error) {
    console.error('❌ Test error:', error.message);
  }
}

testDataIsolation();
