import { PrismaClient } from '@prisma/client';
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
    timestamp: Date;
    query: string;
    duration: number;
    operation: string;
    params: Record<string, any>;
    model?: string;
    action?: string;
}
/**
 * Slow Query Log - stores recent slow queries for analysis
 */
declare class SlowQueryLog {
    private log;
    private maxSize;
    add(event: SlowQueryEvent): void;
    getRecent(limit?: number): SlowQueryEvent[];
    getByModel(model: string): SlowQueryEvent[];
    getByDuration(minDuration: number): SlowQueryEvent[];
    clear(): void;
    getStats(): {
        count: number;
        avgDuration: number;
        maxDuration: number;
        minDuration: number;
    };
}
export declare const slowQueryLog: SlowQueryLog;
/**
 * Initialize Prisma slow query logging
 * Call this in your server initialization after creating PrismaClient
 */
export declare function initializeSlowQueryLogging(prisma: PrismaClient): void;
/**
 * Get slow query report - useful for performance analysis
 */
export declare function getSlowQueryReport(): {
    summary: {
        totalSlowQueries: number;
        averageDuration: number;
        maxDuration: number;
        minDuration: number;
        timeWindow: string;
    };
    byModel: Record<string, SlowQueryEvent[]>;
    byOperation: Record<string, number>;
    recentQueries: SlowQueryEvent[];
};
/**
 * Export slow query report to console (for debugging)
 */
export declare function printSlowQueryReport(): void;
/**
 * REST API endpoint handler for slow query report
 * Usage: app.get('/api/debug/slow-queries', slowQueryReportHandler)
 */
export declare function slowQueryReportHandler(req: any, res: any): any;
/**
 * Middleware to expose slow query metrics
 * Usage: app.get('/metrics/slow-queries', slowQueryMetricsMiddleware)
 */
export declare function slowQueryMetricsMiddleware(req: any, res: any): void;
/**
 * Trigger metrics collection (for periodic analysis)
 */
export declare function collectSlowQueryMetrics(): void;
/**
 * Setup periodic slow query metrics collection
 * Call once on server startup
 */
export declare function startSlowQueryMetricsCollection(intervalMinutes?: number): void;
export {};
//# sourceMappingURL=slow-query-logger.d.ts.map