/**
 * k6 Load Testing Script - Koinonia YW Platform
 *
 * Critical user flows to test:
 * 1. Authentication (login, token refresh)
 * 2. Message sending (single + batch)
 * 3. Dashboard analytics (high DB load)
 * 4. Group management
 * 5. Member operations
 *
 * Load profile:
 * - Ramp up: 0-30 users over 2 minutes
 * - Steady state: 30 users for 5 minutes
 * - Ramp up: 30-100 users over 2 minutes
 * - Steady state: 100 users for 5 minutes
 * - Ramp down: 100-0 users over 2 minutes
 *
 * Success criteria:
 * - P95 latency: <500ms (95% of requests faster than 500ms)
 * - Error rate: <5% (maximum 5% of requests fail)
 * - Throughput: >20 req/s at peak load
 */

import http from 'k6/http';
import { check, group, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

// Custom metrics to track
const authLatency = new Trend('auth_latency');
const messageLatency = new Trend('message_latency');
const dashboardLatency = new Trend('dashboard_latency');
const groupLatency = new Trend('group_latency');
const errorRate = new Rate('errors');

// Configuration
const BASE_URL = __ENV.BASE_URL || 'https://api.ywmessaging.com';
const API_BASE = `${BASE_URL}/api`;

// Test user credentials (for testing - use valid test user in your environment)
const TEST_USER = {
  email: 'loadtest@church.com',
  password: 'LoadTestPass123!',
  churchId: 'test-church-id' // Will be set from login response
};

// Load profile: Ramp up to 100 users, stay for duration, ramp down
export const options = {
  stages: [
    // Phase 1: Ramp up to 30 users (2 minutes)
    { duration: '2m', target: 30, name: 'Ramp up to 30 users' },

    // Phase 2: Stay at 30 users (5 minutes) - baseline testing
    { duration: '5m', target: 30, name: 'Baseline load (30 users)' },

    // Phase 3: Ramp up to 100 users (2 minutes)
    { duration: '2m', target: 100, name: 'Ramp up to 100 users' },

    // Phase 4: Stay at 100 users (5 minutes) - peak testing
    { duration: '5m', target: 100, name: 'Peak load (100 users)' },

    // Phase 5: Ramp down (2 minutes)
    { duration: '2m', target: 0, name: 'Ramp down' },
  ],

  // Thresholds: If these are exceeded, test fails
  thresholds: {
    // 95% of requests must complete within 500ms
    'http_req_duration': ['p(95)<500', 'p(99)<1000'],

    // Error rate must be below 5%
    'errors': ['rate<0.05'],

    // Check failure rate must be below 2%
    'checks': ['rate>0.98'],

    // Authentication should be fast (<200ms p95)
    'auth_latency': ['p(95)<200'],

    // Message sending should be <400ms p95
    'message_latency': ['p(95)<400'],
  },

  // Options
  vus: 1,
  duration: '23m', // Total test duration
  noConnectionReuse: false, // Reuse connections (more realistic)
  userAgent: 'k6-loadtest/1.0',
};

// Global variables to track auth tokens
let globalAuthToken = null;
let globalChurchId = null;

/**
 * Phase 1: Setup - Run once per VU
 */
export function setup() {
  // Optional: Initialize test data
  console.log(`Starting load test against ${BASE_URL}`);
  return { testData: 'ready' };
}

/**
 * Main test function - runs for each iteration
 */
export default function (data) {
  const vu = __VU; // Virtual user number
  const iteration = __ITER; // Iteration number

  // Vary credentials per VU to avoid contention
  const userEmail = `loadtest${vu}@church.com`;

  // Test 1: Authentication
  authFlow(userEmail);

  // Add think time (simulates user reading/waiting)
  sleep(1);

  // Test 2: Get groups (simulate browsing)
  groupsFlow();

  sleep(1);

  // Test 3: Send message (critical path)
  messageFlow();

  sleep(1);

  // Test 4: Analytics dashboard (high DB load)
  dashboardFlow();

  sleep(2); // Longer think time after dashboard
}

/**
 * Test 1: Authentication flow
 * Measures: Login speed, token generation
 */
function authFlow(email) {
  group('1. Authentication Flow', () => {
    // Login
    const loginRes = http.post(`${API_BASE}/auth/login`, {
      email: email,
      password: 'LoadTestPass123!',
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Origin': BASE_URL,
      },
      tags: { name: 'Login' },
    });

    authLatency.add(loginRes.timings.duration);

    const loginOk = check(loginRes, {
      'Login status 200': (r) => r.status === 200,
      'Login has token': (r) => r.json('accessToken') !== undefined,
      'Login response < 300ms': (r) => r.timings.duration < 300,
    });

    errorRate.add(!loginOk);

    // Store token for subsequent requests
    if (loginOk) {
      globalAuthToken = loginRes.json('accessToken');
      globalChurchId = loginRes.json('churchId') || 'test-church';
    }
  });
}

