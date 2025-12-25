const axios = require('axios');

async function testStatsErrors() {
  console.log('\n📊 Testing Stats Endpoints for Error Details\n');

  try {
    // Register test account
    const testEmail = `stats-${Date.now()}@koinoniasms.com`;
    const testPassword = 'Stats123!';

    const registerResponse = await axios.post(
      'https://api.koinoniasms.com/api/auth/register',
      {
        email: testEmail,
        password: testPassword,
        firstName: 'Stats',
        lastName: 'Test',
        churchName: 'Stats Test Church',
      },
      { timeout: 10000 }
    );

    const { accessToken, church } = registerResponse.data.data;
    console.log('✅ Account created:', testEmail);
    console.log('Church ID:', church.id, '\n');

    const client = axios.create({
      baseURL: 'https://api.koinoniasms.com',
      timeout: 12000,
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    // Test Summary Stats
    console.log('📍 Testing Summary Stats...');
    try {
      const response = await client.get('/api/analytics/summary');
      console.log('✅ Status:', response.status);
      console.log('Response:', JSON.stringify(response.data, null, 2), '\n');
    } catch (error) {
      console.log('❌ Error:', error.response?.status || error.code);
      console.log('Message:', error.response?.data?.error || error.message);
      console.log('Full Response:', JSON.stringify(error.response?.data, null, 2), '\n');
    }

    // Test Message Stats
    console.log('📍 Testing Message Stats...');
    try {
      const response = await client.get('/api/analytics/messages?days=7');
      console.log('✅ Status:', response.status);
      console.log('Response:', JSON.stringify(response.data, null, 2), '\n');
    } catch (error) {
      console.log('❌ Error:', error.response?.status || error.code);
      console.log('Message:', error.response?.data?.error || error.message);
      console.log('Full Response:', JSON.stringify(error.response?.data, null, 2), '\n');
    }

  } catch (error) {
    console.error('❌ Test setup failed:', error.message);
  }
}

testStatsErrors();
