import 'dotenv/config';
import app from './app.js';
import { startRecurringMessageScheduler } from './jobs/recurringMessages.job.js';
import { verifyAndRecoverPhoneLinkings } from './services/phone-linking-recovery.service.js';
import { spawn } from 'child_process';
import cron from 'node-cron';
const PORT = process.env.PORT || 3000;
/**
 * Auto-run pending database migrations on startup
 * Enterprise-grade automation: Code and database always stay in sync
 * No manual migration steps required
 */
async function autoRunMigrations() {
    try {
        return new Promise((resolve, reject) => {
            console.log('🔄 Checking for pending database migrations...');
            // Run migrations using spawn (shows output in logs)
            const migration = spawn('npx', ['prisma', 'migrate', 'deploy'], {
                stdio: 'inherit', // Show output in logs
                timeout: 5 * 60 * 1000, // 5 minute timeout
            });
            migration.on('close', (code) => {
                if (code === 0) {
                    console.log('✅ All database migrations applied successfully');
                    console.log('✅ Database schema is in sync with code');
                    resolve();
                }
                else {
                    reject(new Error(`Migration process exited with code ${code}`));
                }
            });
            migration.on('error', (error) => {
                reject(error);
            });
        });
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
        // Step 2: Start Express server
        app.listen(PORT, () => {
            console.log(`✅ Server running on http://localhost:${PORT}`);
            // Step 3: Start recurring message scheduler
            startRecurringMessageScheduler();
            console.log('✅ Message scheduling initialized');
            // Step 4: Start phone number linking recovery job (every 5 minutes)
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