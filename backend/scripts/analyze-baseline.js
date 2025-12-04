#!/usr/bin/env node

/**
 * Phase 3 Task 3.2: k6 Baseline Analysis
 *
 * Analyzes k6 baseline test results and generates performance report
 * Compares metrics against expected thresholds and creates baseline snapshot
 *
 * Usage: node scripts/analyze-baseline.js <k6-results-file>
 */

const fs = require('fs')
const path = require('path')

// Expected performance targets (from k6-baseline.js thresholds)
const PERFORMANCE_TARGETS = {
  'smoke': {
    'p95': 500,
    'p99': 1000,
    'errorRate': 0.05
  },
  'load': {
    'p95': 600,
    'p99': 1200,
    'errorRate': 0.05
  },
  'spike': {
    'p95': 800,
    'p99': 1500,
    'errorRate': 0.05
  },
  'soak': {
    'p95': 700,
    'p99': 1400,
    'errorRate': 0.05
  },
  'conversation': {
    'p95': 1000,
    'p99': 2000,
    'errorRate': 0.05
  }
}

// Expected success rates by feature
const SUCCESS_RATE_TARGETS = {
  'auth_success_rate': 0.95,
  'message_success_rate': 0.98,
  'conversation_success_rate': 0.98,
  'billing_success_rate': 0.99
}

function parseK6Results(filePath) {
  if (!fs.existsSync(filePath)) {
    console.error(`❌ Results file not found: ${filePath}`)
    process.exit(1)
  }

  try {
    const content = fs.readFileSync(filePath, 'utf8')
    return JSON.parse(content)
  } catch (error) {
    console.error(`❌ Failed to parse results file: ${error.message}`)
    process.exit(1)
  }
}

function extractMetric(data, metricName) {
  try {
    if (!data.metrics || !data.metrics[metricName]) {
      return null
    }
    const metric = data.metrics[metricName]
    return metric.values || {}
  } catch (e) {
    return null
  }
}

function extractPercentile(metric, percentile) {
  if (!metric) return null
  const key = `p(${percentile})`
  return metric[key] || metric[`${percentile}`] || null
}

function analyzeResults(k6Data) {
  console.log('\n═══════════════════════════════════════════════════════')
  console.log('BASELINE ANALYSIS REPORT')
  console.log('═══════════════════════════════════════════════════════\n')

  const analysis = {
    timestamp: new Date().toISOString(),
    results: {},
    issues: [],
    recommendations: [],
    passFailStatus: 'PASS'
  }

  // Analyze latency by scenario
  console.log('📊 RESPONSE TIME ANALYSIS')
  console.log('────────────────────────────────────────────────────────\n')

  Object.keys(PERFORMANCE_TARGETS).forEach((scenario) => {
    const targets = PERFORMANCE_TARGETS[scenario]
    const scenarioMetric = extractMetric(
      k6Data,
      `http_req_duration{scenario:${scenario}}`
    )

    if (!scenarioMetric) {
      console.log(`⚠️  ${scenario}: No data collected`)
      return
    }

    const p95 = extractPercentile(scenarioMetric, 95)
    const p99 = extractPercentile(scenarioMetric, 99)
    const avg = scenarioMetric.value || 0

    analysis.results[scenario] = {
      avg: Math.round(avg),
      p95: p95 ? Math.round(p95) : 0,
      p99: p99 ? Math.round(p99) : 0,
      targets: targets,
      status: 'PASS'
    }

    // Check against targets
    if (p95 && p95 > targets.p95) {
      analysis.results[scenario].status = 'FAIL'
      analysis.passFailStatus = 'FAIL'
      analysis.issues.push(
        `${scenario}: p95 latency ${Math.round(p95)}ms exceeds target ${targets.p95}ms`
      )
    }
    if (p99 && p99 > targets.p99) {
      analysis.results[scenario].status = 'FAIL'
      analysis.passFailStatus = 'FAIL'
      analysis.issues.push(
        `${scenario}: p99 latency ${Math.round(p99)}ms exceeds target ${targets.p99}ms`
      )
    }

    const statusIcon = analysis.results[scenario].status === 'PASS' ? '✅' : '❌'
    console.log(`${statusIcon} ${scenario.toUpperCase()}`)
    console.log(`   Avg:     ${Math.round(avg)}ms`)
    console.log(`   P95:     ${p95 ? Math.round(p95) : 'N/A'}ms (target: ${targets.p95}ms)`)
    console.log(`   P99:     ${p99 ? Math.round(p99) : 'N/A'}ms (target: ${targets.p99}ms)`)
    console.log()
  })

  // Analyze error rates
  console.log('📊 ERROR RATE ANALYSIS')
  console.log('────────────────────────────────────────────────────────\n')

  const httpReqFailedMetric = extractMetric(k6Data, 'http_req_failed')
  if (httpReqFailedMetric) {
    const errorRate = httpReqFailedMetric.value || 0
    const targetErrorRate = 0.05

    analysis.errorRate = {
      actual: Math.round(errorRate * 10000) / 100,
      target: Math.round(targetErrorRate * 10000) / 100,
      status: errorRate <= targetErrorRate ? 'PASS' : 'FAIL'
    }

    if (errorRate > targetErrorRate) {
      analysis.passFailStatus = 'FAIL'
      analysis.issues.push(
        `Error rate ${Math.round(errorRate * 10000) / 100}% exceeds target ${targetErrorRate * 100}%`
      )
    }

    const statusIcon = analysis.errorRate.status === 'PASS' ? '✅' : '❌'
    console.log(`${statusIcon} Overall Error Rate: ${analysis.errorRate.actual}% (target: ${analysis.errorRate.target}%)\n`)
  }

  // Analyze success rates by feature
  console.log('📊 SUCCESS RATE BY FEATURE')
  console.log('────────────────────────────────────────────────────────\n')

  analysis.successRates = {}
  Object.entries(SUCCESS_RATE_TARGETS).forEach(([feature, target]) => {
    const metric = extractMetric(k6Data, feature)
    if (metric) {
      const rate = metric.value || 0
      analysis.successRates[feature] = {
        actual: Math.round(rate * 10000) / 100,
        target: Math.round(target * 10000) / 100,
        status: rate >= target ? 'PASS' : 'FAIL'
      }

      if (rate < target) {
        analysis.passFailStatus = 'FAIL'
        analysis.issues.push(
          `${feature}: ${Math.round(rate * 10000) / 100}% below target ${Math.round(target * 10000) / 100}%`
        )
      }

      const statusIcon = analysis.successRates[feature].status === 'PASS' ? '✅' : '❌'
      console.log(`${statusIcon} ${feature}`)
      console.log(`   Actual:  ${analysis.successRates[feature].actual}%`)
      console.log(`   Target:  ${analysis.successRates[feature].target}%`)
      console.log()
    }
  })

  // Analyze throughput
  console.log('📊 THROUGHPUT ANALYSIS')
  console.log('────────────────────────────────────────────────────────\n')

  const httpReqsMetric = extractMetric(k6Data, 'http_reqs')
  if (httpReqsMetric) {
    const totalRequests = httpReqsMetric.value || 0
    analysis.throughput = {
      totalRequests: Math.round(totalRequests),
      requestsPerSecond: totalRequests > 0 ? Math.round((totalRequests / 3600) * 100) / 100 : 0
    }
    console.log(`✅ Total Requests: ${analysis.throughput.totalRequests}`)
    console.log(`   Rate: ~${analysis.throughput.requestsPerSecond} req/sec\n`)
  }

  // Generate recommendations
  if (analysis.issues.length === 0) {
    analysis.recommendations.push('✅ All performance targets met - baseline is healthy')
  } else {
    if (analysis.issues.some(i => i.includes('latency'))) {
      analysis.recommendations.push(
        '⚠️  High latency detected. Consider: Database query optimization, caching, load balancing'
      )
    }
    if (analysis.issues.some(i => i.includes('Error rate'))) {
      analysis.recommendations.push(
        '⚠️  High error rate detected. Review application logs and error handling'
      )
    }
    if (analysis.issues.some(i => i.includes('Success rate'))) {
      analysis.recommendations.push(
        '⚠️  Low success rates detected. Check feature-specific error logs'
      )
    }
  }

  return analysis
}

