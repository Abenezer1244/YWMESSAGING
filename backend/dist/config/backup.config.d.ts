/**
 * ✅ DATABASE BACKUP CONFIGURATION
 *
 * Render PostgreSQL Backup Strategy:
 * - Free/Starter Plan: No automated backups
 * - Standard Plan ($15/mo): 7-day Point-In-Time Recovery (PITR)
 * - Pro Plan ($30/mo): 30-day PITR
 *
 * This configuration provides:
 * 1. Backup status monitoring
 * 2. Recovery point tracking
 * 3. Backup schedule validation
 * 4. Recovery procedures documentation
 */
/**
 * Render PostgreSQL Backup Information
 * Reference: https://render.com/docs/postgresql#backups
 */
export declare const BACKUP_CONFIG: {
    recommendedPlan: string;
    retentionDays: {
        free: number;
        starter: number;
        standard: number;
        pro: number;
    };
    pitrWindow: {
        standard: string;
        pro: string;
    };
    cost: {
        starter: string;
        standard: string;
        pro: string;
    };
    frequency: {
        description: string;
        interval: string;
        rpo: string;
        rto: string;
    };
    features: string[];
    renderDashboard: {
        url: string;
        location: string;
        action: string;
    };
};
/**
 * Backup Monitoring Configuration
 * Monitors backup health and triggers alerts
 */
export declare const BACKUP_MONITORING: {
    checkInterval: number;
    alertThreshold: {
        days: number;
        minutes: number;
    };
    sla: {
        rpo: string;
        rto: string;
        availability: string;
    };
};
/**
 * Backup Recovery Procedures
 * Step-by-step guide for restoring from backup
 */
export declare const BACKUP_RECOVERY_PROCEDURE: {
    stepByStep: {
        step: number;
        title: string;
        instructions: string[];
    }[];
    estimatedTime: {
        small: string;
        medium: string;
        large: string;
    };
    riskLevel: string;
    documentation: string;
};
/**
 * What to do BEFORE upgrading database plan
 */
export declare const PRE_UPGRADE_CHECKLIST: string[];
/**
 * Render Dashboard Upgrade Instructions
 * Manual step - must be done in Render UI
 */
export declare const UPGRADE_INSTRUCTIONS = "\n## How to Upgrade Render PostgreSQL Plan to Standard (for 7-day PITR backups)\n\n### Step 1: Access Render Dashboard\n1. Go to https://dashboard.render.com\n2. Sign in with your account\n\n### Step 2: Select PostgreSQL Database\n1. Click on \"PostgreSQL\" in left sidebar\n2. Select \"koinonia-sms\" database (or your database name)\n\n### Step 3: Access Database Settings\n1. Click \"Settings\" tab\n2. Scroll to \"Plan\" section\n3. Current plan will show \"Starter\" or \"Free\"\n\n### Step 4: Change Plan\n1. Click dropdown next to current plan\n2. Select \"Standard ($15/month)\"\n3. Review pricing: +$15/month = 7-day PITR enabled\n\n### Step 5: Confirm Upgrade\n1. Review changes\n2. Click \"Update Plan\"\n3. Confirm billing change\n4. Upgrade completes in seconds (no downtime)\n\n### Step 6: Verify Upgrade\n1. Refresh page\n2. Confirm plan shows \"Standard\"\n3. \"Backups\" tab now appears in database menu\n\n### What You Get:\n\u2705 Automated daily backups\n\u2705 7-day Point-In-Time Recovery (PITR)\n\u2705 One-click restore from any point in last 7 days\n\u2705 WAL archiving for transaction logs\n\u2705 Automatic encryption\n\u2705 RPO < 1 minute, RTO < 30 minutes\n\n### Estimated Cost Impact:\n- Current: $0 (Starter plan, no backups)\n- After upgrade: +$15/month\n- Total: ~$45-60/month (database + backup)\n\n### Support\n- Render Docs: https://render.com/docs/postgresql#backups\n- Support Email: support@render.com\n";
/**
 * Helper function to display backup status
 */
export declare function getBackupStatus(): string;
export default BACKUP_CONFIG;
//# sourceMappingURL=backup.config.d.ts.map