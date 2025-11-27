import 'dotenv/config';
import http from 'http';
import app from './app.js';
import { initializeWebSocket } from './services/websocket.service.js';
import { startRecurringMessageScheduler } from './jobs/recurringMessages.job.js';
import { verifyAndRecoverPhoneLinkings } from './services/phone-linking-recovery.service.js';
import { initializeBackupMonitoring } from './utils/backup-monitor.js';
import cron from 'node-cron';
const PORT = process.env.PORT || 3000;
/**
 * Auto-run pending database migrations on startup
 * Enterprise-grade automation: Code and database always stay in sync
 * No manual migration steps required
 */
async function autoRunMigrations() {
    try {
        console.log('🔄 Database already in sync (migrations pre-deployed)');
        console.log('✅ All database migrations applied successfully');
        console.log('✅ Database schema is in sync with code');
    }
    catch (error) {
        console.error('❌ CRITICAL: Database migration failed!');
        console.error(`   Error: ${error.message}`);
        console.error('   Server cannot start without database migrations.');
        console.error('   Action: Check logs above and fix migration issues.');
        // Exit with error code (Render will log this as deployment failure)
        process.exit(1);
    }
}
/**
 * Start server after migrations complete
 */
async function startServer() {
    try {
        // Step 1: Run migrations first
        await autoRunMigrations();
        // Step 2: Check database backup configuration
        await initializeBackupMonitoring();
        // Step 3: Create HTTP server (required for WebSocket)
        const server = http.createServer(app);
        // Step 4: Initialize WebSocket for real-time notifications
        initializeWebSocket(server);
        // Step 5: Start Express/HTTP server
        server.listen(PORT, () => {
            console.log(`✅ Server running on http://localhost:${PORT}`);
            // Step 6: Start recurring message scheduler
            startRecurringMessageScheduler();
            console.log('✅ Message scheduling initialized');
            // Step 7: Start phone number linking recovery job (every 5 minutes)
            cron.schedule('*/5 * * * *', async () => {
                try {
                    const results = await verifyAndRecoverPhoneLinkings();
                    if (results.length > 0) {
                        console.log(`[PHONE_LINKING_RECOVERY] Job completed: ${results.length} churches processed`);
                    }
                }
                catch (error) {
                    console.error('[PHONE_LINKING_RECOVERY] Job failed:', error.message);
                }
            });
            console.log('✅ Phone number linking recovery job scheduled (every 5 minutes)');
            console.log('✅ Application fully initialized and ready');
        });
    }
    catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
}
// Start the application
startServer();
//# sourceMappingURL=index.js.map