function saveBaseline(analysis, outputDir = 'benchmarks') {
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5)
  const baselineFile = path.join(outputDir, `baseline-${timestamp}.json`)

  const baselineData = {
    timestamp: analysis.timestamp,
    results: analysis.results,
    errorRate: analysis.errorRate,
    successRates: analysis.successRates,
    throughput: analysis.throughput,
    status: analysis.passFailStatus
  }

  fs.writeFileSync(baselineFile, JSON.stringify(baselineData, null, 2))
  console.log(`✅ Baseline saved: ${baselineFile}\n`)

  return baselineFile
}

function printSummary(analysis) {
  console.log('═══════════════════════════════════════════════════════')
  console.log('BASELINE SUMMARY')
  console.log('═══════════════════════════════════════════════════════\n')

  if (analysis.issues.length > 0) {
    console.log('⚠️  ISSUES FOUND:')
    analysis.issues.forEach((issue) => console.log(`   • ${issue}`))
    console.log()
  }

  console.log('💡 RECOMMENDATIONS:')
  analysis.recommendations.forEach((rec) => console.log(`   ${rec}`))
  console.log()

  console.log('═══════════════════════════════════════════════════════')
  console.log(`OVERALL STATUS: ${analysis.passFailStatus === 'PASS' ? '✅ PASS' : '❌ FAIL'}`)
  console.log('═══════════════════════════════════════════════════════\n')

  console.log('NEXT STEPS:')
  if (analysis.passFailStatus === 'PASS') {
    console.log('1. ✅ Baseline established and healthy')
    console.log('2. Store baseline for regression comparison: cp benchmarks/baseline-*.json benchmarks/main-baseline.json')
    console.log('3. Deploy Task 3.3: Set up New Relic monitoring')
    console.log('4. Start continuous performance monitoring')
  } else {
    console.log('1. ⚠️  Investigate and resolve performance issues')
    console.log('2. Re-run baseline tests after fixes')
    console.log('3. Continue to Task 3.3 once baseline passes')
  }
  console.log()
}

// Main execution
const resultsFile = process.argv[2]
if (!resultsFile) {
  console.error('Usage: node scripts/analyze-baseline.js <k6-results-file>')
  process.exit(1)
}

const k6Data = parseK6Results(resultsFile)
const analysis = analyzeResults(k6Data)
const baselineFile = saveBaseline(analysis)
printSummary(analysis)

// Exit with appropriate code
process.exit(analysis.passFailStatus === 'PASS' ? 0 : 1)
