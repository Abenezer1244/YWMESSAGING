/**
 * Phase 3 Task 3.2: k6 Load Testing - Baseline Capture
 *
 * Establishes performance baseline for regression detection
 * Run: k6 run scripts/k6-baseline.js
 *
 * Scenarios:
 * 1. Smoke Test - Quick validation (5 min, 5 users)
 * 2. Load Test - Sustained load (30 min, 30 users)
 * 3. Spike Test - Sudden surge (10 min, 0->100 users)
 * 4. Soak Test - Long duration (2 hours, 10 users)
 * 5. Conversation Test - Realistic workflow
 */

import http from 'k6/http'
import { check, sleep, group } from 'k6'
import { Rate, Trend, Counter, Gauge } from 'k6/metrics'

// ============================================================================
// CUSTOM METRICS FOR BASELINE TRACKING
// ============================================================================

// Latency metrics (in milliseconds)
const authLatency = new Trend('auth_latency_ms', { unit: 'ms' })
const messageLatency = new Trend('message_latency_ms', { unit: 'ms' })
const conversationLatency = new Trend('conversation_latency_ms', { unit: 'ms' })
const billingLatency = new Trend('billing_latency_ms', { unit: 'ms' })

// Success/failure rates
const authSuccessRate = new Rate('auth_success_rate')
const messageSuccessRate = new Rate('message_success_rate')
const conversationSuccessRate = new Rate('conversation_success_rate')
const billingSuccessRate = new Rate('billing_success_rate')

// Error counters
const authErrors = new Counter('auth_errors')
const messageErrors = new Counter('message_errors')
const conversationErrors = new Counter('conversation_errors')
const billingErrors = new Counter('billing_errors')

// Active connections
const activeConnections = new Gauge('active_connections')

// ============================================================================
// TEST CONFIGURATION
// ============================================================================

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000'
const ADMIN_API_KEY = __ENV.ADMIN_API_KEY || 'test-key'

// Test user credentials
const testUser = {
  email: `k6-user-${Date.now()}@test.local`,
  password: 'TestPassword123!',
  firstName: 'K6',
  lastName: 'Test'
}

// ============================================================================
// SCENARIO CONFIGURATIONS
// ============================================================================

export const options = {
  scenarios: {
    // Smoke Test: Quick validation
    smoke: {
      executor: 'constant-vus',
      vus: 5,
      duration: '5m',
      exec: 'smokeTest',
      tags: { scenario: 'smoke' }
    },

    // Load Test: Sustained load
    load: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '5m', target: 30 }, // Ramp up
        { duration: '20m', target: 30 }, // Sustain
        { duration: '5m', target: 0 } // Ramp down
      ],
      exec: 'loadTest',
      tags: { scenario: 'load' }
    },

    // Spike Test: Sudden surge
    spike: {
      executor: 'ramping-vus',
      startVUs: 5,
      stages: [
        { duration: '2m', target: 5 }, // Baseline
        { duration: '1m', target: 100 }, // Spike
        { duration: '5m', target: 100 }, // Hold
        { duration: '2m', target: 5 } // Return
      ],
      exec: 'spikeTest',
      tags: { scenario: 'spike' }
    },

    // Soak Test: Long duration
    soak: {
      executor: 'constant-vus',
      vus: 10,
      duration: '2h',
      exec: 'soakTest',
      tags: { scenario: 'soak' }
    },

    // Conversation Test: Realistic workflow
    conversation: {
      executor: 'per-vu-iterations',
      vus: 20,
      iterations: 5,
      maxDuration: '30m',
      exec: 'conversationTest',
      tags: { scenario: 'conversation' }
    }
  },

  // Thresholds for pass/fail
  thresholds: {
    // HTTP checks
    'http_req_duration{scenario:smoke}': ['p(95)<500', 'p(99)<1000'],
    'http_req_duration{scenario:load}': ['p(95)<600', 'p(99)<1200'],
    'http_req_duration{scenario:spike}': ['p(95)<800', 'p(99)<1500'],
    'http_req_duration{scenario:soak}': ['p(95)<700', 'p(99)<1400'],
    'http_req_duration{scenario:conversation}': ['p(95)<1000', 'p(99)<2000'],

    // Error rates
    'http_req_failed': ['rate<0.05'], // Less than 5% failures
    'auth_success_rate': ['rate>0.95'],
    'message_success_rate': ['rate>0.98'],
    'conversation_success_rate': ['rate>0.98'],
    'billing_success_rate': ['rate>0.99'],
  }
}

