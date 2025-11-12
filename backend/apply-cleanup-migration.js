import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

const cleanupSteps = [
  // Drop Twilio columns from Church
  'ALTER TABLE "Church" DROP COLUMN IF EXISTS "twilioAccountSid";',
  'ALTER TABLE "Church" DROP COLUMN IF EXISTS "twilioAuthToken";',
  'ALTER TABLE "Church" DROP COLUMN IF EXISTS "twilioPhoneNumber";',
  'ALTER TABLE "Church" DROP COLUMN IF EXISTS "twilioVerified";',

  // Drop twilioMessageSid from MessageRecipient and add providerMessageId
  'ALTER TABLE "MessageRecipient" DROP COLUMN IF EXISTS "twilioMessageSid";',
  'ALTER TABLE "MessageRecipient" ADD COLUMN IF NOT EXISTS "providerMessageId" TEXT;',
];

async function applyCleanup() {
  const client = await pool.connect();
  try {
    let stepNum = 1;
    for (const step of cleanupSteps) {
      try {
        console.log(`Step ${stepNum}: Executing...`);
        await client.query(step);
        console.log(`✅ Step ${stepNum} completed`);
      } catch (error) {
        if (error.message.includes('does not exist') ||
            error.message.includes('already exists') ||
            error.message.includes('duplicate key')) {
          console.log(`⚠️  Step ${stepNum} skipped (already done or doesn't exist)`);
        } else {
          throw error;
        }
      }
      stepNum++;
    }
    console.log('\n✅ Twilio cleanup completed successfully!');
  } catch (error) {
    console.error('❌ Cleanup failed:', error.message);
    process.exit(1);
  } finally {
    await client.release();
    await pool.end();
  }
}

applyCleanup();
