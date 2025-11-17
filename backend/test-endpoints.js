#!/usr/bin/env node
/**
 * Test various Telnyx endpoints to see which ones are accessible
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

const client = axios.create({
  baseURL: 'https://api.telnyx.com/v2',
  headers: {
    Authorization: `Bearer ${TELNYX_API_KEY}`,
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

async function testEndpoint(method, endpoint, description) {
  try {
    let response;
    if (method === 'GET') {
      response = await client.get(endpoint);
    } else if (method === 'POST') {
      response = await client.post(endpoint, { test: true });
    }

    console.log(`✅ ${method} ${endpoint} - ${description}`);
    console.log(`   Status: ${response.status}`);
    if (response.data?.data) {
      const data = response.data.data;
      if (Array.isArray(data)) {
        console.log(`   Found ${data.length} items`);
      } else if (typeof data === 'object') {
        console.log(`   Response:`, Object.keys(data).slice(0, 3).join(', '));
      }
    }
  } catch (err) {
    const status = err.response?.status || 'ERR';
    const detail = err.response?.data?.errors?.[0]?.detail || err.message;
    console.log(`❌ ${method} ${endpoint} - Status ${status}: ${detail}`);
  }
}

async function runTests() {
  console.log('🧪 Testing Telnyx API Endpoints\n');
  console.log('API Key:', TELNYX_API_KEY.substring(0, 15) + '...\n');
  console.log('---\n');

  // These should work (we know they do)
  await testEndpoint('GET', '/messaging_profiles', 'Existing, working');
  await testEndpoint('GET', '/phone_numbers', 'Existing, working');

  console.log();

  // These are the brand-related endpoints we want to test
  console.log('🔍 Testing Brand-related endpoints:\n');
  await testEndpoint('GET', '/a2p_brands', 'A2P Brands (what we need)');
  await testEndpoint('GET', '/10dlc_brands', 'Old 10DLC Brands path');
  await testEndpoint('GET', '/brands', 'Generic Brands');
  await testEndpoint('GET', '/messaging_profiles/brands', 'Brands under profiles');

  console.log();
  console.log('💡 Next steps:');
  console.log('1. Check if /a2p_brands returns 404 consistently');
  console.log('2. If yes, ask Telnyx:');
  console.log('   - "What is the correct endpoint path for A2P brand registration?"');
  console.log('   - "Is my account verified for A2P brand registration?"');
  console.log('   - "Can you provide a curl example that works?"');
  console.log('3. They should provide the exact endpoint and any special headers');
}

runTests();