// ============================================================================
// TEST EXECUTION FUNCTIONS
// ============================================================================

export function smokeTest() {
  executeAuthFlow()
  executeMessageFlow()
  executeConversationFlow()
}

export function loadTest() {
  executeAuthFlow()
  executeMessageFlow()
  executeConversationFlow()
  executeBillingFlow()
}

export function spikeTest() {
  executeAuthFlow()
  executeMessageFlow()
  executeConversationFlow()
}

export function soakTest() {
  executeAuthFlow()
  executeMessageFlow()
  // Lighter load for soak test
  sleep(1)
}

export function conversationTest() {
  // Full realistic workflow
  let authToken = executeAuthFlow()
  if (authToken) {
    executeMessageFlow(authToken)
    executeConversationFlow(authToken)
    executeBillingFlow(authToken)
  }
}

// ============================================================================
// FLOW FUNCTIONS
// ============================================================================

function executeAuthFlow() {
  activeConnections.add(1)

  return group('Auth Flow', () => {
    // Register
    const registerRes = http.post(`${BASE_URL}/api/auth/register`,
      JSON.stringify({
        email: `k6-${Date.now()}-${Math.random()}@test.local`,
        password: 'TestPassword123!',
        firstName: 'K6',
        lastName: 'Tester'
      }),
      { headers: { 'Content-Type': 'application/json' } }
    )

    authLatency.add(registerRes.timings.duration)
    const registerSuccess = check(registerRes, {
      'register status is 200/201': (r) => r.status === 200 || r.status === 201,
      'register has authToken': (r) => r.body.includes('token') || r.body.includes('accessToken')
    })
    authSuccessRate.add(registerSuccess)
    if (!registerSuccess) authErrors.add(1)

    // Login
    const loginRes = http.post(`${BASE_URL}/api/auth/login`,
      JSON.stringify({
        email: testUser.email,
        password: testUser.password
      }),
      { headers: { 'Content-Type': 'application/json' } }
    )

    authLatency.add(loginRes.timings.duration)
    const loginSuccess = check(loginRes, {
      'login status is 200': (r) => r.status === 200,
      'login has token': (r) => r.body.includes('token') || r.body.includes('accessToken')
    })
    authSuccessRate.add(loginSuccess)
    if (!loginSuccess) authErrors.add(1)

    activeConnections.add(-1)

    // Extract and return token
    try {
      const response = JSON.parse(loginRes.body)
      return response.accessToken || response.token || null
    } catch {
      return null
    }
  })
}

function executeMessageFlow(authToken = null) {
  activeConnections.add(1)

  return group('Message Flow', () => {
    const headers = {
      'Content-Type': 'application/json',
      ...(authToken && { 'Authorization': `Bearer ${authToken}` })
    }

    // Send message
    const sendRes = http.post(`${BASE_URL}/api/messages`,
      JSON.stringify({
        content: 'k6 load test message',
        targetType: 'individual',
        targetIds: ['test-member-id']
      }),
      { headers }
    )

    messageLatency.add(sendRes.timings.duration)
    const sendSuccess = check(sendRes, {
      'send status is 200/201': (r) => r.status === 200 || r.status === 201
    })
    messageSuccessRate.add(sendSuccess)
    if (!sendSuccess) messageErrors.add(1)

    // Get history
    const historyRes = http.get(`${BASE_URL}/api/messages/history?limit=50`, { headers })

    messageLatency.add(historyRes.timings.duration)
    const historySuccess = check(historyRes, {
      'history status is 200': (r) => r.status === 200
    })
    messageSuccessRate.add(historySuccess)
    if (!historySuccess) messageErrors.add(1)

    activeConnections.add(-1)
  })
}

