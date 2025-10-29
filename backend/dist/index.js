import 'dotenv/config';
import app from './app.js';
import { startRecurringMessageScheduler } from './jobs/recurringMessages.job.js';
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
    // Start recurring message scheduler
    startRecurringMessageScheduler();
});
//# sourceMappingURL=index.js.map