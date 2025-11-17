#!/usr/bin/env node
/**
 * Test different Telnyx API authentication formats
 * The API key format KEY_ID_secret might need different auth headers
 */

import axios from 'axios';
import fs from 'fs';
import path from 'path';

// Load API key
let TELNYX_API_KEY = process.env.TELNYX_API_KEY;
if (!TELNYX_API_KEY) {
  const envPath = path.join(process.cwd(), '.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    const match = envContent.match(/TELNYX_API_KEY=(.+)/);
    if (match) {
      TELNYX_API_KEY = match[1].trim();
    }
  }
}

if (!TELNYX_API_KEY) {
  console.error('❌ TELNYX_API_KEY not found');
  process.exit(1);
}

console.log('🔐 Testing Telnyx Authentication Formats\n');
console.log('API Key:', TELNYX_API_KEY.substring(0, 15) + '...\n');

// Parse key parts if underscore format
const keyParts = TELNYX_API_KEY.split('_');
const keyId = keyParts[0];
const keySecret = keyParts.slice(1).join('_');

console.log(`Key format detected: KEY_ID_secret`);
console.log(`  ID: ${keyId}`);
console.log(`  Secret: ${keySecret.substring(0, 10)}...`);
console.log('\n---\n');

async function testAuthMethod(name, headers) {
  console.log(`🧪 Testing: ${name}`);
  console.log(`   Headers:`, headers);

  try {
    const response = await axios.post(
      'https://api.telnyx.com/v2/a2p_brands',
      {
        company_name: 'Test',
        brand_type: 'SOLE_PROPRIETOR',
        vertical: 'RELIGION',
        city: 'Seattle',
        state: 'WA',
        country: 'US',
        email: 'test@example.com',
        display_name: 'Test',
      },
      { headers, timeout: 10000 }
    );
    console.log(`   ✅ SUCCESS! Status: ${response.status}`);
    console.log(`   Response:`, JSON.stringify(response.data, null, 2).substring(0, 200));
  } catch (err) {
    const status = err.response?.status;
    const detail = err.response?.data?.errors?.[0]?.detail || err.message;
    console.log(`   ❌ FAILED - Status ${status}: ${detail}`);
  }
  console.log();
}

async function runTests() {
  // Method 1: Bearer token (current approach)
  await testAuthMethod('Bearer Token (current)', {
    'Authorization': `Bearer ${TELNYX_API_KEY}`,
    'Content-Type': 'application/json',
  });

  // Method 2: Basic Auth with key_id:secret
  const basicAuth = Buffer.from(`${keyId}:${keySecret}`).toString('base64');
  await testAuthMethod('Basic Auth (KEY_ID:secret)', {
    'Authorization': `Basic ${basicAuth}`,
    'Content-Type': 'application/json',
  });

  // Method 3: Just the API key as token (no Bearer)
  await testAuthMethod('API Key Only (no Bearer)', {
    'Authorization': TELNYX_API_KEY,
    'Content-Type': 'application/json',
  });

  // Method 4: Custom header (some APIs use X-API-Key)
  await testAuthMethod('Custom Header (X-API-Key)', {
    'X-API-Key': TELNYX_API_KEY,
    'Content-Type': 'application/json',
  });

  console.log('\n📋 Results:');
  console.log('- If any method shows ✅ SUCCESS: Use that auth format');
  console.log('- If all fail with 404: Endpoint might not exist for this account');
  console.log('- If all fail with 401: API key might be invalid or revoked');
  console.log('\nRecommendation: Ask Telnyx which auth format to use for this key type');
}

runTests();
