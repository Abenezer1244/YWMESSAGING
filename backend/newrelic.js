'use strict'
/**
 * New Relic Agent Configuration
 *
 * Phase 2 Task 2.2: Performance monitoring and alerting setup
 * Configures custom metrics for:
 * - Database query latency
 * - API endpoint performance
 * - Message delivery tracking
 * - Billing operation metrics
 */

exports.config = {
  // ============================================================================
  // App Configuration
  // ============================================================================
  app_name: ['Koinonia YW Platform'],
  license_key: process.env.NEW_RELIC_LICENSE_KEY,
  logging: {
    level: 'info',
    filepath: 'stdout'
  },

  // ============================================================================
  // Agent Configuration
  // ============================================================================
  agent_enabled: process.env.NEW_RELIC_ENABLED !== 'false',

  // Attributes - what data gets sent to New Relic
  attributes: {
    enabled: true,
    exclude: [
      'request.headers.cookie',
      'request.headers.authorization',
      'request.headers.x-api-key'
    ]
  },

  // ============================================================================
  // Performance Monitoring
  // ============================================================================
  transaction_tracer: {
    enabled: true,
    // Trace transactions taking longer than this threshold
    transaction_threshold: 'apdex_f', // Frustrated threshold
    top_n: 20,
    record_sql: 'obfuscated'
  },

  // ============================================================================
  // Custom Metrics for Phase 2 Performance Tracking
  // ============================================================================
  custom_metrics: {
    // Database Performance
    'Custom/Database/Query/Latency': {
      description: 'Database query execution time (ms)',
      unit: 'milliseconds',
      target: 100 // Target: <100ms for all queries
    },
    'Custom/Database/SlowQuery/Count': {
      description: 'Count of slow queries (>500ms)',
      unit: 'count',
      target: 0
    },
    'Custom/Database/Connection/Pool/Active': {
      description: 'Active database connections',
      unit: 'count'
    },

    // API Performance by Endpoint
    'Custom/API/Auth/Register/Latency': {
      description: 'POST /api/auth/register duration (ms)',
      unit: 'milliseconds',
      target: 800
    },
    'Custom/API/Auth/Login/Latency': {
      description: 'POST /api/auth/login duration (ms)',
      unit: 'milliseconds',
      target: 500
    },
    'Custom/API/Messages/Create/Latency': {
      description: 'POST /api/messages duration (ms)',
      unit: 'milliseconds',
      target: 1000
    },
    'Custom/API/Messages/History/Latency': {
      description: 'GET /api/messages/history duration (ms)',
      unit: 'milliseconds',
      target: 500
    },
    'Custom/API/Conversations/List/Latency': {
      description: 'GET /api/conversations duration (ms)',
      unit: 'milliseconds',
      target: 400
    },
    'Custom/API/Conversations/Messages/Latency': {
      description: 'GET /api/conversations/:id/messages duration (ms)',
      unit: 'milliseconds',
      target: 300
    },
    'Custom/API/Billing/Plans/Latency': {
      description: 'GET /api/billing/plans duration (ms)',
      unit: 'milliseconds',
      target: 200
    },
    'Custom/API/Billing/Usage/Latency': {
      description: 'GET /api/billing/usage duration (ms)',
      unit: 'milliseconds',
      target: 1500
    },

    // Message Delivery Metrics
    'Custom/Messages/Delivery/Success/Rate': {
      description: 'Percentage of messages delivered successfully',
      unit: 'percent',
      target: 98 // 98% success target
    },
    'Custom/Messages/Delivery/Failed/Count': {
      description: 'Count of failed message deliveries',
      unit: 'count',
      target: 0
    },
    'Custom/Messages/Average/Latency': {
      description: 'Average time from send to delivery (seconds)',
      unit: 'seconds',
      target: 5 // Target: <5 seconds average
    },

    // Billing Metrics
    'Custom/Billing/SMS/Cost/Total': {
      description: 'Total SMS costs for billing period',
      unit: 'usd'
    },
    'Custom/Billing/Plan/Active/Count': {
      description: 'Count of active paid subscriptions',
      unit: 'count'
    },
    'Custom/Billing/Trial/Expiring/Count': {
      description: 'Count of trials expiring within 7 days',
      unit: 'count'
    },

    // Error Tracking
    'Custom/Errors/Database/Count': {
      description: 'Count of database-related errors',
      unit: 'count',
      target: 0
    },
    'Custom/Errors/Payment/Count': {
      description: 'Count of payment processing errors',
      unit: 'count',
      target: 0
    },
    'Custom/Errors/MessageDelivery/Count': {
      description: 'Count of message delivery errors',
      unit: 'count',
      target: 0
    }
  },

  // ============================================================================
  // Slow Query Logging
  // ============================================================================
  slow_sql: {
    enabled: true,
    max_samples: 10,
    threshold: 500 // Log queries taking >500ms
  },

  // ============================================================================
  // Error Collection
  // ============================================================================
  error_collector: {
    enabled: true,
    ignore_status_codes: [400, 401, 403, 404, 405] // Ignore client errors
  },

  // ============================================================================
  // Real User Monitoring (disabled for API-only app)
  // ============================================================================
  browser_monitoring: {
    enabled: false
  },

  // ============================================================================
  // Security
  // ============================================================================
  security: {
    // Don't log sensitive headers
    excluded_request_headers: [
      'authorization',
      'cookie',
      'x-api-key',
      'x-access-token'
    ]
  }
}
