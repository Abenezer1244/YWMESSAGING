import 'dotenv/config';
import app from './app.js';
import { startRecurringMessageScheduler } from './jobs/recurringMessages.job.js';
import './jobs/queue.js'; // Initialize Bull queue processors
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
    // Start recurring message scheduler
    startRecurringMessageScheduler();
    console.log('✅ SMS and MMS queue processors initialized');
});
//# sourceMappingURL=index.js.map