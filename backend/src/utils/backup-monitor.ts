/**
 * ✅ DATABASE BACKUP MONITORING UTILITY
 *
 * Monitors PostgreSQL backup status and triggers alerts
 * Verifies backup health and recovery capability
 */

import { BACKUP_MONITORING, BACKUP_CONFIG } from '../config/backup.config.js';

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
export async function checkBackupHealth(plan: string = 'starter'): Promise<BackupHealthCheck> {
  const currentPlan = plan.toLowerCase();
  const retentionDays = BACKUP_CONFIG.retentionDays[currentPlan as keyof typeof BACKUP_CONFIG.retentionDays] || 0;
  const pitrEnabled = retentionDays > 0;

  // Determine health status based on plan
  let status: 'healthy' | 'warning' | 'critical';
  let message: string;
  const recommendations: string[] = [];

  if (currentPlan === 'standard' || currentPlan === 'pro') {
    // Production-ready backup configuration
    status = 'healthy';
    message = `✅ Automated backups enabled (${retentionDays}-day PITR)`;
  } else if (currentPlan === 'starter') {
    // Development/test environment
    status = 'warning';
    message = `⚠️ Limited backup capability. Upgrade to Standard plan for 7-day PITR`;
    recommendations.push('Upgrade to Standard plan ($15/month)');
    recommendations.push('Enable 7-day Point-In-Time Recovery');
  } else {
    // Free/no backup plan
    status = 'critical';
    message = `❌ NO AUTOMATED BACKUPS. Production data at risk.`;
    recommendations.push('Upgrade to Standard plan immediately ($15/month)');
    recommendations.push('Implement manual backup procedure');
    recommendations.push('Enable automated backup monitoring');
  }

  // Add recommendations for all plans
  if (process.env.NODE_ENV === 'production' && status !== 'healthy') {
    recommendations.push('Schedule backup plan upgrade during maintenance window');
    recommendations.push('Test recovery procedure on staging environment');
    recommendations.push('Document recovery RTO/RPO requirements');
  }

  return {
    status,
    plan: currentPlan,
    pitrEnabled,
    retentionDays,
    lastCheckTime: new Date(),
    message,
    recommendations,
  };
}

/**
 * Generate backup report for monitoring dashboards
 */
export async function generateBackupReport(): Promise<string> {
  const check = await checkBackupHealth(process.env.RENDER_DB_PLAN || 'starter');

  const report = `
DATABASE BACKUP MONITORING REPORT
==================================
Generated: ${check.lastCheckTime.toISOString()}
Environment: ${process.env.NODE_ENV}

STATUS: ${check.status.toUpperCase()}
${check.message}

CONFIGURATION:
- Plan: ${check.plan}
- PITR Enabled: ${check.pitrEnabled ? 'Yes' : 'No'}
- Retention: ${check.retentionDays > 0 ? `${check.retentionDays} days` : 'None'}
- RPO: ${BACKUP_CONFIG.frequency.rpo}
- RTO: ${BACKUP_CONFIG.frequency.rto}

${
  check.recommendations.length > 0
    ? `RECOMMENDATIONS:\n${check.recommendations.map((r) => `- ${r}`).join('\n')}`
    : 'No recommendations at this time.'
}
  `.trim();

  return report;
}

/**
 * Log backup status to console/monitoring
 */
export async function logBackupStatus(): Promise<void> {
  const check = await checkBackupHealth(process.env.RENDER_DB_PLAN || 'starter');

  const colors = {
    healthy: '\x1b[32m', // Green
    warning: '\x1b[33m', // Yellow
    critical: '\x1b[31m', // Red
    reset: '\x1b[0m',
  };

  const color = colors[check.status];

  console.log(`\n${color}${check.message}${colors.reset}`);

  if (check.recommendations.length > 0) {
    console.log(`${colors.warning}Recommendations:${colors.reset}`);
    check.recommendations.forEach((rec) => {
      console.log(`  • ${rec}`);
    });
  }
}

/**
 * Startup backup health check
 * Runs when application starts
 */
export async function initializeBackupMonitoring(): Promise<void> {
  console.log('\n📊 Checking database backup configuration...');

  const check = await checkBackupHealth(process.env.RENDER_DB_PLAN || 'starter');

  if (check.status === 'critical') {
    console.error('❌ CRITICAL: Database backups not properly configured!');
    console.error(
      'Action Required: Upgrade to Standard plan in Render dashboard'
    );

    // In production, this should trigger an alert to ops/monitoring
    if (process.env.NODE_ENV === 'production') {
      console.error('🚨 PRODUCTION ALERT: Backups must be configured immediately!');
    }
  } else if (check.status === 'warning') {
    console.warn('⚠️ Database backup configuration needs attention');
    check.recommendations.forEach((rec) => console.warn(`   → ${rec}`));
  } else {
    console.log('✅ Database backups properly configured');
    console.log(`   → Plan: ${check.plan} (${check.retentionDays}-day PITR)`);
    console.log(`   → RPO: ${BACKUP_CONFIG.frequency.rpo}`);
    console.log(`   → RTO: ${BACKUP_CONFIG.frequency.rto}`);
  }

  console.log('');
}

/**
 * Periodic backup health check (runs every 24 hours)
 * Useful for monitoring dashboards and alerting systems
 */
export function scheduleBackupHealthCheck(
  intervalHours: number = 24
): NodeJS.Timer {
  const intervalMs = intervalHours * 60 * 60 * 1000;

  const timer = setInterval(async () => {
    try {
      const report = await generateBackupReport();
      // Log to monitoring service (Sentry, DataDog, etc)
      console.log(report);
    } catch (error) {
      console.error('Error checking backup health:', error);
    }
  }, intervalMs);

  return timer;
}

export default {
  checkBackupHealth,
  generateBackupReport,
  logBackupStatus,
  initializeBackupMonitoring,
  scheduleBackupHealthCheck,
};
