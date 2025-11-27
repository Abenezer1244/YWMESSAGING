/**
 * ✅ DATABASE BACKUP MONITORING UTILITY
 *
 * Monitors PostgreSQL backup status and triggers alerts
 * Verifies backup health and recovery capability
 */
/**
 * Backup health check interface
 */
interface BackupHealthCheck {
    status: 'healthy' | 'warning' | 'critical';
    plan: string;
    pitrEnabled: boolean;
    retentionDays: number;
    lastCheckTime: Date;
    message: string;
    recommendations: string[];
}
/**
 * Check backup system health
 * Verifies that automated backups are properly configured
 */
export declare function checkBackupHealth(plan?: string): Promise<BackupHealthCheck>;
/**
 * Generate backup report for monitoring dashboards
 */
export declare function generateBackupReport(): Promise<string>;
/**
 * Log backup status to console/monitoring
 */
export declare function logBackupStatus(): Promise<void>;
/**
 * Startup backup health check
 * Runs when application starts
 */
export declare function initializeBackupMonitoring(): Promise<void>;
/**
 * Periodic backup health check (runs every 24 hours)
 * Useful for monitoring dashboards and alerting systems
 */
export declare function scheduleBackupHealthCheck(intervalHours?: number): NodeJS.Timer;
declare const _default: {
    checkBackupHealth: typeof checkBackupHealth;
    generateBackupReport: typeof generateBackupReport;
    logBackupStatus: typeof logBackupStatus;
    initializeBackupMonitoring: typeof initializeBackupMonitoring;
    scheduleBackupHealthCheck: typeof scheduleBackupHealthCheck;
};
export default _default;
//# sourceMappingURL=backup-monitor.d.ts.map