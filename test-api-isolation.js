const axios = require('axios');

async function testAPIDataIsolation() {
  console.log('\n🔒 API DATA ISOLATION TEST\n');

  try {
    // ============================================================
    // ACCOUNT 1: DOKaA@GMAIL.COM - Get Auth Token
    // ============================================================
    console.log('═══════════════════════════════════════════════════════════');
    console.log('ACCOUNT 1: DOKaA@GMAIL.COM');
    console.log('═══════════════════════════════════════════════════════════\n');

    console.log('[1] Logging in with Account 1...');
    const login1 = await axios.post('https://api.koinoniasms.com/api/auth/login', {
      email: 'DOKaA@GMAIL.COM',
      password: '12!Michael'
    }, { validateStatus: () => true });

    if (login1.status !== 200) {
      console.log('❌ Login failed:', login1.status, login1.data);
      return;
    }

    const token1 = login1.data.data.accessToken;
    const account1Id = login1.data.data.admin.churchId;
    
    console.log('✅ Logged in successfully');
    console.log('   Church ID:', account1Id);
    console.log('');

    // Get Account 1's groups
    console.log('[2] Fetching Account 1 groups...');
    const groupsRes1 = await axios.get(
      `https://api.koinoniasms.com/api/churches/${account1Id}/branches`,
      { headers: { Authorization: `Bearer ${token1}` }, validateStatus: () => true }
    );

    if (groupsRes1.status !== 200) {
      console.log('❌ Failed to fetch branches:', groupsRes1.status);
      return;
    }

    const account1Branches = groupsRes1.data.data || [];
    console.log('✅ Found ' + account1Branches.length + ' branches');
    
    let account1GroupId = null;
    if (account1Branches.length > 0) {
      console.log('   First branch ID:', account1Branches[0].id);
      
      // Get groups in first branch
      const groupsInBranchRes = await axios.get(
        `https://api.koinoniasms.com/api/branches/${account1Branches[0].id}/groups`,
        { headers: { Authorization: `Bearer ${token1}` }, validateStatus: () => true }
      );
      
      if (groupsInBranchRes.data.data && groupsInBranchRes.data.data.length > 0) {
        account1GroupId = groupsInBranchRes.data.data[0].id;
        console.log('   First group ID:', account1GroupId);
        
        // Get members in this group
        const membersRes = await axios.get(
          `https://api.koinoniasms.com/api/groups/${account1GroupId}/members`,
          { headers: { Authorization: `Bearer ${token1}` }, validateStatus: () => true }
        );
        console.log('   Group has ' + membersRes.data.data.length + ' members');
      }
    }
    console.log('');

    // ============================================================
    // ACCOUNT 2: ab@gmail.com - Get Auth Token
    // ============================================================
    console.log('═══════════════════════════════════════════════════════════');
    console.log('ACCOUNT 2: ab@gmail.com');
    console.log('═══════════════════════════════════════════════════════════\n');

    console.log('[1] Logging in with Account 2...');
    const login2 = await axios.post('https://api.koinoniasms.com/api/auth/login', {
      email: 'ab@gmail.com',
      password: '12!Michael'
    }, { validateStatus: () => true });

    if (login2.status !== 200) {
      console.log('❌ Login failed:', login2.status, login2.data);
      return;
    }

    const token2 = login2.data.data.accessToken;
    const account2Id = login2.data.data.admin.churchId;
    
    console.log('✅ Logged in successfully');
    console.log('   Church ID:', account2Id);
    console.log('');

    // Get Account 2's groups
    console.log('[2] Fetching Account 2 groups...');
    const groupsRes2 = await axios.get(
      `https://api.koinoniasms.com/api/churches/${account2Id}/branches`,
      { headers: { Authorization: `Bearer ${token2}` }, validateStatus: () => true }
    );

    if (groupsRes2.status !== 200) {
      console.log('❌ Failed to fetch branches:', groupsRes2.status);
      return;
    }

    const account2Branches = groupsRes2.data.data || [];
    console.log('✅ Found ' + account2Branches.length + ' branches');
    console.log('');

    // ============================================================
    // CRITICAL TEST: Can Account 2 access Account 1's Group?
    // ============================================================
    if (account1GroupId) {
      console.log('═══════════════════════════════════════════════════════════');
      console.log('CRITICAL TEST: Cross-Account Access');
      console.log('═══════════════════════════════════════════════════════════\n');

      console.log('[1] Account 2 trying to access Account 1\'s group (' + account1GroupId + ')...');
      const crossAccessTest = await axios.get(
        `https://api.koinoniasms.com/api/groups/${account1GroupId}/members`,
        { headers: { Authorization: `Bearer ${token2}` }, validateStatus: () => true }
      );

      console.log('    Status:', crossAccessTest.status);
      
      if (crossAccessTest.status === 403) {
        console.log('    ✅ ACCESS DENIED - CORRECT!');
        console.log('    Error:', crossAccessTest.data.error);
        console.log('');
        console.log('✅ SECURITY FIX WORKING: Account 2 cannot access Account 1\'s groups');
      } else if (crossAccessTest.status === 200) {
        console.log('    ❌ ACCESS ALLOWED - SECURITY BREACH!');
        console.log('    Account 2 was able to access Account 1\'s members!');
        console.log('    Members returned:', crossAccessTest.data.data.length);
      } else {
        console.log('    ⚠️  Unexpected status:', crossAccessTest.status);
      }
    }

    console.log('');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('DATA ISOLATION TEST COMPLETE');
    console.log('═══════════════════════════════════════════════════════════\n');

  } catch (error) {
    console.error('❌ Test error:', error.message);
  }
}

testAPIDataIsolation();