/**
 * Test 2: Groups - list and view
 * Measures: Group listing performance, DB query efficiency
 */
function groupsFlow() {
  if (!globalAuthToken) return; // Skip if not authenticated

  group('2. Groups Flow', () => {
    const headers = {
      'Authorization': `Bearer ${globalAuthToken}`,
      'Content-Type': 'application/json',
    };

    // Get groups
    const groupsRes = http.get(`${API_BASE}/groups?churchId=${globalChurchId}`, {
      headers: headers,
      tags: { name: 'GetGroups' },
    });

    groupLatency.add(groupsRes.timings.duration);

    const groupsOk = check(groupsRes, {
      'Get groups status 200': (r) => r.status === 200,
      'Groups response < 400ms': (r) => r.timings.duration < 400,
      'Groups is array': (r) => Array.isArray(r.json()),
    });

    errorRate.add(!groupsOk);

    // If groups exist, get first group details
    const groupsData = groupsRes.json();
    if (groupsData && groupsData.length > 0) {
      const groupId = groupsData[0].id || groupsData[0].groupId;

      const groupDetailRes = http.get(`${API_BASE}/groups/${groupId}`, {
        headers: headers,
        tags: { name: 'GetGroupDetail' },
      });

      check(groupDetailRes, {
        'Get group detail 200': (r) => r.status === 200,
        'Group detail < 300ms': (r) => r.timings.duration < 300,
      });
    }
  });
}

/**
 * Test 3: Messages - send message
 * Measures: Message sending throughput, critical path latency
 */
function messageFlow() {
  if (!globalAuthToken) return;

  group('3. Messages Flow', () => {
    const headers = {
      'Authorization': `Bearer ${globalAuthToken}`,
      'Content-Type': 'application/json',
    };

    // Send message
    const messageRes = http.post(`${API_BASE}/messages/send`, {
      content: `Load test message ${__ITER} from VU ${__VU}`,
      churchId: globalChurchId,
      recipientType: 'all', // Send to all members
      memberIds: [], // Will use recipientType instead
      channel: 'sms', // Test SMS sending
    }, {
      headers: headers,
      tags: { name: 'SendMessage' },
    });

    messageLatency.add(messageRes.timings.duration);

    const messageOk = check(messageRes, {
      'Send message 201 created': (r) => r.status === 201 || r.status === 200,
      'Message has ID': (r) => r.json('id') !== undefined || r.json('messageId') !== undefined,
      'Send message < 500ms': (r) => r.timings.duration < 500,
    });

    errorRate.add(!messageOk);
  });
}

/**
 * Test 4: Analytics Dashboard
 * Measures: Database query performance under load, aggregation latency
 * This is typically the slowest endpoint (lots of JOINs and aggregations)
 */
function dashboardFlow() {
  if (!globalAuthToken) return;

  group('4. Analytics Dashboard Flow', () => {
    const headers = {
      'Authorization': `Bearer ${globalAuthToken}`,
      'Content-Type': 'application/json',
    };

    // Get analytics dashboard (typically slow due to JOINs)
    const dashboardRes = http.get(
      `${API_BASE}/analytics/dashboard?churchId=${globalChurchId}&period=30days`,
      {
        headers: headers,
        tags: { name: 'GetDashboard' },
      }
    );

    dashboardLatency.add(dashboardRes.timings.duration);

    const dashboardOk = check(dashboardRes, {
      'Dashboard 200': (r) => r.status === 200,
      'Dashboard < 800ms': (r) => r.timings.duration < 800, // More lenient for complex queries
      'Dashboard has data': (r) => r.json('data') !== undefined || Object.keys(r.json()).length > 0,
    });

    errorRate.add(!dashboardOk);

    // Get conversation list (another common dashboard query)
    const conversationsRes = http.get(
      `${API_BASE}/chat/conversations?churchId=${globalChurchId}`,
      {
        headers: headers,
        tags: { name: 'GetConversations' },
      }
    );

    check(conversationsRes, {
      'Conversations 200': (r) => r.status === 200,
      'Conversations < 500ms': (r) => r.timings.duration < 500,
    });
  });
}

/**
 * Phase 2: Teardown - Run once at end
 */
export function teardown(data) {
  console.log('Load test completed');
}
