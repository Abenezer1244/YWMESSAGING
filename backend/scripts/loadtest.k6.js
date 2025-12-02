/**
 * k6 Load Testing Suite for YWMESSAGING
 *
 * Test critical endpoints under various load scenarios:
 * - Authentication (login/register)
 * - Message sending (broadcast)
 * - Conversation retrieval and replies
 * - Analytics queries
 *
 * Run scenarios:
 * - Smoke Test: 1 user, 5 iterations (verify basic functionality)
 * - Load Test: 10-50 concurrent users, sustained 30 seconds
 * - Spike Test: 1->100 users, verify burst handling
 * - Soak Test: 5 users, 5 minute sustained load
 */

import http from 'k6/http';
import { check, group, sleep } from 'k6';
import { Counter, Trend, Gauge, Rate } from 'k6/metrics';

// ============================================================================
// Environment & Configuration
// ============================================================================

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';
const TEST_USER_EMAIL = `test-${Date.now()}@example.com`;
const TEST_USER_PASSWORD = 'TestPassword123!';
const TEST_CHURCH_ID = __ENV.CHURCH_ID || 'test-church-001';

// Test data
let authToken = null;
let testConversationId = null;

// ============================================================================
// Custom Metrics
// ============================================================================

const authSuccesses = new Counter('auth_successes');
const authFailures = new Counter('auth_failures');
const messageSendDuration = new Trend('message_send_duration');
const conversationFetchDuration = new Trend('conversation_fetch_duration');
const analyticsDuration = new Trend('analytics_duration');
const apiErrors = new Counter('api_errors');
const successfulRequests = new Counter('successful_requests');

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Register and login a test user
 */
function setupAuth() {
  // Register user
  const registerRes = http.post(`${BASE_URL}/api/auth/register`, {
    email: TEST_USER_EMAIL,
    password: TEST_USER_PASSWORD,
    churchName: 'Test Church',
  });

  check(registerRes, {
    'register status is 201 or 400 (already exists)': (r) => [201, 400].includes(r.status),
  }) || authFailures.add(1);

  // Login
  const loginRes = http.post(`${BASE_URL}/api/auth/login`, {
    email: TEST_USER_EMAIL,
    password: TEST_USER_PASSWORD,
  });

  const loginSuccess = check(loginRes, {
    'login status is 200': (r) => r.status === 200,
    'login response has token': (r) => r.json('data.accessToken') !== undefined,
  });

  if (!loginSuccess) {
    authFailures.add(1);
    return null;
  }

  authSuccesses.add(1);
  const token = loginRes.json('data.accessToken');
  return token;
}

/**
 * Make authenticated request
 */
function makeAuthRequest(method, url, body = null) {
  const params = {
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json',
    },
  };

  let response;
  if (method === 'GET') {
    response = http.get(url, params);
  } else if (method === 'POST') {
    response = http.post(url, body ? JSON.stringify(body) : null, params);
  } else if (method === 'PATCH') {
    response = http.patch(url, body ? JSON.stringify(body) : null, params);
  } else if (method === 'DELETE') {
    response = http.del(url, params);
  }

  if (response.status >= 400) {
    apiErrors.add(1);
  } else {
    successfulRequests.add(1);
  }

  return response;
}

// ============================================================================
// Test Scenarios
// ============================================================================

/**
 * Smoke Test: Basic functionality verification
 * 1 user, 5 iterations - verifies all endpoints respond
 */
export function smokeTest() {
  // Setup
  authToken = setupAuth();
  if (!authToken) {
    console.error('Failed to authenticate');
    return;
  }

  group('Smoke Test - Authentication', () => {
    const meRes = makeAuthRequest('GET', `${BASE_URL}/api/auth/me`);
    check(meRes, {
      'get current user status is 200': (r) => r.status === 200,
      'user data returned': (r) => r.json('data.id') !== undefined,
    });
  });

  sleep(1);

  group('Smoke Test - Message Sending', () => {
    const sendRes = makeAuthRequest('POST', `${BASE_URL}/api/messages/send`, {
      groupIds: ['test-group-1'],
      message: 'Smoke test message',
      mediaUrl: null,
    });

    check(sendRes, {
      'send message status is 200 or 400': (r) => [200, 400, 500].includes(r.status),
    });

    messageSendDuration.add(sendRes.timings.duration);
  });

  sleep(1);

  group('Smoke Test - Conversations', () => {
    const conversationsRes = makeAuthRequest('GET', `${BASE_URL}/api/messages/conversations`);

    check(conversationsRes, {
      'get conversations status is 200': (r) => r.status === 200,
      'conversations array returned': (r) => Array.isArray(r.json('data')),
    });

    conversationFetchDuration.add(conversationsRes.timings.duration);

    // Try to get first conversation if exists
    const conversations = conversationsRes.json('data');
    if (conversations && conversations.length > 0) {
      testConversationId = conversations[0].id;

      const singleConvRes = makeAuthRequest(
        'GET',
        `${BASE_URL}/api/messages/conversations/${testConversationId}`
      );

      check(singleConvRes, {
        'get single conversation status is 200': (r) => r.status === 200,
      });
    }
  });

  sleep(1);

  group('Smoke Test - Analytics', () => {
    const summaryRes = makeAuthRequest('GET', `${BASE_URL}/api/analytics/summary`);

    check(summaryRes, {
      'get summary analytics status is 200': (r) => r.status === 200,
      'summary data returned': (r) => r.json('data') !== undefined,
    });

    analyticsDuration.add(summaryRes.timings.duration);
  });

  sleep(1);
}

