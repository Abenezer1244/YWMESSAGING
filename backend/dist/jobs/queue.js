import Bull from 'bull';
const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
// Create job queues
export const mailQueue = new Bull('mail', redisUrl);
export const smsQueue = new Bull('sms', redisUrl);
export const analyticsQueue = new Bull('analytics', redisUrl);
// Global error handlers
mailQueue.on('error', (err) => {
    console.error('❌ Mail queue error:', err);
});
smsQueue.on('error', (err) => {
    console.error('❌ SMS queue error:', err);
});
analyticsQueue.on('error', (err) => {
    console.error('❌ Analytics queue error:', err);
});
// Log when jobs complete
mailQueue.on('completed', (job) => {
    console.log(`✅ Mail job ${job.id} completed`);
});
smsQueue.on('completed', (job) => {
    console.log(`✅ SMS job ${job.id} completed`);
});
analyticsQueue.on('completed', (job) => {
    console.log(`✅ Analytics job ${job.id} completed`);
});
export async function closeQueues() {
    await Promise.all([
        mailQueue.close(),
        smsQueue.close(),
        analyticsQueue.close(),
    ]);
    console.log('✅ All queues closed');
}
//# sourceMappingURL=queue.js.map