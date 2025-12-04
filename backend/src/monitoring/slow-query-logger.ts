import { PrismaClient } from '@prisma/client'

// Optional: Newrelic integration (only if installed)
let newrelic: any = null;
try {
  newrelic = require('newrelic');
} catch (e) {
  // newrelic is optional - if not installed, logging still works
  newrelic = null;
}

/**
 * Slow Query Logger
 *
 * Phase 2 Task 2.4: Enhanced slow query detection and logging
 * Integrates with Prisma middleware to track and report slow queries
 *
 * Features:
 * - Real-time slow query detection (>500ms threshold)
 * - Detailed query analysis and metrics
 * - Integration with New Relic for monitoring
 * - Query performance trends and patterns
 * - Slow query alerts for critical operations
 */

interface SlowQueryEvent {
  timestamp: Date
  query: string
  duration: number
  operation: string
  params: Record<string, any>
  model?: string
  action?: string
}

/**
 * Slow Query Log - stores recent slow queries for analysis
 */
class SlowQueryLog {
  private log: SlowQueryEvent[] = []
  private maxSize: number = 1000

  add(event: SlowQueryEvent) {
    this.log.push(event)
    if (this.log.length > this.maxSize) {
      this.log = this.log.slice(-this.maxSize)
    }
  }

  getRecent(limit: number = 50): SlowQueryEvent[] {
    return this.log.slice(-limit)
  }

  getByModel(model: string): SlowQueryEvent[] {
    return this.log.filter((e) => e.model === model)
  }

  getByDuration(minDuration: number): SlowQueryEvent[] {
    return this.log.filter((e) => e.duration >= minDuration)
  }

  clear() {
    this.log = []
  }

  getStats() {
    if (this.log.length === 0) {
      return {
        count: 0,
        avgDuration: 0,
        maxDuration: 0,
        minDuration: 0
      }
    }

    const durations = this.log.map((e) => e.duration)
    const sum = durations.reduce((a, b) => a + b, 0)

    return {
      count: this.log.length,
      avgDuration: Math.round(sum / this.log.length),
      maxDuration: Math.max(...durations),
      minDuration: Math.min(...durations)
    }
  }
}

export const slowQueryLog = new SlowQueryLog()

/**
 * Initialize Prisma slow query logging
 * Call this in your server initialization after creating PrismaClient
 */
export function initializeSlowQueryLogging(prisma: PrismaClient) {
  const SLOW_QUERY_THRESHOLD = 500 // milliseconds
  const CRITICAL_QUERY_THRESHOLD = 2000 // milliseconds

  // Use Prisma's $use middleware to intercept all queries
  prisma.$use(async (params, next) => {
    const startTime = Date.now()

    try {
      const result = await next(params)
      const duration = Date.now() - startTime

      // Log all queries to performance metrics
      recordQueryMetric(params, duration)

      // Detect and log slow queries
      if (duration > SLOW_QUERY_THRESHOLD) {
        const event: SlowQueryEvent = {
          timestamp: new Date(),
          query: params.args?.query || `${params.model}.${params.action}`,
          duration,
          operation: `${params.model}.${params.action}`,
          params: params.args || {},
          model: params.model,
          action: params.action
        }

        slowQueryLog.add(event)

        // Log to console and New Relic
        logSlowQuery(event, duration > CRITICAL_QUERY_THRESHOLD)
      }

      return result
    } catch (error) {
      const duration = Date.now() - startTime

      // Record error metrics
      if (newrelic) {
        newrelic.recordMetric('Custom/Database/Query/Error/Count', 1);
        newrelic.recordMetric(
          'Custom/Database/Query/Error/Latency',
          duration
        );
      }

      console.error(
        `Database error in ${params.model}.${params.action} after ${duration}ms:`,
        error
      )

      throw error
    }
  })
}

/**
 * Record query metrics to New Relic
 */
function recordQueryMetric(
  params: any,
  duration: number
) {
  if (!newrelic) return;

  // Overall query latency
  newrelic.recordMetric('Custom/Database/Query/Latency', duration);

  // Per-model metrics
  if (params.model) {
    newrelic.recordMetric(
      `Custom/Database/Model/${params.model}/Latency`,
      duration
    );
  }

  // Per-action metrics (find, create, update, delete, etc.)
  if (params.action) {
    newrelic.recordMetric(
      `Custom/Database/Action/${params.action}/Latency`,
      duration
    );
  }

  // Per-model-action metrics
  if (params.model && params.action) {
    newrelic.recordMetric(
      `Custom/Database/${params.model}/${params.action}/Latency`,
      duration
    );
  }
}

/**
 * Log slow query with detailed analysis
 */
function logSlowQuery(event: SlowQueryEvent, isCritical: boolean = false) {
  const logLevel = isCritical ? 'error' : 'warn'
  const logFn = isCritical ? console.error : console.warn

  logFn(
    `[SLOW QUERY] ${event.operation} took ${event.duration}ms (threshold: 500ms)`
  )

  if (isCritical) {
    console.error(`  ⚠️  CRITICAL: This query exceeds 2000ms threshold`)
  }

  // Record slow query event to New Relic
  if (newrelic) {
    newrelic.recordMetric('Custom/Database/SlowQuery/Count', 1);

    if (isCritical) {
      newrelic.recordMetric('Custom/Database/CriticalSlowQuery/Count', 1);
      if (newrelic.noticeError) {
        newrelic.noticeError(
          new Error(`Critical slow query: ${event.operation} (${event.duration}ms)`)
        );
      }
    }
  }

  // Log parameters (sanitized)
  if (Object.keys(event.params).length > 0) {
    // Don't log sensitive data
    const sanitizedParams = sanitizeParams(event.params)
    console.warn(`  Parameters: ${JSON.stringify(sanitizedParams)}`)
  }
}

