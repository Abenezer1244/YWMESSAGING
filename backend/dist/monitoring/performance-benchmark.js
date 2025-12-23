import fs from 'fs';
import path from 'path';
const BASELINE_DIR = path.join(process.cwd(), 'benchmarks');
const REGRESSION_THRESHOLD = {
    critical: 0.25, // 25% regression = critical
    high: 0.15, // 15% regression = high
    medium: 0.10, // 10% regression = medium
    low: 0.05 // 5% regression = low
};
/**
 * Performance Benchmark Manager
 */
export class PerformanceBenchmark {
    constructor(baselineDir = BASELINE_DIR) {
        this.metrics = [];
        this.baselineDir = baselineDir;
        // Create benchmark directory if it doesn't exist
        if (!fs.existsSync(this.baselineDir)) {
            fs.mkdirSync(this.baselineDir, { recursive: true });
        }
    }
    /**
     * Record a performance measurement
     */
    recordMetric(name, duration, unit = 'ms', tags) {
        this.metrics.push({
            name,
            duration,
            unit,
            timestamp: new Date(),
            tags
        });
    }
    /**
     * Record multiple measurements
     */
    recordMetrics(metrics) {
        metrics.forEach((m) => {
            this.recordMetric(m.name, m.duration, m.unit);
        });
    }
    /**
     * Get all recorded metrics
     */
    getMetrics() {
        return this.metrics;
    }
    /**
     * Clear recorded metrics
     */
    clearMetrics() {
        this.metrics = [];
    }
    /**
     * Calculate percentiles for a metric
     */
    calculatePercentiles(values) {
        if (values.length === 0) {
            return { p50: 0, p95: 0, p99: 0, min: 0, max: 0, avg: 0 };
        }
        const sorted = [...values].sort((a, b) => a - b);
        const sum = values.reduce((a, b) => a + b, 0);
        const getPercentile = (p) => {
            const index = Math.ceil((sorted.length * p) / 100) - 1;
            return sorted[Math.max(0, index)];
        };
        return {
            p50: getPercentile(50),
            p95: getPercentile(95),
            p99: getPercentile(99),
            min: sorted[0],
            max: sorted[sorted.length - 1],
            avg: Math.round(sum / values.length)
        };
    }
    /**
     * Create a performance baseline from current metrics
     */
    createBaseline(name, version = '1.0.0') {
        // Group metrics by name
        const grouped = {};
        this.metrics.forEach((m) => {
            if (!grouped[m.name]) {
                grouped[m.name] = [];
            }
            grouped[m.name].push(m.duration);
        });
        // Calculate percentiles for each metric
        const metrics = {};
        Object.entries(grouped).forEach(([metricName, values]) => {
            metrics[metricName] = this.calculatePercentiles(values);
            metrics[metricName].count = values.length;
        });
        const baseline = {
            name,
            version,
            timestamp: new Date(),
            metrics
        };
        // Save baseline to file
        this.saveBaseline(baseline);
        return baseline;
    }
    /**
     * Save baseline to file
     */
    saveBaseline(baseline) {
        const filename = `${baseline.name}-v${baseline.version}-${Date.now()}.json`;
        const filepath = path.join(this.baselineDir, filename);
        fs.writeFileSync(filepath, JSON.stringify(baseline, null, 2));
        console.log(`✅ Baseline saved: ${filepath}`);
        return filepath;
    }
    /**
     * Load baseline from file
     */
    loadBaseline(filename) {
        const filepath = path.join(this.baselineDir, filename);
        if (!fs.existsSync(filepath)) {
            console.error(`❌ Baseline not found: ${filepath}`);
            return null;
        }
        const content = fs.readFileSync(filepath, 'utf-8');
        return JSON.parse(content);
    }
    /**
     * List all available baselines
     */
    listBaselines() {
        if (!fs.existsSync(this.baselineDir)) {
            return [];
        }
        return fs.readdirSync(this.baselineDir).filter((f) => f.endsWith('.json'));
    }
    /**
     * Get latest baseline for a given name
     */
    getLatestBaseline(name) {
        const baselines = this.listBaselines()
            .filter((f) => f.startsWith(name))
            .sort()
            .reverse();
        if (baselines.length === 0) {
            return null;
        }
        return this.loadBaseline(baselines[0]);
    }
    /**
     * Analyze current metrics against a baseline
     */
    analyzeRegression(baseline, name = `regression-${Date.now()}`) {
        const regressions = [];
        const improvements = [];
        // Compare each metric
        for (const [metricName, baselineStats] of Object.entries(baseline.metrics)) {
            // Find corresponding current metric
            const currentMetrics = this.metrics.filter((m) => m.name === metricName);
            if (currentMetrics.length === 0) {
                continue;
            }
            const currentValues = currentMetrics.map((m) => m.duration);
            const currentStats = this.calculatePercentiles(currentValues);
            // Compare p95 as the primary metric
            const percentChange = (currentStats.p95 - baselineStats.p95) / baselineStats.p95;
            const percentChangePercent = percentChange * 100;
            if (percentChange > REGRESSION_THRESHOLD.critical) {
                regressions.push({
                    metric: metricName,
                    baselineValue: baselineStats.p95,
                    currentValue: currentStats.p95,
                    percentChange: percentChangePercent,
                    severity: 'critical'
                });
            }
            else if (percentChange > REGRESSION_THRESHOLD.high) {
                regressions.push({
                    metric: metricName,
                    baselineValue: baselineStats.p95,
                    currentValue: currentStats.p95,
                    percentChange: percentChangePercent,
                    severity: 'high'
                });
            }
            else if (percentChange > REGRESSION_THRESHOLD.medium) {
                regressions.push({
                    metric: metricName,
                    baselineValue: baselineStats.p95,
                    currentValue: currentStats.p95,
                    percentChange: percentChangePercent,
                    severity: 'medium'
                });
            }
            else if (percentChange > REGRESSION_THRESHOLD.low) {
                regressions.push({
                    metric: metricName,
                    baselineValue: baselineStats.p95,
                    currentValue: currentStats.p95,
                    percentChange: percentChangePercent,
                    severity: 'low'
                });
            }
            else if (percentChange < -0.05) {
                // 5% improvement is significant
                improvements.push({
                    metric: metricName,
                    baselineValue: baselineStats.p95,
                    currentValue: currentStats.p95,
                    percentChange: percentChangePercent
                });
            }
        }
        const analysis = {
            timestamp: new Date(),
            baseline: baseline.name,
            regressions,
            improvements,
            passedThreshold: regressions.filter((r) => r.severity === 'critical' || r.severity === 'high').length === 0
        };
        return analysis;
    }
    /**
     * Generate regression report
     */
    generateRegressionReport(analysis) {
        let report = '\n═══════════════════════════════════════════════════════\n';
        report += 'PERFORMANCE REGRESSION ANALYSIS\n';
        report += '═══════════════════════════════════════════════════════\n\n';
        report += `Baseline: ${analysis.baseline}\n`;
        report += `Timestamp: ${analysis.timestamp.toISOString()}\n`;
        report += `Status: ${analysis.passedThreshold ? '✅ PASSED' : '❌ FAILED'}\n\n`;
        if (analysis.regressions.length > 0) {
            report += '⚠️  REGRESSIONS DETECTED:\n';
            analysis.regressions.forEach((r) => {
                const icon = r.severity === 'critical' ? '🔴' : r.severity === 'high' ? '🟠' : '🟡';
                report += `\n${icon} ${r.metric} [${r.severity.toUpperCase()}]\n`;
                report += `   Baseline: ${r.baselineValue.toFixed(2)}ms\n`;
                report += `   Current:  ${r.currentValue.toFixed(2)}ms\n`;
                report += `   Change:   ${r.percentChange > 0 ? '+' : ''}${r.percentChange.toFixed(2)}%\n`;
            });
        }
        else {
            report += '✅ No regressions detected\n';
        }
        if (analysis.improvements.length > 0) {
            report += '\n\n🚀 IMPROVEMENTS DETECTED:\n';
            analysis.improvements.forEach((imp) => {
                report += `\n✨ ${imp.metric}\n`;
                report += `   Baseline: ${imp.baselineValue.toFixed(2)}ms\n`;
                report += `   Current:  ${imp.currentValue.toFixed(2)}ms\n`;
                report += `   Change:   ${imp.percentChange.toFixed(2)}%\n`;
            });
        }
        report += '\n═══════════════════════════════════════════════════════\n';
        return report;
    }
    /**
     * Print regression analysis to console
     */
    printRegressionReport(analysis) {
        const report = this.generateRegressionReport(analysis);
        console.log(report);
    }
    /**
     * Check if analysis passed threshold (for CI/CD gates)
     */
    passedRegressionTest(analysis) {
        return analysis.passedThreshold;
    }
}
/**
 * CI/CD Integration: Jest/Vitest-style test function
 * Usage in test files:
 *
 * describe('Performance Benchmarks', () => {
 *   const benchmark = new PerformanceBenchmark()
 *
 *   it('should not regress query performance', async () => {
 *     // Run your perf test
 *     const start = Date.now()
 *     // ... operation
 *     const duration = Date.now() - start
 *
 *     benchmark.recordMetric('operation_name', duration)
 *   })
 *
 *   afterAll(() => {
 *     const baseline = benchmark.getLatestBaseline('main')
 *     if (baseline) {
 *       const analysis = benchmark.analyzeRegression(baseline)
 *       benchmark.printRegressionReport(analysis)
 *       expect(benchmark.passedRegressionTest(analysis)).toBe(true)
 *     }
 *   })
 * })
 */
/**
 * GitHub Actions Integration
 * Usage in .github/workflows/performance-test.yml:
 *
 * - name: Run Performance Benchmarks
 *   run: npm run benchmark
 *
 * - name: Analyze Regressions
 *   run: npm run benchmark:analyze
 *
 * - name: Comment PR with Results
 *   if: github.event_name == 'pull_request'
 *   uses: actions/github-script@v6
 *   with:
 *     script: |
 *       const report = fs.readFileSync('benchmark-report.md', 'utf8')
 *       github.rest.issues.createComment({
 *         issue_number: context.issue.number,
 *         owner: context.repo.owner,
 *         repo: context.repo.repo,
 *         body: report
 *       })
 */
/**
 * CLI Usage
 * Commands to add to package.json:
 *
 * "benchmark": "node benchmark-runner.js",
 * "benchmark:baseline": "node benchmark-runner.js --create-baseline",
 * "benchmark:analyze": "node benchmark-runner.js --analyze"
 */
//# sourceMappingURL=performance-benchmark.js.map