/**
 * Performance Benchmark Framework
 *
 * Phase 2 Task 2.5: Baseline establishment and regression detection
 * Supports:
 * - Performance baseline snapshot creation
 * - Regression detection against baseline
 * - CI/CD integration for automated testing
 * - Historical performance tracking
 */
export interface BenchmarkMetric {
    name: string;
    duration: number;
    unit: 'ms' | 'sec' | '%';
    timestamp: Date;
    tags?: Record<string, string>;
}
export interface BenchmarkBaseline {
    name: string;
    version: string;
    timestamp: Date;
    metrics: {
        [key: string]: {
            p50: number;
            p95: number;
            p99: number;
            min: number;
            max: number;
            avg: number;
            count: number;
        };
    };
}
export interface RegressionAnalysis {
    timestamp: Date;
    baseline: string;
    regressions: Array<{
        metric: string;
        baselineValue: number;
        currentValue: number;
        percentChange: number;
        severity: 'critical' | 'high' | 'medium' | 'low';
    }>;
    improvements: Array<{
        metric: string;
        baselineValue: number;
        currentValue: number;
        percentChange: number;
    }>;
    passedThreshold: boolean;
}
/**
 * Performance Benchmark Manager
 */
export declare class PerformanceBenchmark {
    private metrics;
    private baselineDir;
    constructor(baselineDir?: string);
    /**
     * Record a performance measurement
     */
    recordMetric(name: string, duration: number, unit?: 'ms' | 'sec' | '%', tags?: Record<string, string>): void;
    /**
     * Record multiple measurements
     */
    recordMetrics(metrics: Array<{
        name: string;
        duration: number;
        unit?: 'ms' | 'sec' | '%';
    }>): void;
    /**
     * Get all recorded metrics
     */
    getMetrics(): BenchmarkMetric[];
    /**
     * Clear recorded metrics
     */
    clearMetrics(): void;
    /**
     * Calculate percentiles for a metric
     */
    private calculatePercentiles;
    /**
     * Create a performance baseline from current metrics
     */
    createBaseline(name: string, version?: string): BenchmarkBaseline;
    /**
     * Save baseline to file
     */
    private saveBaseline;
    /**
     * Load baseline from file
     */
    loadBaseline(filename: string): BenchmarkBaseline | null;
    /**
     * List all available baselines
     */
    listBaselines(): string[];
    /**
     * Get latest baseline for a given name
     */
    getLatestBaseline(name: string): BenchmarkBaseline | null;
    /**
     * Analyze current metrics against a baseline
     */
    analyzeRegression(baseline: BenchmarkBaseline, name?: string): RegressionAnalysis;
    /**
     * Generate regression report
     */
    generateRegressionReport(analysis: RegressionAnalysis): string;
    /**
     * Print regression analysis to console
     */
    printRegressionReport(analysis: RegressionAnalysis): void;
    /**
     * Check if analysis passed threshold (for CI/CD gates)
     */
    passedRegressionTest(analysis: RegressionAnalysis): boolean;
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
//# sourceMappingURL=performance-benchmark.d.ts.map