/**
 * Sanitize query parameters to avoid logging sensitive data
 */
function sanitizeParams(params: Record<string, any>): Record<string, any> {
  const sensitive = ['password', 'passwordHash', 'token', 'secret', 'key', 'apiKey']
  const result: Record<string, any> = {}

  for (const [key, value] of Object.entries(params)) {
    if (sensitive.some((s) => key.toLowerCase().includes(s))) {
      result[key] = '[REDACTED]'
    } else if (typeof value === 'string' && value.length > 100) {
      result[key] = value.substring(0, 50) + '...' + value.substring(value.length - 20)
    } else if (typeof value === 'object' && value !== null) {
      result[key] = '{...}'
    } else {
      result[key] = value
    }
  }

  return result
}

/**
 * Get slow query report - useful for performance analysis
 */
export function getSlowQueryReport() {
  const recentQueries = slowQueryLog.getRecent(50)
  const stats = slowQueryLog.getStats()

  // Group by model
  const byModel: Record<string, SlowQueryEvent[]> = {}
  recentQueries.forEach((q) => {
    if (!byModel[q.model || 'unknown']) {
      byModel[q.model || 'unknown'] = []
    }
    byModel[q.model || 'unknown'].push(q)
  })

  // Group by operation
  const byOperation: Record<string, number> = {}
  recentQueries.forEach((q) => {
    byOperation[q.operation] = (byOperation[q.operation] || 0) + 1
  })

  return {
    summary: {
      totalSlowQueries: stats.count,
      averageDuration: stats.avgDuration,
      maxDuration: stats.maxDuration,
      minDuration: stats.minDuration,
      timeWindow: '1000 most recent queries'
    },
    byModel,
    byOperation,
    recentQueries: recentQueries.slice(-20) // Last 20
  }
}

/**
 * Export slow query report to console (for debugging)
 */
export function printSlowQueryReport() {
  const report = getSlowQueryReport()

  console.log('\n═══════════════════════════════════════════════════════')
  console.log('SLOW QUERY ANALYSIS REPORT')
  console.log('═══════════════════════════════════════════════════════')

  console.log('\n📊 SUMMARY')
  console.log(`  Total Slow Queries: ${report.summary.totalSlowQueries}`)
  console.log(`  Average Duration: ${report.summary.averageDuration}ms`)
  console.log(`  Max Duration: ${report.summary.maxDuration}ms`)
  console.log(`  Min Duration: ${report.summary.minDuration}ms`)

  console.log('\n📈 BY MODEL')
  Object.entries(report.byModel).forEach(([model, queries]) => {
    const avgDuration = Math.round(
      queries.reduce((sum, q) => sum + q.duration, 0) / queries.length
    )
    console.log(`  ${model}: ${queries.length} queries (avg: ${avgDuration}ms)`)
  })

  console.log('\n📋 BY OPERATION')
  Object.entries(report.byOperation).forEach(([operation, count]) => {
    console.log(`  ${operation}: ${count} occurrences`)
  })

  console.log('\n⏱️  RECENT SLOW QUERIES (Top 5)')
  report.recentQueries.slice(-5).forEach((q) => {
    console.log(
      `  ${q.operation} - ${q.duration}ms - ${q.timestamp.toLocaleTimeString()}`
    )
  })

  console.log('\n═══════════════════════════════════════════════════════\n')
}

/**
 * REST API endpoint handler for slow query report
 * Usage: app.get('/api/debug/slow-queries', slowQueryReportHandler)
 */
export function slowQueryReportHandler(req: any, res: any) {
  // Check authorization in production!
  if (
    process.env.NODE_ENV === 'production' &&
    req.headers['authorization'] !== `Bearer ${process.env.ADMIN_API_KEY}`
  ) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const report = getSlowQueryReport()
  res.json(report)
}

/**
 * Middleware to expose slow query metrics
 * Usage: app.get('/metrics/slow-queries', slowQueryMetricsMiddleware)
 */
export function slowQueryMetricsMiddleware(req: any, res: any) {
  const stats = slowQueryLog.getStats()
  const recentQueries = slowQueryLog.getRecent(5)

  res.json({
    stats,
    recentQueries,
    timestamp: new Date().toISOString()
  })
}

/**
 * Trigger metrics collection (for periodic analysis)
 */
export function collectSlowQueryMetrics() {
  const stats = slowQueryLog.getStats()
  const criticalQueries = slowQueryLog.getByDuration(2000).length

  // Send to New Relic (if available)
  if (newrelic) {
    newrelic.recordMetric('Custom/Database/SlowQuery/Total24h', stats.count);
    newrelic.recordMetric(
      'Custom/Database/CriticalSlowQuery/Total24h',
      criticalQueries
    );
    newrelic.recordMetric(
      'Custom/Database/Query/AverageDuration',
      stats.avgDuration
    );
  }
}

/**
 * Setup periodic slow query metrics collection
 * Call once on server startup
 */
export function startSlowQueryMetricsCollection(intervalMinutes: number = 30) {
  // Collect every N minutes
  setInterval(() => {
    collectSlowQueryMetrics()
    console.log('[SlowQueryLogger] Metrics collected and sent to New Relic')
  }, intervalMinutes * 60 * 1000)

  console.log(
    `[SlowQueryLogger] Slow query metrics collection started (every ${intervalMinutes} minutes)`
  )
}
