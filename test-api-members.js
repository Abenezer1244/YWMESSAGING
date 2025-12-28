const axios = require('axios');

async function testMembersAPI() {
  console.log('\n🧪 TESTING MEMBERS API\n');

  try {
    // Get groups first (need a valid groupId)
    const groupsRes = await axios.get('http://localhost:3000/api/branches', {
      headers: {
        'Authorization': 'Bearer YOUR_TOKEN_HERE'  // This won't work without auth
      }
    });

    console.log('Got groups:', groupsRes.data);

  } catch (error) {
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
}

testMembersAPI();