function executeConversationFlow(authToken = null) {
  activeConnections.add(1)

  return group('Conversation Flow', () => {
    const headers = {
      'Content-Type': 'application/json',
      ...(authToken && { 'Authorization': `Bearer ${authToken}` })
    }

    // List conversations
    const listRes = http.get(`${BASE_URL}/api/conversations?limit=20`, { headers })

    conversationLatency.add(listRes.timings.duration)
    const listSuccess = check(listRes, {
      'list status is 200': (r) => r.status === 200
    })
    conversationSuccessRate.add(listSuccess)
    if (!listSuccess) conversationErrors.add(1)

    // Get single conversation (if any exist)
    if (listRes.status === 200) {
      try {
        const conversations = JSON.parse(listRes.body)
        if (conversations.length > 0) {
          const convId = conversations[0].id
          const detailRes = http.get(`${BASE_URL}/api/conversations/${convId}/messages`, { headers })

          conversationLatency.add(detailRes.timings.duration)
          const detailSuccess = check(detailRes, {
            'detail status is 200': (r) => r.status === 200
          })
          conversationSuccessRate.add(detailSuccess)
          if (!detailSuccess) conversationErrors.add(1)
        }
      } catch (e) {
        // Continue if parsing fails
      }
    }

    activeConnections.add(-1)
  })
}

function executeBillingFlow(authToken = null) {
  activeConnections.add(1)

  return group('Billing Flow', () => {
    const headers = {
      'Content-Type': 'application/json',
      ...(authToken && { 'Authorization': `Bearer ${authToken}` })
    }

    // Get plans
    const plansRes = http.get(`${BASE_URL}/api/billing/plans`, { headers })

    billingLatency.add(plansRes.timings.duration)
    const plansSuccess = check(plansRes, {
      'plans status is 200': (r) => r.status === 200
    })
    billingSuccessRate.add(plansSuccess)
    if (!plansSuccess) billingErrors.add(1)

    // Get usage
    const usageRes = http.get(`${BASE_URL}/api/billing/usage`, { headers })

    billingLatency.add(usageRes.timings.duration)
    const usageSuccess = check(usageRes, {
      'usage status is 200': (r) => r.status === 200
    })
    billingSuccessRate.add(usageSuccess)
    if (!usageSuccess) billingErrors.add(1)

    activeConnections.add(-1)
  })
}

// ============================================================================
// SUMMARY HANDLER
// ============================================================================

export function handleSummary(data) {
  console.log('\n═══════════════════════════════════════════════════════')
  console.log('K6 BASELINE TEST SUMMARY')
  console.log('═══════════════════════════════════════════════════════\n')

  // Extract key metrics
  const metrics = {
    'Auth Latency (avg)': data.metrics.auth_latency_ms?.values?.value,
    'Message Latency (avg)': data.metrics.message_latency_ms?.values?.value,
    'Conversation Latency (avg)': data.metrics.conversation_latency_ms?.values?.value,
    'Billing Latency (avg)': data.metrics.billing_latency_ms?.values?.value,
    'Auth Success Rate': data.metrics.auth_success_rate?.values?.value,
    'Message Success Rate': data.metrics.message_success_rate?.values?.value,
    'Conversation Success Rate': data.metrics.conversation_success_rate?.values?.value,
    'Billing Success Rate': data.metrics.billing_success_rate?.values?.value,
    'Auth Errors': data.metrics.auth_errors?.values?.value,
    'Message Errors': data.metrics.message_errors?.values?.value,
    'Conversation Errors': data.metrics.conversation_errors?.values?.value,
    'Billing Errors': data.metrics.billing_errors?.values?.value,
  }

  Object.entries(metrics).forEach(([name, value]) => {
    if (value !== undefined) {
      console.log(`  ${name}: ${Math.round(value * 100) / 100}`)
    }
  })

  console.log('\n═══════════════════════════════════════════════════════')
  console.log('Baseline metrics captured. Store these for regression testing.')
  console.log('═══════════════════════════════════════════════════════\n')

  return {
    stdout: JSON.stringify(data, null, 2),
    'baseline-results.json': JSON.stringify({
      timestamp: new Date().toISOString(),
      metrics: metrics
    }, null, 2)
  }
}
