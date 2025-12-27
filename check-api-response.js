const axios = require('axios');

async function checkAPIResponse() {
  try {
    console.log('Checking API response structure...\n');
    
    const login = await axios.post('https://api.koinoniasms.com/api/auth/login', {
      email: 'DOKaA@GMAIL.COM',
      password: '12!Michael'
    }, { validateStatus: () => true });

    console.log('Login Status:', login.status);
    console.log('Response keys:', Object.keys(login.data));
    console.log('Full response:', JSON.stringify(login.data, null, 2).substring(0, 500));
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkAPIResponse();