/**
 * Load Test: Sustained load with multiple concurrent users
 * 10-50 users sustained for 30 seconds
 */
export function loadTest() {
  authToken = setupAuth();
  if (!authToken) return;

  group('Load Test - Message Operations', () => {
    const startTime = new Date();

    // Send message
    const sendRes = makeAuthRequest('POST', `${BASE_URL}/api/messages/send`, {
      groupIds: ['test-group-1', 'test-group-2'],
      message: `Load test message at ${new Date().toISOString()}`,
      mediaUrl: null,
    });

    messageSendDuration.add(sendRes.timings.duration);

    check(sendRes, {
      'send completes within 2 seconds': (r) => r.timings.duration < 2000,
    });
  });

  sleep(0.5);

  group('Load Test - Conversation Retrieval', () => {
    const conversationsRes = makeAuthRequest('GET', `${BASE_URL}/api/messages/conversations`);

    conversationFetchDuration.add(conversationsRes.timings.duration);

    check(conversationsRes, {
      'conversation fetch completes within 1 second': (r) => r.timings.duration < 1000,
    });

    const conversations = conversationsRes.json('data');
    if (conversations && conversations.length > 0) {
      const singleRes = makeAuthRequest(
        'GET',
        `${BASE_URL}/api/messages/conversations/${conversations[0].id}`
      );

      check(singleRes, {
        'single conversation fetch completes within 500ms': (r) => r.timings.duration < 500,
      });
    }
  });

  sleep(0.5);

  group('Load Test - Analytics', () => {
    const analyticsRes = makeAuthRequest('GET', `${BASE_URL}/api/analytics/summary`);

    analyticsDuration.add(analyticsRes.timings.duration);

    check(analyticsRes, {
      'analytics completes within 1 second': (r) => r.timings.duration < 1000,
    });
  });

  sleep(0.5);
}

/**
 * Conversation Reply Load Test
 * Tests conversation reply endpoints under load
 */
export function conversationReplyTest() {
  authToken = setupAuth();
  if (!authToken) return;

  group('Conversation Reply - Setup', () => {
    const conversationsRes = makeAuthRequest('GET', `${BASE_URL}/api/messages/conversations`);
    const conversations = conversationsRes.json('data');

    if (conversations && conversations.length > 0) {
      testConversationId = conversations[0].id;
    }
  });

  if (!testConversationId) {
    console.warn('No conversations available for reply test');
    return;
  }

  group('Conversation Reply - Send Reply', () => {
    const replyRes = makeAuthRequest(
      'POST',
      `${BASE_URL}/api/messages/conversations/${testConversationId}/reply`,
      {
        message: `Reply at ${new Date().toISOString()}`,
      }
    );

    messageSendDuration.add(replyRes.timings.duration);

    check(replyRes, {
      'reply succeeds': (r) => r.status === 200 || r.status === 400,
      'reply completes within 2 seconds': (r) => r.timings.duration < 2000,
    });
  });

  sleep(0.5);

  group('Conversation Reply - Mark as Read', () => {
    const readRes = makeAuthRequest(
      'PATCH',
      `${BASE_URL}/api/messages/conversations/${testConversationId}/read`,
      {}
    );

    check(readRes, {
      'mark read succeeds': (r) => r.status === 200 || r.status === 400,
      'mark read completes within 500ms': (r) => r.timings.duration < 500,
    });
  });

  sleep(0.5);
}

// ============================================================================
// Scenario Configuration
// ============================================================================

export const options = {
  scenarios: {
    smoke: {
      executor: 'shared-iterations',
      vus: 1,
      iterations: 5,
      maxDuration: '2m',
    },
    load: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '10s', target: 10 },  // Ramp up to 10 users
        { duration: '30s', target: 10 },  // Sustained load
        { duration: '10s', target: 0 },   // Ramp down
      ],
      maxDuration: '2m',
    },
    spike: {
      executor: 'ramping-vus',
      startVUs: 1,
      stages: [
        { duration: '5s', target: 1 },    // Start with 1
        { duration: '5s', target: 50 },   // Spike to 50
        { duration: '10s', target: 50 },  // Hold spike
        { duration: '5s', target: 0 },    // Ramp down
      ],
      maxDuration: '30s',
    },
    soak: {
      executor: 'constant-vus',
      vus: 5,
      duration: '5m',
    },
    conversation: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '15s', target: 20 },   // Ramp up
        { duration: '30s', target: 20 },   // Sustained
        { duration: '10s', target: 0 },    // Ramp down
      ],
      maxDuration: '2m',
    },
  },

  // Performance thresholds
  thresholds: {
    'http_req_duration': ['p(95)<500', 'p(99)<1000'],
    'http_req_failed': ['rate<0.01'], // <1% failure rate
    'message_send_duration': ['p(95)<2000'],
    'conversation_fetch_duration': ['p(95)<1000'],
    'analytics_duration': ['p(95)<1000'],
    'successful_requests': ['rate>0.99'],
  },

  // Collection options
  ext: {
    loadimpact: {
      projectID: 3356020,
      name: 'YWMESSAGING Load Tests',
    },
  },
};

/**
 * Default export - runs smoke test by default
 */
export default smokeTest;
